// Import express to create and configure the HTTP server
var express = require('express');

// Create a HTTP server
var app = express();

// Parser to read JSON file
var bodyParser = require('body-parser');
app.use(bodyParser());

// Import FS (FileSystem)
var fs = require('fs');
var file = "diamonds.db";
var exists = fs.existsSync(file);

// JSON format
var data = JSON.parse(fs.readFileSync('diamonds.json', 'utf8'));

// If the db file does not exist
if(!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
}

// Create a sqlite3 database & open connection
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(file);  // could be a directory file or memory

db.serialize(function(){
    if (!exists) {
        // Id is auto generated
        db.run("CREATE TABLE diamonds (price INTEGER, carat REAL, cut TEXT, colour TEXT, clarity TEXT, x REAL, y REAL, z                REAL, depth REAL, tables REAL)");

        var stmt = db.prepare("INSERT INTO diamonds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        data.forEach(function(diamond){
            stmt.run(diamond.price, diamond.carat, diamond.cut, diamond.color, diamond.clarity, diamond.x, diamond.y,                   diamond.z, diamond.depth, diamond.table);
        });
        stmt.finalize();
    }
});

db.close();

app.get('/', function(req, res) {
    res.send("API Working - Diamonds");
});

// Allows user to select by id from the database
app.get('/:id', function(req, res) {
    
    var result = "";
    var db = new sqlite3.Database(file);
    
    db.get("SELECT rowid as id, price, carat, cut, colour, clarity, x, y, z, depth, tables FROM diamonds WHERE id = ?",         req.params.id, function(err, row){
    
    if (row === undefined) {
        result = "Could not find record: " + req.params.id + "\n";
        res.send(result);
    }
    else{
        result = "id:\t" + row.id + "\nprice:\t" + row.price + "\ncarat:\t" + row.carat + "\ncut:\t" + row.cut +                     "\ncolour:\t" + row.colour + "\nclarity:" + row.clarity + "\nx:\t" + row.x + "\ny:\t" + row.y + "\nz:\t" +                   row.z + "\ndepth:\t" + row.depth + "\ntable:\t" + row.tables + "\n";
        res.send(result);
    }
        
    });
    db.close();
});

// Allows user to update records in database by id
app.put('/:id', function(req, res) {

    var result = "";
    var price = req.body.price;
    var db = new sqlite3.Database(file);

    db.run("UPDATE diamonds SET price=?, carat=?, cut=?, colour=?, clarity=?, x=?, y=?, z=?, depth=?, tables=? WHERE                rowId=?", [req.body.price, req.body.carat, req.body.cut, req.body.colour, req.body.clarity, req.body.x, req.body.y,             req.body.z, req.body.depth, req.body.table, req.params.id], function(err, row){

    if (this.changes == 1) {
        result = "Updated diamond with id: " + req.params.id + "\n";
        res.send(result);
    }
    else{
        result = "Could not find diamond with id: " + req.params.id + "\n";
        res.send(result);
    }
        
    });
    db.close();
});

// Allow user to add to database
app.post('/', function(req, res) {
    
    var result = "";
    var price = req.body.price;
    var db = new sqlite3.Database(file);

    db.run("INSERT INTO diamonds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [req.body.price, req.body.carat, req.body.cut,         req.body.colour, req.body.clarity, req.body.x, req.body.y, req.body.z, req.body.depth, req.body.table],function(err,row)     {

    if (this.changes == 1) {
        result = "Inserted diamond with id: " + this.lastID + "\n";
        res.send(result);
    }
    else{
        result = "Could not insert diamond!\n";
        res.send(result);
    }
        
    });
    db.close();
});

// Removing by if remove database
app.delete('/:id', function(req, res) {
    
    var result = "";
    var db = new sqlite3.Database(file);
    db.run("DELETE FROM diamonds WHERE rowId = ?", req.params.id, function(err, row){

    if (this.changes == 1) {
        result = "Deleted diamond with id: " + req.params.id + "\n";
        res.send(result);
    }
    else{
        result = "Could not delete diamond with id: " + req.params.id + "\n";
        res.send(result);
    }
        
    });
    db.close();
});

var server = app.listen(8000);

console.log("Web Service running on localhost:8000");