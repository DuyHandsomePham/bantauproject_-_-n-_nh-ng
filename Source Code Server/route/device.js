'use strict'
exports.listdevice = function(req, res, next) {
   let sql = "SELECT * FROM device;";
   db.query(sql, (err, rows, fields)=>{
      if (err){}
      else {
         var dev_name, i = 0;
         if (rows.length == 0) {
            res.write('<h3>No device connected! </h3>');
         }
         else {
         while (i < rows.length) {
            dev_name = rows[i].dev_name;
            if (rows[i].connected) {
               res.write('<h3>Device: <span style="color:green">'+dev_name+'</span> - <span style="color:red">CONNECTED!</span></h3>');
            }
            else {
            res.write('<form action="connect.ejs" method="post">'
            +'<h3>Device: <span style="color:green">'+dev_name+'</span> - '
            +'<input type="hidden" name="dev_name" value="'+dev_name+'"/>'
            +'<input type="submit" name="enter" value="CONENCT"/></h3></form></p>');
            }
            i++;
          }
         }
         res.end();
      }
   });
}

exports.connect = function(req, res, next) {
    var sql = "UPDATE device SET connected=1 WHERE dev_name='"+req.body.dev_name+"';";
    db.query(sql, (err, rows, fields)=>{
        if(err){}
        else {
          req.session.dev = req.body.dev_name;
          eventEmitter.emit('newdev');
          res.redirect('/?device=1');
        }
    });
}
