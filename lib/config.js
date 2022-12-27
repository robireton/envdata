import * as environment from '@robireton/environment'

const config = {
  production: (process.env.NODE_ENV === 'production'),
  debug: (process.env.NODE_ENV === 'debug'),
  db: process.env.DB_FILE || 'run/readings.db',
  http: {
    host: process.env.HTTP_HOST || (process.env.NODE_ENV === 'production' ? undefined : 'localhost'),
    port: environment.parseInt('HTTP_PORT', 3282)
  },
  log: {
    stamp: environment.parseBool('LOG_STAMP'),
    method: environment.parseBool('LOG_METHOD'),
    path: environment.parseBool('LOG_PATH'),
    ip: environment.parseBool('LOG_IP'),
    ua: environment.parseBool('LOG_UA')
  }
}

if (config.debug) console.debug(config)

export default config
