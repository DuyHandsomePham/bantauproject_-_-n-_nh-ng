exports.display = function(req, res, next) {
  if(req.body.init) {
      req.session.count = 0;
  }
  var sql = "select * from map where name ='"+req.session.name+"';";
  db.query(sql, function(err, rows, fields) {
      if (err) {
        console.log(err);
      }
      else {
          var X = [],Y = [], z = 0;
          while (z < rows.length) {
             X[z] = rows[z].x;
             Y[z] = rows[z].y;
             z++;
          }
          if (rows.length >= 6) {
            res.write('<h3 style="color:red">You have enough location</h3>');
            delete req.session.count;
          }
          grid(X, Y,'','','','','','', req, res);
      }
 });
}

exports.addmap = function(req, res, next) {
    var sql = "INSERT INTO map SET x="+req.body.x+",y="+req.body.y+",name='"+req.session.name+"';";
    db.query(sql, function(err, rows, fields) {
        if (err) {
          console.log("ERROR");
        }
        else {
          req.session.count++;
          if (req.session.count < 7) {
            res.write('<h4 style="color:green">ADDED: '+req.session.count+'/6</h4>');
          }
          res.end();
        }
   });
}

exports.deletemap = function(req, res, next) {
  var sql = "DELETE FROM map WHERE name='"+req.session.name+"';";
  db.query(sql, function(err, rows, fields) {
      if (err) {
        console.log("ERROR");
      }
      else {
          req.session.count = 0;
          res.write("DELETED");
          res.end();
      }
 });
}

function grid(X, Y, pointer,missX,missY,onX, onY, id, req, res) {
    res.write('<table id="'+id+'" border=1px>');
    var c = 0; var find = 0;
    for (var j = 0; j < 9; j++) {
        res.write('<tr>');
        for (var i = 0; i < 9; i++) {
            if (j == 0 && i > 0) {
                res.write('<td height="40px" width="40px"><strong>'+i+'</strong></td>');
            }
            else if (i == 0 && j > 0) {
                res.write('<td height="40px" width="40px"><strong>'+j+'</strong></td>');
            }
            else {
                if (pointer.x == i && pointer.y == j) {
                  res.write('<td height="40px" width="40px" bgcolor="#f44242"/>');
                }
                else {
                // check location X,Y
                while(c < onX.length) {
                    if (onX[c] == i && onY[c] == j) {
                        res.write('<td height="40px" width="40px"><strong style="color:red">O</strong></td>');
                        find = 1;
                        onX[c] = 10;
                        onY[c] = 10;
                        break;
                    }
                    else {
                        c++;
                    }
                }
                if (find == 0) {
                    c = 0;
                    while(c < missX.length) {
                        if (missX[c] == i && missY[c] == j) {
                            res.write('<td height="40px" width="40px"><strong>X</strong></td>');
                            find = 1;
                            missX[c] = 10;
                            missY[c] = 10;
                            break;
                        }
                        else {
                            c++;
                        }
                    }
                }
                if (find == 0) {
                    c = 0;
                      while(c < X.length) {
                          if (X[c] == i && Y[c] == j) {
                              res.write('<td height="40px" width="40px" bgcolor="#f4e842" />');
                              find = 1;
                              X[c] = 10;
                              Y[c] = 10;
                              break;
                          }
                          else {
                              c++;
                          }
                    }
                }
                if (find == 0) {
                    res.write('<td height="40px" width="40px"/>');
                }
                c = 0;
                find = 0;
              }
            }
        }
        res.write('</tr>');
    }
    res.write('</table>');
    res.end();
}

exports.grid = grid
