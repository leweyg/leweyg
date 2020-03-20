
var capSciBasicScale = 1055.0;
var capSciSampleStadiumData = {"Trackers":[{"Id":"Williams","Task":"Perimeter","Speed":0.0,"ZoneName":"","FloorName":"","Location":{"x":0.013567047193646431,"y":7.281294345855713,"z":-1048.109375},"Location2":{"x":0.013567047193646431,"y":7.281294345855713,"z":-1048.109375},"UnitDir":{"x":-2.4536237716674806,"y":0.0,"z":3.143310070037842}},{"Id":"Fred","Task":"Garage Check","Speed":1.0,"ZoneName":"East Garage","FloorName":"2","Location":{"x":-295.9831237792969,"y":26.317928314208986,"z":-448.37957763671877},"Location2":{"x":-295.26531982421877,"y":26.317928314208986,"z":-396.94000244140627},"UnitDir":{"x":0.16909591853618623,"y":0.0,"z":-3.983978748321533}},{"Id":"Stevens","Task":"Security","Speed":1.0,"ZoneName":"West Hall","FloorName":"3","Location":{"x":-838.2516479492188,"y":48.72804641723633,"z":-525.578857421875},"Location2":{"x":-838.8896484375,"y":48.72804641723633,"z":-325.9214782714844},"UnitDir":{"x":0.22728024423122407,"y":0.0,"z":3.9810831546783449}},{"Id":"Wayne","Task":"Field Check","Speed":2.0,"ZoneName":"Field","FloorName":"F","Location":{"x":-697.01220703125,"y":6.73898458480835,"z":-411.375},"Location2":{"x":-613.427001953125,"y":6.73898458480835,"z":-292.49365234375},"UnitDir":{"x":3.9598405361175539,"y":0.0,"z":0.46937012672424319}},{"Id":"Mitchell","Task":"Chair Sweep","Speed":0.5,"ZoneName":"East Hall","FloorName":"2","Location":{"x":-417.1820983886719,"y":35.943912506103519,"z":-613.3419189453125},"Location2":{"x":-438.4906311035156,"y":29.707359313964845,"z":-591.4019165039063},"UnitDir":{"x":2.7781670093536379,"y":0.0,"z":-2.860499620437622}},{"Id":"MGR TEAM","Task":"Review","Speed":0.0,"ZoneName":"South Hall","FloorName":"3","Location":{"x":-583.845947265625,"y":36.68559646606445,"z":-197.42530822753907},"Location2":{"x":-583.845947265625,"y":36.68559646606445,"z":-197.42530822753907},"UnitDir":{"x":0.01970486529171467,"y":0.0,"z":3.9875168800354006}},{"Id":"Nick","Task":"Parking Duty","Speed":2.0,"ZoneName":"West Parking","FloorName":"","Location":{"x":-962.76904296875,"y":7.540485858917236,"z":-239.73617553710938},"Location2":{"x":-972.3974609375,"y":7.540485858917236,"z":-645.7373657226563},"UnitDir":{"x":-0.0970376580953598,"y":0.0,"z":-3.986384153366089}}]};

var capSciSampleStadiumZones = {"Zones":[{"ZoneName":"West Hall","Center":{"x":-74.30000305175781,"y":7.400000095367432,"z":60.5},"LocalScale":{"x":44.53839111328125,"y":29.336585998535158,"z":80.49603271484375}},{"ZoneName":"East Hall","Center":{"x":-178.10000610351563,"y":7.400000095367432,"z":60.5},"LocalScale":{"x":40.869808197021487,"y":29.336589813232423,"z":80.49604034423828}},{"ZoneName":"East Garage","Center":{"x":-210.89999389648438,"y":7.400000095367432,"z":50.5},"LocalScale":{"x":23.255279541015626,"y":16.692777633666993,"z":45.80295181274414}},{"ZoneName":"South Hall","Center":{"x":-130.10000610351563,"y":7.400000095367432,"z":-2.4000000953674318},"LocalScale":{"x":126.05622863769531,"y":29.336589813232423,"z":37.83564758300781}},{"ZoneName":"West Parking","Center":{"x":-28.0,"y":7.400000095367432,"z":45.0},"LocalScale":{"x":32.53575897216797,"y":29.336589813232423,"z":182.4721221923828}},{"ZoneName":"Field","Center":{"x":-125.80000305175781,"y":7.400000095367432,"z":60.5},"LocalScale":{"x":57.4648323059082,"y":29.336589813232423,"z":80.49604034423828}}]};

