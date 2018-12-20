'use strict'
function initScreeen(req, res, next) {
   let sql = "SELECT * FROM room WHERE roomid="+req.session.roomid+";";
   db.query(sql, (err, rows, fields)=>{
      if(err){}
      else {
        req.session.score = 0;
        var a = parseInt(req.session.dev);
        if (req.session.name == rows[0].player1 && rows[0].turn == 1) {
          res.render('game', {dev: a,turn:1,roomid:req.session.roomid,player1:1});
        }
         else if (req.session.name == rows[0].player1 && rows[0].turn == 2) {
          res.render('game', {dev: a,turn:1,roomid:req.session.roomid,player1:0});
        }
        else {
          res.render('game', {dev: a,turn:0,roomid:req.session.roomid,player1:0});
        }
      }
   });
}
exports.initScreeen = initScreeen

exports.score = function(req, res, next) {
  res.write('<h3 style="color:yellow">Score: '+req.session.score+'</h3>');
  if (req.session.score == 6) {
      res.write('<h1 style="color:cyan">YOU WIN</h1>');
      eventEmitter.emit('GameEnd');
  }
  res.end();
}

exports.PlayerMap = function(req, res, next) {
  if (req.query.map1) {
      let sql = "SELECT * FROM map WHERE name='"+req.session.name+"';";
      db.query(sql, (err, rows, fields)=>{
      if(err){}
      else {
          var X = [],Y = [], z = 0, ontarget=0;
          while (z < rows.length) {
                 X[z] = rows[z].x;
                 Y[z] = rows[z].y;
                    if (req.query.pointer.x == X[z] && req.query.pointer.y == Y[z]) {
                        ontarget=1;
                    }
                 z++;
             }
             if (req.query.updateMap1) {
                if (req.query.pointer.x != 'a') {
                  if(ontarget) {
                     map.grid(X, Y,'','','',req.query.pointer.x,req.query.pointer.y,'my_table' ,req, res);
                  }
                  else {
                     map.grid(X, Y,'',req.query.pointer.x,req.query.pointer.y,'','','my_table' ,req, res);
                  }
                }
             }
             else {
                map.grid(X, Y,'','', '' ,'','','my_table' ,req, res);
             }
           }
      });
   }
   else {
     if (req.query.pointer.x != 'a') {
       map.grid(0, 0,req.query.pointer,'','' ,'','','my_table' ,req, res);
     }
     else {
       map.grid(0, 0,'','','' ,'','','my_table' ,req, res);
     }
   }
}

exports.action = function(req, res, next) {
      let sql, player,missX=[],missY=[],onX=[],onY=[];
      var db1=db, db2=db;
      sql = "SELECT * FROM fire WHERE name='"+req.session.name+"';";
      db.query(sql, (err, rows, fields)=>{
         if(err) {
           console.log(err);
         }
         else {
           var i = 0, ontarget = 0,exist = 0;
           while (i < rows.length) {
              if (req.query.pointer.x == rows[i].onX && req.query.pointer.y == rows[i].onY) {
                  exist = 1;
              }
              onX[i] = rows[i].onX;
              onY[i] = rows[i].onY;
              missX[i] = rows[i].missX;
              missY[i] = rows[i].missY;
              i++;
          }
          if (req.query.fire) {
               sql = "SELECT x,y FROM map "
                 +"INNER JOIN room ON map.name=room.player"+req.query.map+" WHERE roomid="+req.session.roomid+";";
               db1.query(sql, (err1,rows1,field1)=>{
                 if(err1) {
                   console.log(err1);
                 }
                if (exist == 0) {
                    i = 0;
                    while (i < rows1.length) {
                       if (req.query.pointer.x == rows1[i].x && req.query.pointer.y == rows1[i].y) {
                           ontarget = 1;
                           break;
                       }
                       i++;
                    }
                     if (ontarget) {
                         req.session.score++;
                         sql = "INSERT INTO fire SET onX="+req.query.pointer.x+",onY="+req.query.pointer.y
                         +",name='"+req.session.name+"';";
                         db2.query(sql, (err2,rows2,field2)=>{
                           if (err2) {console.log(err2);}
                           else {
                              onX[rows1.length] = req.query.pointer.x;
                              onY[rows1.length] = req.query.pointer.y;
                              map.grid(0, 0,'',missX,missY,onX,onY,'enemy_table' ,req, res);
                           }
                         });
                     }
                     else {
                       sql = "INSERT INTO fire SET missX="+req.query.pointer.x+",missY="+req.query.pointer.y
                       +",name='"+req.session.name+"';";
                       db2.query(sql, (err2,rows2,field2)=>{
                         if (err2) {console.log(err2);}
                         else {
                            missX[rows1.length] = req.query.pointer.x;
                            missY[rows1.length] = req.query.pointer.y;
                            map.grid(0, 0,'',missX,missY,onX,onY,'enemy_table' ,req, res);
                         }
                       });
                     }
                }
                else {
                  map.grid(0, 0,'',missX,missY,onX,onY,'enemy_table' ,req, res);
                }
              });
              eventEmitter.emit('GetPointer', {pointer:req.query.pointer});
          }
          else if (req.query.toggle) {
            map.grid(0, 0,req.query.pointer,missX,missY,onX,onY,'enemy_table' ,req, res);
          }
          else {
            map.grid(0, 0, req.query.pointer,missX,missY,onX,onY,'enemy_table' ,req, res);
          }
        }
     });
}
