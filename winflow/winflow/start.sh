#!/usr/bin/env sh
set -eu

if [ -n "${DB_HOST:-}" ] && [ -n "${DB_PORT:-}" ] && [ -n "${DB_NAME:-}" ]; then
  export SPRING_DATASOURCE_URL="jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}"
fi

if [ -n "${DB_USER:-}" ]; then
  export SPRING_DATASOURCE_USERNAME="${DB_USER}"
fi

if [ -n "${DB_PASSWORD:-}" ]; then
  export SPRING_DATASOURCE_PASSWORD="${DB_PASSWORD}"
fi

exec java -jar app.jar
