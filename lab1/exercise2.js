"use strict";

function wcount(str){
    const texte = str.split(" ");
    var dico = {};
    for (var i=0; i<texte.length;i++){
        if (texte[i] in dico){dico [texte[i]]++}
        else {dico [texte[i]] = 1}
    }
    return dico;
}


class WordL{
    constructor(s){
        var dico = wcount(s);

        this.maxCountWord=function (){
            var max_temp=Object.entries(dico)[0];
            var max=max_temp[0];
            var nb_max=max_temp[1];
            for (const elem in dico){
                if (dico [elem] > nb_max){
                    max=elem;
                    nb_max=dico[elem];
                }
                if (dico [elem] == nb_max){
                    if (elem<max){
                        max=elem;
                        nb_max=dico[elem];
                    }
                }
            }
            return max;
        };
        this.minCountWord=function (){
            var iter=0;
            var min_temp=Object.entries(dico)[0];
            var min_word=[];
            for (const x in dico){
                if (dico [x] <= min_temp[1]){
                    min_word[iter]=x;
                    min_temp=[x,dico[x]];
                    iter++;
                }
            }
            if (min_word.length==0){min_word[0]=min_temp[0]};
            return min_word.sort()[0];
        };
        this.getWords=function (){
            var tableau=[];
            var iter=0;
            for (const x in dico){
                tableau[iter]=x;
                iter++;
            }
            return tableau.sort();
        };
        this.getCount=function (word){return dico [word];};
        this.applyWordFunc=function (f){
            var res =[];
            var iter=0;
            var temp=this.getWords();
            for (var i=0;i<temp.length;i++){
                res[iter]=f(temp[i]);
                iter++;
            }
            return res;
        };
    }

}


exports.wcount = wcount;
exports.WordL = WordL;