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

db.prepare('CREATE TABLE IF NOT EXISTS "co2" ("timestamp" INTEGER NOT NULL, "ppm" INTEGER NOT NULL, PRIMARY KEY("timestamp"))').run()
db.prepare('CREATE TABLE IF NOT EXISTS "temp" ("timestamp" INTEGER NOT NULL, "k16" INTEGER NOT NULL, PRIMARY KEY("timestamp"))').run()

const insertConcentration = db.prepare('INSERT INTO "co2" ("timestamp", "ppm") VALUES (:timestamp, :ppm)')
const insertTemperature = db.prepare('INSERT INTO "temp" ("timestamp", "k16") VALUES (:timestamp, :k16)')

const replaceConcentration = db.prepare('REPLACE INTO "co2" ("timestamp", "ppm") VALUES (:timestamp, :ppm)')
const replaceTemperature = db.prepare('REPLACE INTO "temp" ("timestamp", "k16") VALUES (:timestamp, :k16)')

const selectConcentrations = db.prepare('SELECT "timestamp", "ppm" FROM "co2" WHERE "timestamp" BETWEEN :start AND :stop ORDER BY "timestamp"')
const selectTemperatures = db.prepare('SELECT "timestamp", "k16" FROM "temp" WHERE "timestamp" BETWEEN :start AND :stop ORDER BY "timestamp"')

const selectConcentration = db.prepare('SELECT "ppm" FROM "co2" WHERE "timestamp" = ?')
const selectTemperature = db.prepare('SELECT "k16" FROM "temp" WHERE "timestamp" = ?')

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

  replaceCO2: entry => {
    try {
      const existing = selectConcentration.get(entry.timestamp)
      const addition = replaceConcentration.run(entry)
      return {
        added: existing === undefined && addition.changes === 1,
        changed: existing !== undefined && existing.ppm !== entry.ppm,
        error: false
      }
    } catch (err) {
      console.error(err)
      return {
        added: false,
        changed: false,
        error: true
      }
    }
  },

  replaceTemp: entry => {
    // k16 has units 1/16th Kelvin
    try {
      const existing = selectTemperature.get(entry.timestamp)
      const addition = replaceTemperature.run(entry)
      return {
        added: existing === undefined && addition.changes === 1,
        changed: existing !== undefined && existing.k16 !== entry.k16,
        error: false
      }
    } catch (err) {
      console.error(err)
      return {
        added: false,
        changed: false,
        error: true
      }
    }
  },

  getCO2: (start, stop) => selectConcentrations.all({ start: start, stop: stop }).map(row => [row.timestamp, row.ppm]),
  getTemp: (start, stop) => selectTemperatures.all({ start: start, stop: stop }).map(row => [row.timestamp, row.k16])
}
