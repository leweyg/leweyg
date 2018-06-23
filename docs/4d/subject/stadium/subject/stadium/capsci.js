
var capSciBasicScale = 1055.0;
var capSciSampleStadiumData = {"Trackers":[{"Id":"NearOne","Task":"SEC RUN","Location":{"x":0.013567047193646431,"y":0.2791295647621155,"z":-1048.109375}},{"Id":"NearZero","Task":"SEC RUN","Location":{"x":0.013567047193646431,"y":0.2791295647621155,"z":-7.354898929595947}},{"Id":"Stevens","Task":"SEC RUN","Location":{"x":-802.3635864257813,"y":0.2791295647621155,"z":-422.85919189453127}},{"Id":"Wayne","Task":"MV BM","Location":{"x":-697.01220703125,"y":-0.358880877494812,"z":-411.375}},{"Id":"Mitchell","Task":"PSR CHK","Location":{"x":-430.6430969238281,"y":0.31900519132614138,"z":-440.0057067871094}},{"Id":"Forman's Office","Task":"TEAM REVIEW","Location":{"x":-583.1644897460938,"y":0.3135368824005127,"z":-204.6696319580078}},{"Id":"MGR TEAM","Task":"SYS REVW","Location":{"x":-584.6427001953125,"y":5.861720561981201,"z":-201.11068725585938}},{"Id":"Nick","Task":"SUIT UP","Location":{"x":-962.18505859375,"y":-0.03987564891576767,"z":-240.62745666503907}}]};

var __capSciState = undefined;

function capSciState() {
	if (evxToolsNotNull(__capSciState)) {
		return __capSciState;
	}
	__capSciState = {
		knownMarkers:{},
		focusName:"Stevens",
		focusObj:undefined,
		objThreeRoot:undefined,
		objThreeTrackerRoot:undefined,
		sharedGeo:new THREE.SphereGeometry( 1.0, 32, 32 ),
		sharedMat:new THREE.MeshBasicMaterial( {color: 0xffff00 } ),
		latestZoomWidth:1.0,
	};
	var state = __capSciState;
	//state.sharedMat.depthTest = false;
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
			latestHoverMarker:undefined,
			unitPos:(new THREE.Vector3()),
			metadata:{IdName:trackerInfo.Id, TaskName:trackerInfo.Task},
		};
		markers[trackerInfo.Id] = obj;
	}
	obj.latestData = trackerInfo;
	if (obj.Id == state.focusName) {
		state.focusObj = obj;
	}

	if (obj.objThree) {
		// update below
	} else {
		var sphere = new THREE.Mesh( state.sharedGeo, state.sharedMat );
		obj.objThree = sphere;
		state.objThreeTrackerRoot.add( sphere );
	}
	var p = trackerInfo.Location;
	obj.objThree.position.set(-p.x/capSciBasicScale, p.y/capSciBasicScale, -p.z/capSciBasicScale);
	obj.unitPos.copy(obj.objThree.position);
	
	return obj;
}

function capSciMarkerZoomUpdate(unitWidth) {
	var state = capSciState();
	state.latestZoomWidth = unitWidth;
	for (var mi in state.knownMarkers) {
		var m = state.knownMarkers[mi];
		var scl = 0.0125 * unitWidth;
		m.objThree.scale.set(scl,scl*8,scl);
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

function capSciConfigureModels(res) {

	// this ensure that the root is configured:
	capSciAddTrackers( res.objThree, capSciSampleStadiumData );

	capSciAddBgModel("overview","subject/stadium/model/OutlineModel/USM_Stadium.obj");
	capSciAddBgModel("floor0","subject/stadium/model/FloorDetails_0/USM_Stadium_FloorDetails_0.obj");
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
		var mat = evxShaderMaterialCreateForLitTriangles(new THREE.Color( 0x866e00 ));
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

	var cb = function(camera, sceneObj, mouseX, mouseY, isSnap) {

		if (!evxToolsNotNull(state)) {
			state = capSciState();// call this after system initializes.
			
			initialCamPos = camera.position.clone();
			initialScenePos = sceneObj.position.clone();
		}

		camera.position.copy( initialCamPos );
		camera.position.x += mouseX * -2.0;
		camera.position.y += (mouseY * -2.0) + 6.0;
		camera.position.z += 2.0;

		camera.lookAt( initialScenePos );

		return true;
	}
	return cb;
}

function capSciClickedCallback(isOverObj) {
	var state = capSciState();
	if (true) {
		state.focusObj = state.latestHoverMarker;
	}
}

function capSciPostIncludeCallback() {
	ecoSlide0.customCameraCallback = capSciBuildCameraCallback();
	ecoSlide0.customClickCallback = capSciClickedCallback;
}


function partnerSetupExtension_UnitScroller(res) {

	var basicScale = 1.0;

	res.customScrollCallback = function(unitDelta) {

		var el = res.objJs;
		var axs = el.InputScope.Vector[0];
		var w = (axs.Scope.To - axs.Scope.From) / basicScale;
		var w2 = (w * (1 - ( unitDelta * 0.5)));
		w2 = Math.max( 0.1, Math.min(w2, 4.0));
		w2 *= basicScale;

		var zoomPct = evxToolsClamp01(1 - w2);
		var targetPos = capSciState().focusObj.unitPos;

		for (var ai in el.InputScope.Vector) {
			var ax = el.InputScope.Vector[ai];

			if (ax.Id != 'y') {
				//ax.Scope.From = evxToolsLerp(0, targetPos[ax.Id] - (w2/2), zoomPct);
				ax.Scope.From = targetPos[ax.Id] - (w2/2);
			} else {
				ax.Scope.From = -0.01;
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
}
evxExtensions["unitmodel"] = partnerSetupExtension_UnitModel;

