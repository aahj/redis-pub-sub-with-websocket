const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const websockets = require("./websockets");
require("dotenv").config();

app.use(bodyparser.json({ limit: "40mb" }));

app.get("/test", (req, res, next) => {
  res.status(200).json({ success: true });
});

app.post("/test", (req, res, next) => {
  res.status(201).json({ success: true, body: req.body });
});
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`server is listen on ${PORT} and ${process.env.NODE_ENV}`);
});
websockets(server);
