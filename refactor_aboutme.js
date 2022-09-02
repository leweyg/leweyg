console.log("Starting...");

const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');

function pathToLocalPath(path) {
    return "docs/" + path;
}

function fileReadWhole(path) {
    return fs.readFileSync(pathToLocalPath(path));
}

function splitHTML( text) {
    var parts = [];
    var elementDepth = 0;
    var currentPart = null;
    var quote = false;
    for (var i in text) {
        var index = i;
        var letter = text[index];
        if (letter == "<") {
            elementDepth++;
            currentPart = null;
        } else if (letter == ">") {
            elementDepth--;
            currentPart = null;
        } else if ((letter == "\"") || (letter == "'")) {
            quote = !quote;
            elementDepth += (quote ? 1 : -1);
            currentPart = null;
        } else {
            if (!currentPart) {
                currentPart = {
                    depth : elementDepth,
                    is_plain_text : (elementDepth == 0),
                    text : "",
                };
                parts.push(currentPart);
            }
            currentPart.text += letter;
        }
    }

    return parts;
}

function cleanWhiteSpace(str) {
    if (str === undefined) return undefined;
    if (str == "") return "";

    var ans = "";
    for (var i in str) {
        switch (str[i]) {
            case "\n":
            case "\r":
            case "\t":
                ans += " ";
                break;
            default:
                ans += str[i];
                break;
        }
    }
    while (ans.includes("  ")) {
        ans = ans.replace("  "," ");
    }
    ans = ans.trim();
    return ans;
}

function collectCells() {
    var cells = [];
    var content = "" + fileReadWhole("lg/aboutme.html");
    var tds = content.split("<td");
    for (var ti in tds) {
        var td = ((ti==0)?"":"<td") + tds[ti];
        //console.log(td);
        var parts = splitHTML(td);
        var cell = {
            plain_text : "",
        };
        cells.push(cell);
        var isTitle = false;
        for (var pi in parts) {
            var p = parts[pi];
            var pi_next = (1*pi) + 1;
            if (p.is_plain_text)  {
                cell.plain_text += p.text;
                if (isTitle) {
                    if (!cell.title) cell.title = "";
                    cell.title += p.text;
                } else {
                    if (!cell.subtitle) cell.subtitle = "";
                    cell.subtitle += p.text;
                }
            } else {
                if (p.text.startsWith("br")) {
                    cell.plain_text += "\n";
                }
                if (p.text.startsWith("a") && p.depth==1) {
                    isTitle = true;
                }
                if (p.text.startsWith("/a") && p.depth==1) {
                    isTitle = false;
                }
                if (p.text.endsWith("href=")) {
                    cell.href = parts[pi_next].text;
                }
                if (p.text.endsWith("src=")) {
                    cell.src = parts[pi_next].text;
                }
            }
        }
        cell.plain_text = cleanWhiteSpace(cell.plain_text);
        cell.title = cleanWhiteSpace(cell.title);
        cell.subtitle = cleanWhiteSpace(cell.subtitle);
        
        cell = null;
    }
    console.log(JSON.stringify(cells,null,2));

    var lines = "";
    for (var i in cells) {
        var cell = cells[i];
        lines += JSON.stringify(cell) + "\n";
    }
    fs.writeFileSync("timeline.json", lines);
    return cells;
}

collectCells();

console.log("Done.");