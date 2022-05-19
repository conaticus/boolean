FROM node:16-alpine AS base

WORKDIR /opt/app
COPY package.json /opt/app

RUN npm install

FROM base AS build

COPY . /opt/app
RUN sh ./scripts/build.sh

FROM base as production

COPY --from=build /opt/app/package.json /opt/app/package.json
COPY --from=build /opt/app/node_modules /opt/app/node_modules
COPY --from=build /opt/app/dist /opt/app/dist
COPY --from=build /opt/app/scripts /opt/app/scripts
COPY --from=build /opt/app/prisma /opt/app/prisma

CMD sh ./scripts/start.sh
