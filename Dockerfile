# Chessalyze: one image for the Next.js app (pages, tRPC API and the WebSocket server).
#
# Built and run from /app. The build bakes absolute source paths into the server
# bundle (src/config/config.ts uses import.meta.url to find public/), so the image
# keeps src/ and runs from the same folder it was built in.
FROM node:20-bookworm-slim

WORKDIR /app

# Install first, with dev dependencies (needed for the build and drizzle-kit).
# postinstall runs next-ws-cli, which patches Next.js to accept WebSocket upgrades.
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# The build never uses the database or OAuth settings, so skip their validation
# here (see src/env.js). They are supplied at runtime: docker-compose.yml refuses to
# start without them, and the server validates them when a route first uses them.
RUN SKIP_ENV_VALIDATION=1 yarn build

EXPOSE 3000
CMD ["yarn", "start"]
