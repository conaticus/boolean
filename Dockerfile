FROM node:16-alpine AS base

WORKDIR /opt/app
COPY package.json /opt/app

RUN npm install

FROM base AS build

COPY . /opt/app
RUN npm run build

FROM base as production

USER node

COPY --from=build /opt/app/package.json /opt/app/package.json
COPY --from=build /opt/app/node_modules /opt/app/node_modules

COPY --from=build /opt/app/dist /opt/app/dist
COPY --from=build /opt/app/.env /opt/app/.env
COPY --from=build /opt/app/data.json /opt/app/data.json

CMD npm start
