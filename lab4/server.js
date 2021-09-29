"use strict";

var my_http = require("http"),
url = require("url"), 
path = require("path"),
filesys = require("fs"); 
var escape = require('escape-html'); 
const querystring = require('querystring');

var user_list = [];

my_http.createServer(function(request,response){  

    console.log(request.url);
    if (request.url == "/kill") {
        response.writeHead(200, {
            'Content-Type': 'text/html'
          })
        response.write('The server will stop now.')
        response.end(); 
        process.exit(0)
    }

    /*else if ((request.url.startsWith("..")) || (request.url.startsWith("/.."))) {
        response.writeHead(404);
        response.end("404 Sorry, we can't serve files in parent directories");
        response.end(); 
    }*/

    else if (request.url.startsWith("/Files")){
        var filePath = request.url.replace("/Files", "");
        var filePath = '.' + filePath;
        if ((filePath == './') || (filePath == '.')) filePath = './index.html';
        var extname = path.extname(filePath);
        var contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'application/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;      
            case '.jpg':
                contentType = 'image/jpeg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
        }
        filesys.readFile(filePath, function(error, content) {
            if (error) {
                if(error.code == 'ENOENT'){
                    filesys.readFile('./404.html', function(error, content) {
                        response.writeHead(404, { 'Content-Type': contentType });
                        response.end(content, 'utf-8');
                    });
                }
                else {
                    response.writeHead(500);
                    response.end('Sorry, an unexpected error occured');
                    response.end(); 
                }
            }
            else {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
        });
    }
    else if (request.url.startsWith('/hi?user=')) {
        var user_string = decodeURI(request.url.replace("/hi?user=", ""));
        response.writeHead(200, {
          'Content-Type':  'text/html; charset=utf-8'
        });
        var response_text = 'hi ' + user_string;
        response.end(`<p>${response_text}</p>`, "utf-8");
    }

    else if (request.url.startsWith('/ciao?nom=')) {
        var user_string = querystring.unescape(request.url.replace("/ciao?nom=", ""));
        var user_string = escape(user_string);
        console.log("username =", user_string);
        var old_users_string = "";
        for (var user in user_list){
          old_users_string = old_users_string +user_list[user]+', '
        }
  
        if (old_users_string != "") {
          old_users_string = old_users_string.slice(0, -2); 
        }
            
        if (!user_list.includes(user_string)) {
          user_list.push(user_string)
        }
  
        response.writeHead(200, {
          'Content-Type':  'text/html; charset=utf-8'
        })
        var response_text = `ciao ${user_string}, the following users have already visited this page: ${old_users_string}`;
  
        response.end(response_text, "utf-8");
    }

    else if (request.url.startsWith('/clear')) {
        user_list = []
        response.writeHead(200, {
          'Content-Type':  'text/html; charset=utf-8'
        });
        response.end();
      }

    else {
        response.writeHead(200, { 'Content-Type': "text/html" });
        response.end('The server works');
    }
}).listen(process.argv[2]);  