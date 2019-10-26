var fs = require('fs');
var path = require('path');
var config = require(__dirname + '/config.js');



var date2timestamp = function(y, m, d, h, m, s) {
      return (new Date(y, m, d, h, m, s).getTime() / 1000);
};
exports.date2timestamp = date2timestamp;

var getFilesizeInBytes = function(filename) {
      return (fs.statSync(filename)).size;
};
exports.getFilesizeInBytes = getFilesizeInBytes;

/**
 * Log
 *
 * @param {String} log String to log; can also be object for dump
 * @param {String} type 'fatal'=always output, default=only in dev mode
 */

var log = function l(log, type) {
      if (log === '-') log = '------------------------------------------------------------------------------------------';
      else if (typeof log === 'string') {
            log = new Date().toLocaleString() + ': ' + log;
      }
      if (type === 'header') {
            l('-');
      }
      if (type === 'fatal') {
            console.log(log);
      }
      if (type === 'mysql') {
            console.log('There was an error in your mysql');
            console.log(log);
      }
      else if (config.dev) {
            console.log(log);
      }
      if (type === 'header') {
            l('-');
      }
};
exports.log = log;




/*
 * 
 * 
console.log('\x1b[36m%s\x1b[0m', 'I am cyan');  //cyan
console.log('\x1b[33m%s\x1b[0m', stringToMakeYellow);  //yellow

Note %s is where in the string (the second argument) gets injected.
\x1b[0m resets the terminal color so it doesn't continue to be the
chosen color anymore after this point.

Colors reference

Reset = "\x1b[0m"
Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"
Reverse = "\x1b[7m"
Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"


For example, \x1b[31m is an escape sequence that will be intercepted by your 
terminal and instructs it to switch to the red color. In fact, \x1b is the code
for the non-printable control character escape. Escape sequences dealing only
with colors and styles are also known as ANSI escape code and are standardized, 
so therefore they (should) work on any platform.

*/



var flatten = function(arr) {
      return arr.reduce(function(flat, toFlatten) {
            return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
      }, []);
};



let array2csv = function(data) {
      var file = "";
      // go trough all array elements and convert strings to csv-Strings ""
      for (let i = 0; i < data.length; i++) {
            var line = "";
            for (let r = 0; r < data[i].length; r++) {
                  if (typeof data[i][r] !== 'number') {
                        data[i][r] = '"' + data[i][r] + '"';
                  }
            }
      }
      // go trough rows and add cols
      for (let i = 0; i < data.length; i++) {
            line = data[i].join(';');
            line += "\n";
            file += line;
      }
      return file;
};
exports.array2csv = array2csv;


let csvExport = function(res, csvData, filename) {
      res.writeHead(200, {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attchment; filename=' + filename + '.csv'
      });
      res.write('﻿' + csvData);
      res.end();
};
exports.csvExport = csvExport;



/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/ 
*/
const json2xml = function(o, tab) {
      var toXml = function(v, name, ind) {
                  var xml = "";
                  if (v instanceof Array) {
                        for (var i = 0, n = v.length; i < n; i++)
                              xml += ind + toXml(v[i], name, ind + "\t") + "\n";
                  }
                  else if (typeof(v) == "object") {
                        var hasChild = false;
                        xml += ind + "<" + name;
                        for (var m in v) {
                              if (m.charAt(0) == "@")
                                    xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                              else
                                    hasChild = true;
                        }
                        xml += hasChild ? ">" : "/>";
                        if (hasChild) {
                              for (var m in v) {
                                    if (m == "#text")
                                          xml += v[m];
                                    else if (m == "#cdata")
                                          xml += "<![CDATA[" + v[m] + "]]>";
                                    else if (m.charAt(0) != "@")
                                          xml += toXml(v[m], m, ind + "\t");
                              }
                              xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
                        }
                  }
                  else {
                        xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
                  }
                  return xml;
            },
            xml = "";
      for (var m in o)
            xml += toXml(o[m], m, "");
      return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
};
exports.json2xml = json2xml;



const cloneObj = function(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
};
exports.cloneObj = cloneObj;
