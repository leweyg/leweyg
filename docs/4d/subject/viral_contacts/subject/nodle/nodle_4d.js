

/* Copyright (C) Lewcid Systems LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Lewey Geselowitz <LeweyGeselowitz@gmail.com>, October 2018
 */

var __nodleStatePtr = undefined;
function nodleState() {
	if (__nodleStatePtr) {
		return __nodleStatePtr;
	}
	__nodleStatePtr = {
		ModelRootObjThree:null,
		DataShapes:[],
		DataBlocks:[],
		UnitTimeOffset:0,
		LatestCursorOnWPlane:new THREE.Vector3(),
		PreviousCursorOnWPlane:new THREE.Vector3(),
		CubeCenterWPos:null,
		LatestHoverItem:null,
		FollowPersonEl:null,
		PreviousIconPosW:null,
		ScrollByWorldPos:nodleScrollByWorldDeltaBuilder(),
		TempVectors:[new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()],
	};
	return __nodleStatePtr;
}
function nodleStateTry() {
	return __nodleStatePtr;
}

function partnerGeneralInfo() {
	return {
		bgImagePath : "subject/nodle/images/360s/nodle_mirror_360.jpg", //"images/sunset_360.jpg",
		scrollImagePath : "subject/nodle/images/360s/nodle_mirror_360.jpg",
		imageScale : 1.0,
	};
}

function nodleLoadData(path, callback) {
	evxToolsWebDownloadString(path, callback);
}

var nodleAxes = [ "x", "TIME", "z" ];

function nodleMeasureInclude(scope,entry) {
	for (var ai in nodleAxes) {
		var ax = nodleAxes[ai];
		var val = entry[ax];
		var scp = scope[ax];
		if (val < scp.MIN) {
			scp.MIN = val;
		}
		if (val > scp.MAX) {
			scp.MAX = val;
		}
	}
}

function nodleMeasureData(data) {
	var first = data.SIGHTINGS[0].SEER;
	var ans = {};
	for (var aii in nodleAxes) {
		var ai = nodleAxes[aii];
		ans[ai] = { MIN:first[ai], MAX:first[ai] };
	}
	for (var si in data.SIGHTINGS) {
		var sight = data.SIGHTINGS[si];
		var seer = sight.SEER;
		nodleMeasureInclude(ans, seer);
		for (var oi in sight.SEEN) {
			var other = sight.SEEN[oi];
			nodleMeasureInclude(ans, other);
		}
	}
	return ans;
}

function nodleMeasureNormalizeAndPush(scope,ar,entry) {
	for (var ai in nodleAxes) {
		var ax = nodleAxes[ai];
		var val = entry[ax];
		var scp = scope[ax];
		var nv = ((val - scp.MIN) / (scp.MAX - scp.MIN));
		ar.push(nv);
		if (ax == "TIME") {
			entry.UnitTime = nv;
		}
	}
}

function nodlePointSprites(pnts,texPath=null,defSize=35,defColor=0xaaAAFF) {
	// setup the points:
	var geometry = new THREE.BufferGeometry();
	var vertices = pnts;
	texPath = (evxToolsIsNull(texPath)?'subject/nodle/images/icons/Bluetooth-icon.png':texPath);
	var sprite = evxObjThreeCreateTexture( texPath ); //new THREE.TextureLoader().load( 'subject/verses/particle_texture.png' );
	
	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	material = new THREE.PointsMaterial( { size: defSize, sizeAttenuation: false, map: sprite, alphaTest: 0.5, transparent: true } );
	material.color.setHex( defColor );
	var particles = new THREE.Points( geometry, material );
	return particles;
}

