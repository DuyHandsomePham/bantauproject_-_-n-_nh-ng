'use strict';
module.exports = function(app) {
var session = require('express-session');
var user = require('../route/user.js');
var map = require('../route/map.js');
global.map = map;
var room = require('../route/room.js');
var device = require('../route/device.js');
var game = require('../route/game.js');

app.get('/', function(req, res, next) {
    if (req.query.device) {
      res.render('device', {name: req.session.name, dev: req.session.dev});
    }
    else if(req.query.map) {
      res.render('map0', {name: req.session.name, dev: req.session.dev});
    }
    else if(req.query.start){
       game.initScreeen(req, res, next);
    }
    else if(req.query.room) {
        let sql = 'SELECT player1 FROM room WHERE roomid='+req.session.roomid+';';
        db.query(sql, (err, rows, fields)=>{
           if (err) {
             console.log('ERROR');
           }
           else {
             res.render('room/play_room.ejs', {name: req.session.name,roomid:req.session.roomid});
           }
        });
    }
    else {
      res.render('index');
    }
});
app.post('/', function(req, res, next) {
  res.write('<button type="button" name="button" id="click">Count</button>');
  res.end();
});

app.get('/index.ejs', function(req, res) {
  res.render('index');
});
// user
app.get('/login', function(req, res, next) {
      res.render('login', {fail: ''});
});
app.post('/login', user.login);
app.get('/register', function(req, res) {
      res.render('register', {success:'', username:'',name:''});
});
app.post('/register.ejs', user.register);
app.get('/logout.ejs', function(req, res) {
    delete req.session.username;
    delete req.session.name;
    delete req.session.roomid;
    delete req.session.dev;
    res.redirect('/login');
});
// ================================================================
// User's map
// ================================================================
app.get('/map', function(req, res) {
  res.render('map', {name: req.session.name, dev: req.session.dev});
});
//ajax
app.post('/display.ejs', map.display);
app.post('/add.ejs', map.addmap);
app.post('/delete.ejs', map.deletemap);
// ================================================================
// Device connect
// ================================================================
app.get('/device.ejs', (req, res, next)=>{
   res.render('device', {name: req.session.name, dev: req.session.dev});
});
app.post('/device.ejs', device.listdevice);
app.post('/connect.ejs', device.connect);
// ================================================================
// Room system
// ================================================================
app.get('/room/index', function(req, res) {
    res.render('room/room.ejs', {name: req.session.name, dev: req.session.dev});
});
app.post('/room/list_room.ejs', room.list);
app.get('/room/create.ejs', room.createRoom);
app.get('/room/start', (req,res,next)=>{
    res.redirect('/?start=1');
    eventEmitter.emit('ClickStart');
});
app.get('/room/player1', (req,res,next)=>{
  let sql = 'SELECT player1 FROM room WHERE roomid='+req.session.roomid+';';
  db.query(sql, (err, rows, fields)=>{
     if (err) {
       console.log('ERROR');
     }
     else {
          res.write('<h3 style="color:blue">Player1: '+rows[0].player1+'</h3>');
          res.end();
          eventEmitter.emit('P2join',req.session.roomid);
     }
    });
});
app.post('/room/leave_room.ejs', room.deleteRoom);
app.post('/room/join.ejs', room.joinRoom);
app.post('/room/player2_join.ejs', room.player2);
app.post('/room/delete.ejs', room.deleteRoom);
// ================================================================
// Game
// ================================================================
app.get('/game/game.ejs', game.PlayerMap);
app.get('/game/action', game.action);
app.get('/game/score', game.score);
};
