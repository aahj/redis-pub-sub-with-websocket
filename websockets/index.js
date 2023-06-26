const WebSocket = require("ws");
const Redis = require("ioredis");
const querystring = require("querystring");

module.exports = (app) => {
  // Create a Redis client for subscribing to channels
  const redisSubscriber = new Redis(6379,process.env.REDIS_HOST);
  // Create a Redis client for publishing messages
  const redisPublisher = new Redis(6379,process.env.REDIS_HOST);

  const subscribersByChannel = {};

  const wss = new WebSocket.Server({
    noServer: true,
    path: "/websockets",
  });

  const heartbeat = (ws) => {
    ws.isAlive = true;
  };
  const onSockerError = (error) => {
    console.log(error);
  };

  const noop = function () {};
  app.on("upgrade", (request, socket, head) => {
    wss.on("error", onSockerError);
    wss.handleUpgrade(request, socket, head, (websocket) => {
      wss.emit("connection", websocket, request);
    });
  });

  // WebSocket server event: connection established
  wss.on("connection", (ws,connectionRequest) => {
    const [_path, params] = connectionRequest?.url?.split("?");
    const connectionParams = querystring.parse(params);    
    ws.userId = connectionParams.userid;
    let subscribedChannels = [];
    // WebSocket event: message received from client
    ws.on("message", (message) => {
      const data = JSON.parse(message);

      if (data.event === "subscribe") {
        const channel = data.channel;
        // Subscribe to a Redis channel
        redisSubscriber.subscribe(channel);
        subscribedChannels.push(channel);

        if (!subscribersByChannel[channel]) {
          subscribersByChannel[channel] = new Set();
        }
        subscribersByChannel[channel].add(ws);
      } else if (data.event === "publish") {
        // Publish a message to a Redis channel
        redisPublisher.publish(data.channel, data.message);
      }
    });

    // WebSocket event: connection closed
    ws.on("close", () => {
      // Unsubscribe from Redis channels
      for (const channel of subscribedChannels) {
        redisSubscriber.unsubscribe(channel);
        if (subscribersByChannel[channel]) {
          subscribersByChannel[channel].delete(ws);
          if (subscribersByChannel[channel].size == 0) {
            delete subscribersByChannel[channel];
          }
        }
      }
    });
  });

  redisSubscriber.on("message", (channel, message) => {
    const subscribers = subscribersByChannel[channel];
    if (subscribers) {
      subscribers.forEach((subscriber) => {
        subscriber.send(JSON.stringify({ channel, message }));
      });
    }
  });
};