function nodleCreateLines(data,scene) {
	var state = nodleState();
	state.DataBlocks.push(data);
	nodleApplyDataTypes();
	

	var packedVerts = [];
	var packedIndices = [];
	var vertexCount = 0;

	var pathVerts = [];
	var pathIndices = [];
	var pathCount = 0;
	
	var prevVertex = -1;
	var pathPrevVertex = -1;

	var uniquePoints = [];
	var typedPoints = {};

	var matchPrevious = {};
	var matchVerts = [];
	var matchIndices = [];
	var matchCount = 0;

	var scope = nodleMeasureData(data);
	data.ALL = [];
	for (var si in data.SIGHTINGS) {
		var sight = data.SIGHTINGS[si];
		var seer = sight.SEER;
		data.ALL.push(seer);
		var curIndex = vertexCount;
		nodleMeasureNormalizeAndPush(scope, packedVerts, seer);
		vertexCount++;
		nodleMeasureNormalizeAndPush(scope, pathVerts, seer);
		pathCount++;
		if (prevVertex >= 0) {
			//packedIndices.push(curIndex);
			//packedIndices.push(prevVertex);

			pathIndices.push(pathCount-1);
			pathIndices.push(pathCount-2);
		}
		prevVertex = curIndex;
		
		for (var oi in sight.SEEN) {
			var other = sight.SEEN[oi];
			data.ALL.push(other);
			var oindex = vertexCount;
			nodleMeasureNormalizeAndPush(scope, packedVerts, other);
			vertexCount++;
			var matchId = matchCount;
			nodleMeasureNormalizeAndPush(scope, matchVerts, other);
			matchCount++;
			packedIndices.push(curIndex);
			packedIndices.push(oindex);

			if (other.ID in matchPrevious) {
				matchIndices.push(matchId);
				matchIndices.push(matchPrevious[other.ID]);
			} else {
				
				nodleMeasureNormalizeAndPush(scope, uniquePoints, other);
				uniquePoints[uniquePoints.length-2] = 0; // y = 0

				var ar = typedPoints[other.FakeType];
				if (!(other.FakeType in typedPoints)) {
					ar = [];
					typedPoints[other.FakeType] = ar;
				}
				nodleMeasureNormalizeAndPush(scope, ar, other);
				ar[ar.length-2] = 0;
				
			}
			matchPrevious[other.ID] = matchId;
			
		}
	}

	if (true) {
		//var packedVerts = [];
		//var packedIndices = [];
		//var vertexCount = 238;
		var shape = {"Scope":
			{"Vector":[
				{"Id":"x"},{"Id":"y"},{"Id":"z"},
				{"Id":"i","IsPacking":true,"Resolution":{"Count":vertexCount}}],
				"Packing":{"VertexWidth":3,"VertexCount":vertexCount,"FrameCount":1}},
				"PackedUnitVertices":packedVerts,
				"IndexSets":[
					{"IndexType":"Lines","IndexWidth":2,"Weight":1,
					Options:{Strings:{dataContent:2, LineColor:0xA9B3F3 }},
					"Indices":packedIndices}]};
		var ns = shape.IndexSets[0];
		var colr = new THREE.Color( 0xA9B3F3 );
		state.DataShapes.push(shape);
		var res = evxShapeCreateFromJsonShape(shape); 
		
		var mesh = res.objThree;
		//var mesh = evxShapeIndexedLineCreateFancyLines(shape, ns, null, true, colr);
		if (scene) {
			scene.add(mesh);
		}
	}
	if (true) {
		//var packedVerts = [];
		//var packedIndices = [];
		//var vertexCount = 238;
		var shape = {"Scope":
			{"Vector":[
				{"Id":"x"},{"Id":"y"},{"Id":"z"},
				{"Id":"i","IsPacking":true,"Resolution":{"Count":pathCount}}],
				"Packing":{"VertexWidth":3,"VertexCount":pathCount,"FrameCount":1}},
				"PackedUnitVertices":pathVerts,
				"IndexSets":[
					{"IndexType":"Lines","IndexWidth":2,"Weight":1,
					Options:{Strings:{FollowablePath:2, FollowAxis:"y", LineColor:0xF9B3A3}},
					"Indices":pathIndices}]};
		var ns = shape.IndexSets[0];
		state.DataShapes.push(shape);
		var res = evxShapeCreateFromJsonShape(shape); 
		var mesh = res.objThree;
		mesh.traverse(function(child){
			if (child.evxOnScrollChange) {
				state.FollowPersonEl = child;
				child.evxScrollCustomValue = function() {
					return nodleState().UnitTimeOffset; 
				};

			}
		});
		//var mesh = evxShapeIndexedLineCreateFancyLines(shape, ns, null, true);
		if (scene) {
			scene.add(mesh);
		}
	}
	if (true) {
		var flatVerts = [];
		for (var vi in pathVerts) {
			flatVerts.push( pathVerts[vi] );
			if ((vi%3) == 1) {
				flatVerts[vi] = 0;
			}
		}
		//var packedVerts = [];
		//var packedIndices = [];
		//var vertexCount = 238;
		var shape = {"Scope":
			{"Vector":[
				{"Id":"x"},{"Id":"y"},{"Id":"z"},
				{"Id":"i","IsPacking":true,"Resolution":{"Count":pathCount}}],
				"Packing":{"VertexWidth":3,"VertexCount":pathCount,"FrameCount":1}},
				"PackedUnitVertices":flatVerts,
				"IndexSets":[
					{"IndexType":"Lines","IndexWidth":2,"Weight":1,
					Options:{Strings:{dataContent:true}},
					"Indices":pathIndices}]};
		var ns = shape.IndexSets[0];
		//state.DataShapes.push(shape);
		var res = evxShapeCreateFromJsonShape(shape); 
		var mesh = res.objThree;
		//var mesh = evxShapeIndexedLineCreateFancyLines(shape, ns, null, true);
		if (scene) {
			nodleState().ModelRootThree.add(mesh);
		}
	}

	if (true) {
		//var packedVerts = [];
		//var packedIndices = [];
		//var vertexCount = 238;
		var shape = {"Scope":
			{"Vector":[
				{"Id":"x"},{"Id":"y"},{"Id":"z"},
				{"Id":"i","IsPacking":true,"Resolution":{"Count":matchCount}}],
				"Packing":{"VertexWidth":3,"VertexCount":matchCount,"FrameCount":1}},
				"PackedUnitVertices":matchVerts,
				"IndexSets":[
					{"IndexType":"Lines","IndexWidth":2,"Weight":1,
					Options:{Strings:{dataContent:2, LineColor:0xF9B3F3 }},
					"Indices":matchIndices}]};
		var ns = shape.IndexSets[0];
		var colr = new THREE.Color( 0xA9B3F3 );
		state.DataShapes.push(shape);
		var res = evxShapeCreateFromJsonShape(shape); 
		
		var mesh = res.objThree;
		//var mesh = evxShapeIndexedLineCreateFancyLines(shape, ns, null, true, colr);
		if (scene) {
			scene.add(mesh);
		}

		
	}
	if (true) {
		//nodleState().ModelRootThree.add( nodlePointSprites(uniquePoints) );
		for (var ti in typedPoints) {
			var ar = typedPoints[ti];
			var path = undefined;
			var basePath = 'subject/nodle/images/icons/';
			switch (ti) {
				case "PHONE":
				path = basePath + "icon-phone.png";
				break;
				case "HEADPHONES":
				path = basePath + "icon-headphones.png";
				break;
				case "BEACON":
				path = basePath + "icon-beacon.png";
				break;
			}
			nodleState().ModelRootThree.add( nodlePointSprites(ar,path) );
		}
	}
	nodleMetadataAllUpdateUI();
	return mesh;
}

