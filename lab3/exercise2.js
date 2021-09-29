"use strict";

function send() {
  var xmlreq = new XMLHttpRequest();
  var txt = document.getElementById("textedit").value;
  if (txt == "") return;
  txt = "chat.php?phrase="+txt;
  xmlreq.open("GET", txt);
  xmlreq.send();
}


function reload(){
  var xmlreq = new XMLHttpRequest();
  xmlreq.open("GET", "chatlog.txt");
  xmlreq.onload = function() {
    var div = document.getElementById("texta");
    var lines = this.responseText.split("\n").reverse();
    let n = div.childElementCount;
    for (let i=0; i<n; i++)
      div.removeChild(div.firstChild);
    var p;
    for (let i in lines) {
      if (lines[i] == "") continue;
      p = document.createElement("p");
      p.textContent = lines[i];
      div.appendChild(p);
      if (div.childElementCount == 10) break;
    }
  }
  xmlreq.send();
}

setInterval(reload, 1000);