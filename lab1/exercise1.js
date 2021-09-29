"use strict";

function fibIt(n){
    if (n<2) {return n};
    var a=1;
    var b=1;
    for (var i=2;i<n;i++){
        var c = a+b;
        a=b;
        b=c;
    }
    return c;
}

function fiboRec(n){
    if (n<2) {return n};
    return fiboRec(n-1)+fiboRec(n-2);
}

function fiboArr(l){
    var res=[];
    for (var i=0;i<l.length;i++){
        res[i]=fiboRec(l[i]);
    }
    return res;
}

function fiboMap(l){
    return l.map(fiboRec);
}


exports.fibIt = fibIt;
exports.fiboRec = fiboRec;
exports.fiboArr = fiboArr;
exports.fiboMap = fiboMap;