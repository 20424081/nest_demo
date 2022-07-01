FROM node:12.14-alpine
COPY package.json /usr/src/

WORKDIR /usr/src
# RUN npm install -g nodemon
# RUN npm install yarn
RUN npm install
COPY . /usr/src
RUN npm run build

EXPOSE 3000
# ENTRYPOINT ["ng", "serve", "-H", "0.0.0.0"]
CMD ["npm", "run", "start:prod"]