"use strict";

var colors = ["red", "blue", "green", "aqua", "silver", "purple", "lime"];
var DEFAULTS_COLORS = {aqua:"#00FFFF", black:"#000000", blue:"#0000FF", fushia:"#FF00FF", gray:"#808080", green:"#008000", lime:"#00FF00", maroon:"#800000",
                       navy:"#000080", olive:"#808000", purple:"#800080", red:"#FF0000", silver:"#C0C0C0", teal:"#008080", white:"#FFFFFF", yellow:"#FFFF00"};

function getCoord(percent) {
  const x = Math.floor(Math.cos(2 * Math.PI * (percent - 0.25)) * 10000)/10000;
  const y = Math.floor(Math.sin(2 * Math.PI * (percent - 0.25)) * 10000)/10000;
  return [x, y];
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




function request(name) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "../../" + name.toString());
  xhr.onload = function() {
    var div = document.getElementById("show_div");
    div.textContent = this.responseText;
  }
  xhr.send();
}


function show() {
  request("show");
}

function add() {
  var xhr = new XMLHttpRequest();
  var value = Math.floor(Math.random() * 4) + 1;
  var color = colors[Math.floor(Math.random() * colors.length)];
  var title = "t" + Math.floor(Math.random() * 10);


  xhr.open("GET", `../../add?title=${title}&color=${color}&value=${value}`);
  xhr.onload = function() {
    var div = document.getElementById("show_div");
    div.textContent = this.responseText;
  }
  xhr.send();
}

function remove() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "../../remove?index=0");
  xhr.onload = function() {
    var div = document.getElementById("show_div");
    div.textContent = this.responseText;
  }
  xhr.send();
}

function _clear() {
  request("clear");
}

function restore() {
  request("restore");
}

function svg() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "../../show");
  xhr.onload = function() {
    var div = document.getElementById("svg_div");
    if (document.getElementById("show") != null)
      div.removeChild(document.getElementById("show"));
    div.innerHTML = this.responseText;
  }
  xhr.send();
}

function localsvg() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "../../show");
  xhr.onload = function() {
    var div = document.getElementById("svg_div");

    let slices = JSON.parse(this.responseText);

    if (document.getElementById("pchart") != null)
      div.removeChild(document.getElementById("pchart"));

    var svgElt = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElt.setAttribute("id", "pchart");
    svgElt.setAttribute('viewBox', "-1 -1 2 2");
    svgElt.setAttribute("height", 500);
    svgElt.setAttribute("width", 500);

    let sum = 0;
    for (let slice of slices) {
      sum += slice.value;
    }

    var texts = [];

    let cumulPercent = 0;
    for (let slice of slices) {
      let percent = slice.value/sum;
      let [x, y] = getCoord(cumulPercent);

      let [x_t, y_t] = getCoord(cumulPercent + percent/2);

      cumulPercent += percent;
      let [a, b] = getCoord(cumulPercent);

      let largeArcFlag = percent > .5 ? 1 : 0;

      let pathData = `M ${x} ${y} A 1 1 0 ${largeArcFlag} 1 ${a} ${b} L 0 0`;


      var pathElt = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElt.setAttribute('d', pathData);
      pathElt.setAttribute('fill', slice.color);
      svgElt.appendChild(pathElt);

      var textElt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textElt.setAttribute("x", x_t/2);
      textElt.setAttribute("y", y_t/2);
      textElt.setAttribute("fill", negative_color(slice.color));
      textElt.setAttribute("style", "font: italic 0.1px sans-serif;");

      textElt.textContent = slice.title;
      texts.push(textElt);
    }

    for (let textElt of texts)
      svgElt.appendChild(textElt);

    div.appendChild(svgElt);
  }
  xhr.send();
}