var capSciPeopleFolder = "subject/stadium/model/People/";
var capSciPeopleFilenames = [	
	'Worker008.obj',
	'Worker006.obj',
	'Worker001.obj',
	'Worker016.obj',
	'Worker017.obj',
	'Worker023.obj',
	'Worker024.obj',
	'Worker026.obj',
	'Worker007.obj',
	];
var capSciMarkerUpdateCallback = undefined;


var __capSciState = undefined;

function capSciStateIsReady() {
	return evxToolsNotNull(__capSciState);
}

function capSciState() {
	if (evxToolsNotNull(__capSciState)) {
		return __capSciState;
	}
	__capSciState = {
		knownMarkers:{},
		focusName:"MGR TEAM",
		focusObj:undefined,
		objThreeRoot:undefined,
		objThreeTrackerRoot:undefined,
		//sharedGeo:new THREE.SphereGeometry( 1.0, 32, 32 ),
		sharedGeo:new THREE.ConeGeometry(1.0, 1.0, 9),
		sharedMat:new THREE.MeshBasicMaterial( {color: 0xffff00 } ),
		//sharedMatPeople:new THREE.MeshBasicMaterial( {color: 0xffff00 } ),
		sharedMatPeople:evxShaderMaterialCreateForLitTriangles(new THREE.Color(0xffff00)),
		latestZoomWidth:1.0,
		animTimeNeeded:2.0,
		animTimeDefault:1.0,
		goalZoom:undefined,
		timeStart:(Date.now()),
		isContinuousAnim:true,
		iconCache:[],
		tempQuat:new THREE.Quaternion(),
	};
	var state = __capSciState;
	state.sharedMat.depthTest = false;
	state.sharedMat.transparent = true;
	state.sharedMatPeople.side = THREE.DoubleSide;
	//state.sharedMat.depthWrite = true;
	//state.sharedMat.depthFunc = THREE.AlwaysDepth;
	return __capSciState;
}

function capSciMarkerInfoUpdate(trackerInfo) {
	var state = capSciState();
	var markers = state.knownMarkers;

	var obj = undefined;
	if (trackerInfo.Id in markers) {
		obj = markers[trackerInfo.Id];
	} else {
		obj = {
			Id:trackerInfo.Id,
			latestData:trackerInfo,
			objThree:undefined,
			objWorld:undefined,
			latestHoverMarker:undefined,
			unitPos:(new THREE.Vector3()),
			unitDir:(new THREE.Vector3()),
			tempVec:(new THREE.Vector3()),
			tempVecSrc:(new THREE.Vector3()),
			metadata:{
				IdName:trackerInfo.Id, 
				TaskName:trackerInfo.Task,
				ZoneName:trackerInfo.ZoneName,
			FloorName:trackerInfo.FloorName },
		};
		markers[trackerInfo.Id] = obj;
	}
	obj.latestData = trackerInfo;
	if ((obj.Id == state.focusName) && (!state.initialFocusObj)) {
		state.focusObj = obj;
		state.initialFocusObj = obj;
	}

	if (obj.objThree) {
		// update below
	} else {
		var sphere = new THREE.Mesh( state.sharedGeo, state.sharedMat );
		sphere.renderOrder = 10;
		obj.objThree = sphere;
		state.objThreeTrackerRoot.add( sphere );

		obj.objWorld = capSciIconCacheInstanceRandom(trackerInfo.Speed);
		state.objThreeTrackerRoot.add( obj.objWorld );
	}
	var p = trackerInfo.Location;
	var d = trackerInfo.UnitDir;
	if (evxToolsNotNull(trackerInfo.Location2) && state.isContinuousAnim) {
		var tn = (Date.now());
		var timeInSecs =  ( (1*tn) - (1*state.timeStart) ) / 1000;
		var sv = timeInSecs * 0.45; // NOTE: TOTAL HACK
		var lt = Math.sin( sv );
		lt = ((lt * 0.5) + 0.5);
		var ts = obj.tempVecSrc;
		evxToolsVectorLerp(trackerInfo.Location, trackerInfo.Location2, lt, ts );
		if (trackerInfo.Speed != 0.0) {
			evxToolsVectorLerp(trackerInfo.Location, trackerInfo.Location2, lt + 0.1, d );
			evxToolsVectorSubtract(d, ts, d);
			evxToolsVectorScale(d, Math.sign(Math.cos(sv)));
			if (evxToolsVectorMagnitude(d) < 1.0) {
				d = trackerInfo.UnitDir;
			}
		}
		p = ts;
	}
	
	obj.unitPos.set(-p.x/capSciBasicScale, p.y/capSciBasicScale, -p.z/capSciBasicScale);
	obj.unitDir.set(-d.x, d.y, -d.z);
	evxToolsVectorScale(obj.unitDir, -1.0);
	var tv = obj.tempVec;
	tv.copy(obj.unitPos);
	tv.add(obj.unitDir);
	obj.objThree.position.copy(obj.unitPos);
	obj.objWorld.position.copy(obj.unitPos); // add offset here
	obj.objWorld.lookAt(tv);
	
	return obj;
}

