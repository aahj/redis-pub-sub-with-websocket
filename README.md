# Redis pub/sub with websocket

For websockets we used [ws](https://www.npmjs.com/package/ws) npm package.
## Prerequesite
- node v18.16.1
- npm v9.5.1
- running redis server on port 6379

## Instructions
This project demonstrates the architecture of a simple real-time communication. Here, we will focus on the various components, such as Redis Pub/Sub, involved in building a real-time app and see how they all play their role in the overall architecture. I have implemented all the required stuff for backend.
Inside [websockets/client] all the files demonstrated how to handle the other usecases for websockets on frontend. So it should be handle properly on client side.

## install node_modules
```sh
npm i
```
### start server
```sh
npm run start
```

### start dev server
```sh
npm run start:dev
```

## Best Articles References
- [websockets-on-production-with-node-js](https://medium.com/voodoo-engineering/websockets-on-production-with-node-js-bdc82d07bb9f)
- [How to Set Up a Websocket Server with Node.js and Express](https://cheatcode.co/tutorials/how-to-set-up-a-websocket-server-with-node-js-and-express)
- [pub/sub with redis](https://raphaeldelio.medium.com/understanding-pub-sub-in-redis-18278440c2a9)
