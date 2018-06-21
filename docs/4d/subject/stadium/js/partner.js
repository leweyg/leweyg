

var lionCachedInfo = {};
var lionPsuedoRandomValue = 0;

function lionRandomInArray(items) {
	var v = lionPsuedoRandomValue;
	lionPsuedoRandomValue += 3;
	return items[(v % items.length)];
	//return items[Math.floor(Math.random()*items.length) % items.length];
}


function convertMinsToHrsMins (minutes) {
  var h = Math.floor(minutes / 60) % 24;
  var m = Math.floor( minutes % 60 );
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  return h + ':' + m;
}

function splitWordByCapitals(word) {
	var ans = "";
	for (var i in word) {
		var c = word[i];
		if (c == c.toUpperCase()) {
			ans += " ";
		}
		ans += c;
	}
	return ans;
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function capitalizeWords(sentense) {
	return toTitleCase(sentense);
}


function lionEventTypeInCycle(EventType) {
	for (var si in partnerEcosystemCycle) {
		var s = partnerEcosystemCycle[si];
		for (var ei in s.eventTypes) {
			var et = s.eventTypes[ei];
			if (et == EventType) return s.step;
		}
	}
	return "";
}

var partnerGetCurrentSlideIndex = function() { return 0; };

function boldOnPage(slideIndex, text) {
	if (partnerGetCurrentSlideIndex() == slideIndex) {
		return "<b>" + text + "</b>";
	}
	return text;
}

function partnerResetEnsuredInfo() {
	lionCachedInfo = { };
}


function partnerEnsureInfo(uniqueId,isUser,metaData) {
	var key = "" + uniqueId + (isUser ? "USER" : "MSN");
	if (key in lionCachedInfo) {
		return lionCachedInfo[key];
	}

	var srcPrefix = partnerImageSrcBase + (isUser ? "users/" : "actions/" );

	var res = {
		Id:uniqueId,
		Name:lionRandomInArray(isUser ? partnerRandomData_UserName : partnerRandomData_MissionName).trim(),
		Image:srcPrefix + lionRandomInArray(isUser ? partnerRandomData_UserImagePaths : partnerRandomData_MissionImagePaths),
	};
	if (res.Name.endsWith("#")) {
		res.Name += "" + ( uniqueId ? uniqueId : "S" );
	}
	var remoteImagePrefix = "https:";
	if (isUser && evxToolsNotNull(metaData) && evxToolsNotNull(metaData.PersonName)) {
		res.Name = capitalizeWords( metaData.PersonName );
	}
	if ((isUser) && evxToolsNotNull(metaData) && evxToolsNotNull(metaData.PersonImagePath)) {
		res.Image = remoteImagePrefix + metaData.PersonImagePath;
	}
	if ((!isUser) && evxToolsNotNull(metaData) && evxToolsNotNull(metaData.MissionType)) {
		res.Name = capitalizeWords( metaData.MissionType );
	}
	if ((!isUser) && evxToolsNotNull(metaData) && evxToolsNotNull(metaData.MissionImagePath)) {
		res.Image = remoteImagePrefix + metaData.MissionImagePath;
	}
	if (evxToolsNotNull(metaData) && evxToolsNotNull(metaData.MissionImagePath)) {
		var scenarioId = metaData.Mission.replace("scenarios","");
		var path = partnerRemoteServerBase + scenarioId + "/doner/";
		res.ExternalLink = path;
	}
	lionCachedInfo[key] = res;
	return res;
}

function partnerTryFilterInto(uniqueId,isUser,metaData) {
	var info = partnerEnsureInfo(metaData.Mission,false,metaData);
	if (evxToolsNotNull(info.ExternalLink)) {
		// TODO: get the point location working correctly
		window.location.href = info.ExternalLink;
		return true;
	}
	return false;
}

function partnerSingleMetaItem( docEl, slideIndex, rawText ) {
	var html = boldOnPage( slideIndex, rawText );
	if (!evxToolsNotNull(docEl.data)) {
		docEl.data = {};
	}
	if (docEl.data.customHTML != html) {
		docEl.innerHTML = html;
		docEl.data.customHTML = html;
	}
}

function partnerCalculateTime(rawTime) {
	return "" + convertMinsToHrsMins( rawTime * 24 * 60 );
}

var __partnerLatestDataContent = "";
var __partnerLatestDataHidden = false;
var __partnerLatestInfoHidden = false;

function partnerUpdateMetaShowing() {
	partner_detail_table2d_holder.style.display = __partnerLatestDataHidden ? 'none' : 'block';
	partner_detail_table2d.innerHTML = (__partnerLatestDataHidden)
		? ("<tr><td onclick='partnerToggleDataView()'>TABLE</td></tr>") : (__partnerLatestDataContent);

}

function partnerToggleDataView() {
	__partnerLatestDataHidden = !__partnerLatestDataHidden;
	partnerUpdateMetaShowing();
}

function partnerToggleInfoView() {
	__partnerLatestInfoHidden =! __partnerLatestInfoHidden;
	partnerUpdateInfoShowing();
}

function partnerUpdateInfoShowing() {
	partner_view_info.style.display = (__partnerLatestInfoHidden ? 'none' : 'inline');
}

function lerpColor(a, b, amount) { 

    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}


var partnerTempSlideOverride = undefined;

function partnerSetupInfoPanel(slide) {
	var baseInfo = partnerSlideInfo[0];
	var info = baseInfo;
	if (partnerTempSlideOverride) {
		slide = partnerTempSlideOverride;
		partnerTempSlideOverride = undefined;
	}
	if (__env_IsOnEcoSlide) {
		slide = __env_IsOnEcoSlide;
	}
	if (slide in partnerSlideInfo) {
		info = partnerSlideInfo[slide];
	}
	partner_info_title.innerHTML = info.title;// + " (" + slide + ")";
	partner_info_desc .innerHTML = (info.desc ? info.desc : baseInfo.desc);
	partner_info_commands.innerHTML = (info.commands ? info.commands : baseInfo.commands);
	partner_info_source.innerHTML = "&bull;" + (info.source ? info.source : baseInfo.source);
	partner_info_filter.innerHTML = "&bull;" + (info.filter ? info.filter : baseInfo.filter);
	partner_info_graph.innerHTML = "&bull;" + (info.graph ? info.graph : baseInfo.graph);
}

function partnerSetupAllMetaData(metaArray,ns,shape) {

	if (!evxToolsNotNull(metaArray)) {
		metaArray = [];
	}

	var slide = partnerGetCurrentSlideIndex();
	partnerSetupInfoPanel(slide);
	var isMissionFocus = (partnerGetCurrentSlideIndex() < 2);
	var isPersonFirst = (partnerGetCurrentSlideIndex()%2 != 0);
	if (isPersonFirst) { isMissionFocus = true; }
	var isUseCreator = false;

	if ((slide == 5) || (slide == 4)) {
		isPersonFirst = false;
	}
	if (slide == 6) {
		isUseCreator = true;
	}
	if (slide == 7) {
		isPersonFirst = true;
		isMissionFocus = true;
		
	}
	if (slide == 8) {
		isPersonFirst = true;
		isMissionFocus = true;
	}

	var toggleCode = " onclick='partnerToggleDataView()' ";

	var leftTitle = (isPersonFirst ? "USER" : "USER ACTION");
	var rghtTitle = (isMissionFocus?"MISSION":"USER");

	if ((metaArray.length > 0) && evxToolsNotNull(metaArray[0].Property)) {
		leftTitle = "STATE";
		rghtTitle = "REFS"
	}

	var title = "<tr>" 
		+ "<td onclick='partnerToggleDataView()' ><font color='#999999'>" + leftTitle + "</font></td>"
		+ "<td onclick='partnerToggleDataView()' ><font color='#999999'>" + rghtTitle + ""
		//+ "<b style='float: right;border:1px solid #A9F3B3; border-radius:5px; '>  2D </b>"
		+ "</font></td>"
		+ "</tr>";

	var clickCode = function(row,isFirstCol) {
		return " onclick=\"evn_GotoSpecificView(" + (!isMissionFocus) 
			+ ",'" + (isMissionFocus ? row.Mission : row.Person) + "')\" ";
	};
	var tdHide = "<td onclick='partnerToggleDataView()' >";
	var countCommas = function(str) {
		var ans = 0;
		for (var ii=0; ii<str.length; ii++) {
			if (str[ii] == ',') ans++;
		}
		return ans;
	}

	var newRows = "";
	var prevRow = "";
	var rowCount = 0;
	var maxRows = 40;
	var knownProperties = {};
	for (var ii in metaArray) {
		var data = null;
		data = metaArray[ii];

		if (evxToolsNotNull(data.Property)) {
			if (data.Property in knownProperties) {
				continue;
			}
			knownProperties[data.Property] = data;
			var curRow = "<tr>";
			curRow += tdHide + partnerUserString(data.Property) + "</td>";
			curRow += tdHide + countCommas(data.Inputs) + "&rarr;" + countCommas(data.Outputs) + "</td>";
			curRow += "</tr>";
			newRows += curRow;
			continue;
		}

		var colorPrefix = "", colorPostfix = "";
		var hasColor = ((shape.Scope.Vector.length >= 4) && (shape.Scope.Vector[3].Id == "color_unit"));
		if (hasColor) {
			var vi = (ns.Indices[ii] * shape.Scope.Packing.VertexWidth) + 3;
			var f = evxToolsLerp( 0.0, 1.0, 1.0 - shape.PackedUnitVertices[vi] );
			var clr = lerpColor( "#336d2e", "#b7f5c1", f );
			colorPrefix = "<font color='" + clr + "'>";
			colorPostfix = "</font>";
		}

		var personInfo = partnerEnsureInfo(data.Person, true, data);
		var missionInfo = partnerEnsureInfo(data.Mission, false, data);
		if (ii == 0) {
			var titleBar = "";
			if ((slide==0) || (__evn_slide_filtered && (slide==1))) {
				titleBar = personInfo.Name + "...";
			} else if ((slide==2) || (__evn_slide_filtered && (slide==3))) {
				titleBar = "'" + missionInfo.Name + "'";
			}
			title = "<tr><td colspan='2'><i>" + titleBar + "</i></td></tr>" + title;
		}	
		var time = partnerCalculateTime(data.Time);
		var entry = (isMissionFocus ? missionInfo.Name : personInfo.Name );
		var firstEntry = (isPersonFirst ? personInfo.Name : (splitWordByCapitals(data.EventType).toLowerCase() ) );
		var skipRow = false;
		if (isUseCreator && ("MissionCreator" in data)) {
			if (data.MissionCreator != data.Person) {
				var creatorInfo = partnerEnsureInfo(data.MissionCreator, true, data);
				firstEntry = creatorInfo.Name;
				if (creatorInfo.Name == personInfo.Name) {
					skipRow = true;
				}
			} else {
				skipRow = true;
			}
		}
		if (!skipRow) {
			var curRow = "";
			curRow += "<tr>"
			curRow += "<td " + toggleCode + ">" + colorPrefix + firstEntry + colorPostfix + "</td>";
			if (evxToolsNotNull(missionInfo.ExternalLink)) {
				curRow += "<td ><a href='" + missionInfo.ExternalLink + "'>" + colorPrefix + entry + colorPostfix + "</a></td>";
			} else {
				curRow += "<td " + clickCode(data,false) + " ><u>" + colorPrefix + entry + colorPostfix + "</u></td>";
			}
			curRow += "</tr>";
			if (curRow != prevRow) {
				rowCount++;
				newRows += curRow;
				if ((maxRows > 0) && (rowCount > maxRows)) {
					newRows += "<tr><td>more...</td></tr>";
					break;
				}
			}
			prevRow = curRow;
		}
	}
	__partnerLatestDataContent = title + newRows;
	if (!__partnerLatestDataHidden) {
		partner_detail_table2d.innerHTML = __partnerLatestDataContent;
	}
}

function partnerSingleMetaReset(item, idealSlide, etc) {
	item.innerHTML = "";
}

var __partner_latestMetaData = null;

function partnerUserString(str) {
	if (str.startsWith(",")) {
		str = str.substr(1);
	}
	str = str.replace("Water_Density", "Water_Saturation");
	str = str.replace(/_/g," ");
	str = str.replace(/,/g,", ");
	return str;
}

function  partnerSetupMetaData(metaData) {
	var data = null;
	data = metaData; //eval("data="+metaString);
	if (!evxToolsNotNull(metaData)) {
		return;
	}
	if ((!evxToolsNotNull(metaData.Person)) || (!evxToolsNotNull(metaData.Mission))) {

		if (evxToolsNotNull(metaData.Property)) {
			var str = partnerUserString(metaData.Property);
			var title = str;
			var mname = "Affects: " + partnerUserString(metaData.Outputs);
			if (title.length > 30) {
				title = title.substr(0,30);
			}
			partner_detail_user_name.innerHTML = title;
			partner_detail_mission_name.innerHTML = mname;
			partner_detail_event_type.innerHTML = "Affected By: " + partnerUserString( metaData.Inputs );

			//partnerSingleMetaReset( partner_detail_event_type,  4,  splitWordByCapitals( data.EventType ) );
			partnerSingleMetaReset( partner_detail_event_time,  7,  "@" + time );
			partnerSingleMetaReset( partner_detail_event_cycle,  9,  "[" + lionEventTypeInCycle( data.EventType ) + "]" );
			partnerSingleMetaReset( partner_detail_user_social, 6, "(social)");
			partnerSingleMetaReset( partner_detail_user_similar, 1, "(similar)");
			partnerSingleMetaReset( partner_detail_mission_type, 5, "(mission type)");
			partnerSingleMetaReset( partner_detail_mission_similar, 3, "(similar)");
			return;
		}

		if (evxToolsNotNull(metaData.string)) {
			var str = metaData.string;
			var title = str;
			var mname = "";
			if (str.includes("(")) {
				var start = str.indexOf("(");
				title = str.substr(0, start).trim();
				mname = str.substr(start+1).trim();
				if (mname.includes(")")) {
					mname = mname.substr(0,mname.indexOf(")"));
				}
			}
			if (title.length > 30) {
				title = title.substr(0,30);
			}
			partner_detail_user_name.innerHTML = title;
			partner_detail_mission_name.innerHTML = mname;

			partnerSingleMetaReset( partner_detail_event_type,  4,  splitWordByCapitals( data.EventType ) );
			partnerSingleMetaReset( partner_detail_event_time,  7,  "@" + time );
			partnerSingleMetaReset( partner_detail_event_cycle,  9,  "[" + lionEventTypeInCycle( data.EventType ) + "]" );
			partnerSingleMetaReset( partner_detail_user_social, 6, "(social)");
			partnerSingleMetaReset( partner_detail_user_similar, 1, "(similar)");
			partnerSingleMetaReset( partner_detail_mission_type, 5, "(mission type)");
			partnerSingleMetaReset( partner_detail_mission_similar, 3, "(similar)");
		
		}

		return;
	}
	__partner_latestMetaData = data;

	var personInfo = partnerEnsureInfo(data.Person, true, data);
	var missionInfo = partnerEnsureInfo(data.Mission, false, data);

	partner_detail_mission_image.src = missionInfo.Image;
	partner_detail_user_image.src = personInfo.Image;
	var time = partnerCalculateTime( data.Time );
	if (evxToolsNotNull(data.TimeProper)) {
		time = data.TimeProper;
	}
	var pname = personInfo.Name;
	var mname = missionInfo.Name;
	if (evxToolsNotNull( personInfo.ExternalLink)) {
		pname = "<a href='" + personInfo.ExternalLink + "'>" + pname + "</a>";
	}
	if (evxToolsNotNull( missionInfo.ExternalLink)) {
		mname = "<a href='" + missionInfo.ExternalLink + "'>" + mname + "</a>";
	}

	partnerSingleMetaItem( partner_detail_user_name,  0, pname );
	partnerSingleMetaItem( partner_detail_mission_name,  2,  mname );
	partnerSingleMetaItem( partner_detail_event_type,  4,  splitWordByCapitals( data.EventType ) );
	partnerSingleMetaItem( partner_detail_event_time,  7,  "@" + time );
	partnerSingleMetaItem( partner_detail_event_cycle,  9,  "[" + lionEventTypeInCycle( data.EventType ) + "]" );
	partnerSingleMetaItem( partner_detail_user_social, 6, "(social)");
	partnerSingleMetaItem( partner_detail_user_similar, 1, "(similar)");
	partnerSingleMetaItem( partner_detail_mission_type, 5, "(mission type)");
	partnerSingleMetaItem( partner_detail_mission_similar, 3, "(similar)");
}

function partnerMetaLinksString() {
	//evn_Update3dModel("models/person.json");
	var modelPath = "models/poly_people.json"; // "models/plant_succession.json"; 

	if (evxToolsUrlHasArg("lion_app") || evxToolsUrlHasArg("business")) {	
		evx_3dPack_LoadModelGeneric(modelPath, function(packOfPeople) {

			var placeInfo = {
				PackIndex: 1, // 4
				Rotation: Math.PI // 0
			};
			var person = evx_3dPack_CreateItemInstance( evx_3dPack_FindItem(packOfPeople, 0, placeInfo.PackIndex ) );
			evx_3dPack_SetScale(person, 0.41);
			if (placeInfo.Rotation != 0) {
				person.rotation.x = 0; //placeInfo.Rotation;
				person.rotation.y = Math.PI * 1.5; //placeInfo.Rotation;
				person.rotation.z = Math.PI * 1.5;
				evx_3dPack_SetScale(person, 0.21);
			}
			evx_3dPack_SetMaterialColorFromHex(person, "#eabd07");
			evn_Update3dModel(modelPath, function(){return person;}, function(){ });
			return;
		});
	}

	return partnerInfoLink;
}


/* -------------------- LATEST MISSION STUFF ------------- */

var lionApp_LatestMission = null;

function parterUpdateLatest() {

	if (evxToolsNotNull(lionApp_LatestMission)) {
		partner_detail_app_update.innerHTML = "(loading...)";
	
		//__evn_slide_filter_key = lionApp_LatestMission;
		//evn_GotoSlide(7, true);
		evn_GotoSpecificView(false, lionApp_LatestMission, 7, function() {
			partnerResetEnsuredInfo(); // as misson ids might have changed
			partner_detail_app_update.innerHTML = "(update)";
		}); // filter by this mission, on slide 7
		evn_PopOneHistory(); // don't put this on the history stack, just an update
	} else {
		evn_GotoSlide(7);
	}

}

function partnerCalcLatestMission() {

	partner_detail_app_latest.innerHTML = "(loading...)";

	var hackyLatestMission = null; //"49";
	if (evxToolsNotNull(hackyLatestMission)) {
		lionApp_LatestMission = hackyLatestMission;
		partner_detail_app_latest.innerHTML = "(hardcoded " + lionApp_LatestMission + ")";
		parterUpdateLatest();
		return;
	}

	var baseServer = partnerRemoteBackend;
	var scenariosReq = baseServer + "scenarios?sort=-parent_scenario_id,-created_at&page[limit]=21";
	lionToolsWebDownloadString(scenariosReq, function(json) {

		lionApp_LatestMission = null;
		var data = null;
		data = eval("data = " + json);
		var list = data.data;
		list.sort(function(a,b){return a.id - b.id;}); // sort by ids
		for (var ri in list) {
		  var ii = (list.length - ri - 1);
		  var item = list[ii];
		  if (!evxToolsNotNull(item.attributes.parent_scenario_id )) {
			lionApp_LatestMission = item.id;
			break;
		  }
		}

		partner_detail_app_latest.innerHTML = "(mission " + lionApp_LatestMission + ")";
	
		parterUpdateLatest();
	  }, true);

}

function lionToolsWebDownloadString (url, callback, isJson) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			// Typical action to be performed when the document is ready:
			callback(xhttp.responseText, true);
		}
		else if (this.readyState == 4) {
			// probably failed, test this
			callback(xhttp.responseText, false);
		}
	};
	xhttp.open("GET", url, true);
	if (isJson) {
	  xhttp.setRequestHeader("Content-type", "application/vnd.api+json");
	  xhttp.setRequestHeader("Accept", "application/vnd.api+json");
	}
	xhttp.send();
};