function capSciMarkerZoomUpdate(unitWidth) {
	var state = capSciState();

	state.latestZoomWidth = unitWidth;
	if (evxToolsIsNull(state.zoomTemps)) {
		state.zoomTemps = {
			baseRot : new THREE.Quaternion(),
			tempQuat : new THREE.Quaternion(),
		};
		state.zoomTemps.baseRot.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI / 2 );
	}
	var temps = state.zoomTemps;

	for (var mi in state.knownMarkers) {
		var m = state.knownMarkers[mi];
		var scl = 0.0125 * unitWidth;
		m.objThree.scale.set(scl*2,scl*8,scl*2);

		temps.tempQuat.setFromEuler(m.objWorld.rotation);
		temps.tempQuat.multiply(temps.baseRot);
		m.objThree.rotation.setFromQuaternion(temps.tempQuat);
	}
}

function capSciMarkerHitTesterBuilder() {
	var state = capSciState();
	var v0 = new THREE.Vector3();
	var v1 = new THREE.Vector3();
	var dx, dy;
	var bestd, countTouches, m;
	var bestMarker;

	var cb = function (toucher) {
		bestd = 1000000;
		countTouches = 0;
		bestMarker = undefined;
		// see reference in evxToucherIntersectPoints
		for (var mi in state.knownMarkers) {
			m = state.knownMarkers[mi];
			v0.copy(m.unitPos);
			v0.applyMatrix4(m.objThree.matrixWorld);
			evxProjectorProjectWorld(toucher.projection, v0);
			dx = v0.x - toucher.projX;
			dy = v0.y - toucher.projY;
			dp = ((dx*dx) + (dy*dy));
			if ((dp < toucher.projMinDistSquare) && (dp < bestd)) {
				bestd = dp;
				evxToucherPushHit(toucher, state.objThreeTrackerRoot, Math.sqrt(dp), mi);
				bestMarker = m;
				countTouches++;
			}
			m = null;
		}
		state.latestHoverMarker = bestMarker;
		if (countTouches > 0) {
			toucher.intersects.sort(__evxToucherIntersectsComparer);
		}
		return (countTouches > 0);
	}
	return cb;
}

function capSciMarkerTouched(hitInfo, metadataCallback) {
	var state = capSciState();
	var marker = state.knownMarkers[hitInfo.index];
	metadataCallback(marker.metadata);
}

function capSciMarkersUpdateAll(objThree, frameInfo) {
	var state = capSciState();
	if (!evxToolsNotNull(state.objThreeRoot)) {
		state.objThreeTrackerRoot = new THREE.Group();
		state.objThreeRoot = objThree;
		state.objThreeRoot.add( state.objThreeTrackerRoot );
		state.objThreeTrackerRoot.customHitTestToucher = capSciMarkerHitTesterBuilder();
		state.objThreeTrackerRoot.customOnTouch = capSciMarkerTouched;
	}

	for (var ti in frameInfo.Trackers) {
		var tr = frameInfo.Trackers[ti];
		capSciMarkerInfoUpdate(tr);
	}
	
	capSciMarkerZoomUpdate(state.latestZoomWidth);
}

