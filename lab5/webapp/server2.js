"use strict";
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');

var NAMES = "database.txt";
var DATABASE = "storage.json";
var PORT = process.argv[2];
var DEFAULT = {title:"empty", color:"red", value:1};
var DEFAULTS = [{title:"empty", color:"red", value:1}, {title:"empty", color:"blue", value:2}, {title:"empty", color:"green", value:4}]
var DEFAULTS_COLORS = {aqua:"#00FFFF", black:"#000000", blue:"#0000FF", fushia:"#FF00FF", gray:"#808080", green:"#008000", lime:"#00FF00", maroon:"#800000",
                       navy:"#000080", olive:"#808000", purple:"#800080", red:"#FF0000", silver:"#C0C0C0", teal:"#008080", white:"#FFFFFF", yellow:"#FFFF00"};

function getCoord(percent) {
  const x = Math.floor(Math.cos(2 * Math.PI * (percent - 0.25)) * 10000)/10000;
  const y = Math.floor(Math.sin(2 * Math.PI * (percent - 0.25)) * 10000)/10000;
  return [x, y];
}

function notFound(response) {
  response.writeHeader(404, {"Content-Type": "text/html"});
  response.write("404 Not Found\n");
  response.end();
}

function forbid(response) {
  response.writeHeader(403, {"Content-Type": "text/html"});
  response.write("403 Forbidden\n");
  response.end();
}

function badRequest(response) {
  response.writeHeader(400, {"Content-Type": "text/html"});
  response.write("400 Bad Request\n");
  response.end();
}

