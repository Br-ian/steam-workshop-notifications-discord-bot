FROM node:17

RUN mkdir /bot && mkdir /bot/data && mkdir /bot/config && mkdir /bot/logs

WORKDIR /bot

VOLUME /bot/data
VOLUME /bot/config

COPY package.json index.js ./
ADD ./modules ./modules

RUN npm update && npm install

CMD [ "npm", "start" ]
