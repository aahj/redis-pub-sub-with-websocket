const querystring = require("querystring");
const WebSocket = require("ws");
const isAllow = require("./whitelist");
// const jwt = require("jsonwebtoken");

module.exports = (app) => {
  const websocketServer = new WebSocket.Server({
    noServer: true,
    path: "/websockets",
    // verifyClient: (info, cb) => {
    //   const token = info.req.headers.token;
    //   if (!token) {
    //     cb(false, 401, "Unauthorized");
    //   } else {
    //     jwt.verify(token, "secretkey123", (err, decoded) => {
    //       if (err) {
    //         cb(false, 401, "Unauthorized");
    //       } else {
    //         info.req.user = decoded;
    //         cb(true);
    //       }
    //     });
    //   }
    // },
  });

  const heartbeat = (ws) => {
    ws.isAlive = true;
  };
  const onSockerError = (error) => {
    console.log(error);
  };

  const noop = function () {};
  const list = ["1001", "1002"];

  app.on("upgrade", (request, socket, head) => {
    websocketServer.on("error", onSockerError);
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit("connection", websocket, request);
    });
  });

  websocketServer.on("connection", function connection(ws, connectionRequest) {
    ws.on("error", console.error);

    ws.on("open", function open() {
      console.log("open");
    });

    ws.on("close", function close() {
      console.log("disconnected");
    });
    // As you can see here we set ws.isAlive = true when the ‘connection’ starts,
    // doing the same when the ‘pong’ event is called
    ws.isAlive = true;
    ws.on("pong", () => {
      heartbeat(ws);
    });

    const [_path, params] = connectionRequest?.url?.split("?");
    const connectionParams = querystring.parse(params);
    // console.log("connectionParams-->", JSON.stringify(connectionParams));
    ws.userId = connectionParams.userid;

    ws.on("message", (message) => {
      let request,
        response = {};
      try {
        request = JSON.parse(message);
      } catch (error) {
        response.command = "unknown";
        response.output = "Invalid JSON";
        response.status = "error";
        return ws.send(JSON.stringify(response));
      }
      if (!isAllow(request.command)) {
        response.command = request.command;
        response.output = "Command not allowed";
        response.status = "error";
        return ws.send(JSON.stringify(response));
      }

      websocketServer.clients.forEach(function each(client) {
        console.log({ userId: client.userId });
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              serverResponse:
                "broadcast message sent to other except who initiates",
              payload: request,
            })
          );
        }
      });
    });
  });

  // Before the server startup we set an interval (30 seconds in this case) that checks if the client is alive:
  // if the value of isAlive is false we terminate the client connection;
  // if the value of isAlive is true, we set its value to false and then we execute a ping.
  // Pings and Pongs are just regular frames, but they are specific control frames defined by the specs of WebSocket protocol in order to check if the remote endpoint is still connected.
  // In this case we are setting the isAlive to false to understand if the client pong event sets it back to true, completing the connection check.

  const interval = setInterval(() => {
    websocketServer.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      // ws.ping(null, false, true);
      ws.ping(noop);
    });
  }, 30000);

  websocketServer.on("close", function close() {
    clearInterval(interval);
  });

  return websocketServer;
};
