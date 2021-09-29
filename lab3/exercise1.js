"use strict";

function loadDoc() {
  var xmlreq = new XMLHttpRequest();
  xmlreq.open("GET", "text.txt");
  xmlreq.onload = function() {
    var obj = document.getElementById("texta");
    obj.textContent += this.responseText;
  }
  xmlreq.send();
}

function generate_color() {
  var col = "#";
  var cols = "0123456789ABCDEF";

  for (var i = 0; i<6; i++) {
    col += cols[Math.floor(Math.random()*16)];
  }
  return col;
}


function loadDoc2() {
  var xmlreq = new XMLHttpRequest();
  xmlreq.open("GET", "text.txt");
  xmlreq.onload = function() {
    var div = document.getElementById("texta2");
    var lines = this.responseText.split("<br/>");
    var p;
    for (var i in lines) {
      p = document.createElement("p");
      p.textContent = lines[i];
      p.style.color = generate_color();
      div.appendChild(p);
    }
  }
  xmlreq.send();
}