'use strict'
exports.login = function(req, res, next) {
  let sql = "SELECT * FROM account WHERE username='"+req.body.username+"' AND password='"+req.body.password+"';";
  db.query(sql, function(err, rows, fields) {
      if (err) {}
      else {
        if(rows.length) {
          req.session.username = rows[0].username;
          req.session.name = rows[0].name;
          res.redirect('/login');
        }
        else {
           res.render('login', {fail: 1});
        }
      }
 });
}

exports.register = function(req, res, next) {
  let sql = "SELECT username, name FROM account WHERE username='"+req.body.username+"' OR name='"+req.body.name+"';";
  db.query(sql, function(err, rows, fields) {
     if (err) {}
     else {
        var i = 0, username = 0, name = 0;
        while (i < rows.length) {
           if (req.body.username == rows[i].username) {
              username = 1;
           }
           if (req.body.name == rows[i].name) {
              name = 1;
           }
           i++;
        }

        if (username == 1 || name == 1) {
            res.render('register', {success: '',username:username,name:name});
        }
        else {
           sql = "INSERT INTO account SET username='"+req.body.username+"',name='"+req.body.name+"',password='"+req.body.password+"';";
           var db1 = db;
           db1.query(sql, (err1, rows1, fields1)=>{
              if (err) {
              }
              else {
                 res.render('register', {success: 1,username:'',name:''});
              }
           });
        }
     }
  });
}
