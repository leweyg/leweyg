
console.log("Starting...");

const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');

function pathToLocalPath(path) {
    return "docs/" + path;
}

function pathToRemotePath(path) {
    return "http://www.lewcid.com/" + path;
}

function folderFromPath(path) {
    var end = path.lastIndexOf("/");
    if (end >= 0) {
        return path.substr(0,end+1);
    }
    return "";
}

function backToRoot(path) {
    var ans = "";
    while (path.includes("/")) {
        ans += "../";
        path = path.substr(path.indexOf("/")+1);
    }
    return ans;
}

function pathFromOriginal(linkPath,filePath) {
    if (linkPath.includes("?")) {
        linkPath = linkPath.substr(0,linkPath.indexOf("?"));
    }
    if (linkPath.includes("#")) {
        linkPath = linkPath.substr(0,linkPath.indexOf("#"));
    }
    var path = linkPath;
    var folder = folderFromPath(filePath);
    var toRoot = backToRoot(filePath);
    if (path.startsWith("http")) {
        path = path.substr(path.indexOf("com/")+4);
        if (path.startsWith(folder)) {
            path = path.substr(folder.length);
        } else {
            path = toRoot + path;
        }
    } else {
        // already a relative path
        path = path;
    }


    // now make it relative to the folder of filePath:
    return path;
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

function findLinksInFile(path,full_list=null) {
    var text = "" + fileReadWhole(path);
    var parts = text.split("\"");
    var ans = [];
    var nextIsLink = false;
    for (var p in parts) {
        var str = parts[p];
        var isLink = (nextIsLink || isStringALink(str)) && (!isDropLink(str));
        if (isLink)
        {
            ans.push(str);
        }
        if (full_list) {
            full_list.push({text:str,is_link:isLink});
        }
        nextIsLink = isNextALink(str);
    }
    return ans;
}

function showLinks(path) {
    var links = findLinksInFile(path);
    console.log("Link Count = " + links.length);
    for (var i in links) {
        var to = pathFromOriginal(links[i], path);
        console.log("to='" + to + "' Link='" + links[i] + "' ");
    }
}

function refactorFile(path) {
    // todo
    var fullText = [];
    findLinksInFile(path, fullText);
    var localPath = pathToLocalPath(path);
    console.log("Refactoring '" + localPath + "'...");
    var fout = fs.createWriteStream(localPath);
    // loop over full text and write it out etc.
    var isFirst = true;
    for (var ndx in fullText) {
        if (!isFirst) {
            fout.write("\"");
        }
        isFirst = false;
        var ln = fullText[ndx];
        if (!ln.is_link) {
            fout.write(ln.text);
        } else {
            var to = pathFromOriginal(ln.text, path);
            fout.write(to);
        }
    }
    fout.close();
}

//refactorFile("index.html");
//refactorFile("lg/aboutme.html");




if (_threadCounter_Global > 0) {
    console.log("Waiting for threads...!");
} else {
    console.log("Done!");
}
