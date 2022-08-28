
console.log("Starting...");

const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');

function pathToLocalPath(path) {
    return "docs/" + path;
}

function pathToRemotePath(path) {
    return "http://www.lewcid.com/" + path;
}

function fileExists(path) {
    return fs.existsSync(path);
}

function fileReadWhole(path) {
    return fs.readFileSync(pathToLocalPath(path));
}

var _threadCounter_Global = 0;
function threadCounter(delta=1) {
    _threadCounter_Global += delta;
    console.log("Threads:" + _threadCounter_Global + " (+" + delta + ")" );
}
function threadStart() {
    threadCounter(1);
}
function threadDone() {
    threadCounter(-1);
}

function downloadFile(path, callback) {
    if (fileExists(path)) {
        callback(path);
        return;
    }

    var localPath = pathToLocalPath(path);
    var remotePath = pathToRemotePath(path);
    console.log("Downloading '" + remotePath + "' into '" + localPath + "'...");
    threadStart();
    const file = fs.createWriteStream(localPath);
    const request = http.get(remotePath, function(response) {
       response.pipe(file);
    
       // after download completed close filestream
       file.on("finish", () => {
           file.close();
           console.log("Download Completed");
           threadDone();
       });
    });
}

//downloadFile("index.html");

function isStringALink(str) {
    str = str.toLowerCase();
    if (str.startsWith("http")) return true;
    if (str.endsWith(".png")) return true;
    if (str.endsWith(".jpg")) return true;
    if (str.endsWith(".jpeg")) return true;
    if (str.endsWith(".html")) return true;
    if (str.endsWith("/")) return true;
    return false;
}

function isNextALink(str) {
    str = str.toLowerCase();
    if (str.endsWith("href=")) return true;
    if (str.endsWith("src=")) return true;
    return false;
}

function isDropLink(str) {
    if (str.startsWith("#")) return true;
    if (str.startsWith("javascript:")) return true;
    if (str.startsWith("mailto:")) return true;
    if (str.startsWith("http") && !str.includes("lewcid")) return true;
    return false;
}

function findLinksInFile(path) {
    var text = "" + fileReadWhole(path);
    var parts = text.split("\"");
    var ans = [];
    var nextIsLink = false;
    for (var p in parts) {
        var str = parts[p];
        if (nextIsLink || isStringALink(str))
        {
            if (!isDropLink(str)) {
                ans.push(str);
            }
        }
        nextIsLink = isNextALink(str);
    }
    return ans;
}

function showLinks(path) {
    var links = findLinksInFile(path);
    console.log("Link Count = " + links.length);
    for (var i in links) {
        console.log("Link='" + links[i] + "'");
    }
}

showLinks("index.html");




if (_threadCounter_Global > 0) {
    console.log("Waiting for threads...!");
} else {
    console.log("Done!");
}
