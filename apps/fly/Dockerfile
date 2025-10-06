# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS release
COPY ./dist/index.js ./

# run the app
USER bun

ENTRYPOINT [ "bun", "run", "index.js" ]
