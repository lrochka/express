const express = require('express')
const app = express()
var mysql = require('mysql');
var pool = mysql.createPool({
  host: "zanner.org.ua",
  port: "33321",
  user: "user",
  password: "123456789",
  database: "world_x"
});
app.use(express.static(__dirname + '/public'));
exports.connection = {
    query: function () {
        var queryArgs = Array.prototype.slice.call(arguments),
            events = [],
            eventNameIndex = {};

        pool.getConnection(function (err, conn) {
            if (err) {
                if (eventNameIndex.error) {
                    eventNameIndex.error();
                }
            }
            if (conn) { 
                var q = conn.query.apply(conn, queryArgs);
                q.on('end', function () {
                    conn.release();
                });

                events.forEach(function (args) {
                    q.on.apply(q, args);
                });
            }
        });

        return {
            on: function (eventName, callback) {
                events.push(Array.prototype.slice.call(arguments));
                eventNameIndex[eventName] = callback;
                return this;
            }
        };
    }
};

app.get('/', function(req, res) {
  console.log("before exports");
    exports.connection.query('SELECT * FROM countryinfo;', function(error, results, fields) {
      console.log("inside exports");
      if (error) throw error
      var str='<p>hello iasa!</p>';
  // results is an array with one element for every statement in the query:
    try {
      str = '<link rel="stylesheet" type="text/css" href="stylesheets/style.css" />'+'<table>';
      for(var key in results){
      const data = JSON.parse(results[key].doc);
        str += '<tr>';
        str += '<td>'+ data.Name+'</td>';
        str += '<td>'+ data.geography.Continent+'</td>';
        str += '<td>'+ data.IndepYear+'</td>';
      str += '</tr>';
      console.log(data);
      }
      str += '</table>';
    } catch(err) {
      console.error(err)
    } 
    
    res.send(str);
      
     console.log(results); // [{2: 2}]
    });
  
    //res.sendfile('./index.html');
})


app.get('/abc', function(req, res) {
  res.sendfile('./index.html');
})

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port 3000!')
})