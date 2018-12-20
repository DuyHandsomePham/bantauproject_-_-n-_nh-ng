// ================================================================
// get all the tools we need
// ================================================================
var express = require('express');
var routes = require('./route/main.js');
var net = require('net');
var mysql = require('mysql');
var port = process.env.PORT || 3000;
var app = express();
// application
app.use('/public', express.static(process.cwd() + '/public'));
app.set('view engine', 'ejs');
app.set('views','./views');
//bodyParser for form handling
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//session init
var session = require('express-session');
app.use(session({
  secret: "sosecret",
  saveUninitialized: false,
  resave: false
}));
app.use((req, res, next)=>{
  global.logged = req.session.username;
  next();
});

var events = require('events');
var eventEmitter = new events.EventEmitter();
global.eventEmitter = eventEmitter;
var http = require("http").Server(app);
// setting for tcp socket
var PORT = 6969;
//Database connect
var db = mysql.createConnection ({
    host: 'project.cvllvtkeljmi.ap-southeast-1.rds.amazonaws.com',
    user: 'taikhoan',
    password: '123rule456',
    database: 'projectdb'
});
db.connect((err) => {
  if(err) {
    console.log("LOI database");
  }
  else console.log('Connected to database');
});
global.db = db;
// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
var net = require('net');
var server = net.createServer();
global.server = server;
server.listen(PORT, function(){
   console.log("Listen TCP: "+ PORT);
});
server.on('connection', function(sock) {

    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

    sock.on('data', function(data){
       var a = data+'';
       if (data.indexOf(':') < 0) {
          var sql = "INSERT INTO device SET dev_name='"+data+"';";
          db.query(sql, (err,rows,fields)=>{
            if(err){}
            else {
              sock.dev=data;
              eventEmitter.emit('newdev');
           }
         });
       }
       else {
            var cmd = a.split(':');
            if (cmd[1] == 'F') {
              eventEmitter.emit('Fire', cmd[0]);
            }
            else {
              var name = parseInt(cmd[0]);
              eventEmitter.emit('Move', {dev:name,dir:cmd[1]});
            }
       }
    });

    sock.on('close', function(data) {
        var sql = "DELETE FROM device WHERE dev_name='"+sock.dev+"';";
        db.query(sql, (err,rows,fields)=>{
            if(err){}
            else {
              eventEmitter.emit('newdev');
            }
        });
    });
});


// ================================================================
// socket.io
// ================================================================
var io = require('socket.io')(http);
io.on('connection', (socket)=>{
   eventEmitter.on('newdev', ()=>{
      io.sockets.emit('NewDevice');
   });

   eventEmitter.on('P2join', (data)=>{
     socket.join(data);
     socket.room = data;
     io.to(socket.room).emit('DisplayP2');
   });
   eventEmitter.on('ClickStart', ()=>{
     io.to(socket.room).emit('ToGameScreen');
     eventEmitter.removeAllListeners();
   });

   socket.on('JoinIO', (data)=>{
     socket.join(data);
     socket.room = data;
     socket.end = 0;
     socket.pointer = {x:'a',y:'a'};
   });
   eventEmitter.on('Move', (data)=>{
      socket.emit('playerMove', data);
   });
   eventEmitter.on('Fire', (data)=>{
      socket.emit('playerFire', data);
   });
   eventEmitter.on('GetPointer', (data)=>{
      socket.pointer = data.pointer;
   });
   eventEmitter.on('GameEnd', (data)=>{
      socket.end = 1;
   });

   socket.on('MyTurnEnd', function(){
      //socket.broadcast.to(socket.room).emit('UpdateYourTurn', socket.pointer);
      io.to(socket.room).emit('UpdateYourTurn',{end:socket.end});
   });

   socket.on('MapUpdate', function(){
      socket.emit('Map', {pointer:socket.pointer,end:socket.end});
   });
});

// ================================================================
// setup routes
// ================================================================
routes(app);
// ================================================================
// start our server
// ================================================================
http.listen(port, function() {
  var sql = "DELETE FROM device WHERE deviceid > 0;";
  db.query(sql, function(err, rows, fields){
     if(err){}
     else {
        console.log('DEVICE refresh');
        var db1 = db;
        sql = "DELETE FROM room WHERE roomid > 0;";
        db1.query(sql, function(err1,rows1,fields1){
          if(err1) {}
          else console.log('ROOM refresh');
        });
     }
     var sql1 = "DELETE FROM fire WHERE id > 0;";
     db.query(sql1, function(err2, rows2, fields2){
        if (err2) {}
        else console.log("REFRESH");
     });
  });
  console.log('Server listening on port ' + port + '…');
});
