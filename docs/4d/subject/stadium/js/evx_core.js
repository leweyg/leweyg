

/* Copyright (C) Lewcid Systems LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Lewey Geselowitz <LeweyGeselowitz@gmail.com>, March 2018
 */

/* ------------ ECOVOXEL (EVX) TOOLS API ------------------------- */

var evxRequestUpdate = function() { 
	evxToolsAssert(false); // this must be replaced by someone else
};

function evxToolsAssert(test, msg = "") {
    if (test) {
    } else {
        //throw "Assert Failed: " + msg;
    }
}

function evxToolsLog(msg) {
    //alert(msg); // TODO: make this log better
}

function evxToolsTODO() {
    evxToolsAssert(false);
}

function evxToolsNotNull(obj) {
    return ((obj != undefined) && (obj != null));
}

function evxToolsIsNull(obj) {
    return !evxToolsNotNull(obj);
}

function evxToolsHasOption(obj,name) {
	if (evxToolsNotNull(name)) {
		return (evxToolsNotNull(obj.Options) && evxToolsNotNull(obj.Options.Strings[name]));
	} else {
		return evxToolsNotNull(obj.Options);
	}
}

function evxToolsArrayLength(list) {
	if (list.length != undefined) {
		return list.length;
	}
	var ans = 0;
	for (var i in list) {
		ans++;
	}
	return ans;
}

var __evxPsuedoRandomValue = 0;
function evxToolsRandomInArray(items) {
	var v = __evxPsuedoRandomValue;
	__evxPsuedoRandomValue += items.length + 1;
	return items[(v % items.length)];
	//return items[Math.floor(Math.random()*items.length) % items.length];
}

function evxToolsLerp(a, b, t) {
	return ((b * t) + (a * (1.0 - t)));
}

function evxToolsInvLerp(a, b, t) {
	return ((t - a) / (b - a));
}

function evxToolsClamp01(v) {
	if ((v >= 0) && (v <= 1)) {
		return v;
	} else if (v < 0) {
		return 0;
	} else {
		return 1;
	}
}

function evxToolsUnitTo010(v) {
	if (v <= 0.5) {
		return (v * 2.0);
	} else {
		return 1.0 - ((v - 0.5) * 2.0);
	}
}

function evxToolsVectorCreateXYZ(vx, vy, vz) {
    return { x:vx, y:vy, z:vz }
}

function evxToolsVectorSetXYZ(v, vx, vy, vz) {
    v.x=vx;
	v.y=vy;
	v.z=vz;
	return v;
}

function evxToolsVectorMagnitude(a) {
	return Math.sqrt((a.x*a.x) + (a.y*a.y) + (a.z*a.z));
}

function evxToolsVectorSubtract(a, b, into) {
	into.x = (a.x - b.x);
	into.y = (a.y - b.y);
	into.z = (a.z - b.z);
	return into;
}

function evxToolsVectorScale(v, scl) {
	v.x *= scl;
	v.y *= scl;
	v.z *= scl;
}

function evxToolsVectorDistance(a, b) {
	var dx = (a.x - b.x);
	var dy = (a.y - b.y);
	var dz = (a.z - b.z);
	return Math.sqrt((dx*dx)+(dy*dy)+(dz*dz));
}

function evxToolsIsWebGLSupported(canvas) {
	return (window.WebGLRenderingContext && 
		( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) )
	);
}

var evxConstXYZZero = evxToolsVectorCreateXYZ(0,0,0);
var evxConstXYZOne = evxToolsVectorCreateXYZ(1, 1, 1);

function evxToolsWebDownloadString (url, callback) {
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
    xhttp.send();
};

function evxToolsJsonFromString(str) {
    var compiledJS = null;
    try {
        compiledJS = eval("compiledJS=" + str);
    } catch (ex) {
		evxToolsAssert(false, "JSON parse error: " + ex);
    }
    return compiledJS;
}


var evxToolsWebStdServerPathsPossible = [ "/", "http://ec2-54-176-185-23.us-west-1.compute.amazonaws.com/", "http://localhost:8080/" ];
var evxToolsWebStdServerPath = evxToolsWebStdServerPathsPossible[0];


function evxToolsWebServiceConfigure(callback) {
    // TODO: if localhost fails, then try get path from Firebase
    evxToolsWebServicePing(function(pingWorked) {
        callback(pingWorked);
    });
}

function evxToolsWebQueryService(cmd, options, callback) {
    var lnk = evxToolsWebStdServerPath + "?" + cmd + "=true" + options;
    evxToolsWebDownloadString(lnk, callback);
}

function evxToolsWebServiceBegin(serviceId, options, callback) {
	evxToolsWebQueryService("begin", "&service=" + serviceId + options, callback);
}

function evxToolsWebServiceUpdate(requestId, options, callback) {
	evxToolsWebQueryService("update", "&request=" + requestId + options, callback);
}

function evxToolsWebServicePing(callback){
	evxToolsWebQueryService("evx_ping", "", function(text,didPass) {
        var worked = ((didPass) && (text == "evx_ack"));
		if (false && (!worked) && (evxToolsWebStdServerPath == evxToolsWebStdServerPathsPossible[0])) {
			evxToolsWebStdServerPath = evxToolsWebStdServerPathsPossible[1]; // try the secondary path
			evxToolsWebServicePing(callback);
		} else {
			callback(worked);
		}
    });
}

function evxToolsWebServiceRestart() {
	evxToolsWebQueryService("app_wide_restart", "", function(res,didWork) {
		if (didWork) {
			location.reload(true);
		}
	});
}


function evxHtmlFromShape(sh) {
    var nprops = sh.Scope.Packing.VertexWidth;
    var ntimes = sh.Scope.Packing.VertexCount;
    var data = sh.PackedUnitVertices;
    var ans = "";
    ans += "<table>";
    for (var ri = 0; ri < nprops; ri++) {
        ans += "<tr>";
        for (var ci = 0; ci < ntimes; ci++) {
            if (ci == 0) {
                ans += "<td>" + sh.Scope.Vector[ri].Id + "</td>";
            }
            ans += "<td>";
            var item = "" + data[ri + (ci * nprops)];
            if (item.length > 4) {
                item = item.substr(0, 4);
            }
            ans += item;
            ans += "</td>";
        }
        ans += "</tr>";
    }
    ans += "</table>";
    return ans;
}

var evxToolsMatrixAutoUpdateDefault = true;


/* ------------ ECOVOXEL (EVX) CORE API ------------------------- */


function evxElementCreate() {
    return {
        type:"evxElement",
        objThree:null,
        objJs:null,
        childElements:[],
        shape:null,
    };
}

function evxShapeCreate() {
    return {
        type:"evxShape",
		parent:null,
        objThree:null,
        objJs:null,
    };
}

function evxShapeIndexedCreate() {
    return {
        type:"evxShapeIndexed",
		parent:null,
        objThree:null,
        objJs:null,
    };
}

function evxScope1DCreate() {
    return {
        type:"evxScope1D",
        Id:"",
        IsPacking:false,
        Scope:null,
        ScopeString:null,
        Resolution:null,
        Inputs:[],
    };
}

function evxScopeNCreate() {
    return {
        type: "evxScopeN",
        Vector:[], // of scope 1ds
        Packing:{
            VertexWidth:0,
            VertexCount:0,
        },
    };
}

function evxToolsCloneObject(ob) {
    if ((ob == null) || (ob == undefined))
        return ob;
    var obType = (typeof ob);
    if (obType == 'string')
        return "" + ob;
    if (obType == 'number')
        return 1.0 * ob;
    if (obType == 'boolean')
        return ob;
    if (Array.isArray(ob)) {
        var ar = [];
        for (var ii in ob) {
            ar.push( evxToolsCloneObject( ob[ii] ) );
        }
        return ar;
    } else {
        var ans = {};
        for (var k in ob) {
            ans[k] = evxToolsCloneObject(ob[k]);
        }
        return ans;
    }
}

var evxScopeId_One = "one";

function evxScopeTransformVector(scopeJs, vec, into) {
    if (into == undefined) {
        into = {};
    }
	var res = into;
    for (var si in scopeJs.Vector) {
        var s1 = scopeJs.Vector[si];
        var sid = s1.Id;
        if (evxToolsNotNull(s1.Inputs)) {
            res[sid] = 0.0;
            for (var ii in s1.Inputs) {
                var iw = s1.Inputs[ii];
                var iv = 0.0;
                if (iw.Id == evxScopeId_One) {
                    iv = 1.0;
                } else {
                    iv = vec[iw.Id];
                }
                res[sid] += (iv * iw.Weight);
            }
        } else {
            if (sid in vec) {
                res[sid] = ( vec[sid] );
            } else if (s1.IsPacking) {
				// TODO: put normalization code here
			} else {
                // TODO: load shape data here:
                if (si < 3) {
                    //alert("Missing '" + sid + "' in vector");
                    evxToolsAssert(false, "Missing '" + sid + "' in vector"); // missing input
                } else {
                    // probably color etc., doesn't affect transform
                }
            }
        }
        if (evxToolsNotNull(s1.Scope)) {
            var f = s1.Scope.From;
            var t = s1.Scope.To;
            //res[sid] = (f + ((t - f) * (res[sid]))); // WHY IS THIS HERE?
        }
    }
    return res;
}

var __evxTemp_ETFOS_0 = evxToolsVectorCreateXYZ(0,0,0);
var __evxTemp_ETFOS_1 = evxToolsVectorCreateXYZ(0,0,0);
var __evxTemp_ETFOS_2 = evxToolsVectorCreateXYZ(0,0,0);
var __evxTemp_ETFOS_X = evxToolsVectorCreateXYZ(0,0,0);
var __evxTemp_ETFOS_Y = evxToolsVectorCreateXYZ(0,0,0);
var __evxTemp_ETFOS_Z = evxToolsVectorCreateXYZ(0,0,0);
var __evxTemp_Matrix_0 = null; //new THREE.Matrix4();
var __evxTemp_Quat_0 = null; //new THREE.Quaternion();


function evxObjThreeSetTransformFromScope(objThree, scope) {
    var pos = evxScopeTransformVector(scope, evxConstXYZZero, __evxTemp_ETFOS_0 );

	var px = evxScopeTransformVector(scope, evxToolsVectorSetXYZ(__evxTemp_ETFOS_1, 1,0,0), __evxTemp_ETFOS_X );
	var py = evxScopeTransformVector(scope, evxToolsVectorSetXYZ(__evxTemp_ETFOS_1, 0,1,0), __evxTemp_ETFOS_Y );
	var pz = evxScopeTransformVector(scope, evxToolsVectorSetXYZ(__evxTemp_ETFOS_1, 0,0,1), __evxTemp_ETFOS_Z );
	evxToolsVectorSubtract(px, pos, px);
	evxToolsVectorSubtract(py, pos, py);
	evxToolsVectorSubtract(pz, pos, pz);

	if (!evxToolsNotNull(__evxTemp_Matrix_0)) {
		__evxTemp_Matrix_0 = new THREE.Matrix4();
		__evxTemp_Quat_0 = new THREE.Quaternion();
	}
	__evxTemp_Matrix_0.makeBasis(px, py, pz);
	__evxTemp_Matrix_0.decompose(__evxTemp_ETFOS_1, __evxTemp_Quat_0, __evxTemp_ETFOS_2);

    objThree.position.x = pos.x;
    objThree.position.y = pos.y;
    objThree.position.z = pos.z;
    objThree.scale.x = evxToolsVectorMagnitude( px );
    objThree.scale.y = evxToolsVectorMagnitude( py );
    objThree.scale.z = evxToolsVectorMagnitude( pz );
    objThree.rotation.setFromQuaternion(__evxTemp_Quat_0);
	objThree.updateMatrix();

	//var pos = evxScopeTransformVector(scope, evxConstXYZZero, __evxTemp_ETFOS_0 );
    //var tip = evxScopeTransformVector(scope, evxConstXYZOne, __evxTemp_ETFOS_1 );
    //objThree.scale.x = tip.x - pos.x;
    //objThree.scale.y = tip.y - pos.y;
    //objThree.scale.z = tip.z - pos.z;
	//objThree.updateMatrix();

}