function nodleSetupData(res) {
	var scene = nodleState().TimeRootThree;
	nodleLoadData("subject/nodle/data/ex_motion_data.json", function(dataStr) {
		if (dataStr) {
			if (dataStr.startsWith("\"")) {
				dataStr = dataStr.substr(1,dataStr.length-2);
			}
			var data = evxToolsJsonFromString(dataStr);
			// TODO: draw lines
			nodleCreateLines(data,scene);
			data = null;
		}
	});
}

function nodleGenerateMapTexture() {
	var geometry = new THREE.PlaneGeometry( 1, 1, 5, 5 );

	var shaderPostFix = ""
	+ "float outRad = length(vUv.xy - vec2(0.5,0.5));"
	+ "if (outRad > 0.5) {discard;};"
	+ "float outPct = (outRad - 0.5)*10.0;"
	//+ "gl_FragColor.a *= saturate(outPct);"
	//+ "vec4 mapTex = texture2D( map, vUv ).rgba;"
	//+ "float bgVal = (1.0 - bgTex.g);"
	//+ "float fAlpha = pow( 1.0 - ((mapTex.g + mapTex.r + mapTex.b)/3.0), 0.5 );"
	//+ "gl_FragColor = vec4(mapTex.rgb * vec3(0.3,1.0,0.6),fAlpha);"
	;

	//var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	var sprite = evxObjThreeCreateTexture( "subject/nodle/images/road_and_transport_map_san_francisco.png" );
	var uvTransform = new THREE.Vector4( 0, 0, 1, 1 );
	var material = evxShaderMaterialCreateForUnlitMonoTexture(
		new THREE.Color(0x00FF99), sprite, uvTransform, shaderPostFix);

	var plane = new THREE.Mesh( geometry, material );
	plane.renderOrder = 1;
	plane.position.set(0.5,0.0125,0.5);
	plane.rotation.x = Math.PI / 2.0;
	var scl = 2.0;
	plane.scale.set(scl,scl,scl);

	nodleState().MapPlane = plane;

	return plane;
}

