"use strict";

const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
var bodyParser = require('body-parser');


var PORT = process.argv[2];
var DB = "db.json";
var DB_S = "db_save.json";

const exp = express();

exp.use(morgan("combined"));
exp.use(bodyParser.json());

exp.get('/', function (req, res) {
  res.send('Hi');
});

exp.get('/stop', function (req, res) {
  res.send("The server will stop and exit");
  process.exit(0);
});

exp.get('/restart', function (req, res) {
  console.log("get /restart");
  fs.writeFileSync(DB, fs.readFileSync(DB_S));
  res.send("db.json reloaded");
});

exp.get('/nbpapers', function (req, res) {
  var array = JSON.parse(fs.readFileSync(DB).toString());
  res.type("text/plain");
  res.send(""+array.length);
});

exp.get('/authoredby/:xxx', function (req, res) {
  var author = req.params.xxx;
  var array = JSON.parse(fs.readFileSync(DB).toString());
  var count = array.reduce(function (c, doc) {
    for (var auth of doc.authors) {
      if (auth.toLowerCase().includes(author.toLowerCase()))
        return c+1;
    }
    return c;
  }, 0);
  res.type("text/plain");
  res.send(""+count);
});

exp.get('/descriptors/:xxx', function (req, res) {
  var author = req.params.xxx;
  var all = JSON.parse(fs.readFileSync(DB).toString());
  var papers = all.reduce(function (papers, doc) {
    for (var auth of doc.authors) {
      if (auth.toLowerCase().includes(author.toLowerCase())) {
        papers.push(doc);
        return papers;
      }
    }
    return papers;
  }, []);
  res.json(papers);
});


exp.get('/ttlist/:xxx', function (req, res) {
  var author = req.params.xxx;
  var all = JSON.parse(fs.readFileSync(DB).toString());
  var titles = all.reduce(function (titles, doc) {
    for (var auth of doc.authors) {
      if (auth.toLowerCase().includes(author.toLowerCase())) {
        titles.push(doc.title);
        return titles;
      }
    }
    return titles;
  }, []);
  res.json(titles);
});


exp.get('/pubref/:xxx', function (req, res) {
  var xxx = req.params.xxx;
  var all = JSON.parse(fs.readFileSync(DB).toString());
  for (var doc of all) {
    if (doc.key == xxx) {
      res.json(doc);
      return;
    }
  }
  res.sendStatus(404);
});

exp.delete('/pubref/:xxx', function (req, res) {
  var xxx = req.params.xxx;
  var all = JSON.parse(fs.readFileSync(DB).toString());
  var index = -1;
  for (var i = 0; i < all.length; i++) {
    if (all[i].key == xxx) {
      index = i;
      break;
    }
  }
  if (index == -1) {
    res.sendStatus(404);
    return;
  }
  let json = JSON.stringify(all.slice(0, index).concat(all.slice(index+1)));
  fs.writeFileSync(DB, json);
  res.sendStatus(200);
});

exp.post('/pubref' , function (req, res) {
  var all = JSON.parse(fs.readFileSync(DB).toString());
  all.push(req.body);
  fs.writeFileSync(DB, JSON.stringify(all));
  res.sendStatus(200);
});


exp.put('/pubref/:xxx' , function (req, res) {
  var xxx = req.params.xxx;
  var all = JSON.parse(fs.readFileSync(DB).toString());
  var modified = false;
  for (var doc of all) {
    if (doc.key == xxx) {
      for (var key in req.body)
        doc[key] = req.body[key];
      modified = true;
    }
  }
  if (modified) {
    fs.writeFileSync(DB, JSON.stringify(all));
    res.sendStatus(200);
    return;
  } else {
    all.push(req.body);
    fs.writeFileSync(DB, JSON.stringify(all));
    res.sendStatus(200);
  }
});


exp.listen(PORT);