function evxObjThreeCreateZFlipGroup() {
    var group = new THREE.Group();
	group.scale.z = -1.0;
	group.matrixAutoUpdate = evxToolsMatrixAutoUpdateDefault;
	group.updateMatrix();
	return group;
}

var __evxCachedTextures = { };

function evxObjThreeCreateTexture(path, onErrorCallback) {
	if (path in __evxCachedTextures) {
		return __evxCachedTextures[path];
	}
	var ans = new THREE.TextureLoader().load( path,
		function(loadedImage) { evxRequestUpdate(); },
		undefined,
		function() { 
			if (evxToolsNotNull(onErrorCallback)) { 
				onErrorCallback(); 
			} else {
				evxToolsLog("Image failed to load '" + path + "'");
			}
	});
	__evxCachedTextures[path] = ans;
	return ans;
}

var __evxObjThreeCorrectLocalScaleTempVector0 = null;
var __evxObjThreeCorrectLocalScaleTempVector1 = null;
var __evxObjThreeCorrectLocalScaleTempVector2 = null;
var __evxObjThreeCorrectLocalScaleTempAxisNames = [ 'x', 'y', 'z' ];

function evxObjThreeCorrectLocalScale(objThree, scl) {

	if (!evxToolsNotNull(__evxObjThreeCorrectLocalScaleTempVector0)) {
		__evxObjThreeCorrectLocalScaleTempVector0 = new THREE.Vector3();
		__evxObjThreeCorrectLocalScaleTempVector1 = new THREE.Vector3();
		__evxObjThreeCorrectLocalScaleTempVector2 = new THREE.Vector3();
	}
	var p0 = __evxObjThreeCorrectLocalScaleTempVector0;
	var p1 = __evxObjThreeCorrectLocalScaleTempVector1;
	var p2 = __evxObjThreeCorrectLocalScaleTempVector2;

	var orig = p1;
	orig.set(0,0,0);
	objThree.updateMatrix();
	orig.applyMatrix4( objThree.matrixWorld );

	var axes = __evxObjThreeCorrectLocalScaleTempAxisNames;
	for (var ai in axes) {
		var ax = axes[ai];
		var oldscale = objThree.scale[ax];
		
		p0.set(0,0,0);
		p0[ax] = 1.0;
		p0.applyMatrix4( objThree.matrixWorld );
		var wScale = p0.distanceTo(orig);
		objThree.scale[ax] = oldscale * (scl / wScale);
		
	}
	objThree.updateMatrix();
}

function evxObjectThreeCreateBackgroundSphere(path) {
	var geometry = new THREE.SphereGeometry( 20, 24, 12 );
	var texture = evxObjThreeCreateTexture( path );

	var scale360 = 1.45;
	texture.repeat.x = 1.0;
	texture.repeat.y = scale360;
	texture.offset.x = 0.0;
	texture.offset.y = (1.0 - (1.0 / scale360)) * -0.5;
	var material = new THREE.MeshBasicMaterial( { 
		map: texture, 
		color: 0x888888,
	 } );
	//var material = new THREE.MeshNormalMaterial(); // new THREE.MeshBasicMaterial( {color: 0xffff00} );
	var sphere = new THREE.Mesh( geometry, material );
	sphere.rotation.y = Math.PI * -0.4; //0.92;
	return sphere;
}

function evxElementSetTransformFromOutputScope(el) {
    if ("OutputScope" in el.objJs) {
		evxObjThreeSetTransformFromScope(el.objThree, el.objJs.OutputScope);
    }
}

function evxShapeIndexedMetaData(ns) {
    if (evxToolsNotNull(ns.MetaData)) {
        return ns.MetaData;
    }
    if (!evxToolsNotNull(ns.MetaStrings)) {
        return undefined;
    }
    ns.MetaData = [];
    for (var ii in ns.MetaStrings) {
        ns.MetaData.push( evxToolsJsonFromString(ns.MetaStrings[ii]));
    }
    return ns.MetaData;
}

function evxElementFindFirstMetaData(el, metaCallback, allMetaCallback=null) {
	if (evxToolsNotNull( el.Elements)) {
		for (var ci in el.Elements) {
			var c = el.Elements[ci];
			if (evxElementFindFirstMetaData(c, metaCallback, allMetaCallback)) {
				return true;
			}
		}
	}
	if (evxToolsNotNull(el.Shape)) {
		for (var ci in el.Shape.IndexSets) {
            var ns = el.Shape.IndexSets[ci];
            evxShapeIndexedMetaData(ns);
			if (evxToolsNotNull(ns.MetaData)) {
                metaCallback(ns.MetaData[0]);
                if (evxToolsNotNull(allMetaCallback)) {
                    allMetaCallback(ns.MetaData, ns, el.Shape);
                }
				return true;
			}
		}
	}
	return false;
}

function evxElementResetRecursive(el) {
	if (evxToolsNotNull(el.evxTagEl)) {
		el.evxTagEl.objThree.visible = true;
    }

	if (evxToolsNotNull(el.Elements)) {
		for (var ei in el.Elements) {
			var ce = el.Elements[ei];
			evxElementResetRecursive(ce);
		}
	}

	if (evxToolsNotNull(el.Shape)) {
		if (evxToolsNotNull(el.Shape.evxTag)) {
			el.Shape.evxTag.objThree.visible = true;
		}
		for (si in el.Shape.IndexSets) {
			var ns = el.Shape.IndexSets[si];
			if (evxToolsNotNull(ns.evxTag)) {
				ns.evxTag.objThree.visible = true;
			}
		}
    }
    

    if (evxToolsNotNull(el.InputScopeOriginal)) {
        el.InputScope = evxToolsCloneObject(el.InputScopeOriginal);
        evxElementInputScopeUpdate(el);
    }
}

function evxElementApplyMetaFilter(el, metaFilterCallback) {

	if (evxToolsNotNull(el.Elements)) {
		for (var ei in el.Elements) {
			var ce = el.Elements[ei];
			evxElementApplyMetaFilter(ce, metaFilterCallback);
		}
	}

	if (evxToolsNotNull(el.Shape)) {
        var validVertices = [];
        var hasMetaData = false;
        for (var ci in el.Shape.IndexSets) {
            var ns = el.Shape.IndexSets[ci];
            evxShapeIndexedMetaData(ns);
			if (evxToolsNotNull(ns.MetaData)) {
                hasMetaData = true;
                for (var mi=0; mi<ns.MetaData.length; mi++) {
                    if (metaFilterCallback(ns.MetaData[mi])) {
                        var vi = mi;
                        if (evxToolsNotNull(ns.IndicesPerString)) {
                            vi *= ns.IndicesPerString.Count;
                        }
                        if (evxToolsNotNull(ns.Indices)) {
                            vi = ns.Indices[vi];
                        }
                        validVertices.push(vi);
                    }
                }
			}
        }
        if (hasMetaData) {
            for (var ci in el.Shape.IndexSets) {
                var ns = el.Shape.IndexSets[ci];
                if (evxToolsNotNull(ns.Indices)) {
                    var shouldShow = false;
                    for (var ii in ns.Indices) {
                        var vi = ns.Indices[ii];
                        if (validVertices.includes(vi)) {
                            shouldShow = true;
                        }
                    }
                    if (!shouldShow) {
                        ns.evxTag.objThree.visible = false;
                    }
                }
            }
        }
	}
}

var __evx_RecursiveCurrentClip = null;

function evxElementCreateFromJsonElement(el) {

	if (evxToolsNotNull(el.evxTagEl)) {
		evxElementResetRecursive(el);
		return el.evxTagEl;
	}

    var res = evxElementCreate();

    var group = new THREE.Group();
	//group.matrixAutoUpdate = false;
    res.objThree = group;
    res.objJs = el;
    el.evxTagEl = res;
    group.evxTagEl = res;
    
    var previousClip = __evx_RecursiveCurrentClip;

    evxElementSetTransformFromOutputScope(res);
	if ("InputScope" in el) {
		// add view scoping here:
		var viewGroup = new THREE.Group();
        evxObjThreeSetTransformFromScope(viewGroup, el.InputScope);
        
        group.add(viewGroup);
        group.updateMatrix();
		res.objThreeScroll = viewGroup;
		var planes = [];
		for (var pii=0; pii<2; pii++) { // should 6
			var pl = new THREE.Plane(new THREE.Vector3(0,0,0),0);
			planes.push(new THREE.Plane());
		}
		res.clipMatrixSrc = { matrix: new THREE.Matrix4(), planes:planes };
		res.clipMatrix = res.clipMatrixSrc;
        res.clipMatrix.matrix.getInverse( group.matrixWorld );
        res.clipMatrix.matrix.makeScale(0,0,0); // disable clipping at first

        __evx_RecursiveCurrentClip = res.clipMatrix;
        
		group = viewGroup; // this is what the children will be added to
	}
	if (evxToolsNotNull(__evx_RecursiveCurrentClip)) {
		res.clipMatrix = __evx_RecursiveCurrentClip.matrix;
	}

    if ('Shape' in el) {
        var sh = evxShapeCreateFromJsonShape( el.Shape );
        group.add(sh.objThree);
    }
    if (('Elements' in el) && (el.Elements.length > 0)) {
        for (var ci in el.Elements) {
            var c = evxElementCreateFromJsonElement(  el.Elements[ci] );
            group.add(c.objThree);
        }
	}
	
	evxExtensionCheckCreate(res);

    __evx_RecursiveCurrentClip = previousClip;

    return res;
}

var evxExtensions = { };

function evxExtensionCheckCreate(res) {
	if (evxToolsHasOption(res.objJs, 'extension')) {
		var ex = res.objJs.Options.Strings.extension;
		if (ex in evxExtensions) {
			evxExtensions[ex](res);
		}
	}
}

