
/* Copyright (C) Lewcid Systems LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Lewey Geselowitz <LeweyGeselowitz@gmail.com>, March 2018
 */

var lewdoToTable = function(whole) {
	var pieceOfTable = function(ob) {
		if (ob == null) return "null";
		var tp = typeof(ob);
		if (tp == "string") return "" + ob;
		if (tp == "number") return "" + ob;
		return listOfTable(ob);
	};
	var listOfTable = function(lst) {
		var ans = "<table >";
		for (var i in lst) {
			ans += "<tr><td>" + i + "</td>";
			ans += "<td style='border:1px solid lightgray;'>" + pieceOfTable(lst[i]) + "</td></tr>";
		}
		return ans + "</table>";
	};
	return listOfTable(whole);
};

var lewdoToTableWithJoin = function(whole,keyId,joinedTo,joinedOn) {
	var ans = "<table>";
	ans += "<tr><td>" + keyId + "</td></tr>"
	for (var i in whole) {
			ans += "<tr><td>";
			if (joinedTo != '') {
				ans += "<a href='?stream=" + joinedTo;
				if (joinedTo == 'users') {
					ans += "&user=" + i;
				}
				ans += "'>";
			}
			ans += i + "</a></td>";
			ans += "<td style='border:1px solid lightgray;'>" + lewdoToTable(whole[i]) + "</td></tr>";
	}
	return ans + "</table>";
};

var lewdoToJson = function (ob) {
	if (ob == null) return "null";
	var tp = typeof(ob);
	if (tp == "string") return "\"" + ob + "\"";
	if (tp == "number") return ob.tostring();
	var ans = "";
	if (Array.isArray(ob)) {
		ans += "[";
		var isfirst = true;
		for (var i in ob) {
			if (!isfirst) { ans += ", "; } else { isfirst = false; }
			ans += lewdoToJson(ob[i]);
		}
		ans += "]";
	}
	else {
		ans += "{";
		var isfirst = true;
		for (var k in ob) {
			if (!isfirst) { ans += ", "; } else { isfirst = false; }
			ans += "\"" + k + "\":" + lewdoToJson(ob[k]);
		}
		ans += "}";
	}
	return ans;
}