function capSciIconCacheEnsureHolder(id) {
	var state = capSciState();
	var objPath = capSciPeopleFolder + id;
	var info = {
		path:objPath,
		loadedModel:undefined,
		needingModel:[],
	};
	state.iconCache.push( info );

	evx_3dPack_LoadModelObj(objPath, '', function(model) {
		if (evxToolsNotNull(model)) {
			evxToolsAssert(info.loadedModel == undefined);
			info.loadedModel = model;

			var scl = 0.005;
			model.scale.set(scl,scl,-scl);
			model.position.set(0,-0.0061,0);

			// TODO: set the material here.
			model.traverse(function(m) {
				if (evxToolsNotNull(m.material)) {
					m.material = state.sharedMatPeople;
				}
			});
			
			for (var i in info.needingModel) {
				var h = info.needingModel[i];
				h.add(model.clone());
			}
		}
	});

	return info;
}

function capSciIconCacheEnsureSetup() {
	var state = capSciState();
	if (state.iconCache.length > 0) {
		return;
	}
	var count = 0;
	for (var fn in capSciPeopleFilenames) {
		capSciIconCacheEnsureHolder(capSciPeopleFilenames[fn]);
		count++;
		if (count > 2) {
			return; // for now only load two
		}
	}
}

function capSciIconCacheInstanceRandom(speed) {
	capSciIconCacheEnsureSetup();
	var iconAr = (capSciState().iconCache);
	var iconNdx = ((speed == 0.0) ? 0 : ((speed > 1.5) ? 2 : 1 ));
	var info = iconAr[iconNdx];
	var res = new THREE.Group();
	if (info.loadedModel) {
		res.add(info.loadedModel.clone());
	} else {
		info.needingModel.push(res);
	}
	return res;
}

function capSciConfigureModels(res) {

	// this ensure that the root is configured:
	capSciMarkerUpdateCallback = function() {
		capSciMarkersUpdateAll( res.objThree, capSciSampleStadiumData );
	};
	capSciMarkerUpdateCallback();

	capSciAddBgModel("stadiumFull","subject/stadium/model/StadiumFull/USM_Stadium_FullModel.obj");
	//capSciAddBgModel("overview","subject/stadium/model/OutlineModel/USM_Stadium.obj");
	//capSciAddBgModel("floor0","subject/stadium/model/FloorDetails_0/USM_Stadium_FloorDetails_0.obj");
}

function capSciCustomClipUpdateBuilder() {
	var tm = new THREE.Matrix4();
	var pos = new THREE.Vector3();
	var scl = new THREE.Vector3();
	var rot = new THREE.Quaternion();

	var cb = function (res) {
		//originally: res.clipMatrixSrc.matrix.getInverse( res.objThree.matrixWorld );

		// adjust the clip so that it shows more than just the unit cube:
		res.objThree.matrixWorld.decompose(pos, rot, scl);
		pos.x += scl.x;
		pos.y -= scl.y;
		evxToolsVectorScale(scl, 3.0);
		tm.compose(pos, rot, scl);
		res.clipMatrixSrc.matrix.getInverse( tm );
	};
	return cb;
}