function evxThreeHitInfoTryGetMeta(hitInfo, outInfo) {
    if (evxToolsNotNull(hitInfo.object)) {
        if (evxToolsNotNull(hitInfo.object.evxTagIndex)) {
            var shapeNdx = hitInfo.object.evxTagIndex;
            if ((shapeNdx.IndexType == "Triangles") || (shapeNdx.IndexType == "Points")) {
                if (evxToolsNotNull(hitInfo.index)) {
                    if (evxShapeIndexedTryGetMeta(shapeNdx, hitInfo.index, true, outInfo)) {
                        return true;
                    }
                } else if (evxToolsNotNull(hitInfo.faceIndex)) {
                    if (evxShapeIndexedTryGetMeta(shapeNdx, hitInfo.faceIndex, true, outInfo)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function evxShapeIndexedTryGetMeta(shapeNdxed, index, isFaceIndex, outInfo) {
    var ns = shapeNdxed;
    var faceIndex = -1;
    if (isFaceIndex) {
        faceIndex = index;
    } else {
        evxShapeIndexedMetaData(ns);
        if (evxToolsNotNull(ns.MetaData) && evxToolsNotNull(ns.Indices)) {
            // if index is actually the 'face index'
            for (var ii in ns.Indices) {
                var ndx = ns.Indices[ii];
                if (ndx == index) {
                    faceIndex = ii;
                    break;
                }
            }
        }
    }
    if (evxToolsNotNull(ns.IndicesPerString)) {
        faceIndex = Math.floor( faceIndex / ns.IndicesPerString.Count );
    }
	outInfo.vertexIndex = faceIndex;
    if (evxToolsNotNull(ns.MetaStrings)) {
        if((faceIndex >= 0) && (faceIndex < ns.MetaStrings.length)){
		outInfo.metadata = evxShapeIndexedMetaData( ns )[faceIndex];
        return true;
		}
    }
    if (evxToolsNotNull(ns.Strings)) {
        if((faceIndex >= 0) && (faceIndex < ns.Strings.length)){
		outInfo.metadata = {'string':ns.Strings[faceIndex]};
        return true;
		}
    }
    return false;
}

function evxShapeAddBackgroundMap(groupThree, mapType) {
	var geometry = new THREE.PlaneGeometry( 1, 1, 2, 2 );
	var imagePath = ((mapType=="gridMap") ? "images/just_edge.png" : ((mapType == "scrollMap") ? (partnerGeneralInfo().scrollImagePath) : "images/earth_map.png" ));
    var texture = evxObjThreeCreateTexture( imagePath );
    var uvTransform = new THREE.Vector4( 0, 0, 1, 1 );
    if (mapType == "scrollMap") {
        //uvTransform = new THREE.Vector4( 0.46, 0.59, 0.15, 0.19 );
    }
    var material = evxShaderMaterialCreateForUnlitMonoTexture(new THREE.Color(0xA9B3F3), texture, uvTransform);
    // new THREE.MeshBasicMaterial( { map: texture, color: 0x888888, side: THREE.DoubleSide } );
	//var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	plane.position.x = 0.5;
	plane.position.y = 0.5;
	plane.position.z = 1.0;
	groupThree.add( plane );
}

function evxShapeCreateFromJsonShape(shape) {

	if (evxToolsNotNull(shape.evxTag)) {
		return shape.evxTag;
	}

    var group = new THREE.Group(); // result;
    group.matrixAutoUpdate = evxToolsMatrixAutoUpdateDefault;

    var res = evxShapeCreate();
    res.objJs = shape;
    res.objThree = group;
	shape.evxTag = res;

	evxObjThreeSetTransformFromScope(group, shape.Scope);


    var positions = shape.PackedUnitVertices;
    var vertexCount = shape.Scope.Packing.VertexCount;
    var vertexWidth = shape.Scope.Packing.VertexWidth;
    if ((positions == null) || (positions == undefined) || (positions.length == 0)) {
        // TODO: ideally support the proper scope processing chain
        if (vertexCount == 8) {
            // assume they wanted the unit cube:
            vertexWidth = 3;
            positions = [];
            for (var zi=0; zi<2; zi++) {
                for (var yi=0; yi<2; yi++) {
                    for (var xi=0; xi<2; xi++) {
                        positions.push(xi);
                        positions.push(yi);
                        positions.push(zi);
                    }
                }
            }
			shape.PackedUnitVertices = positions;
        } else {
			// no vertices... empty shape:
			return res;
        }
    }
    var colors = positions; // COPY for now

    // Make sure that these are shared across buffers:
    var posData, colorData=null, uvData=null;
    if (false) {
        posData = new THREE.Float32BufferAttribute( positions, 3 );
        colorData = new THREE.Float32BufferAttribute( colors, 3 );
    } else {
        var posArray = Float32Array.from(positions);
        var interleaved = new THREE.InterleavedBuffer( posArray, vertexWidth );
        posData = new THREE.InterleavedBufferAttribute( interleaved, 3, 0, false );
        if ((vertexWidth > 3) && (shape.Scope.Vector[3].Id == "color_unit")) {
                var colorOffset = ((vertexWidth > 3) ? 3 : 0);
                var colorSize = ((vertexWidth == 4) ? 1 : 3);
                colorData = new THREE.InterleavedBufferAttribute( interleaved, colorSize, colorOffset, false );	
        }    
		if ((vertexWidth > 4) && (shape.Scope.Vector[3].Id == "tex_u")) {
                var uvOffset = 3;
                var uvSize = 2;
                uvData = new THREE.InterleavedBufferAttribute( interleaved, uvSize, uvOffset, false );	
        }  
    }
	
    evxToolsAssert(positions.length == vertexCount*vertexWidth);

    for (var isi in shape.IndexSets) {
        var ss = shape.IndexSets[isi];

		var resNdx = evxShapeIndexedCreate();
		resNdx.parent = res;
		resNdx.objJs = ss;
		ss.evxTag = resNdx;

        if (!("Indices" in ss)) {
            // If "Indices" is not defined, it means all indices
            ss.Indices = [];
            for (var i=0; i<shape.Scope.Packing.VertexCount; i++) {
                ss.Indices.push(i);
            }
        }

        var bufferGeo = new THREE.BufferGeometry();
        bufferGeo.addAttribute( 'position', posData );
        if (evxToolsNotNull(colorData)) {
            bufferGeo.addAttribute( 'evxcolor', colorData );
        }
		if (evxToolsNotNull(uvData)) {
			bufferGeo.addAttribute( 'uv', uvData );
		}
        bufferGeo.setIndex( ss.Indices );// new THREE.Uint16BufferAttribute( ss.Indices ) );
        bufferGeo.computeBoundingSphere();
		bufferGeo.boundingBox = null;
        var geometry = bufferGeo;

        var mat = null; // THREE.Mesh of some kind
        var mesh = null; // THREE.Mesh of some kind;
        var isPoints = false;
        var isLines = false;
		var defColor = new THREE.Color( 0xA9F3B3 );
        if (ss.IndexType == 'Points') {
            isPoints = true;
			var pntSize = 0.1;
			if (evxToolsNotNull(ss.Options) && (evxToolsNotNull(ss.Options.Strings.SkipPointRender) || evxToolsNotNull(ss.Options.Strings.scopeCollision))) {
				pntSize = 0.0; // but still here for collision sake
				bufferGeo.setIndex( [ ] );
			}            
			mat = new THREE.PointsMaterial( { 
				size: pntSize, sizeAttenuation: true, 
				alphaTest: 0.5, 
				transparent: true, 
				color: defColor, 
				clippingPlanes: evxShaderGetClipPlanes(),
			} );
            //mat = evxShaderMaterialPoints(defColor);
            mesh = new THREE.Points( geometry, mat );

        } else if (ss.IndexType == 'Lines') {
            isLines = true;
            //mat = new THREE.LineBasicMaterial( { color: defColor, opacity: 1, linewidth: 1 } ); //, vertexColors: THREE.VertexColors

			if (false) {
				mat = evxShaderMaterialCreateForLines(defColor);
				mesh = new THREE.LineSegments( geometry, mat );
			} else {
				var isAnts = false;
				if (evxToolsHasOption(ss,'FollowablePath') || evxToolsHasOption(ss,'dataContent')) {
					isAnts = true;
				}
				mesh = evxShapeIndexedLineCreateFancyLines(shape, ss, null, isAnts);
			}
			
        } else if (ss.IndexType == 'Triangles') {
			var clr = defColor;
			if (evxToolsNotNull(ss.Options) && (evxToolsNotNull(ss.Options.Strings.ColorAsHex))) {
				var rawClr = null;
				rawClr = eval("rawClr = 0x" + ss.Options.Strings.ColorAsHex);
				clr = new THREE.Color(rawClr);
			}
			if (evxToolsNotNull(ss.Options) && (evxToolsNotNull(ss.Options.Strings.TexturePath))) {
				mat = evxShaderMaterialCreateForLitTexturePath(clr, ss.Options.Strings.TexturePath);
			} else {
				mat = evxShaderMaterialCreateForLitTriangles(clr); //new THREE.MeshLambertMaterial( { color: defColor } );
			}
            mesh = new THREE.Mesh( geometry, mat );
        } else {
            evxToolsLog("Support this type: " + ss.IndexType);
            evxToolsTODO();
        }
		resNdx.objThree = mesh;
        //var mat = new THREE.MeshLambertMaterial( { color: Math.random() * 0xccffcc } );
        //var mesh = new THREE.Mesh( geometry, mat );
        {
			mesh.matrixAutoUpdate = evxToolsMatrixAutoUpdateDefault;
            group.add( mesh );
            mesh.updateMatrix();
            evxShapeIndexedAddMetaData(mesh, resNdx);
        }

		if (evxToolsNotNull(ss.Options)) {
			if (evxToolsNotNull(ss.Options.Strings.earthMap)) {
				evxShapeAddBackgroundMap(group, "earthMap");
            }
            if (evxToolsNotNull(ss.Options.Strings.scrollMap)) {
				evxShapeAddBackgroundMap(group, "scrollMap");
            }
            if (evxToolsNotNull(ss.Options.Strings.gridMap)) {
				evxShapeAddBackgroundMap(group, "gridMap");
			}
			if (evxToolsNotNull(ss.Options.Strings.FollowablePath)) {
				evxShapeFollowCharacterAdd(group,shape,ss);

				//evxShapeIndexedLineCreateFancyLines(shape, ss, group, true);
			}
		}
    }

    return res;
}

function evxToolsAny(ar,testFunc) {
	for (var ii in ar) {
		var e = ar[ii];
		if (testFunc(e)) {
			return true;
		}
	}
	return false;
}


function evxToolsUrlHasArg(name) {
	return ("" + location.href).includes(name);
}

function evxShapeIndexedLineCreateFancyLines(shape,ns,group=null,curvyCorners=false) {
	var positions = [];
	var nextPoses = [];
	var uvs = [];
	var evxcolors = null;
	var indices = []; // [ 0, 1, 2, 0, 2, 3, ];
	var alongs = null;
	var outIndex = 0;
	var stride = 2;
	var pack = shape.Scope.Packing;
	var srcVerts = shape.PackedUnitVertices;
	var srcIndices = ns.Indices;
	var srcVw = pack.VertexWidth;
	if (evxToolsNotNull( curvyCorners ) && curvyCorners) {
		alongs = [];
	}
	if (evxToolsAny(shape.Scope.Vector,function(ax){return ax.Id == "color_unit"})) {
		evxcolors = [];
	}

	for (var ii = 0; ii < srcIndices.length; ii += stride) {
		var svi0 = srcIndices[ii + 0];
		var svi1 = srcIndices[ii + stride - 1];
		var dvi = (outIndex);
		for (var ri=0; ri<4; ri++) {
			outIndex++;
			positions.push( srcVerts[ ( svi0 * srcVw) + 0 ] );
			positions.push( srcVerts[ ( svi0 * srcVw) + 1 ] ); //+ ((ri%2)*0.1) );
			positions.push( srcVerts[ ( svi0 * srcVw) + 2 ] );
			nextPoses.push( srcVerts[ ( svi1 * srcVw) + 0 ] );
			nextPoses.push( srcVerts[ ( svi1 * srcVw) + 1 ] );
			nextPoses.push( srcVerts[ ( svi1 * srcVw) + 2 ] );
			uvs.push(ri % 2);
			uvs.push((ri >= 2)?1:0);
			if (evxcolors != null) {
				evxcolors.push( srcVerts[ ( svi0 * srcVw) + 3 ] );
			}
			if (ri == 1) {
				var t = svi0; svi0 = svi1; svi1 = t;
			}
		}
		indices.push(dvi + 0);
		indices.push(dvi + 1);
		indices.push(dvi + 2);

		indices.push(dvi + 3);
		indices.push(dvi + 1);
		indices.push(dvi + 2);
	}


	var posData = new THREE.Float32BufferAttribute( positions, 3 );
	var nextPosData = new THREE.Float32BufferAttribute( nextPoses, 3 );
	var uvData = new THREE.Float32BufferAttribute( uvs, 2 );

	var bufferGeo = new THREE.BufferGeometry();
    bufferGeo.addAttribute( 'position', posData );
	bufferGeo.addAttribute( 'nextPos', nextPosData );
	bufferGeo.addAttribute( 'nextUv', uvData );
	if (evxcolors != null) {
		bufferGeo.addAttribute( 'evxcolor', new THREE.Float32BufferAttribute( evxcolors, 1 ) );
	}
    bufferGeo.setIndex( indices );
	bufferGeo.computeBoundingSphere();
	if (isNaN(bufferGeo.boundingSphere.radius)) {
		evxToolsAssert(false);
	}
	bufferGeo.boundingBox = null;
    var geometry = bufferGeo;

	var defColor = new THREE.Color( 0xA9F3B3 );
	var mat = evxShaderMaterialCreateForFancyLines(defColor, evxToolsNotNull(alongs));
	var mesh = new THREE.Mesh( geometry, mat );

	if (evxToolsNotNull(group)) {
		group.add( mesh );
	}
	return mesh;
}

function evxShapeFollowCharacterFindPathPos(shape,ss,z,into) {
	var positions = shape.PackedUnitVertices;
    var vertexWidth = shape.Scope.Packing.VertexWidth;
    var indices = ss.Indices;
    var indicesPerLineSegment = 1 * (ss.Options.Strings.FollowablePath);
    var lc = indicesPerLineSegment; 
    var si = lc-1;
	var zIndex = 2;
	var isForward = true;
	for (var ii=0; ii<indices.length; ii+=lc) {
		var i0 = ((indices[ii+0] * vertexWidth) + zIndex);
		var i1 = ((indices[ii+si] * vertexWidth) + zIndex);
		var z0 = positions[ i0 ];
		var z1 = positions[ i1 ];
		if (z1 < z0) {
			var t = z1; z1 = z0; z0 = t;
		}
		var isMatch = (z >= z0) && (z <= z1);
		var isEdge = isMatch || (((z < z0) && (ii == 0)) || ((z > z1) && (ii+lc >= indices.length)));
		if ((isMatch) || (isEdge)) {
			var zf = 0.0;
			if (z1 > z0) {
				zf = evxToolsClamp01( ((z - z1) / (z0 - z1)) );
			}
			into.z = z;
			into.x = evxToolsLerp( positions[ (indices[ii+0] * vertexWidth) + 0 ], positions[ (indices[ii+si] * vertexWidth) + 0 ], zf );
			into.y = evxToolsLerp( positions[ (indices[ii+0] * vertexWidth) + 1 ], positions[ (indices[ii+si] * vertexWidth) + 1 ], zf );
			if (isMatch) {
				return true;
			} else {
				isForward = (z < z0);
			}
		}
	}
	return isForward;
}

function evxShapeFollowCharacterAdd(group,shape,ss) {
	evxToolsAssert(ss.IndexType == 'Lines');
    var positions = shape.PackedUnitVertices;
    //var vertexCount = shape.Scope.Packing.VertexCount;
    var vertexWidth = shape.Scope.Packing.VertexWidth;

	var posStart = ( ss.Indices[0] * vertexWidth );

	var worldScale = 0.15;
	var initialScale = worldScale * 0.25;

	var sphere = null;
	if (true) {
		sphere = new THREE.Group();
		evx_3dPack_LoadModelGeneric("models/poly_people.json", function (packOfPeople) {
			if (packOfPeople) {
			var person = evx_3dPack_CreateItemInstance( evx_3dPack_FindItem(packOfPeople, 0, 4) );
			//evx_3dPack_SetScale(person, 0.41);
			evx_3dPack_SetMaterialColorFromHex(person, "#eabd07");
			sphere.add(person);
			evxRequestUpdate();
			}
		});
	} else {
		var geometry = new THREE.SphereGeometry( 1.0, 32, 32 );
		var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		sphere = new THREE.Mesh( geometry, material );
	}

	sphere.position.set( positions[posStart+0], positions[posStart+1], positions[posStart+2]);
	sphere.scale.set( initialScale, initialScale, -initialScale ); // -Z to adjust for higher level z flip causing winding order flip
	sphere.rotation.y = Math.PI;
	var followPos = sphere.position.clone();
	var scaleCount = 0;
	var curFwd = true;
	sphere.evxOnScrollChange = function(scrollInput) {
		var zScope = scrollInput.Vector[2].Scope;
		var z = evxToolsLerp (zScope.From, zScope.To, 0.5);
		// do something with this
		var fwd = ( evxShapeFollowCharacterFindPathPos(shape, ss, z, followPos) );
		followPos.z = z;
		sphere.position.copy( followPos );
		if (fwd != curFwd) {
			curFwd = fwd;
			sphere.rotation.y = ((curFwd ? Math.PI : 0));
		}

		if (true) {
			sphere.updateMatrix();
		}

		scaleCount++;
		if (scaleCount < 3) {
			evxObjThreeCorrectLocalScale(sphere, worldScale);
		}
	};
	group.add( sphere );
}

function evxShapeIndexedAddMetaData(mesh, resNdx) {
	mesh.evxTag = resNdx;
    mesh.evxTagShape = resNdx.parent;
    mesh.evxTagIndex = resNdx.objJs;
}

function evxToolsJsWalkChildrenUntil(el, testFunc) {
	if (!evxToolsNotNull(el)) {
		return undefined;
	}
    if (true) // test element
    {
        var t = testFunc(el);
        if (evxToolsNotNull(t)) {
            return t;
        }
    }
    if (evxToolsNotNull(el.Elements)) {
        for (var ci in el.Elements) {
            var c = el.Elements[ci];
            var res = evxToolsJsWalkChildrenUntil(c, testFunc);
            if (evxToolsNotNull(res)) {
                return res;
            }
        }
    }
}

function evxToolsThreeWalkChildrenUntil(el, testFunc) {
    if (true) // test element
    {
        var t = testFunc(el);
        if (evxToolsNotNull(t)) {
            return t;
        }
    }
    if (evxToolsNotNull(el.children)) {
        for (var ci in el.children) {
            var c = el.children[ci];
            var res = evxToolsThreeWalkChildrenUntil(c, testFunc);
            if (evxToolsNotNull(res)) {
                return res;
            }
        }
    }
}

function evxToolsThreeWalkChildrenUntilPerBranch(el, testFunc) {
    if (true) // test element
    {
        var t = testFunc(el);
        if (evxToolsNotNull(t) && t) {
            return t;
        }
    }
    if (evxToolsNotNull(el.children)) {
        for (var ci in el.children) {
            var c = el.children[ci];
            evxToolsThreeWalkChildrenUntilPerBranch(c, testFunc);
        }
    }
}

var __evxUpdateClipPlaneTemp0 = null;
var __evxUpdateClipPlaneTemp1 = null;

function evxToolsThreeUpdateMatricesRecursive(el) {
    evxToolsThreeWalkChildrenUntil(el, function(c) {
        c.updateMatrix();
        if (evxToolsNotNull(c.evxTagEl)) {
            var res = c.evxTagEl;
            if (evxToolsNotNull(res.objThree)) {
                res.objThree.updateMatrix();
            }
            if (evxToolsNotNull(res.clipMatrixSrc)) {
				res.clipMatrixSrc.matrix.getInverse( res.objThree.matrixWorld );
				var planes = res.clipMatrixSrc.planes;
				if (!evxToolsNotNull(__evxUpdateClipPlaneTemp0)) {
					__evxUpdateClipPlaneTemp0 = new THREE.Vector3();
					__evxUpdateClipPlaneTemp1 = new THREE.Vector3();
				}
				var nrml = __evxUpdateClipPlaneTemp0;
				var pnt = __evxUpdateClipPlaneTemp1;
				for (var rii in planes) {
					var pii = ((planes.length==2) ? ((rii*3)+2) : rii);
					var pl = planes[rii];
					nrml.set(0,0,0);
					nrml.setComponent(pii%3, (pii<3)?2.0:-2.0);
					if (pii < 3) {
						pnt.set(0,0,0);
					} else {
						pnt.set(1,1,1);
					}
					nrml.add(pnt);
					pnt.applyMatrix4(res.objThree.matrixWorld);
					nrml.applyMatrix4(res.objThree.matrixWorld);
					nrml.sub(pnt);
					//nrml.multiplyScalar(-1.0);
					pl.setFromNormalAndCoplanarPoint(nrml,pnt);
				}
				if (evxToolsNotNull(res.clipMatrixSrc.onClipUpdate)) {
					res.clipMatrixSrc.onClipUpdate(res);
				}
            }
        }
        return null;
    });

}

/* ------------ ECOVOXEL (EVX) SCROLL HELPER API -------------------- */

function evxElementFindScrollChild(el) {
    return evxToolsJsWalkChildrenUntil(el, function(t) {
        if (evxToolsNotNull(t.InputScope)) {
            return t;
        }
        return null;
    });
}

function evxElementInputScopeUpdate(el) {
    var res = el.evxTagEl;
    var mod = res.objThreeScroll;
    evxObjThreeSetTransformFromScope( mod, el.InputScope );
    evxToolsThreeUpdateMatricesRecursive(res.objThree);
	evxElementInputScopeBroadcastUpdate(el);
}

function evxElementInputScopeBroadcastUpdate(el) {
    var res = el.evxTagEl;
	evxToolsThreeWalkChildrenUntilPerBranch(res.objThree, function(childEl) {
		if ('evxOnScrollChange' in childEl) {
			childEl.evxOnScrollChange(el.InputScope);
		}
		if (('evxTagEl' in childEl) && (childEl != res.objThree)) {
			if ('InputScope' in childEl.evxTagEl) {
				// reached sub-scroll window, stop
				return true;
			}
		}
	});
}

function evxElementInputScopeCopy(elTo,elFrom) {
    if (evxToolsNotNull(elTo.InputScope) && evxToolsNotNull(elFrom.InputScope)) {
        // all good
    } else {
        return;
    }

    var axsTo = null, axsFrom = null;
    for (var ii in elTo.InputScope.Vector) {
        axsTo = elTo.InputScope.Vector[ii];
        axsFrom = elFrom.InputScope.Vector[ii];
        if (axsTo.Id == axsFrom.Id) {
            if (evxToolsNotNull(axsTo.Scope) && evxToolsNotNull(axsFrom.Scope)) {
                break;
            }
        } else {
            evxToolsTODO(); // axes in different orders
            return;
        }
        axsTo = null; axsFrom = null;
    }

    if (evxToolsNotNull(axsTo) && evxToolsNotNull(axsFrom)) {
        if (axsTo.Inputs.length == axsFrom.Inputs.length) {
            for (var ii in axsFrom.Inputs) {
                evxToolsAssert(axsTo.Inputs[ii].Id == axsFrom.Inputs[ii].Id);
                if (axsTo.Inputs[ii].Id == "one") {
                    axsTo.Inputs[ii].Weight = axsFrom.Inputs[ii].Weight;
                }
            }
        } else {
            evxToolsTODO();
        }
        evxElementInputScopeUpdate(elTo);
    }
}

function evxHoloScope1DUpdateTransform(axs) {
    var offset = axs.Inputs[1];
	var scl = axs.Inputs[0];

	var to = axs.Scope.To;
	var fm = axs.Scope.From;
	
	var m = 1.0 / (to - fm);
	var a = -m * fm;
	scl.Weight = m;
	offset.Weight = a;
}

function evxElementApplyInputScroll1D(el,unitDelta) {
    evxToolsAssert(el.InputScope != null);
	var mod = el.evxTagEl.objThreeScroll;
	
    evxToolsAssert( mod );

	var axs = null;
	
    for (var ai in el.InputScope.Vector) {
        var a = el.InputScope.Vector[ai];
        if (evxToolsNotNull(a.Scope)) {
            axs = a;
        }
	}
	var isXYZZoom = evxToolsNotNull( el.InputScope.Vector[0].Scope );

    if (!evxToolsNotNull(el.InputScopeOriginal)) {
        el.InputScopeOriginal = evxToolsCloneObject(el.InputScope);
    }
 
    var zAxis = axs;
    var offset = zAxis.Inputs[1];
	var scl = zAxis.Inputs[0];
	var result = undefined;

	var custom = el.evxTagEl.customScrollCallback;
	if (evxToolsNotNull(custom)) {
		custom(unitDelta);
	} else if (isXYZZoom) {
		if (!evxToolsNotNull(axs.evxScroll)) {
			axs.evxScroll = (axs.Scope.To - axs.Scope.From);
		}
		var su = axs.evxScroll;
		var w = su;
		var w2 = (w * (1 - ( unitDelta * 0.5)));
		var offsetY = 0, offsetXY = 0;
		if (true) {
			w2 = Math.max( 0.5, Math.min(w2, 10.0));
			var offsetXY = Math.max( 0, 1.2 - w2 ) * 0.61;
			var sunit = evxToolsClamp01( evxToolsUnitTo010( 
				evxToolsInvLerp( 0, 0.5, offsetXY )));
			var offsetY = evxToolsLerp( 0, -1.35, sunit );
			result = w2;
		}

		axs.evxScroll = w2;

		for (var ai in el.InputScope.Vector) {
			var ax = el.InputScope.Vector[ai];
			var origAx = el.InputScopeOriginal.Vector[ai];

			if (ax.Id != "z") {
				ax.Scope.From = origAx.Scope.From + offsetXY +
					((ax.Id == 'z') ? offsetY : 0 );
				ax.Scope.To = ax.Scope.From + w2;
			} else {
				ax.Scope.To = origAx.Scope.To + offsetXY
				 + ((ax.Id == 'z') ? offsetY : 0 );
				ax.Scope.From = ax.Scope.To - w2;
			}
			evxHoloScope1DUpdateTransform(ax);
		}
	}
	else
	{
		var w = (axs.Scope.To - axs.Scope.From);
		var d = (w * -unitDelta);

		var mnFrom = -1.9;
		var mxFrom = 1.0;

		var fm = axs.Scope.From + d;
		if (fm < mnFrom) {
			fm = mnFrom;
		}
		if (fm > mxFrom) {
			fm = mxFrom;
		}
		var to = fm + w;
		result = ((fm + to) * 0.5);

		axs.Scope.To = to;
		axs.Scope.From = fm;

		var m = 1.0 / (to - fm);
        var a = -m * fm;
        scl.Weight = m;
		offset.Weight = a;
		//offset.Weight += (scl.Weight * -unitDelta );
	}


	evxElementInputScopeUpdate(el);
	return result;
}

/* ------------ ECOVOXEL (EVX) CAMEREA HELPER API ------------------------ */

function evxWASDCreateAndSetup(control) {

	var targetCanvas = control;
	var _this = { 
		'control':control,
		enabled:true,
		isMouseDown:false,
		keysDown:{}
	};

	_this.innerMouseDown = function() {
		if (!_this.enabled) return;
		event.preventDefault();
		_this.isMouseDown = false;
	};
	_this.innerMouseUp = function() {
		_this.isMouseDown = true;
	}
	_this.innerKeyDown = function() {
		var kc = event.key.toLowerCase();
		_this.keysDown[kc] = true;
	}
	_this.innerKeyUp = function() {
		var kc = event.key.toLowerCase();
		_this.keysDown[kc] = false;
	}
	_this.isKey = function(k) {
		if (k in _this.keysDown) {
			return _this.keysDown[k];
		} else {
			return false;
		}
	}

	var tv = new THREE.Vector3();
	var tv1= new THREE.Vector3();
	_this.updateAndApplyToObjThree = function(cam,dt) {
		_this.camera = cam;
		if (!evxToolsNotNull(dt)) {
			dt = 0.1;
		}
		tv.set(0,0,0);
		if (_this.isKey('w')) {
			tv.z = -1;
		}
		if (_this.isKey('s')) {
			tv.z = 1;
		}
		if (_this.isKey('a')) {
			tv.x = -1;
		}
		if (_this.isKey('d')) {
			tv.x = 1;
		}
		if (tv.lengthSq() == 0) {
			// return if not moving
			return;
		}
		tv.applyMatrix4(cam.matrixWorld);

		// Subtract origin vector:
		tv1.set(0,0,0);
		tv1.applyMatrix4(cam.matrixWorld);
		tv.sub(tv1);

		// Scale:
		tv.multiplyScalar(dt * 1.0);

		tv.add(_this.camera.position);		
		_this.camera.position.copy( tv );
		//_this.camera.lookAt( latestLookAtPos );
	}

	//targetCanvas.addEventListener( 'touchstart', _this.innerTouchStart, false );
	//targetCanvas.parentElement.addEventListener( 'touchmove', _this.innerTouchMove, false );
	//targetCanvas.addEventListener( 'touchend', _this.innerTouchEnd, false );
	//targetCanvas.addEventListener( 'touchcancel', _this.innerTouchCancel, false );
	//targetCanvas.addEventListener( 'mousewheel', _this.innerMouseWheel, false );
	targetCanvas.addEventListener( 'mousedown', _this.innerMouseDown, false );
	targetCanvas.parentElement.addEventListener( 'mousemove', _this.innerMouseMove, false );
	targetCanvas.addEventListener( 'mouseup', _this.innerMouseUp, false );
	document.addEventListener( 'keydown', _this.innerKeyDown, false );
	document.addEventListener( 'keyup', _this.innerKeyUp, false );

	return _this;
}


/* ------------ ECOVOXEL (EVX) TOUCHER HELPER API ------------------------- */

function evxToucherCreate() {
    var ans = {
        raycaster: new THREE.Raycaster(),
        evxToucher: true,
		latestOver: { },
		intersects: [ ],
		cachedIntersects: [],
        latestMetaData: null,
		projX:0,
		projY:0,
		projMinDist: 0.2,
		camera:null,
		projection : evxProjectionCreate(),
    };
	ans.projMinDistSquare = ans.projMinDist * ans.projMinDist;
    ans.raycaster.params.Points.threshold = 0.1;
    return ans;
}

function evxToucherConfigure(toucher, camera, unitX, unitY) {
    evxToolsAssert((toucher.evxToucher == true));
	toucher.projX = unitX; // possibly convert 0~1 to -1~1
	toucher.projY = unitY;
	toucher.camera = camera;
	toucher.raycaster.setFromCamera( {x:unitX, y:unitY }, camera );
	evxProjectionUpdateFromCamera(toucher.projection, camera);
}

function evxToucherPushHit(toucher, objThree, dist, ndx) {
	var hit = null;
	if (toucher.cachedIntersects.length > 0) {
		hit = toucher.cachedIntersects.pop();
	} else {
		hit = { };
	}
	hit.object = objThree;
	hit.vertexIndex = ndx;
	hit.index = ndx;
	hit.distance = dist;
	toucher.intersects.push(hit);
}

var __evxToucherIntersectPointsTempVec0 = null;
var __evxToucherIntersectPointsTempVec1 = null;

var __evxToucherIntersectsComparer = function(a,b) {
	return a.distance - b.distance;
};

function evxToucherIntersectPoints(toucher, shape, ns) {

	if (!evxToolsNotNull(__evxToucherIntersectPointsTempVec0)) {
		__evxToucherIntersectPointsTempVec0 = new THREE.Vector3();
		__evxToucherIntersectPointsTempVec1 = new THREE.Vector3();
	}
	var v0 = __evxToucherIntersectPointsTempVec0;
	var v1 = __evxToucherIntersectPointsTempVec1;

	var pack = shape.Scope.Packing;
	var data = shape.PackedUnitVertices;
	var dx, dy, dp;
	var vi = 0;
	var bestd = 1000000;
	var countTouches = 0;
	for (var ii in ns.Indices) {
		vi = ns.Indices[ii];
		v0.x = data[(vi*pack.VertexWidth) + 0];
		v0.y = data[(vi*pack.VertexWidth) + 1];
		v0.z = data[(vi*pack.VertexWidth) + 2];
		v0.applyMatrix4(shape.evxTag.objThree.matrixWorld);
		//v1.copy(v0);
		//v0.project(toucher.camera); // NOTE: SUPER SLOW!!! TODO: Write a custom camera projection function (from world to unit projection space)
		evxProjectorProjectWorld(toucher.projection, v0);
		dx = v0.x - toucher.projX;
		dy = v0.y - toucher.projY;
		dp = ((dx*dx) + (dy*dy));
		if ((dp < toucher.projMinDistSquare) && (dp < bestd)) {
			bestd = dp;
			evxToucherPushHit(toucher, ns.evxTag.objThree, Math.sqrt(dp), vi);
			countTouches++;
		}
	}
	if (countTouches > 0) {
		toucher.intersects.sort(__evxToucherIntersectsComparer);
	}
}

function __evxToucherInternalRecursiveTouch(toucher, group, metaCallback) {

    var justDoItAll = false;
    if (justDoItAll) {
        toucher.intersects = toucher.raycaster.intersectObjects( group.children, true );
        return toucher.intersects.length;
	}
	
	if (group.visible == false) {
		return;
	}

    var touchCount = 0;
    if (("children" in group) && (group.children.length > 0)) {
        for (var ci in group.children) {
            var c = group.children[ci];
            touchCount += __evxToucherInternalRecursiveTouch(toucher, c, metaCallback);
        }
    } 
	
	{
        if ((evxToolsNotNull(group.evxTagIndex)) && (evxToolsNotNull(group.evxTagIndex.Options))) {
            if ((group.evxTagIndex.IndexType == "Triangles") && (evxToolsNotNull(group.evxTagIndex.Options)) && (evxToolsNotNull(group.evxTagIndex.Options.Strings.MeshCollision))) {
                //toucher.intersects = toucher.raycaster.intersectObjects( [ group ], true, toucher.intersects );
                touchCount += 1;
            }
            if ((group.evxTagIndex.IndexType == "Points") && (evxToolsNotNull(group.evxTagIndex.Options.Strings.pointCollision))) {
				evxToucherIntersectPoints(toucher, group.evxTagShape.objJs, group.evxTagIndex );
                //toucher.intersects = toucher.raycaster.intersectObjects( [ group ], true, toucher.intersects );
                touchCount += 1;
            }
		}
		if (evxToolsNotNull(group.customHitTestToucher)) {
			if (group.customHitTestToucher(toucher)) {
				touchCount += 1;
			}
		}
    }
    return touchCount;
}

function evxToucherUpdateHovered(toucher, isOver) {
	var info = toucher.latestOver;
	var res = info.objThree.evxTag;
	var shape = res.parent.objJs;
	if (!isOver) {
		// unhighlight stuff:
		for (var hci in info.hoverChanged) {
			var hc = info.hoverChanged[hci];
			if (evxToolsHasOption(hc.shapeNdxed,'highlightableSet')) {
				var mat = hc.shapeNdxed.evxTag.objThree.material;
				mat.uniforms.color.value.set( hc.prevColor );
				mat.linewidth = 1.0;
				//mat.needsUpdate = true;
			}
		}
		info.hoverChanged = [];
	} else {
		info.hoverChanged = [];
		for (var sii in shape.IndexSets) {
			var ns = shape.IndexSets[sii];
			if ((ns.IndexType == "Lines") && (evxToolsNotNull(ns.Indices))) {
				if (ns.Indices.includes(info.vertexIndex)) {
					info.hoverChanged.push( { shapeNdxed: ns } );
				}
			}
		}
		for (var hci in info.hoverChanged) {
			var hc = info.hoverChanged[hci];
			if (evxToolsHasOption(hc.shapeNdxed,'highlightableSet')) {
				var mat = hc.shapeNdxed.evxTag.objThree.material;
				hc.prevColor = mat.uniforms.color.value.clone();
				mat.uniforms.color.value = ( new THREE.Color( 0xFFff00 ) );
				mat.linewidth = 3.0; // sadly... ignored on Windows
				//mat.needsUpdate = true;
			}
		}
	}
}

function evxToucherIsOverSomething(toucher) {
	return evxToolsNotNull(toucher.latestOver.objThree);
}

function evxToucherDoTouch(toucher, rootEl, metaCallback) {
	if (!evxToolsNotNull(rootEl)) {
		// TODO:
		return false;
	}
	while (toucher.intersects.length > 0) {
		toucher.cachedIntersects.push( toucher.intersects.pop() );
	}
    toucher.intersects.length = 0;
    var touchCount = __evxToucherInternalRecursiveTouch(toucher, rootEl.objThree, metaCallback);

    var intersects = toucher.intersects;
    var touchInfo = {};
    var fullTouches = 0;
	var currentOver = {}; //toucher.latestOver;
    if (intersects.length > 0) {
        for (var ii in intersects) {
            var hitInfo = intersects[ii];
            if ('customOnTouch' in hitInfo.object) {
                hitInfo.object.customOnTouch(hitInfo, metaCallback);
                fullTouches++;
                break;
            }
            else if (evxThreeHitInfoTryGetMeta(hitInfo, touchInfo)) {
				touchInfo.objThree = hitInfo.object;
                currentOver = touchInfo;
                toucher.latestMetaData = touchInfo.metadata;
                metaCallback(touchInfo.metadata);
                fullTouches++;
                break;
            }
        }
    }

	var didChange = false;
	if ((currentOver.objThree != toucher.latestOver.objThree) || (currentOver.vertexIndex != toucher.latestOver.vertexIndex)) {
		if (evxToolsNotNull( toucher.latestOver.objThree )) {
			evxToucherUpdateHovered(toucher, false);
		}
		toucher.latestOver = currentOver;
		if (evxToolsNotNull( toucher.latestOver.objThree )) {
			evxToucherUpdateHovered(toucher, true);
		}
		didChange = true;
	}

    return didChange; //"" + fullTouches + "/" + intersects.length + "/" + touchCount;
}


/* ------------ ECOVOXEL (EVX) PROJECTION HELPER API ------------------------- */


function evxProjectionCreate() {
	var proj = {
		'camera': null,
		matrixWorldToProj: new THREE.Matrix4(),
	};
	return proj
}

function evxProjectionUpdateFromCamera(proj,camera) {
	proj.camera = camera;
	var matrix = proj.matrixWorldToProj;
	matrix.multiplyMatrices( camera.projectionMatrix, matrix.getInverse( camera.matrixWorld ) );
	//return this.applyMatrix4( matrix );
}

function evxProjectorProjectWorld(proj,wPosToProjPos) {
	//return wPosToProjPos.project(proj.camera);
	wPosToProjPos.applyMatrix4(proj.matrixWorldToProj);
	return wPosToProjPos;
}

/* ------------ ECOVOXEL (EVX) TEXT LABELS API ------------------------- */

var evxTextLabelsMain = null;

function evxTextLabelsEnsureMain(overlayElement = null) {
    if (evxToolsNotNull(evxTextLabelsMain)) {
        return evxTextLabelsMain;
    }
    evxToolsAssert(evxToolsNotNull(overlayElement));
    evxTextLabelsMain = {
        overlayElement : overlayElement,
        labelsInUse : [],
		unusedLabels : [],
		projector : evxProjectionCreate(),
    };
    return evxTextLabelsMain;
}

function evxTextLabelsSetupOverlay(overlayElement) {
    evxTextLabelsEnsureMain(overlayElement);
}

function evxTextLabelsAdd(text = "Label text") {
    var main = evxTextLabelsEnsureMain();
    var label = document.createElement("i");
    label.innerText = text;
    label.style.position = 'absolute';
    label.style.top = '35px';
    label.style.left = '10px';
    label.style.color = 'white';
    label.style.display = 'inline';
	label.style['pointer-events'] = 'none';
    label.inUse = true;
    main.overlayElement.appendChild(label);
    main.labelsInUse.push( label );
    return label;
}

function evxTextLabelsClear() {
    var main = evxTextLabelsMain;
    if (!evxToolsNotNull(main)) {
        return;
    }
    for (var ii in main.labelsInUse) {
        var lbl = main.labelsInUse[ii];
        if (lbl.inUse) {
            lbl.inUse = false;
            lbl.style.display = 'none';
            main.overlayElement.removeChild(lbl);
        }
    }
}

var __evxTextLabelTempVectorWalk = null;
var __evxTextLabelTempVector0 = null;
var __evxTextLabelTempVector1 = null;
function evxTagLabelsUpdateLocation(all, label, objThree, pos ) {

    if (!evxToolsNotNull(__evxTextLabelTempVector0)) {
        __evxTextLabelTempVector0 = new THREE.Vector3();
        __evxTextLabelTempVector1 = new THREE.Vector3();
    }

    __evxTextLabelTempVector0.copy(pos); //(0,0,0);
    __evxTextLabelTempVector0.applyMatrix4( objThree.matrixWorld );
	evxToolsAssert(objThree.evxTagEl);
	var inClip = true;
	if (evxToolsNotNull(objThree.evxTagEl.clipMatrix)) {
		var tv = __evxTextLabelTempVector1;
		tv.copy( __evxTextLabelTempVector0 );
		tv.applyMatrix4(objThree.evxTagEl.clipMatrix.matrix);
		var tf = Math.max( Math.max( Math.abs(tv.x - 0.5), Math.abs(tv.y - 0.5) ), Math.abs(tv.z - 0.5) );
		inClip = (tf <= 0.5);
		if (!inClip) {
			inClip = false;
		}
	} else {
		inClip = true;
	}
    var scPos = evxProjectorProjectWorld(all.projector, __evxTextLabelTempVector0 ); // TODO: probably pretty slow too, optimize!
    var isLeft = (scPos.x >= 0.0);
    if (isLeft) {
        label.style.left = Math.floor( all.scrWidth * (((scPos.x)*0.5)+0.5) ) + "px";
        if (label.style.right != "") { label.style.right = ""; }
        
    } else {
        label.style.right = Math.floor( all.scrWidth - (all.scrWidth * (((scPos.x)*0.5)+0.5) )) + "px";
        if (label.style.left != "") { label.style.left = ""; }
    }
    label.style.top = Math.floor( all.scrHeight * (((scPos.y)*-0.5)+0.5) ) + "px";
	label.style.display = (inClip ? 'inline' : 'none');
}

function evxTextLabelsUpdate(rootThree, camera, scrWidth, scrHeight) {
    var countLabels = 0;

    var allLabels = evxTextLabelsMain;
    if (!evxToolsNotNull(allLabels)) {
        return allLabels;
    }
    allLabels.camera = camera;
    allLabels.scrWidth = scrWidth;
	allLabels.scrHeight = scrHeight;
	evxProjectionUpdateFromCamera(allLabels.projector, camera);

    if (!evxToolsNotNull(__evxTextLabelTempVectorWalk)) {
        __evxTextLabelTempVectorWalk = new THREE.Vector3();
    }

    evxToolsThreeWalkChildrenUntil(rootThree, function(objThree) {
        if (!evxToolsNotNull(objThree.evxTagEl)) {
            return null;
        }
        var el = objThree.evxTagEl.objJs;
        if (evxToolsNotNull(el.Shape)) {

            if (false) {
                // HACKY TEST TO SHOW LABELS:
                if (!evxToolsNotNull(el.HackyLabel)) {
                    el.HackyLabel = evxTextLabelsAdd("EL");
                } 
                __evxTextLabelTempVectorWalk.set(0,0,0);
                evxTagLabelsUpdateLocation( allLabels, el.HackyLabel, objThree, __evxTextLabelTempVectorWalk );
            }


            for (var ci in el.Shape.IndexSets) {
                var ns = el.Shape.IndexSets[ci];
                var vw = el.Shape.Scope.Packing.VertexWidth;
                if ((ns.IndexType == "Points") && (evxToolsNotNull(ns.Strings))) {

					var showPnts = false;
					if (evxToolsNotNull(ns.Options) && evxToolsNotNull(ns.Options.Strings.dataContent)) {
						showPnts = true;
					}
					if (!showPnts) {
						continue;
					}

                    var isMakingLabels = false;
                    var makingDictionary = {};
                    if (!evxToolsNotNull(ns.RuntimeLabels)) {
                        ns.RuntimeLabels = [];
                        isMakingLabels = true;
                    }

                    var maxPerShape = 8;
                    var countInShape = 0;

                    if (evxToolsNotNull(ns.RuntimeLabels)) {
                        for (var bi in (isMakingLabels ? ns.Indices : ns.RuntimeLabels)) {
							var ii = (isMakingLabels ? bi : ns.RuntimeLabels[bi].indexIndex );
                            var label = (isMakingLabels ? null : ns.RuntimeLabels[bi] );
                            if (evxToolsNotNull(label) || isMakingLabels) {
                                var vi = ns.Indices[ii];
                                __evxTextLabelTempVectorWalk.set(0,0,0);
                                __evxTextLabelTempVectorWalk.x = el.Shape.PackedUnitVertices[(vi*vw)+0];
                                __evxTextLabelTempVectorWalk.y = el.Shape.PackedUnitVertices[(vi*vw)+1];
                                __evxTextLabelTempVectorWalk.z = el.Shape.PackedUnitVertices[(vi*vw)+2];
                                if ((label == null) && (isMakingLabels)) {
                                    var hashGridResolutionX = 5;
									var hashGridResolutionY = 5;
                                    var testHash = "_" + Math.floor(hashGridResolutionX* __evxTextLabelTempVectorWalk.x) + "_" + Math.floor(hashGridResolutionY* __evxTextLabelTempVectorWalk.y);
                                    if (!(testHash in makingDictionary) && (countInShape < maxPerShape)) {
                                        countInShape++;
										var text = ns.Strings[ii];
										if (evxToolsNotNull(partnerEnsureInfo) && (text.startsWith("UID"))) {
											text = partnerEnsureInfo(text, true).Name;
										}
										if (evxToolsNotNull(partnerEnsureInfo) && (text.startsWith("users"))) {
											text = partnerEnsureInfo(text, true).Name;
										}
										label = evxTextLabelsAdd( text );
										label.indexIndex = ii;
                                        ns.RuntimeLabels.push( label );
                                        makingDictionary[testHash] = true;
                                    }
                                }
                                if (label != null) {
                                    if (!label.inUse) {
                                        label.inUse = true;
                                        label.style.display = 'inline';
                                        allLabels.overlayElement.appendChild(label);
                                    }
                                    evxTagLabelsUpdateLocation( allLabels, label, objThree, __evxTextLabelTempVectorWalk );
                                }
                            }            
                        }
                    }


                }
            }
        }
        return null;
    });
}

/* ------------ ECOVOXEL (EVX) 3D Pack API ----------------------- */

var __evx_3dModelsActive = null;

function evx_3dPack_LoadModelGeneric(src, sceneCallback) {

	var common = __evx_3dModelsActive;
	if (!evxToolsNotNull(__evx_3dModelsActive)) {
		var manager = new THREE.LoadingManager();
		var loader = new THREE.ObjectLoader(manager);
		common = {
			loader: loader,
			currentSrc: "",
			all:{},
		};
		__evx_3dModelsActive = common;
	}

	// update other models:
	{
		var already = common.all[src];
		common.currentSrc = src;
		for (var ci in common.all) {
			var c = common.all[ci];
			var isMatch = (ci == src);
			if (isMatch) {
				if (c.isLoaded || c.isFailed) {
					sceneCallback(c.result);
				} else {
					c.callbacks.push(sceneCallback);
				}
				return;
			}
		}
	}

	common.currentSrc = src;
	var ctx = { 
		'showing' : true,
		'src' : src,
		callbacks : [ sceneCallback ],
		isLoaded : false,
		isFailed : false,
		result : null,
	};
	common.all[src] = ctx;
	

	common.loader.load(
		// resource URL
		src,
		// called when the resource is loaded
		function ( loadedScene ) {
			ctx.isLoaded = true;
			ctx.result = loadedScene;
			for (var ci in ctx.callbacks) {
				ctx.callbacks[ci]( ctx.result );
			}
		},
		// called when loading is in progresses
		function ( xhr ) {

			//evxToolsLog( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			ctx.isFailed = true;
			evxToolsLog( 'An error occured while loading 3d model' );
			for (var ci in ctx.callbacks) {
				ctx.callbacks[ci]( ctx.result );
			}
		}
	);
}

function evx_3dPack_LoadModelObj(dirPath, modelPath, sceneCallback) {

	var objPath = dirPath + modelPath + ".obj";
	var mtlPath = dirPath + modelPath + ".mtl";

	if (evxToolsNotNull(modelPath) || (modelPath == "")) {
		objPath = dirPath;
		mtlPath = undefined;
	}

	try {

	var loader = new THREE.OBJLoader2();
	loader.logging.enabled = false;

	var loadModel = function() {

		loader.load(
			// resource URL
			objPath, //'models/something.obj',
			// called when resource is loaded
			function ( object ) {
		
				sceneCallback(object.detail.loaderRootNode);
		
			},
			// called when loading is in progresses
			function ( xhr ) {
		
				//console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		
			},
			// called when loading has errors
			function ( error ) {
				console.log( 'Error loading: ' + srcPath );
				sceneCallback(null);
			}
		);

	};


	if (evxToolsNotNull(mtlPath)) {
		var onLoadMtl = function(materials) {
			loader.setMaterials( materials );
			loadModel();
		};
		loader.setPath(dirPath);
		loader.loadMtl( mtlPath, null, onLoadMtl );
	} else {
		loadModel();
	}


	}  catch(ex) {
		console.log("" + ex);
	}
}

function evx_3dPack_SetScale(model,scl) {
	model.scale.set( scl, scl, scl );
}

function evx_3dPack_SetMaterialColorFromHex(model,colorAsHex) {
	model.traverse(function(mesh) {
		if (evxToolsNotNull(mesh.material)) {
			if (evxToolsNotNull(mesh.material.color)) {
				mesh.material.color.copy(new THREE.Color(colorAsHex));
			}
		}
	});
}

function evx_3dPack_FindItem(model,categoryNdx,itemNdx) {
	var found = null;
	model.traverse( function(child) {
		if ('userData' in child) {
			if ('SuccessionCategoryIndex' in child.userData) {
				if (true)
				{
					var ci = child.userData.SuccessionCategoryIndex;
					var ii = child.userData.SuccessionIndex;
					var isMatch = ((ci == categoryNdx) && (ii == itemNdx));
					if (isMatch) {
						found = child;
					}
				}
			}
		}
	});
	return found;
}

function evx_3dPack_CreateItemInstance(item) {
	return item.clone(true);
}

function evx_3dPack_SelectItem(model,item) {
	var found = null;
	model.traverse( function(child) {
		if ('userData' in child) {
			if ('SuccessionCategoryIndex' in child.userData) {
				child.visible = (child == item);
			}
		}
	});
	return found;
}

/* ------------ ECOVOXEL (EVX) SHADER API ------------------------- */

var __evxShaderZeroMatrix = null;
function evxShaderGetClipMatrix() {

    if (__evx_RecursiveCurrentClip != null) {
        return __evx_RecursiveCurrentClip.matrix;
    }

    if (__evxShaderZeroMatrix == null) {
        __evxShaderZeroMatrix = new THREE.Matrix4();
        __evxShaderZeroMatrix.makeScale(0,0,0);
    }

    return __evxShaderZeroMatrix;
}

function evxShaderStateStore() {
	return __evx_RecursiveCurrentClip;
}

function evxShaderStateRestore(clip) {
	__evx_RecursiveCurrentClip = clip;
}

var __evxShaderNoPlanes = [];
function evxShaderGetClipPlanes() {

    if (__evx_RecursiveCurrentClip != null) {
        return __evx_RecursiveCurrentClip.planes;
    }

    return __evxShaderNoPlanes;
}

function evxShaderBasicVertex(prefixes="",middleBits="") {
	return ""
    + "attribute float evxcolor;"
    + "varying vec4 wPos;"
    + "varying float vevxcolor;"
	+ prefixes
	+ "void main() {"
	+ "	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );"
	+ "	wPos = modelMatrix * vec4( position, 1.0 );"
	+ "	gl_Position = projectionMatrix * mvPosition;"
	+ " vevxcolor = mix(0.35,1.0,1.0 - evxcolor);"
	+ middleBits
	+ "}";
};

function evxShaderBasicVertexWithUVs() {
    var pre = "varying vec2 vUv;";
    var during = " vUv = uv;";
    return evxShaderBasicVertex(pre, during);
};

function evxShaderBasicVertexWithUnitColor() {
    return evxShaderBasicVertex("","");

}

function evxShaderBasicVertexForFancyLine() {

	// cameraPosition
	/*
		float3 fwd = wPos - _WorldSpaceCameraPos;
	float dist = length(fwd);
	float scalarPerDist = 0.01f;
	float finalSclar = dist * scalarPerDist * _WeightInPixels;
	float2 unitOffset = (v.uv - float2(0.5,0.5)) * 2.0f * finalSclar;
	float3 left = normalize( cross(fwd, wPosOther - _WorldSpaceCameraPos ) );
	if (dot(left,float3(0,1,0)) > 0) { 
		//left *= -1.0f;
	}
	if (v.uv.x > 0.5) {
		left *= -1.0f;
	}
	wPos = wPosOther + float4( ( left * unitOffset.y ), 0 );
	*/


	var pre = ""
	+ "attribute vec3 nextPos;"
	+ "attribute vec3 nextUv;"
	+ "varying vec2 vUv;"
	;
	var during = ""
	//+ " vUv = uv;"
	+ " vec4 wPosOther = modelMatrix * vec4( nextPos, 1.0 ); "
	+ " vec3 fwd = wPos.xyz - cameraPosition;"
	+ " float finalSclar = 0.04;" // TODO: utilize camera distance and account for screen resolution
	+ " vUv = nextUv.xy;"
	+ " vec2 unitOffset = (nextUv.xy - vec2(0.5,0.5)) * 2.0 * finalSclar;"
	+ " vec3 left = normalize( cross(fwd, (wPosOther.xyz - cameraPosition) ) );"
	+ " if (nextUv.y > 0.5) { left *= -1.0; }"
	+ " vec3 wPosNew = wPos.xyz + (left * unitOffset.x);" //unitOffset.y);"
	+ "	gl_Position = projectionMatrix * ( viewMatrix * vec4( wPosNew, 1 ) );"
	;

    return evxShaderBasicVertex(pre,during);
}


function evxShaderBasicPixel(prefixes,middleBit) {

    var clipFunction = "float testClip(vec4 wpos) {"
    + "vec4 cpos = clipFromWorldMat * vec4(wpos.xyz,1);"
    + "vec4 tpos = abs( (cpos - vec4(0.5,0.5,0.5,0.5)) * 2.0 );"
    + "float md = max( max( tpos.x, tpos.y ), tpos.z );"
    + "if (md > 1.0) {discard;}"
    + "return md; }";

	return ""
    + "uniform vec3 color;"
    + "uniform mat4 clipFromWorldMat;"
	+ "varying vec4 wPos;"
	+ "varying float vevxcolor;"
    + prefixes
    + clipFunction
    + "void main() {"
	+   "testClip(wPos);"
	+   "float finalAlpha = 1.0;"
	+ " gl_FragColor = vec4(color * vevxcolor, finalAlpha );"
	+ middleBit
	+ "	}";
};

function evxShaderPixelLit(prefixes="",middleBit="",final="") {

	var shading = ""
	+ "	vec3 cameraDir = normalize(wPos.xyz - cameraPosition);"
	+ " vec3 norm = normalize( cross( dFdx( wPos.xyz ), dFdy( wPos.xyz ) ) );"
	+ " float NdotC = abs( dot( norm, cameraDir ) );"
	+ " float lightScale = NdotC;"
    + " lightScale = ((1.0*lightScale) + (0.61*(1.0 - lightScale)));"
    + " vec3 baseCol = ( color * vevxcolor );"
	+ middleBit
	+ "		gl_FragColor = vec4( baseCol * lightScale, finalAlpha );"
	;
	return evxShaderBasicPixel( prefixes, shading );
}

function evxShaderPixelLitTexture() {
	var decls = ""
    + "uniform sampler2D map;"
    + "uniform vec4 uvTransform;"
	+ "varying vec2 vUv;"
	var shading = ""
	+ "		vec3 texVal = texture2D( map, ( vUv ) ).rgb;"
	+ " baseCol = texVal;"
	;
	var final = ""
	//+ " gl_FragColor = vec4(texVal.rgb,1); "
	;
	return evxShaderPixelLit(decls, shading,final);
}

function evxShaderFuncXyzToLatLng() {
	return ""
		+ "vec2 xyzToLatLng(vec3 dir) {"
			+ "float pi = 3.14159;"
		
	+ "float lat = acos(dir.y / 1.0) / (pi); "
		+ "float lon = atan(dir.x, dir.y) / (pi*2.0);"
		+ "float y = 1.0 - lat;"
		+ "float _ScaleUpDown = 1.0;"
		+ "float _RotationOffset = 0.0;"
		+ "float _FlipLeftRight = 1.0;"
		+ "float sy = (((y - 0.5) / _ScaleUpDown) + 0.5);"
		+ "return vec2(_FlipLeftRight*(lon + _RotationOffset), sy);"
		//+ " return dir.xy;"
		+ "}"
		;

}

function evxShaderPixelLitReflection() {
	var decls = ""
	+ "uniform sampler2D texture;"
	+ evxShaderFuncXyzToLatLng();
	var shading = ""
	+ "		vec3 reflectDir = reflect( cameraDir, norm );"
	+ "     vec2 latLng = xyzToLatLng( reflectDir );"
	+ "		vec3 texVal = texture2D( texture, latLng ).rgb;"
	+ " baseCol = texVal;"
	;
	var final = ""
	//+ " gl_FragColor = vec4(texVal.rgb,1); "
	;
	return evxShaderPixelLit(decls, shading,final);
}


function evxShaderPixelForFancyLine(before="",during="") {

		//float lineWidthInPixels = _WeightInPixels; //2.0f;
		//float d = max( abs(ddx(u)), abs(ddy(u) ) ) * lineWidthInPixels; // max displacement in one pixel
		//
		//if (((u - d) > 0.0f) || ((u + d) < 0.0f)) {
		//	clip(-1);
		//}
		//float opacity = 1.0f - (abs(u) / (d));

	var pre = ""
	+ "varying vec2 vUv;"
	+ before
	;
	var mid = ""
	+ " float u = (vUv.x) - 0.5;"
	+ " float lineWidthInPixels = 1.0; "
	+ during
	//+ " float t = dFdx( u ); "
	+ " float d = max( abs(dFdx(u)), abs(dFdy(u) ) ) * lineWidthInPixels; "
	+ " float nearness = clamp( (abs(u) / (d)), 0.0, 1.0 ); "
	//+ " float lineOpacity = 1.0 - (nearness * nearness); "
	+ " float lineOpacity = 1.0 - pow(nearness, 1.61); "
	+ "if (lineOpacity <= 0.0) {discard;} "
	+ "gl_FragColor = vec4(color * vevxcolor, lineOpacity ); "
	//+ "gl_FragColor = vec4(lineOpacity,lineOpacity,lineOpacity, 1.0 ); "
	;
	return evxShaderBasicPixel(pre,mid);
}

function evxShaderPixelForFancyAntsLine() {
	var pre = ""
	+ "uniform float antsTime; "
	;
	var during = ""
		+ " float along = (vUv.y); "
		+ " float wave = ( sin( ( along * 3.14159 * 4.0) + antsTime ) * 0.5) + 0.5;"
		//+ " gl_FragColor = vec4( 0, wave, 0, 1 ); return; "
		//+ " lineOpacity = min( wave, lineOpacity ); "
		+ " lineWidthInPixels = mix(1.0, 3.0, wave); "
	;
	return evxShaderPixelForFancyLine(pre, during);
}

function evxShaderPixelUnlit() {
	var shading = "";
	return evxShaderBasicPixel( "", shading );
}

function evxShaderPixelUnlitMonoTexture() {
	var decls = ""
    + "uniform sampler2D map;"
    //+ "uniform vec4 uvTransform;"
	+ "varying vec2 vUv;";
	var shading = ""
	+ "		float baseVal = texture2D( map, vUv ).b;"
    //+ "		float scld = pow(abs(1.0 - (baseVal)),0.25);"
    + "		float scld = (1.0-pow(baseVal,2.0));"
    + "     scld = ((scld * 0.8) + 0.2);"
	+ "		gl_FragColor = vec4( color.rgb,  scld );"
	//+ "		gl_FragColor = vec4( color,  1 );"
	;
	return evxShaderBasicPixel( decls, shading );
}

function evxShaderMaterialCreateForLitTriangles(defColor) {
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			//amplitude: { value: 1.0 },
            color:     { value: ( defColor ) },
            clipFromWorldMat : { value: evxShaderGetClipMatrix() },
			//texture:   { value: new THREE.TextureLoader().load( "textures/sprites/spark1.png" ) }
		},
		vertexShader:   evxShaderBasicVertexWithUnitColor(),
		fragmentShader: evxShaderPixelLit(),
		//blending:       THREE.AdditiveBlending,
		depthTest:      true,
		transparent:    false,
		
	});
	material.extensions.derivatives = true;
	return material;
}

function evxShaderMaterialCreateForLitTrianglesTransparent(defColor) {
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			//amplitude: { value: 1.0 },
            color:     { value: ( defColor ) },
            clipFromWorldMat : { value: evxShaderGetClipMatrix() },
			//texture:   { value: new THREE.TextureLoader().load( "textures/sprites/spark1.png" ) }
		},
		vertexShader:   evxShaderBasicVertexWithUnitColor(),
		fragmentShader: evxShaderPixelLit("","finalAlpha = pow(1.0-NdotC,2.0);",""),
		blending:       THREE.NormalBlending,
		depthTest:      true,
		depthWrite:		false,
		transparent:    true,
		
	});
	material.extensions.derivatives = true;
	return material;
}

