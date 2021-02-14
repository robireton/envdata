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

router.post('/co2', (req, res) => {
  if ('ppm' in req.body) {
    const entry = {
      timestamp: Date.now(),
      ppm: Number.parseInt(req.body.ppm, 10)
    }
    if (Number.isNaN(entry.ppm)) {
      res.sendStatus(400)
    } else {
      if (datastore.insertCO2(entry)) {
        res.sendStatus(201)
      } else {
        res.sendStatus(500)
      }
    }
  } else {
    res.sendStatus(400)
  }
})

router.post('/temp', (req, res) => {
  if ('k16' in req.body) {
    const entry = {
      timestamp: Date.now(),
      k16: Number.parseInt(req.body.k16, 10)
    }
    if (Number.isNaN(entry.k16)) {
      res.sendStatus(400)
    } else {
      if (datastore.insertTemp(entry)) {
        res.sendStatus(201)
      } else {
        res.sendStatus(500)
      }
    }
  } else {
    res.sendStatus(400)
  }
})

router.put('/co2', (req, res) => {
  if ('timestamp' in req.body && 'ppm' in req.body) {
    const entry = {
      timestamp: Number.parseInt(req.body.timestamp, 10),
      ppm: Number.parseInt(req.body.ppm, 10)
    }
    if (Number.isNaN(entry.timestamp) || Number.isNaN(entry.ppm)) {
      res.sendStatus(400)
    } else {
      const result = datastore.replaceCO2(entry)
      if (result.error) {
        res.sendStatus(500)
      } else if (result.added) {
        res.sendStatus(201)
      } else if (result.changed) {
        res.sendStatus(200)
      } else {
        res.sendStatus(204)
      }
    }
  } else {
    res.sendStatus(400)
  }
})

router.put('/temp', (req, res) => {
  if ('timestamp' in req.body && 'k16' in req.body) {
    const entry = {
      timestamp: Number.parseInt(req.body.timestamp, 10),
      k16: Number.parseInt(req.body.k16, 10)
    }
    if (Number.isNaN(entry.timestamp) || Number.isNaN(entry.k16)) {
      res.sendStatus(400)
    } else {
      const result = datastore.replaceTemp(entry)
      if (result.error) {
        res.sendStatus(500)
      } else if (result.added) {
        res.sendStatus(201)
      } else if (result.changed) {
        res.sendStatus(200)
      } else {
        res.sendStatus(204)
      }
    }
  } else {
    res.sendStatus(400)
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
