FROM node:18.16
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 9000
CMD [ "node","server.js" ]