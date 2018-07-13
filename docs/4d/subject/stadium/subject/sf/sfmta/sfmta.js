
/* Copyright (C) Lewcid Systems LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Lewey Geselowitz <LeweyGeselowitz@gmail.com>, July 2018
 */

/* ------------ SFMTA DEMO ------------------------- */

var __sfmta_interState = undefined;
function sfmtaState() {
    if (__sfmta_interState) {
        return __sfmta_interState;
    }
    __sfmta_interState = {
        isReady : true,
        latestHoverIndex : -1,
        latestHoverWPos : new THREE.Vector3(),
        busRootRes : undefined,
        focusRoute : undefined,
        focusOutCb : undefined,
        volumeObj : undefined,
        pointsObj : undefined,
    };
    return __sfmta_interState;
}

function sfmtaCustomSlideEnter() {
    var state = sfmtaState();
}

function sfmtaCustomSlideExit() {
    var state = sfmtaState();
}

function sfmtaMarkerTouched(hitInfo) {
    var state = sfmtaState();
    var ndx = hitInfo.index;
    state.latestHoverIndex = ndx;
    state.latestHoverWPos.copy(hitInfo.estWpos);
}

function sfmtaAnimateSedecaIn(wpos) {
    var state = sfmtaState();
    var sumTime = 0.0;
    var maxTime = 0.61;
    if (!state.focusRoute) {
        return;
    }
   var parent = state.pointsObj;
   var lpos = new THREE.Vector3();
   var w2l = new THREE.Matrix4();
   w2l.getInverse(parent.matrixWorld);
   lpos.copy(wpos);
   lpos.applyMatrix4(w2l);

    evnAnimationPushThread(function(dt) {
        if (!state.focusRoute) {
            return;
        }
        sumTime += dt;
        var ut = (sumTime / maxTime);
        ut = Math.pow( ut, 0.61 );
        ut = evxToolsClamp01( ut );
        var it = 1.0 - ut;
        state.focusRoute.position.set(it*lpos.x, it*lpos.y, it*lpos.z);
        state.focusRoute.scale.set(ut,ut,ut);
        if (ut >= 1.0) {
            return; // done
        }
        return true; // continue going...
    });

    var animOut = function(after) {
        sumTime = 0.0;
        var whenDone = function() {
            if (after) after();
        };
        evnAnimationPushThread(function(dt) {
            if (!state.focusRoute) {
                whenDone();
                return;
            }
            sumTime += dt;
            var ut = (sumTime / maxTime);
            ut = Math.pow( ut, 0.61 );
            ut = 1.0 - evxToolsClamp01( ut );
            var it = 1.0 - ut;
            if (state.focusRoute) {
                state.focusRoute.position.set(it*lpos.x, it*lpos.y, it*lpos.z);
                state.focusRoute.scale.set(ut,ut,ut);
            }
            if (ut <= 0.0) {
                whenDone();
                return; // done
            }
            return true; // continue going...
        });
    }
    return animOut;
}

function sfmtaSwitchToSedeca(sed, fromWpos) {
    var wpos = new THREE.Vector3();
    wpos.copy(fromWpos);
    var path = "subject/sf/sfmta/fileparts/shapes/sfmtaAVLRawData04192013.csv.sfonly.csv.sedeca.s"
                + sed + "g.csv.shape.json";
    evxToolsWebDownloadString(path, function(jsonString) {
        var state = sfmtaState();
        if (evxToolsNotNull(state.focusRoute)) {
            return; // already there, must be a late load
        }
        if (evxToolsIsNull(jsonString)) {
            return;
        }

        var shapeJs = evxToolsJsonFromString(jsonString);
        if (evxToolsIsNull(shapeJs)) { return; }

        var res = evxShapeCreateFromJsonShape(shapeJs);
        state.busRootRes.objThree.add(res.objThree);

        state.focusRoute = res.objThree;
        state.volumeObj.visible = false;
        state.pointsObj.visible = false;

        state.focusOutCb = sfmtaAnimateSedecaIn(wpos);

        evxRequestUpdate();
    });
}

