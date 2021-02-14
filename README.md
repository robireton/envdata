# Environment Data · [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

HTTP API server with SQLite data storage for environmental data

## Endpoints

### `/co2` [ GET · POST · PUT ]

#### GET
Returns concentration of CO₂ in whole number parts per million. If request asks for JSON (via Content-type header) returns an array of tuples; each tuple is an array of time (in ms since 1970-01-01 UTC) and ppm, in that order. Otherwise, returns plain text CSV of the same data points.

query parameter | description | default
--- | --- | ---
hours | how much data to return | 36.0
stop | most recent data to include (in ms since 1970-01-01 UTC) | now
start | oldest data to include (in ms since 1970-01-01 UTC) | *hours* before *start*
average | perform running average over *average* minutes | 1


#### POST
The concentration of CO₂ in whole number parts per million provided should be saved with the timestamp set as the time the post arrives at the API server.

#### PUT
The concentration of CO₂ in whole number parts per million provided should be saved with the timestamp provided.

### `/temp` [ GET · POST · PUT ]

#### GET
Returns temperature in whole number of sixteenth Kelvin. If request asks for JSON (via Content-type header) returns an array of tuples; each tuple is an array of time (in ms since 1970-01-01 UTC) and temperature, in that order. Otherwise, returns plain text CSV of the same data points.

query parameter | description | default
--- | --- | ---
hours | how much data to return | 36.0
stop | most recent data to include (in ms since 1970-01-01 UTC) | now
start | oldest data to include (in ms since 1970-01-01 UTC) | *hours* before *start*
average | perform running average over *average* minutes | 15


#### POST
The concentration of CO₂ in whole number parts per million provided should be saved with the timestamp set as the time the post arrives at the API server.

#### PUT
The concentration of CO₂ in whole number parts per million provided should be saved with the timestamp provided.

## Config

### Environment
variable | description | default
--- | --- | ---
DB_FILE | path for SQLite database file | run/readings.db
HTTP_HOST | network interface to bind to | *undefined*
HTTP_PORT | TCP port to listen on | 3282
LOG_STAMP | include timestamp in request log | false
LOG_METHOD | include request method in log | false
LOG_PATH | include request path in log | false
LOG_IP | include requester address in log | false
LOG_UA | include user agent string in request log | false