function evxShaderMaterialCreateForLitReflectiveTriangles(defColor) {
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			//amplitude: { value: 1.0 },
            color:     { value: ( defColor ) },
            clipFromWorldMat : { value: evxShaderGetClipMatrix() },
			texture:   { value: new THREE.TextureLoader().load( "sunset_360.jpg" ) }
		},
		vertexShader:   evxShaderBasicVertexWithUnitColor(),
		fragmentShader: evxShaderPixelLitReflection(),
		//blending:       THREE.AdditiveBlending,
		depthTest:      true,
		transparent:    false,
		
	});
	material.extensions.derivatives = true;
	return material;
}

function evxShaderMaterialCreateForLitTexturePath(defColor,texturePath) {
	var texture = evxObjThreeCreateTexture(texturePath, function(error) { 
		evxToolsLog("Texture load failed for '" + texturePath + "'" );
	});
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			//amplitude: { value: 1.0 },
            color:     { value: ( defColor ) },
			map:   { value: texture },
            clipFromWorldMat : { value: evxShaderGetClipMatrix() },
			//texture:   { value: new THREE.TextureLoader().load( "textures/sprites/spark1.png" ) }
		},
		vertexShader:   evxShaderBasicVertexWithUVs(),
		fragmentShader: evxShaderPixelLitTexture(),
		//blending:       THREE.AdditiveBlending,
		depthTest:      true,
		transparent:    false,
		side: THREE.DoubleSide, // TEMP HACK, to fix ground plane
	});
	material.extensions.derivatives = true;
	return material;
}