function capSciAddBgModel(name,objPath) {
	var state = capSciState();
	var parObjThree = state.objThreeRoot;

	var clip = evxShaderStateStore();
	var isUseClipping = true;

	evx_3dPack_LoadModelObj(objPath, '', function(stadiumModel) {
		if (!evxToolsNotNull(stadiumModel)) {
			return;
		}
		var sysClip = evxShaderStateStore();
		evxShaderStateRestore(isUseClipping ? clip : undefined);
		if (isUseClipping && evxToolsIsNull(clip.onClipUpdate)) {
			clip.onClipUpdate = capSciCustomClipUpdateBuilder();
		}
		//var mat = evxShaderMaterialCreateForLitTriangles(new THREE.Color( 0x866e00 ));
		var mat = evxShaderMaterialCreateForLitTrianglesTransparent(
				new THREE.Color( 0xecc101 ),
					"vec4 wOffset = (modelMatrix * vec4(0,0,0,1));" +
					"vec4 wScale = (modelMatrix * vec4(1,1,1,0));" +
					"vec3 lPos = (wPos.xyz - wOffset.xyz) / wScale.xyz;" +
					"vec3 grid = saturate(fract(0.2 * lPos.xyz)/(1.0/10.0));"
					+ "finalAlpha *= min(grid.x,min(grid.y,grid.z));"
					,"uniform mat4 modelMatrix;"); //float3 grid = wPos.xyz - floor(wPos.xyz); finalAlpha *= min(grid.x,min(grid.y,grid.z));");
		mat.side = THREE.DoubleSide;
		var matTex = evxShaderMaterialCreateForLitTexturePath(
			new THREE.Color( 0xecc101 ), 
			"subject/stadium/Stadium_Better.png" );
		matTex.side = THREE.DoubleSide;
		matTex.depthWrite = false;
		evxShaderStateRestore(sysClip);

		stadiumModel.traverse(function(mesh) {
			if (evxToolsNotNull(mesh.material)) {
				mesh.material = mat;
				if (mesh.name == "Mesh4 Model") {
					mesh.material = matTex;
				}
			}
		});
		var scl = 1.0 / capSciBasicScale;
		stadiumModel.scale.set( scl, scl, -scl );
		stadiumModel.position.set(0,0,0);
		parObjThree.add(stadiumModel);
		//var person = evx_3dPack_CreateItemInstance(stadiumModel);
	});
}


function capSciBuildCameraCallback() {
	var initialCamPos = undefined;
	var initialScenePos = undefined;
	var state = undefined;
	var dc = new THREE.Vector3();

	var cb = function(camera, sceneObj, mouseX, mouseY, isSnap) {

		if (!evxToolsNotNull(state)) {
			state = capSciState();// call this after system initializes.
			
			initialCamPos = camera.position.clone();
			initialScenePos = sceneObj.position.clone();
		}

		camera.position.copy( initialCamPos );
		camera.position.x += mouseX * -4.0;
		camera.position.y += (mouseY * -4.0) + 6.0;
		camera.position.z += 2.0;
		evxToolsVectorSubtract(camera.position, initialCamPos, dc);
		//evxToolsVectorScale(dc, 0.125);
		camera.position.copy( initialCamPos );
		camera.position.add(dc);


		camera.lookAt( initialScenePos );

		return true;
	}
	return cb;
}

function capSciClickedCallback(isOverObj,isTouch) {
	var state = capSciState();
	if (true) {
		if (state.focusObj != state.latestHoverMarker)  {
			state.focusObj = state.latestHoverMarker;
			state.goalZoom = 0.016;
		} else {
			state.focusObj = undefined;
			state.goalZoom = 0.312;
		}
		capSciAnimationRequest();
	}
}

function capSciCursorDragCallback(dx,dy) {
	var state = capSciState();
	var scl = 2.0 * state.latestZoomWidth;
	state.prevZoomCenter.x += -dx * scl;
	state.prevZoomCenter.z += -dy * scl;
	state.focusObj = undefined;
	evn3d_root.innerScroll1d(0);
}

function capSciSlideExitCallback() {
	var state = capSciState();
	state.isContinuousAnim = false;
}

function capSciSlideEnterCallback() {
	var state = capSciState();
	state.isContinuousAnim = true;
}

function capSciMetadataCallback() {
	var state = capSciState();
	var markers = state.knownMarkers;
	var meta = [];
	for (var mi in markers) {
		var m = markers[mi];
		meta.push({
			Person:m.latestData.Id,
			Mission:m.latestData.Task,
			Zone:m.latestData.ZoneName,
		});
	}
	return meta;
}

function capSciPostIncludeCallback() {
	ecoSlide0.customCameraCallback = capSciBuildCameraCallback();
	ecoSlide0.customClickCallback = capSciClickedCallback;
	ecoSlide0.customDragCallback = capSciCursorDragCallback;
	ecoSlide0.customSlideExitCallback = capSciSlideExitCallback;
	ecoSlide0.customSlideEnterCallback = capSciSlideEnterCallback;
	ecoSlide0.customSlideMetadataCallback = capSciMetadataCallback;
}

