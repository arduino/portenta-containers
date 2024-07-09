FROM balenalib/aarch64-node:14 as build

WORKDIR /usr/src
COPY ./package*.json ./
RUN npm install

#dev-cmd-live=npm run livepush

COPY ./src ./src
COPY ./tsconfig.json .
RUN npm run build
COPY ./VERSION .

FROM node:14-alpine3.14

WORKDIR /usr/src

COPY ./package*.json ./
COPY --from=build /usr/src/build ./build
COPY ./VERSION .

RUN npm install --production

CMD [ "npm", "start" ]
