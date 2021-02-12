import chrono from '@robireton/chrono'
import express from 'express'
import config from './config.js'
import data from './data.js'
import datastore from './datastore.js'
import temperature from './temperature.js'

const router = express.Router()

// Logging and setup
router.all('*', (req, res, next) => {
  res.set('X-UA-Compatible', 'IE=edge')
  const fields = []
  if (config.log.stamp) fields.push(chrono.timestamp())
  if (config.log.method) fields.push(req.method)
  if (config.log.path) fields.push(req.path)
  if (config.log.ip) fields.push(req.ip)
  if (config.log.ua) fields.push(req.get('user-agent') || '')
  if (fields.length) console.log(fields.join('\t'))

  req.proxyBase = req.get('x-script-name') || ''

  next()
})

router.post('/co2/:ppm(\\d+)', (req, res) => {
  const entry = {
    timestamp: Date.now(),
    ppm: Number.parseInt(req.params.ppm, 10)
  }
  if (datastore.insertCO2(entry)) {
    res.sendStatus(201)
  } else {
    res.sendStatus(500)
  }
})

router.post('/temp/:k16(\\d+)', (req, res) => {
  const entry = {
    timestamp: Date.now(),
    k16: Number.parseInt(req.params.k16, 10)
  }
  if (datastore.insertTemp(entry)) {
    res.sendStatus(201)
  } else {
    res.sendStatus(500)
  }
})

router.put('/co2/:timestamp(\\d+)/:ppm(\\d+)', (req, res) => {
  const entry = {
    timestamp: Number.parseInt(req.params.timestamp, 10),
    ppm: Number.parseInt(req.params.ppm, 10)
  }
  if (datastore.insertCO2(entry)) {
    res.sendStatus(201)
  } else {
    res.sendStatus(500)
  }
})

router.put('/temp/:timestamp(\\d+)/:k16(\\d+)', (req, res) => {
  const entry = {
    timestamp: Number.parseInt(req.params.timestamp, 10),
    k16: Number.parseInt(req.params.k16, 10)
  }
  if (datastore.insertTemp(entry)) {
    res.sendStatus(201)
  } else {
    res.sendStatus(500)
  }
})

router.get('/co2', (req, res) => {
  const hours = 'hours' in req.query ? Number.parseFloat(req.query.hours) : 36
  const stop = 'stop' in req.query ? Number.parseInt(req.query.stop, 10) : Date.now()
  const start = 'start' in req.query ? Number.parseInt(req.query.start, 10) : stop - Math.floor(hours * 60 * 60 * 1000)
  const average = 'average' in req.query ? Number.parseInt(req.query.average) : 0
  const co2 = data.dedup((average ? data.average(datastore.getCO2(start, stop), average) : datastore.getCO2(start, stop)).map(([k, v]) => [k, Math.round(v)]))
  if ('content-type' in req.headers && req.headers['content-type'] === 'application/json') {
    res.json(co2)
  } else {
    res.set('Content-Type', 'text/plain')
    res.send(['timestamp,ppm', ...co2.map(p => p.join(','))].join('\n'))
  }
})

router.get('/temp', (req, res) => {
  const hours = 'hours' in req.query ? Number.parseFloat(req.query.hours) : 36
  const stop = 'stop' in req.query ? Number.parseInt(req.query.stop, 10) : Date.now()
  const start = 'start' in req.query ? Number.parseInt(req.query.start, 10) : stop - Math.floor(hours * 60 * 60 * 1000)
  const average = 'average' in req.query ? Number.parseInt(req.query.average) : 15
  const temps = data.dedup((average ? data.average(datastore.getTemp(start, stop), average) : datastore.getTemp(start, stop)).map(([k, v]) => [k, Number.parseFloat(temperature.fahrenheit(v).toPrecision(3))]))
  if ('content-type' in req.headers && req.headers['content-type'] === 'application/json') {
    res.json(temps)
  } else {
    res.set('Content-Type', 'text/plain')
    res.send(['timestamp,temp', ...temps.map(p => p.join(','))].join('\n'))
  }
})

export default router