function sfmtaCustomClickCallback(isOverObj,isTouch) {
    var state = sfmtaState();
    if (evxToolsNotNull(state.focusRoute)) {

        var whenDone = function() {
            state.focusRoute.visible = false;
            state.focusRoute = undefined;
            // TODO: NOTE: MASSIVE MEMORY LEAK ABOVE!!!!

            state.volumeObj.visible = true;
            state.pointsObj.visible = true;
        };
        if (state.focusOutCb) {
            state.focusOutCb(whenDone);
        } else {
            whenDone();
        }

    } else {
        if (state.latestHoverIndex >= 0) {
            var sed = evxSedecaIndexToHex(state.latestHoverIndex);
            sfmtaSwitchToSedeca(sed, state.latestHoverWPos);
        }
    }
    evxRequestUpdate();

}

function sfmtaCustomSlidePreEnter(rootJs) {
    if (rootJs == ecoSlide3) {
        // Quick hack to remove point indices which represent small batches:
        var pnts = rootJs.Elements[2].Elements[0].Shape;
        var ns = pnts.IndexSets[0];
        var nds = ns.Indices;
        var counts = ns.Strings; // counts are in the labels
        var ans = [];
        for (var ii=0; ii<nds.length; ii++) {
            if ( (1*counts[ii] ) > 60 ) {
                ans.push(ii);
            }
        }
        ns.Indices = ans;
    }
}

function sfmtaPostIncludeCallback() {
    var allSlides = [ ecoSlide2, ecoSlide3 ];
    for (var ii in allSlides) {
        var sl = allSlides[ii];
        //sl.customCameraCallback = capSciBuildCameraCallback();
        sl.customClickCallback = sfmtaCustomClickCallback;
        //sl.customDragCallback = capSciCursorDragCallback;
        sl.customSlideExitCallback = sfmtaCustomSlideExit;
        sl.customSlideEnterCallback = sfmtaCustomSlideEnter;
        sl.customSlidePreEnterCallback = sfmtaCustomSlidePreEnter;
        sl.customCameraScale = function() { return 1.61; };
        //sl.customSlideMetadataCallback = capSciMetadataCallback;    
    }

}

evxPostScriptCallbacks.push( sfmtaPostIncludeCallback );

function sfmtaExtensionBuilder(isBusRoutes,filePath,isYDir=true) {

    var cb = function(res) {
        var rootSpace = res.objThree;
        var state = sfmtaState();

        if (isBusRoutes) {
            state.busRootRes = res;
            var pnts = rootSpace.children[0].children[0];
            pnts.customPostTouch = sfmtaMarkerTouched;
            state.pointsObj = pnts;
        }

        var scene = new THREE.Group();
        rootSpace.add(scene);
        scene.position.set(0.5, 0.5, 0.5);
        var sceneScl = 1.0; //0.5;
        scene.scale.set(sceneScl,sceneScl,-sceneScl);

        //var filePath = 'subject/sf/market_st/concrete-rebar.192x96x157.dat.xyzg.grid16.png';
        //var filePath = 'subject/sf/sfmta/sfmtaAVLRawData04192013.csv.sfonly.csv.vol16.png';
        var texture = evxObjThreeCreateTexture( filePath );
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        var uvTransform = new THREE.Vector4( 0, 0, 1, 1 );
        var material = evxShaderMaterialCreateForVolumeTexture(new THREE.Color(0xccCCcc), texture, isYDir, uvTransform);

        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        //var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        var cube = new THREE.Mesh( geometry, material );
        state.volumeObj = cube;
        scene.add( cube );
    }
    return cb;
}
evxExtensions["volscroller"] = sfmtaExtensionBuilder(false,'subject/sf/market_st/concrete-rebar.192x96x157.dat.xyzg.grid16.png', false);
evxExtensions["sfmta_vol"] = sfmtaExtensionBuilder(true,'subject/sf/sfmta/sfmtaAVLRawData04192013.csv.sfonly.csv.vol16.png', true);


function sfmtaExtension_volmodel(res) {
}
evxExtensions["volmodel"] = sfmtaExtension_volmodel;



