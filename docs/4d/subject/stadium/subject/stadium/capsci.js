
var capSciBasicScale = 1055.0;
var capSciSampleStadiumData = {"Trackers":[{"Id":"NearOne","Task":"Perimeter","Speed":0.0,"Location":{"x":0.013567047193646431,"y":7.281294345855713,"z":-1048.109375},"UnitDir":{"x":-2.4536237716674806,"y":0.0,"z":3.143310070037842}},{"Id":"NearZero","Task":"Garage Check","Speed":1.0,"Location":{"x":-295.9831237792969,"y":26.317928314208986,"z":-448.37957763671877},"UnitDir":{"x":0.16909591853618623,"y":0.0,"z":-3.983978748321533}},{"Id":"Stevens","Task":"Security","Speed":1.0,"Location":{"x":-838.2516479492188,"y":48.72804641723633,"z":-525.578857421875},"UnitDir":{"x":0.22728024423122407,"y":0.0,"z":3.9810831546783449}},{"Id":"Wayne","Task":"Field Check","Speed":2.0,"Location":{"x":-697.01220703125,"y":6.73898458480835,"z":-411.375},"UnitDir":{"x":3.9598405361175539,"y":0.0,"z":0.46937012672424319}},{"Id":"Mitchell","Task":"Chair Sweep","Speed":0.5,"Location":{"x":-417.1820983886719,"y":35.943912506103519,"z":-613.3419189453125},"UnitDir":{"x":2.7781670093536379,"y":0.0,"z":-2.860499620437622}},{"Id":"MGR TEAM","Task":"Review","Speed":0.0,"Location":{"x":-583.845947265625,"y":36.68559646606445,"z":-197.42530822753907},"UnitDir":{"x":0.01970486529171467,"y":0.0,"z":3.9875168800354006}},{"Id":"Nick","Task":"Parking Duty","Speed":2.0,"Location":{"x":-962.76904296875,"y":7.540485858917236,"z":-239.73617553710938},"UnitDir":{"x":-0.0970376580953598,"y":0.0,"z":-3.986384153366089}}]}
;
var capSciPeopleFolder = "subject/stadium/model/People/";
var capSciPeopleFilenames = [	
	'Worker001.obj',
	'Worker006.obj',
	'Worker008.obj',
	'Worker016.obj',
	'Worker017.obj',
	'Worker023.obj',
	'Worker024.obj',
	'Worker026.obj',
	'Worker007.obj',
	];


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
		sharedGeo:new THREE.SphereGeometry( 1.0, 32, 32 ),
		sharedMat:new THREE.MeshBasicMaterial( {color: 0xffff00 } ),
		//sharedMatPeople:new THREE.MeshBasicMaterial( {color: 0xffff00 } ),
		sharedMatPeople:evxShaderMaterialCreateForLitTriangles(new THREE.Color(0xffff00)),
		latestZoomWidth:1.0,
		animTimeNeeded:2.0,
		animTimeDefault:2.0,
		goalZoom:undefined,
		iconCache:[],
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
			metadata:{IdName:trackerInfo.Id, TaskName:trackerInfo.Task},
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

		obj.objWorld = capSciIconCacheInstanceRandom();
		state.objThreeTrackerRoot.add( obj.objWorld );
	}
	var p = trackerInfo.Location;
	var d = trackerInfo.UnitDir;
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
	for (var mi in state.knownMarkers) {
		var m = state.knownMarkers[mi];
		var scl = 0.0125 * unitWidth;
		m.objThree.scale.set(scl*3,scl*8,scl);
		
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

function capSciAddTrackers(objThree, frameInfo) {
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

function capSciIconCacheInstanceRandom() {
	capSciIconCacheEnsureSetup();
	var info = evxToolsRandomInArray(capSciState().iconCache);
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
	capSciAddTrackers( res.objThree, capSciSampleStadiumData );

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
		var mat = evxShaderMaterialCreateForLitTrianglesTransparent(new THREE.Color( 0x866e00 ));
		mat.side = THREE.DoubleSide;
		evxShaderStateRestore(sysClip);

		stadiumModel.traverse(function(mesh) {
			if (evxToolsNotNull(mesh.material)) {
				mesh.material = mat;
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

function capSciClickedCallback(isOverObj) {
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

function capSciPostIncludeCallback() {
	ecoSlide0.customCameraCallback = capSciBuildCameraCallback();
	ecoSlide0.customClickCallback = capSciClickedCallback;
	ecoSlide0.customDragCallback = capSciCursorDragCallback;
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
	var ft = (state.animTimeNeeded / state.animTimeDefault);
	
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

	state.animTimeNeeded -= dt;
	if (state.animTimeNeeded < 0) {
		state.goalZoom = undefined;
		evn_AnimationEnable(false);
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
			if (evxToolsNotNull(state.goalZoom)) {
				evxToolsVectorSubtract(targetPos, state.prevZoomCenter, tv0);
				var interF = 0.15 * (1.0 - ( state.animTimeNeeded / state.animTimeDefault ));
				evxToolsVectorScale(tv0, interF );
				if (interF > 0) {
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

