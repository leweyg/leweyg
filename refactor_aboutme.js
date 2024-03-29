console.log("Starting...");

const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');

var input_timeline = "timeline.json";
var input_template = "aboutme_template.html";
var output_path = "docs/lg/aboutme.html";

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

function replaceSquares(subtitle) {
    if (subtitle.trim() == "") return "";
    if (subtitle.includes("[")) {
        var ans = "";
        var index = subtitle.indexOf("[");
        var left = subtitle.substr(0,index);
        var right = subtitle.substr(index+1).replace("]","");
        return "\n " + left + "<span class='pcell_cat'>\n [" + right + "]</span>";
    }
    return "\n " + subtitle;
}

function cellToHtml(cell) {
    if ((!cell.plain_text) && (!cell.href) && (!cell.src)) return "";

    var ans = "";
   // ans += "<pre>" + JSON.stringify(cell) + ":</pre>";

    if (cell.href) {
        ans += "<a \n href=\"" + cell.href + "\" class='pcell_link'>";
    }
    if (cell.src) {
        if (cell.img2) {
            ans += "<table style='border-spacing:0; padding:0;' ><tr><td style='padding:0;'>";
        }
        if (cell.is_key_picture) {
            ans += "<picture>";
        }
        ans += "<img class='pcell_image' \n src=\"" + cell.src + "\" />";
        if (cell.is_key_picture) {
            ans += "</picture>";
        }
        if (cell.img2) {
            ans += "</td><td style='padding:0;'>";
            ans += "<img class='pcell_image' \n src=\"" + cell.img2 + "\" />";
            ans += "</td></tr></table>"
        } else {
            ans += "<br/>";
        }
    }
    if (cell.title) {
        ans += "\n " + cell.title + "";
        //ans += "</b>" + cell.subtitle + "";
    } else {
        ans += cell.plain_text;
    }
    if (cell.href) {
        //ans += " <br/>(" + cell.href + ")";
    }
    if (cell.href) {
        ans += "</a>";
    }
    if (cell.subtitle) {
        ans += "<br/><span class='pcell_white pcell_subtitle' > " + replaceSquares(cell.subtitle) + "</span>";
    }
    ans += "<br/>";
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
                    cell.plain_text += " ";
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

    var rawJson = "[";
    for (var i in cells) {
        rawJson += JSON.stringify(cells[i]) + ",\n";
    }
    rawJson += "]";
    fs.writeFileSync(input_timeline,rawJson);

    return cells;
}

function categorizeCells() {
    var cells = JSON.parse( fs.readFileSync(input_timeline) );

    var category = "team";
    var knownCategories = {
        "PRODUCTS":"product",
        "PERSONAL PROJECTS":"personal",
        "ACTIVE INTERESTS and *articles":"interest",
    }
    for (var i in cells) {
        var cell = cells[i];
        if (cell.subtitle in knownCategories) {
            category = knownCategories[cell.subtitle];
        }
        cell.category = category;
    }

    var rawJson = "[";
    for (var i in cells) {
        rawJson += JSON.stringify(cells[i]) + ",\n";
    }
    rawJson += "]";
    fs.writeFileSync(input_timeline,rawJson);
}

function groupByCallback(ar,callback) {
    var ans = {};
    for (var i in ar) {
        var item = ar[i];
        var key = item ? callback(item) : "";
        if (key in ans) {
            ans[key].push(item);
        } else {
            ans[key] = [ item ];
        }
    }
    return ans;
}

function flattenGroups(groups) {
    var ans = [];
    for (var name in groups) {
        var g = groups[name];
        for (var i in g) {
            ans.push(g[i]);
        }
    }
    return ans;
}

