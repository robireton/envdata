import env from '@robireton/environment'

const config = {
  production: (process.env.NODE_ENV === 'production'),
  debug: (process.env.NODE_ENV === 'debug'),
  db: process.env.DB_FILE || 'run/readings.db',
  http: {
    host: process.env.HTTP_HOST || (process.env.NODE_ENV === 'production' ? undefined : 'localhost'),
    port: env.parseInt('HTTP_PORT', 3282)
  },
  log: {
    stamp: env.parseBool('LOG_STAMP'),
    method: env.parseBool('LOG_METHOD'),
    path: env.parseBool('LOG_PATH'),
    ip: env.parseBool('LOG_IP'),
    ua: env.parseBool('LOG_UA')
  }
}

if (config.debug) console.debug(config)

export default config