function nodleGenerateBgTexture() {
	var geometry = new THREE.PlaneGeometry( 1, 1, 5, 5 );

	var shaderPostFix = "vec4 bgTex = texture2D( map, vUv * 4.0 ).rgba;"
	+ "float bgVal = (1.0 - bgTex.g);"
	+ "gl_FragColor = vec4(0,0.6,0.2,bgVal);"
	;

	//var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	var sprite = evxObjThreeCreateTexture( "subject/nodle/images/flower_of_life_v2.jpg" );
	sprite.wrapS = THREE.RepeatWrapping;
	sprite.wrapT = THREE.RepeatWrapping;
	var uvTransform = new THREE.Vector4( 0, 0, 10, 10 );
	var material = evxShaderMaterialCreateForUnlitMonoTexture(
		new THREE.Color(0x005522), sprite, uvTransform, shaderPostFix);

	var plane = new THREE.Mesh( geometry, material );
	plane.renderOrder = 2;
	plane.position.set(0.5,-0.1,0.5);
	plane.rotation.x = Math.PI / 2.0;
	var scl = 10.0;
	plane.scale.set(scl,scl,scl);
	return plane;
}

function nodleBuildCameraModCallback() {
	var cb = function(latestCameraGoal, latestLookAtGoal) {
		latestCameraGoal.y += 4.0;
	};
	return cb;
}

function nodleCenterOnUser() {
	var state = nodleStateTry();
	if ((!state) || (!state.FollowPersonEl)) {
		return;
	}
	if (evxToolsNotNull( state.CubeCenterWPos )) {
		var center = state.CubeCenterWPos;

		var v0 = state.TempVectors[0];
		v0.copy(state.FollowPersonEl.position);
		state.FollowPersonEl.parent.localToWorld(v0);

		var delta = state.TempVectors[1];
		evxToolsVectorSubtract(v0, center, delta); // change in world needed

		v0.y = center.y;
		// TODO: rest of this...
		state.ScrollByWorldPos(v0, center);

	}
}

function nodleUpdateTimeTo(goalUnitTime, isClick) {
	var state = nodleStateTry();
	if (!state) {
		return;
	}
	var obj = state.TimeRootThree;
	var curt = goalUnitTime;
	obj.position.y = -curt;
	state.UnitTimeOffset = curt;
	if (evxToolsNotNull(state.FollowPersonEl)) {
		var isReady = true;
		if (!state.PreviousIconPosW) {
			isReady = false;
			state.PreviousIconPosW = new THREE.Vector3();
			state.LatestIconPosW = new THREE.Vector3();
		}
		state.FollowPersonEl.updateMatrixWorld();
		state.LatestIconPosW.set(0,0,0);
		state.FollowPersonEl.localToWorld(state.LatestIconPosW);
		state.PreviousIconPosW.copy(state.LatestIconPosW);

		// MOST IMPORTANT PART!!!
		state.FollowPersonEl.evxOnScrollChange();
		// DONE WITH MOST IMPORTANT PART!!!
		
		
		state.FollowPersonEl.updateMatrixWorld();
		state.LatestIconPosW.set(0,0,0);
		state.FollowPersonEl.localToWorld(state.LatestIconPosW);
		if (isReady && !isClick) {
			state.PreviousIconPosW.y = state.LatestIconPosW.y;

			//state.ScrollByWorldPos(state.LatestIconPosW, state.PreviousIconPosW);

			state.FollowPersonEl.updateMatrixWorld();
			state.LatestIconPosW.set(0,0,0);
			state.FollowPersonEl.localToWorld(state.LatestIconPosW);
		}
		state.PreviousIconPosW.copy(state.LatestIconPosW);
	}
	
	
	evxRequestUpdate();
}