function cleanUpString(str) {
    var replacements = {
        "video-article":"Articles - Videos",
        "article-images":"Articles - Images",
        "sculpture":"Sculpture & Literature",
        "undefined":"Links",
        "collage":"University Years",
        "keyproduct":"Key <a href=\"#products\" class='pcell_white' >Products</a>...",
        "keyart":"<a href=\"#art\" class='pcell_white' >Side projects / games</a>...",
        "article-theory":"Articles - Theory"
    };
    if (str === undefined) str = "undefined";
    if (str in replacements) {
        return replacements[str];
    }

    var parts = ("" + str).split("-");
    var ans = "";
    for (var i in parts) {
        if (i != 0) {
            ans += " - ";
        }
        var part = parts[i];
        ans += part.substr(0,1).toUpperCase() + part.substr(1);
    }
    return ans;
}

function filterCells(allCells) {
    var cells = [];
    for (var ci in allCells) {
        var c = allCells[ci];
        if (c.hide) continue;
        cells.push(c);
    }
    return cells;
}

function updateCells() {
    var allCells = JSON.parse( fs.readFileSync(input_timeline) );
    var cells = filterCells(allCells);
    var groups = groupByCallback(cells, (a) => a.category);
    var lines = "";
    var isHtmlPrefix = false;
    if (isHtmlPrefix) {
    lines += "<html>";
    lines += "<head><title>About Me</title></head>";
    lines += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">";
    lines += "\n<style>\n";
    lines += ".pcell_image{height:120px}\n";
    lines += ".pcell_td{valign:top;}\n"
    lines += ".pcell_td_team{align:center;}\n"
    lines += ".pcell_link{color:white}\n";
    lines += ".pcell_white{color:white}\n";
    lines += ".pcell_group_major{color:white;padding-top:15px;}"
    lines += ".pcell_subtitle{color:white;opacity:39%}\n";
    lines += ".pcell_cat{color:white;opacity:50%}\n"
    lines += "\n</style>\n";
    lines += "\n<body><br/>\n";
    }

    var subgroup = undefined;
    var groupInfos = {
        "team":{title:"Teams",color:"black"},
        "product":{title:"Products",color:"#6898b3",hashlink:"products"},
        "personal":{title:"Articles / Demos",color:"#68b368",hashlink:"art"},
        "interest":{title:"Interests",color:"#a19a5c"},
        "unfinished":{title:"Unfinished",color:"#a19a5c"}
    }

    for (var groupName in groups)
    {
        var info = groupInfos[groupName];
        lines += "<div style='width:100%;background-color:" + info.color + "' >";
        lines += "<h2 class='pcell_group_major' ";
        if (info.hashlink) {
            lines += " id=\'" + info.hashlink + "\' ";
        }
        lines += " >\n" + info.title + "</h2>\n";
        lines += "<div><table><tr>\n";

        var cellList = groups[groupName];
        if (cellList[0].subgroup) {
            cellList = flattenGroups( groupByCallback(cellList, (c) => c.subgroup));
        }
        for (var i in cellList) {
            var cell = cellList[i];
            if (cell.subgroup != subgroup) {
                subgroup = cell.subgroup;
                lines += "\n</tr></table></div>\n";
                lines += "<h3 style='margin:0px; padding-top:20px; color:white;'><i>" + cleanUpString(subgroup) + "</i></h3>";
                lines += "<div style='overflow-x:scroll;' >";
                lines += "<table style='width:min-content;' ><tr>\n";
                //lines += "<tr><td colspan='3'><i>" + subgroup + "</i></td></tr>\n";
                //lines += "<tr>\n";
            }
            var tdProps = " valign='top' ";
            if (cell.category == "team") {
                tdProps += " align='center' ";
            }
            var td = "\n<td class='pcell_td' " + tdProps + " >" + cellToHtml(cell) + "</td>\n";
            lines += td;
            
        }
        lines += "</tr></table></div>\n"
        lines += "</div>";
    }

    var tempPath = "tmp_about_me.html"
    fs.writeFileSync(tempPath, lines);

    var wholeTemplate = "" + fs.readFileSync(input_template);
    var wholeCore = "" + fs.readFileSync(tempPath);
    var replaceMarker = "<!--INSERT_PROFOLIO_HERE-->";
    var wholeFinal = wholeTemplate.replace(replaceMarker, wholeCore);
    fs.writeFileSync(output_path, wholeFinal);
}

//collectCells();
//categorizeCells();
updateCells();



console.log("Done.");