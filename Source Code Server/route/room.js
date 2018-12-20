'use strict'

exports.list = function(req, res, next) {
  let sql = "SELECT * FROM room WHERE num > 0;";
  db.query(sql, function(err, rows, fields) {
      if (err) {
        console.log("ERROR");
      }
      else {
          var num, player1, roomid, i = 0;
          while (i < rows.length) {
             num = rows[i].num;
             player1 = rows[i].player1;
             roomid = rows[i].roomid;
             res.write('<div class="boxed"><h3>Room: '+roomid);
             res.write(' - Host: <span style="color:blue>">'+player1+'</span> - ')
             if (num != 2) {
               var waiting = '<span style="color:lime">WAITING</span>'
                           +'<form action="/room/join.ejs" method="post">'
                           +' <input type="hidden" name="roomid" value="'+roomid+'" />'
                           +' <input type="submit" name="join" value="JOIN" />'
                           +'</form></h3></div><p/>';
               res.write(waiting);
             }
             else res.write(' <span style="color:red">Full</span></h3></div><p/>');
             i++;
          }
          res.end();
      }
 });
}
//player1 create room
exports.createRoom = function(req, res, next) {
   let sql = "INSERT INTO room SET player1='"+req.session.name+"',num = 1;";
   var db1 = db;
   db.query(sql, (err, rows, fields)=>{
      if (err) {
         console.log("ERROR");
      }
      else {
         sql = "SELECT roomid FROM room WHERE player1='"+req.session.name+"';";
         db1.query(sql, (err1, rows1, fields1)=>{
            if (err) {}
            else {
                //player1 roomid session
                req.session.roomid = rows1[0].roomid;
            }
            res.redirect('/?room=1');
         });
      }
   });
}

exports.deleteRoom = function(req, res, next) {
   var roomid = req.session.roomid;
   delete req.session.roomid;
   let sql = 'DELETE FROM room WHERE roomid='+roomid+';';
      db.query(sql, (err, rows, fields)=>{
      sql = 'DELETE FROM fire WHERE name="'+req.session.name+'";';
      db.query(sql, (err, rows, fields)=>{
          if (err) console.log(err);
          else res.redirect('/room/index');
      });
   });
}
//player2 create room
exports.joinRoom = function(req, res, next) {
   var db1 = db;
   var turn = Math.floor(Math.random() * (2 - 1)) + 1;
   let sql = "UPDATE room SET turn="+turn+",player2='"+req.session.name+"',num=2 WHERE roomid="+req.body.roomid+";";
   db.query(sql, (err, rows, fields)=>{
      if(err) {}
      else {
        sql = "SELECT roomid FROM room WHERE player2='"+req.session.name+"';";
        db1.query(sql, (err1, rows1, fields1)=>{
           if (err) {}
           else {
               //player2 roomid session
               req.session.roomid = rows1[0].roomid;
           }
           res.redirect('/?room=1');
       });
      }
   });
}
// display player2 and add turn
exports.player2 = function(req, res, next) {
  let sql = "SELECT player1,player2,turn FROM room WHERE roomid="+req.session.roomid+";";
  db.query(sql, (err, rows, fields)=>{
      if (err){}
      else {
            if (rows[0].player2) {
            let str ='<h3 style="color:blue">Player 2: '+rows[0].player2+'</h3>';

                  /*eventEmitter.emit('JoinRoom', req.session.roomid);
                  if(turn == 1 && req.session.name == rows[0].player1) {
                    req.session.pointer = {x:1,y:1};
                  }
                  else if(turn == 2 && req.session.name == rows[0].player2) {
                    req.session.pointer = {x:1,y:1};
                  }
                  else {
                    req.session.pointer = {x:'a',y:'a'};
                  }*/
                  req.session.turn = rows[0].turn;
                  if (req.session.name==rows[0].player1) {
                  res.write('<form action="/room/start" method="get">'
                     +'<input type="submit" name="start" value="START GAME" />'
                     +'</form><p/>');
                  }
                  req.session.turn = rows[0].turn;
                  res.write('<h3 style="color:red">Player '+rows[0].turn+' FIRST!</h3>');
                  res.write(str);
                  res.end();
          }
        }
  });
}
// start game click
