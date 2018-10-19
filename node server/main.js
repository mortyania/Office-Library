//Liberies
//express
let express = require('express');
let app = express();
let Connection = require('tedious').Connection;
let Request = require('tedious').Request;
let bodyParser = require("body-parser");
app.use(express.static(__dirname + '/app'));
//because we are expecting json files....
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
//Paths
let path = require('path');
//body
require('./sql.js')(Connection, Request, app);

//app.listen(8080, () => console.log('Example app listening on port 8080'));
let server = app.listen(8080, "127.0.0.1", function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log('running at http://' + host + ':' + port)
});