function is_valid_color(color) {
  if (! color)
    return false;
  color = color.toLowerCase();
  if (color in DEFAULTS_COLORS)
    return true;
  if (color.length != 7)
    return false;
  if (color.match(/^#([0-9]|[a-f]|[A-F])*$/))
    return true;
  return false;
}

function negative_char(c) {
  switch (c.toLowerCase()) {
    case '0': return 'f';
    case '1': return 'e';
    case '2': return 'd';
    case '3': return 'c';
    case '4': return 'b';
    case '5': return 'a';
    case '6': return '9';
    case '7': return '8';
    case '8': return '7';
    case '9': return '6';
    case 'a': return '5';
    case 'b': return '4';
    case 'c': return '3';
    case 'd': return '2';
    case 'e': return '1';
    case 'f': return '0';
    case "#": return '#';
  }
}

function negative_color(color) {
  if (!is_valid_color(color)) return -1;
  if (color in DEFAULTS_COLORS)
    color = DEFAULTS_COLORS[color];

  var ret = "";
  for (let i=0; i<7; i++)
    ret += negative_char(color[i]);
  return ret;
}







function handle(request, response) {
  var myUrl = url.parse(request.url);
  var myPath = myUrl.pathname;
  myPath = myPath.slice(1, myPath.length);

  console.log("__________________________________________________");
  console.log("__________________________________________________");
  console.log(request.url);
  console.log(myPath);
  console.log(querystring.parse(myUrl.query));

  if (myPath == "") {
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write("The server is running.\n", 'utf8');
    response.end();
    return ;
  }

  if (myPath == "kill"){
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write("The server will stop now.\n", 'utf8', process.exit, 0);
    response.end();
    return ;
  }

  if (myPath == "pchart") {
    let slices = JSON.parse(fs.readFileSync(DATABASE).toString());

    let sum = 0;
    for (let slice of slices) {
      sum += slice.value;
    }
    var texts = [];
    var responseSvg = '<svg id="pchart" viewBox="-1 -1 2 2" height=500 width=500>';
    let cumulPercent = 0;
    for (let slice of slices) {
      let percent = slice.value/sum;
      let [x, y] = getCoord(cumulPercent);
      let [x_t, y_t] = getCoord(cumulPercent + percent/2);
      cumulPercent += percent;
      let [a, b] = getCoord(cumulPercent);

      let largeArcFlag = percent > .5 ? 1 : 0;

      let pathData = `M ${x} ${y} A 1 1 0 ${largeArcFlag} 1 ${a} ${b} L 0 0`;

      responseSvg += '<path d="' + pathData + '" fill="' + slice.color + '"></path>';
      console.log(slice.color);
      texts.push('<text x="' + x_t/2 + '" y="' + y_t/2 + '"fill="' + negative_color(slice.color) + '" style="font: italic 0.1px sans-serif;">' + slice.title + "</text>");
    }

    for (let text of texts)
      responseSvg += text;

    responseSvg += '</svg>'


    response.writeHeader(200, {"Content-Type": "image/svg+xml"});
    response.write(responseSvg);
    response.end();
    return;
  }


  if (myPath == "show") {
    if (!fs.existsSync(DATABASE)) {
      notFound(response);
      return;
    }
    let json = fs.readFileSync(DATABASE).toString();
    response.writeHeader(200, {"Content-Type": "application/json"});
    response.write(json);
    response.end();
    console.log(json);
    return;
  }

  if (myPath == "add") {
    let obj = querystring.parse(myUrl.query);
    if (parseInt(obj.value) == NaN || obj.title == undefined || !is_valid_color(obj.color)) {
      badRequest(response);
      return;
    }
    let array = [];

    if (fs.existsSync(DATABASE))
      array = JSON.parse(fs.readFileSync(DATABASE).toString());
    array.push({title: obj.title, color: obj.color, value: parseInt(obj.value)});

    let json = JSON.stringify(array);

    fs.writeFileSync(DATABASE, json);

    response.writeHeader(200, {"Content-Type": "application/json"});
    response.write(json);
    response.end();

    console.log(json);
    return;
  }

  if (myPath == "remove") {
    let index = parseInt(querystring.parse(myUrl.query).index);
    console.log("start to remove");
    if (index == NaN) {
      badRequest(response);
      return;
    }
    console.log("index != Nan");
    let array = [];

    if (fs.existsSync(DATABASE)) {
      console.log("File exists");
      let json = fs.readFileSync(DATABASE).toString();
      console.log("Json in file :", json);
      array = JSON.parse(json);
      console.log("Parsed");
    }
    //array.splice(index, 1);

    let json = JSON.stringify(array.slice(0, index).concat(array.slice(index+1)));
    console.log("Should start writing");
    fs.writeFileSync(DATABASE, json);
    console.log("Write ok");
/*
    fs.writeFile(DATABASE, json, function (err, data) {
      if (err) console.log(err);
      else console.log("Correctly written !");
    });
*/
    response.writeHeader(200, {"Content-Type": "application/json"});
    response.write(json);
    response.end();

    console.log("Response done");

    console.log(json);
    return;
  }

  if (myPath == "clear") {
    let json = JSON.stringify([DEFAULT]);

    fs.writeFileSync(DATABASE, json);

    response.writeHeader(200, {"Content-Type": "application/json"});
    response.write(json);
    response.end();
    //JSON.parse();
    return;
  }

  if (myPath == "restore") {
    let json = JSON.stringify(DEFAULTS);

    fs.writeFileSync(DATABASE, json);

    response.writeHeader(200, {"Content-Type": "application/json"});
    response.write(json);
    response.end();

    return;
  }


  if (myPath == "hello") {
    var name = querystring.parse(myUrl.query).name;
    fs.writeFileSync(NAMES, name + "<", {encoding: "utf-8", flag: "a"});
    response.writeHeader(200, {"Content-Type": "text/html; charset=UTF-8"});
    response.write("Hello " + name + " !", 'utf8');
    response.end();
    return;
  }


  if (myPath == "hello2") {
    var name = querystring.parse(myUrl.query).name.replace(/</g, "&lt&").replace(/>/g,"&gt&");
    var names = "None";
    if (fs.existsSync(NAMES))
      names = fs.readFileSync(NAMES, "utf-8").toString().slice(0, -1).replace(/</g, ", ");

    fs.writeFileSync(NAMES, name + "<", {encoding: "utf-8", flag: "a"});

    response.writeHeader(200, {"Content-Type": "text/html; charset=UTF-8"});
    response.write("Hello " + name + ", the following users have already visited this page: ", "utf-8");
    response.write(names, "utf-8");
    response.end();
    return ;
  }

  if (myPath.slice(0,6) == "Files/") {
    if (myPath.includes("/../")) {
      forbid(response);
      return;
    }
    myPath = myPath.slice(6);
    if (!fs.existsSync(myPath)) {
      notFound(response);
      return;
    }

    var header = {};
    if (myPath.slice(-4) == ".jpg" || myPath.slice(-5) == ".jpeg") {
      header["Content-Type"] = "image/jpeg";
    }
    if (myPath.slice(-4) == ".png") {
      header["Content-Type"] = "image/png";
    }
    if (myPath.slice(-4) == ".svg") {
      header["Content-Type"] = "image/svg+xml";
    }
    if (myPath.slice(-4) == ".txt") {
      header["Content-Type"] = "text/plain";
    }
    if (myPath.slice(-5) == ".html") {
      header["Content-Type"] = "text/html";
    }
    if (myPath.slice(-4) == ".css") {
      header["Content-Type"] = "text/css";
    }
    if (myPath.slice(-3) == ".js") {
      header["Content-Type"] = "application/javascript";
    }
    if (myPath.slice(-5) == ".json") {
      header["Content-Type"] = "application/json";
    }

    let file = fs.readFileSync(myPath, "binary");


    response.writeHeader(200, header);
    response.write(file, "binary");
    response.end();
    return;

    fs.readFile(myPath, "binary", function (err, file) {
      if (err) {
        response.writeHeader(500, {"Content-Type": "text/plain; charset=UTF-8"});
        response.write(err + "\n");
        response.end();
      } else {
        response.writeHeader(200, header);
        response.write(file, "binary");
        console.log("Read file", myPath);
        response.end();
      }
    });

    return;
  }

  // DEFAULT TREATMENT
  badRequest(response);
}




http.createServer(handle).listen(PORT);

console.log("Server Running on " + PORT);