function nodleCustomScrollXCallback_Builder() {

	var state = null;
	var cb = function(dx) {
		state = nodleStateTry();
		if (!state) return;

		var obj = state.TimeRootThree;
		var curt = state.UnitTimeOffset;
		curt += dx * 0.1;
		curt = evxToolsClampM(curt, -0.05, 0.95);
		nodleUpdateTimeTo(curt);
	};
	return cb;
}

function nodleCustomLabelUpdate() {
	var state = nodleStateTry();
	if (state) {
		state.HasRendered = true;
	}
}

function nodleClickedCallback() {
	var state = nodleStateTry();
	if (!state) {
		return;
	}
	var latest = state.LatestHoverItem;
	if (latest) {
		if (latest.UnitTime) {
			nodleUpdateTimeTo(latest.UnitTime, true);
			//nodleCenterOnUser();
		}
	}
}

function nodlePostIncludeCallback() {
	var slides = [ nodleSlide0, nodleSlide1 ];
	for (var si in slides) {
		var slide = slides[si];

		slide.customCameraModCallback = nodleBuildCameraModCallback();
		slide.customMetaAllUpdate = nodleCustomMetaAllUpdate;
		slide.customLabelUpdate = nodleCustomLabelUpdate;
		slide.customScrollX = nodleCustomScrollXCallback_Builder();
		slide.customDragCallback = nodleCursorDragCallbackBuilder();
		slide.customClickCallback = nodleClickedCallback;
		slide.customInfoToggle = function() { return true; };

		var infoPnl = {
			title : "Nodle.io ",
			desc : "Spatial model of user's motion and detected devices.",
			commands : "&bull; Zoom in/out.<br/>&bull; Scroll time left/right",
			source : "Based on synthetic Nodle.io data.",
			filter : "Filtered to current user.",
			graph : "Graphing physical space over time."
		};
		slide.InfoPlaneOverride = function() { return infoPnl; };
		/*
		slide.customCameraCallback = nodleBuildCameraCallback();
		
		
		slide.customSlideExitCallback = nodleSlideExitCallback;
		slide.customSlideEnterCallback = nodleSlideEnterCallback;
		slide.customSlideMetadataCallback = nodleMetadataCallback;
		
		slide.customHoverDetailsCallback = nodleCustomHoverDetailsCallback;
		slide.customEditDetailsCallback = nodleCustomEditDetailsCallback;
		
		
	
		slide.customSlideEnterCallback = nodleGenericEnterCallback;
		slide.customSlideExitCallback = nodleGenericExitCallback;
		*/
	}

	
}

function nodleItemMetaUpdate(item) {
	partner_detail_user_name.innerHTML = "ID " + item.FakeId;
	partner_detail_mission_name.innerHTML = "Time=" + item.TIME;
	partner_detail_event_time.innerHTML = "";
	partner_detail_event_type.innerHTML = "" + item.FakeType; //"Asset " + item.ID;
}

function nodleApplyDataTypes() {
	var state = nodleStateTry();
	if (state) {
		var typeNames = ["PHONE","BEACON","HEADPHONES"];
		for (var di in state.DataBlocks) {
			var data = state.DataBlocks[di];
			var mall = data.ALL;
			if (!mall) {
				mall = [];
				for (var si in data.SIGHTINGS) {
					var sight = data.SIGHTINGS[si];
					var seer = sight.SEER;
					mall.push(seer);
					var sight 
					for (var oi in sight.SEEN) {
						var other = sight.SEEN[oi];
						mall.push(other);
					}
				}
				data.ALL = mall;
			}
			for (var ai in mall) {
				var data = mall[ai];
				if (data.FakeId) {
					return;
				}
				var tp = data.ID;
				var id = data.ID;
				if (tp == "user") {
					tp = "USER";
					id = "Steven";
				} else {
					tp = typeNames[(7*id) % typeNames.length];
					id = "" + ((1943 * id) % 2342);
				}
				data.FakeId = id;
				data.FakeType = tp;
			}
		}
	}
}

function nodleClickedOnId(id) {
	var state = nodleStateTry();
	if (state) {
		for (var di in state.DataBlocks) {
			var dataBlock = state.DataBlocks[di];
			for (var ai in dataBlock.ALL) {
				var data = dataBlock.ALL[ai];
				if (data.ID == id) {
					if (data.UnitTime) {
						nodleUpdateTimeTo(data.UnitTime);
						nodleCenterOnUser();
						return;
					}
				}
			}
		}
	}
}