function evxShaderMaterialPoints(defColor) {
	var material = new THREE.ShaderMaterial( {
		uniforms: {
            color:     { value: ( defColor ) },
            clipFromWorldMat : { value: evxShaderGetClipMatrix() },
		},
		vertexShader:   evxShaderBasicVertex("", "gl_PointSize = 100;"),
		fragmentShader: evxShaderPixelUnlit(),
		depthTest:      true,
        transparent:    false,
	});
	//material.extensions.derivatives = true;
	return material;
}

var __evxGlobalAntsTime = { value : 0 };

function evxShaderMaterialCreateForFancyLines(defColor,isAnts=false) {
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			//amplitude: { value: 1.0 },
            color:     { value: ( defColor ) },
            wireframe: true,
            wireframeLinewidth: 1,
			antsTime: __evxGlobalAntsTime,
            linewidth: 1,
            clipFromWorldMat : { value: evxShaderGetClipMatrix() },
		},
		vertexShader:   evxShaderBasicVertexForFancyLine(),
		fragmentShader: ( isAnts ? evxShaderPixelForFancyAntsLine() : evxShaderPixelForFancyLine()),
		blending:       THREE.NormalBlending,
		depthTest:      true,
		depthWrite:		false,
		transparent:    true	,
		side: THREE.DoubleSide,
	});
	material.extensions.derivatives = true;
	return material;
}

