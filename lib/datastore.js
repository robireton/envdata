import { dirname } from 'path'
import { ensureDirSync } from 'fs-extra'
import sqlite from 'better-sqlite3'
import config from './config.js'

ensureDirSync(dirname(config.db))
const db = sqlite(config.db)

process.on('exit', () => {
  console.log('closing sqlite readings database')
  db.close()
})

db.prepare('CREATE TABLE IF NOT EXISTS "co2" ("timestamp" INTEGER NOT NULL, "ppm" INTEGER NOT NULL)').run()
db.prepare('CREATE TABLE IF NOT EXISTS "temp" ("timestamp" INTEGER NOT NULL, "k16" INTEGER NOT NULL)').run()
db.prepare('CREATE INDEX IF NOT EXISTS "concentration_at_time" ON "co2" ("timestamp")').run()
db.prepare('CREATE INDEX IF NOT EXISTS "temperature_at_time" ON "temp" ("timestamp")').run()

const insertConcentration = db.prepare('INSERT INTO "co2" ("timestamp", "ppm") VALUES (:timestamp, :ppm)')
const insertTemperature = db.prepare('INSERT INTO "temp" ("timestamp", "k16") VALUES (:timestamp, :k16)')

const selectConcentration = db.prepare('SELECT "timestamp", "ppm" FROM "co2" WHERE "timestamp" BETWEEN :start AND :stop ORDER BY "timestamp"')
const selectTemperature = db.prepare('SELECT "timestamp", "k16" FROM "temp" WHERE "timestamp" BETWEEN :start AND :stop ORDER BY "timestamp"')

export default {
  insertCO2: entry => {
    try {
      return insertConcentration.run(entry)
    } catch (err) {
      console.error(err)
      return false
    }
  },

  insertTemp: entry => {
    // k16 has units 1/16th Kelvin
    try {
      return insertTemperature.run(entry)
    } catch (err) {
      console.error(err)
      return false
    }
  },

  getCO2: (start, stop) => selectConcentration.all({ start: start, stop: stop }).map(row => [row.timestamp, row.ppm]),
  getTemp: (start, stop) => selectTemperature.all({ start: start, stop: stop }).map(row => [row.timestamp, row.k16])
}
