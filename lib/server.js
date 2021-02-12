
import path from 'path'
import cors from 'cors'
import express from 'express'
import chrono from '@robireton/chrono'
import config from './config.js'
import routes from './routes.js'

const app = express()
app.set('trust proxy', ['loopback', 'uniquelocal'])
app.use(cors())
app.use(express.static(path.join(process.cwd(), 'static')))
app.use(routes)

const server = app.listen(config.http, () => {
  console.log(`${chrono.timestamp()}\tData Server listening on ${server.address().address}:${server.address().port}`)
})

server.on('close', () => console.log('web server closed'))

for (const signal of ['SIGUSR2', 'SIGINT', 'SIGTERM']) {
  process.on(signal, s => {
    console.log(`signal: ${s}`)
    server.close(err => {
      if (err) console.error(`error ${err} while closing web server`)
      console.log('Data Server exiting')
      process.exit()
    })
  })
}
