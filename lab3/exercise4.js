"use strict";

var slides;
var paused;
var current_slide;

function load() {
  var xmlreq = new XMLHttpRequest();
  xmlreq.open("GET", "slides.json");
  xmlreq.onload = function() {
    slides = JSON.parse(this.responseText);
    slides.functions = [];
  }
  xmlreq.send();
}

load();


function play_slide(slide) {
  var div = document.getElementById("SLSH");
  if (div.firstChild) div.removeChild(div.firstChild);
  var frame = document.createElement("iframe");
  frame.src = slide.url;
  frame.style.height = "100%";
  frame.style.width = "100%";
  div.appendChild(frame);
  current_slide = slide;
}

function play() {
  for (let i in slides.functions)
    clearTimeout(slides.functions[i]);
  slides.functions = []
  for (let i in slides.slides) {
    slides.functions.push(setTimeout(play_slide, 1000 * slides.slides[i].time, slides.slides[i]));
  }
  document.getElementById("paus").textContent = "Pause";
  paused = false;
}

function pause() {
  if (current_slide == undefined) return;
  if (paused) {
    for (let i in slides.slides) {
      if (current_slide.time < slides.slides[i].time) {
        slides.functions.push(setTimeout(play_slide, 1000*(slides.slides[i].time - current_slide.time), slides.slides[i]));
      }
    }
    document.getElementById("paus").textContent = "Pause";
    paused = false;
    return;
  }
  for (let i in slides.functions) {
    clearTimeout(slides.functions[i]);
  }
  slides.functions = [];
  document.getElementById("paus").textContent = "Continue";
  paused = true;
}


function previous() {
  for (let i in slides.functions)
    clearTimeout(slides.functions[i])
  slides.functions = [];
  document.getElementById("paus").textContent = "Continue";
  paused = true;

  if (current_slide == undefined) return;

  var prec;
  for (let i in slides.slides) {
    if (slides.slides[i].time < current_slide.time) {
      if (prec == undefined)
        prec = slides.slides[i];
      else if (slides.slides[i].time > prec.time)
        prec = slides.slides[i];
    }
  }
  if (prec) play_slide(prec);
}


function next() {
  for (let i in slides.functions)
    clearTimeout(slides.functions[i])
  slides.functions = [];
  document.getElementById("paus").textContent = "Continue";
  paused = true;

  if (current_slide == undefined) {
    console.log("no slide");
    return;
  }

  var suiv;
  for (let i in slides.slides){
    if (slides.slides[i].time > current_slide.time) {
      if (suiv == undefined)
        suiv = slides.slides[i];
      else if (slides.slides[i].time < suiv.time)
        suiv = slides.slides[i];
    }
  }
  if (suiv) play_slide(suiv);
}