function evxShaderMaterialCreateForLines(defColor) {
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			//amplitude: { value: 1.0 },
            color:     { value: ( defColor ) },
            wireframe: true,
            wireframeLinewidth: 1,
            linewidth: 1,
            clipFromWorldMat : { value: evxShaderGetClipMatrix() },
			//texture:   { value: new THREE.TextureLoader().load( "textures/sprites/spark1.png" ) }
		},
		vertexShader:   evxShaderBasicVertex(),
		fragmentShader: evxShaderPixelUnlit(),
		//blending:       THREE.AdditiveBlending,
		depthTest:      true,
		transparent:    false,
	});
	//material.extensions.derivatives = true;
	return material;
}

function evxShaderMaterialCreateForUnlitMonoTexture(defColor,txLoader,uvTransform) {
	var material = new THREE.ShaderMaterial( {
		uniforms: {
			//amplitude: { value: 1.0 },
			color:     { value: ( defColor ) },
            map:   { value: txLoader },
            uvTransform: { value: uvTransform },
			side:		THREE.DoubleSide,
		},
		vertexShader:   evxShaderBasicVertexWithUVs(),
		fragmentShader: evxShaderPixelUnlitMonoTexture(),
		blending:       THREE.NormalBlending,
		depthTest:      true,
		transparent:    true,
	});
	material.extensions.derivatives = true;
	return material;
}