function nodleMetadataAllUpdateUI() {
	var newRows = "<tr><td>DEVICE</td><td>TYPE</td></tr>";
	var state = nodleStateTry();
	if (state) {
		nodleApplyDataTypes();
		var found = {};
		var typeNames = ["PHONE","BEACON","HEADPHONES"];
		//nodleUpdateTimeTo();
		for (var di in state.DataBlocks) {
			var dataBlock = state.DataBlocks[di];
			for (var ai in dataBlock.ALL) {
				var data = dataBlock.ALL[ai];
				var id = data.FakeId;
				var tp = data.FakeType;
				var clickCode = " onclick=\"nodleClickedOnId('" + data.ID + "')\" ";
				if (!(data.ID in found)) {
					newRows += "<tr " + clickCode + "><td><u>" + id + "</u></td><td>" + tp + "</td></tr>";
					found[data.ID] = data;
				}
				
			}
		}
	}
	partner_detail_table2d.innerHTML = newRows;

	partnerSetupInfoPanel(0);
}

function nodleCustomMetaAllUpdate() {
	nodleMetadataAllUpdateUI();
	return true;
}

function nodleMarkerTouched(hitInfo, metadataCallback) {
	//hitInfo = null;

	var state = nodleState();
	
	var data = state.DataBlocks[0];
	if (hitInfo.index < data.ALL.length) {
		var item = data.ALL[hitInfo.index];
		state.LatestHoverItem = item;
		nodleItemMetaUpdate(item);
		//metadataCallback(item);
	}

	/*
	var state = versesState();
	if (hitInfo.customTag == "verses") {
		var asset = state.vsAssets[hitInfo.index];
		if (!state.IsOverDetails) {
			state.latestHoverMarker = asset;
			versesSpatialAssetUpdateDescription(asset);
		}
		metadataCallback(asset);
	} else {
		var marker = state.knownMarkers[hitInfo.index];
		metadataCallback(marker.metadata);
	}
	*/
	
}

function nodleMarkerHitTesterBuilder() {
	var state = nodleState();
	var v0 = new THREE.Vector3();
	var v1 = new THREE.Vector3();
	var mapPlane = null;
	var dx, dy;
	var bestd, countTouches, m;
	var bestMarker;
	var vw = new THREE.Vector3();

	var cb = function (toucher) {

		if (!state.HasRendered) {
			return;
		}
		if (state.ScrollRes) {
			if (!state.CursorObjThree) {
				var geometry = new THREE.SphereGeometry( 0.025, 8, 8 );
				var material = new THREE.MeshBasicMaterial( {color: 0x44FF55} );
				var sphere = new THREE.Mesh( geometry, material );
				state.CursorObjThree = sphere;
				var worldRoot = state.ScrollRes.objThree;
				while (evxToolsNotNull(worldRoot.parent)) {
					worldRoot = worldRoot.parent;
				}
				worldRoot.add( state.CursorObjThree );

				if (true) {
					var mapCenterW = new THREE.Vector3();
					mapCenterW.set(0.5,0,0.5);
					nodleState().ScrollRes.objThree.localToWorld(mapCenterW);
					state.CubeCenterWPos = mapCenterW;

					/*
					var midSphere = new THREE.Mesh( geometry, material );
					midSphere.position.copy(mapCenterW);
					midSphere.scale.set(10,10,10);
					worldRoot.add( midSphere );
					*/
				}
			}
			var ray = toucher.raycaster.ray;

			if (mapPlane == null) {
				vw.set(0,0,0);
				nodleState().MapPlane.localToWorld(vw);
				mapPlane = new THREE.Plane(new THREE.Vector3(0,1,0),-vw.y);
			}
			

			if (ray.intersectPlane(mapPlane, v0)) {
				state.PreviousCursorOnWPlane.copy(state.LatestCursorOnWPlane);
				state.LatestCursorOnWPlane.copy(v0);
				state.CursorObjThree.position.copy(v0);
			}
		}

		//return false; 

		// see reference in evxToucherIntersectPoints
		var countHit = 0;
		for (var mi in state.DataShapes) {
			m = state.DataShapes[mi];
			for (var ni in m.IndexSets) {
				var ns = m.IndexSets[ni];
				var curHits = evxToucherIntersectPoints(toucher, m, ns);
				
				if (curHits > 0) {
					countHit += curHits;
					for (var di=0; di<curHits; di++) {
						var hit = toucher.intersects[toucher.intersects.length - di - 1];
						hit.customTag = nodleState().ModelRootThree;
						hit.object = nodleState().ModelRootThree;
					}
				}
			}
		}
		if (countHit > 0) {
			return true;
		}

		return false;
	}
	return cb;
}

