/**

  v6

  Setup:
  - install nodejs
  - install express.js (npm install express@4)
  - install socket.io (npm install socket.io)
  - npm install express-fileupload
  - npm install sharp
  - npm install mime-types
  - npm install image-size
  - npm install sanitize-filename
  - npm install cookie-parser
  
*/

global.ROOT = __dirname;

const express = require('express');
const fileUpload = require('express-fileupload');
// const multer = require("multer");

const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const {adminDrivers} = require("./admin/drivers");
const {drivers} = require("./drivers");
// const {db} = require("./admin/db.js");

const cookieParser = require('cookie-parser')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cookieParser());

app.get("/admin/get/:driver/:id*", adminDrivers.get);
app.get("/admin/query/:driver*", adminDrivers.query);
app.get("/admin/count/:driver*", adminDrivers.count);
app.post("/admin/update/:driver/:id*", adminDrivers.update);
app.post("/admin/add/:driver*", adminDrivers.add);
app.post("/admin/upload*", adminDrivers.upload);
app.post("/admin/regen/:id*", adminDrivers.regen);
app.post("/admin/login*", adminDrivers.login);
app.post("/admin/logout*", adminDrivers.logout);

app.get("/admin/*", (req, res) => {
  res.sendFile(__dirname + req.url);
});

app.get("/get/:driver/:id*", drivers.get);
app.get("/query/:driver*", drivers.query);

app.get("/uploads/*", (req, res) => {
  res.sendFile(__dirname + "/"+decodeURI(req.url));
});

app.get("/db.json", (req, res) => {
  res.sendFile(__dirname + "/"+req.url);
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/"+req.url);
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  // console.log('a user connected');

  socket.broadcast.emit('hi');

  socket.on('disconnect', () => {
    // console.log('user disconnected');
  });

  socket.on('pop', (msg) => {
    // console.log('pop: ' + JSON.stringify(msg));
    io.emit('pop', msg);
  });

});