function capSciAnimationRequest() {
	var state = capSciState();
	state.animTimeNeeded = state.animTimeDefault;
	evn_AnimationEnable(true);
}

function capSciAnimationTick(dt,totalTime,isReset) {
	if (!capSciStateIsReady()) {
		return;
	}
	var state = capSciState();

	evn3d_root.innerScroll1d(0);
	//var waveTime = Math.abs( Math.sin(totalTime * 3.141 * 4.0) );
	var ft = 0; //(state.animTimeNeeded / state.animTimeDefault);
	
	for (var mi in state.knownMarkers) {
		var m = state.knownMarkers[mi];
		var tv = m.tempVec;
		tv.copy(m.unitDir);
		evxToolsVectorScale(tv, ft * 0.003 * Math.min( m.latestData.Speed, 1.5 ) );
		tv.add(m.unitPos);
		m.objWorld.position.copy(tv);//m.unitPos);

		//m.objWorld.position.add(tv);
		//m.objWorld.rotation.y += dt * 0.61;
	}

	if (evxToolsNotNull(capSciMarkerUpdateCallback)) {
		capSciMarkerUpdateCallback();
		//state.animTimeNeeded = 1.0; // TODO: use default value here
	}

	state.animTimeNeeded -= dt;
	if ((state.animTimeNeeded < 0)) {
		state.goalZoom = undefined;
		if ((!state.isContinuousAnim) || evxToolsIsNull(capSciMarkerUpdateCallback)) {
			evn_AnimationEnable(false);
		}
	}

	
}

function partnerSetupExtension_UnitScroller(res) {

	var basicScale = 1.0;
	var isFirst = true;
	var tv0 = undefined;

	res.customScrollCallback = function(unitDelta) {

		var state = capSciState();
		var el = res.objJs;
		var axs = el.InputScope.Vector[0];
		var w = (axs.Scope.To - axs.Scope.From) / basicScale;
		var w2 = (w * (1 - ( unitDelta * 0.5)));
		w2 = Math.max( 0.0130, Math.min(w2, 0.5));
		w2 *= basicScale;

		var targetPos = ((state.focusObj) ? (state.focusObj.unitPos) : state.initialCameraPos);
		if (isFirst) {
			isFirst = false;
			w2 = 0.312;
			state.initialFocusObj = state.focusObj;
			state.initialCameraPos = state.focusObj.unitPos.clone();
			state.prevZoomCenter = state.initialCameraPos.clone();
			tv0 = new THREE.Vector3();
		} else {
			if (evxToolsNotNull(state.goalZoom) || (state.isContinuousAnim && (evxToolsNotNull(state.focusObj)))) {
				evxToolsVectorSubtract(targetPos, state.prevZoomCenter, tv0);
				var interF = 0.15 * (1.0 - evxToolsClamp01( state.animTimeNeeded / state.animTimeDefault ));
				evxToolsVectorScale(tv0, interF );
				if (interF > 0 && evxToolsNotNull(state.goalZoom)) {
					w2 = evxToolsLerp( w2, state.goalZoom, interF );
				}
				tv0.add(state.prevZoomCenter);
				targetPos = tv0;
				state.prevZoomCenter.copy(targetPos);
			} else {
				targetPos = state.prevZoomCenter;
			}
		}
		var zoomPct = evxToolsClamp01(1 - w2);
		
		for (var ai in el.InputScope.Vector) {
			var ax = el.InputScope.Vector[ai];

			ax.Scope.From = targetPos[ax.Id] - (w2/2);
			if (ax.Id == 'y') {
				ax.Scope.From = Math.max( -0.01, ax.Scope.From );
			}

			ax.Scope.To = ax.Scope.From + w2;
			evxHoloScope1DUpdateTransform(ax);
		}

		capSciMarkerZoomUpdate(w2);

		// will automatically call evxElementInputScopeUpdate at the end
	};
}
evxExtensions["unitscroller"] = partnerSetupExtension_UnitScroller;

function partnerSetupExtension_UnitModel(res) {
	capSciConfigureModels(res);
	evn_AnimationCallback = capSciAnimationTick;
	capSciAnimationRequest();
}
evxExtensions["unitmodel"] = partnerSetupExtension_UnitModel;