function nodleScrollByWorldDeltaBuilder() {

	var v0 = new THREE.Vector3();
	var v1 = new THREE.Vector3();
	var delta = new THREE.Vector3();

	var cb = function(oldWorldPos, newWorldPos) {
		var state = nodleStateTry();
		if (!state) {
			return;
		}
		var obj = state.ModelRootThree;
		var objPar = obj.parent;

		var oldLocal = v0;
		oldLocal.copy(oldWorldPos);
		objPar.worldToLocal(oldLocal);

		var toLocal = v1;
		toLocal.copy(newWorldPos);
		objPar.worldToLocal(toLocal);

		evxToolsVectorSubtract(toLocal, oldLocal, delta);
		obj.position.add(delta);
		evxRequestUpdate();
	};
	return cb;
}

function nodleCursorDragCallbackBuilder() {

	var v0 = new THREE.Vector3();
	var v1 = new THREE.Vector3();
	var delta = new THREE.Vector3();

	var cb = function(deltaX, deltaY) {
		var state = nodleStateTry();
		if (!state) {
			return;
		}
		var obj = state.ModelRootThree;
		var objPar = obj.parent;

		var oldLocal = v0;
		oldLocal.copy(state.PreviousCursorOnWPlane);
		objPar.worldToLocal(oldLocal);

		var toLocal = v1;
		toLocal.copy(state.LatestCursorOnWPlane);
		objPar.worldToLocal(toLocal);

		evxToolsVectorSubtract(toLocal, oldLocal, delta);
		obj.position.add(delta);
		evxRequestUpdate();
	};
	return cb;
}

function nodle_partnerSetupExtension_UnitScroller(res) {
	var test = res;
	test = null;

	var v0 = new THREE.Vector3();
	var v1 = new THREE.Vector3();

	nodleState().ScrollRes = res;

	var scrollCb = function(unitDelta) {
		var obj = nodleState().ModelRootThree;
		var objPar = obj.parent;
		var wcursor = nodleState().LatestCursorOnWPlane;

		var localCursor = v0;
		localCursor.copy(wcursor);
		obj.worldToLocal(localCursor);

		var scl = obj.scale.x;
		scl *= (1.0 + (unitDelta * 0.2));
		obj.scale.set(scl,obj.scale.y,scl);
		obj.updateMatrixWorld();

		var newWorld = v1;
		newWorld.copy(localCursor);
		obj.localToWorld(newWorld);

		localCursor.copy(wcursor);
		objPar.worldToLocal(localCursor);
		objPar.worldToLocal(newWorld);
		evxToolsVectorSubtract(localCursor, newWorld, newWorld);
		localCursor.copy(obj.position);
		evxToolsVectorAdd(localCursor, newWorld, localCursor);
		obj.position.copy(localCursor);
		obj.updateMatrixWorld();
	};
	res.customScrollCallback = scrollCb;

	res.objThree.add( nodleGenerateBgTexture() );
}
evxExtensions["nodle_scroll_user"] = nodle_partnerSetupExtension_UnitScroller;

function nodle_partnerSetupExtension_UnitModel(res) {
	var test = res;
	test = null;
	var scene = new THREE.Group();
	res.objThree.add(scene);
	nodleState().ModelRootThree = scene;

	var timeScene = new THREE.Group();
	scene.add(timeScene);
	nodleState().TimeRootThree = timeScene;

	if (true) {

		scene.customHitTestToucher = nodleMarkerHitTesterBuilder();
		scene.customOnTouch = nodleMarkerTouched;
		
		scene.add( nodleGenerateMapTexture() );

		nodleSetupData(res);
	}
}

evxExtensions["nodle_model_user"] = nodle_partnerSetupExtension_UnitModel;

