"use strict";

let ex3 = require ('./exercise3.js');
let Stdt = ex3.Stdt;
let FrStdt = ex3.FrStdt;
var fs = require('fs');

class Promo extends Array{

    add(student){return this.push(student);}
    size(){return this.length;}
    get(i){return this[i];}
    print(){
        var temp="";
        for (var i=0;i<this.length;i++){
            temp=temp+"\n"+this.get(i).toString();
        }
        console.log(temp);
    }
    write(){return JSON.stringify(this);}
    read(str){
        var line=JSON.parse(str);
        for (var i=0;i<line.length;i++){
            this.add(new FrStdt(line[i].lastName,line[i].firstName, line[i].id));
        }
        return this;
    }
    saveToFile(fileName){
        fs.writeFile(fileName,this.write());
    }
    readFrom(fileName){
        var data = fs.readFileSync(fileName, 'utf8');
        this.read(data);
    }
}
/*
let promo = new Promo();
promo.add(new Stdt("priam","cardouat",1));
console.log(promo);
promo.add(new Stdt("astree","cardouat",2));
console.log(promo.print());
console.log(promo.write());
console.log(promo.read(promo.write()));*/

exports.Promo = Promo;