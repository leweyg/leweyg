
/* Copyright (C) Lewcid Systems LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Lewey Geselowitz <LeweyGeselowitz@gmail.com>, March 2018
 */

var evn3d_root = null;

var evnCameraSetting_ZPos = 10;
var evnCameraSetting_FOV = 25;
var evnCameraSetting_MotionScale = 3.2;
var evnCameraDynamic = true;

function evn3d_init(targetCanvas) {
	evn3d_root = evn3d_initcore(targetCanvas);
	evn3d_root.init();
	evn3d_root.animate();

	//evn3d_addGridCubes();

	return evn3d_root;
}

function evn3d_addGridCubes() {

	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshNormalMaterial();
	var mat = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
	group = new THREE.Group();

	var gridSize = 3;
	for ( var i = 0; i < gridSize*gridSize; i ++ ) {
		//var mat = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
		var mesh = new THREE.Mesh( geometry, mat );
		var sz = 7;
		mesh.position.x = (((i % gridSize) / (gridSize-1)) - 0.5) * sz;
		mesh.position.y = ((((Math.floor(i / gridSize)) / (gridSize-1))) - 0.5) * sz;
		mesh.position.z = 0.0; //Math.random() * 10 - 5;
		mesh.rotation.x = 0; //Math.random() * 2 * Math.PI;
		mesh.rotation.y = 0; //Math.random() * 2 * Math.PI;
		var scl = 0.8;
		mesh.scale.x = scl;
		mesh.scale.y = scl;
		mesh.scale.z = scl;
		
		//mesh.matrixAutoUpdate = false;
		mesh.updateMatrix();
		group.add( mesh );

		mesh.customOnTouch = function() {
			mat.color = new THREE.Color( Math.random() * 0xffffff );
		};

	}

	evn3d_root.scene.add( group );
	evn3d_root.requestUpdate();
}

function evn_outputString(str) {
	alert("" + str);
}

var __evn_latestMetaData = null;
function evn_updateMetaData(metaDataString) {
	// nothing yet;
}

function evn_updateAllMetaData(metaDataArray,ns,shape) {
	// nothing yet;
}

function __evnNoCallback() { return undefined; }
function evnPageCallback(name,args) {
	if (!evxToolsNotNull(__evn_currentJsRoot)) {
		return __evnNoCallback;
	}
	if (name in __evn_currentJsRoot) {
		return __evn_currentJsRoot[name];
	}
	return __evnNoCallback;
}

var evnIsAnimating = false;

function evn3d_initcore(targetCanvas) {

	if (evxToolsIsWebGLSupported(targetCanvas)) {
		// let's do this:
		main_compat_results.innerHTML = "";
	} else {
		main_compat_results.innerHTML = "Your browser + graphics-card combination doesn't seem to support WebGL based 3d graphics. <br/><br/>For Mac's try using Safari, for Windows try using Edge or Chrome."
	}

			var container;

			var camera, scene, renderer;
			var _this = this;

			this.toucher = evxToucherCreate();
			this.isRequestInQueue = false;

			this.requestUpdate = function() {
				if (!this.isRequestInQueue) {
					this.isRequestInQueue = true;
					//requestAnimationFrame( animate ); 
					setTimeout( animate, 0 );
				}
			};

			evxRequestUpdate = function() { this.requestUpdate(); };

			this.userRequestedUpdate = function() {
				_this.requestUpdate();
			};

			var tempMousePos = new THREE.Vector2();
			var startMousePos = new THREE.Vector2();
			this.getMouseOnScreen = function ( pageX, pageY ) {
		
					tempMousePos.set(
						( pageX - targetCanvas.left ) / targetCanvas.width,
						( pageY - targetCanvas.top ) / targetCanvas.height
					);
		
					return tempMousePos;
		
				};

				this.isEventRightClick = function(e) {
					var isRightMB = false;
					e = e || window.event;

					if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
						isRightMB = e.which == 3; 
					else if ("button" in e)  // IE, Opera 
						isRightMB = e.button == 2; 

					return isRightMB;
				};

				var enableMouseMotion = true;
				var enableDragCamera = true;
				var dragDistanceTravelled = 0;

			this.innerMouseUp = function() {
				event.preventDefault();
				enableDragCamera = true;
				if (isEventRightClick()) {
					enableMouseMotion = !enableMouseMotion;
				} 
				_this.innerCursorUpdate( event, false, true );
			};

			this.innerMouseOut = function() {
				event.preventDefault();
				enableDragCamera = true;
				if (isEventRightClick()) {
					enableMouseMotion = !enableMouseMotion;
				} 
				_this.innerCursorUpdate( event, false, false, true );
			};

			this.innerMouseDown = function() {
				event.preventDefault();
				dragDistanceTravelled = 0;
				if (isEventRightClick()) {
				} else {
					_this.innerCursorUpdate( event, true, false );
				}
			};


			this.innerMouseMove = function() {
				_this.innerCursorUpdate( event, false, false );
			
			};

			this.innerTouchStart = function() {
				event.preventDefault();
				dragDistanceTravelled = 0;
				var me = event.touches[0];
				innerCursorUpdate(me, true, false );
			};

			this.innerTouchMove = function() {
				event.preventDefault();
				var me = event.touches[0];
				innerCursorUpdate(me, false, false );
			};

			this.innerTouchEnd = function() {
				event.preventDefault();
				var me = event.changedTouches[0];
				innerCursorUpdate(me, false, true );
			};
			this.innerTouchCancel = function() {
				event.preventDefault();
				var me = event.changedTouches[0];
				innerCursorUpdate(me, false, false, true );
			};

			this.innerGestureChange = function() {
				if (event.scale != 1.0) {
					event.preventDefault();
					innerScroll1d( (0.25 * event.scale) - 1.0 );
					return false;
				}
			};


			var hackyScrollUpdate = function(el, scrollPos) {
				var validRanges = [
					{from:0.4, name:"LifeBasic"},
					{from:0.64, name:"LifeAgriculture"},
					{from:1.2, name:"LifePlants"},
					{from:1.55, name:"Land"},
				];
				var name = validRanges[0].name;
				for (var ii in validRanges) {
					if (validRanges[ii].from < scrollPos) {
						name = validRanges[ii].name;
					}
				}
				var isShow = (el.Options.Strings.HackyVizTest == name);
				var wasShow = el.evxTagEl.objThree.visible;
				el.evxTagEl.objThree.visible = isShow;
				if (isShow && (!wasShow)) {
					
					evxElementFindFirstMetaData(el, evn_updateMetaData, evn_updateAllMetaData);
				}
				//evn_outputString(scrollPos + " " + name);
			};

			this.innerScroll1d = function(delta) {
				var scrollItem = evxElementFindScrollChild(__evn_currentJsRoot);
				if (evxToolsNotNull(scrollItem)) {
					var res = evxElementApplyInputScroll1D(scrollItem, delta );
					evxToolsJsWalkChildrenUntil(__evn_currentJsRoot, function(el) {
						if (evxToolsNotNull(el.Options)) {
							if (evxToolsNotNull(el.Options.Strings.HackyVizTest)) {
								//alert("Found it!");
								//evn_outputString(res);
								hackyScrollUpdate(el, res);
								return undefined; // let it continue...
								//return el.Options.Strings.HackyVizTest;
							}
						}
						return undefined;
					});
					requestUpdate();
				}
			}

			this.innerScroll2d = function(dx,dy) {
				var scrollItem = evxElementFindScrollChild(__evn_currentJsRoot);
				if (evxToolsNotNull(scrollItem)) {
					innerScroll1d(((-dx) + dy) * -0.61);
				}
			}

			this.innerMouseWheel = function() {
				event.preventDefault();

				innerScroll1d(0.0005 * event.wheelDeltaY);

				return false;
			};

			this.latest_mouse = {x:0, y:0};
			var tempHitArray  = [];
			var cameraIsReset = true;
			var isDownOnSameObj = false;
			var isCursorDragging = false;

			this.innerCursorUpdate = function (eventSrc,isDown=false,isUp=false,isCancel=false) {

				var isTouch = !("button" in eventSrc);
				//_this.latest_mouse = getMouseOnScreen
				//evn_outputString('x=' + eventSrc.clientX + " y=" + eventSrc.clientY);
				var rect = targetCanvas.getBoundingClientRect();
				var curX =  (((( eventSrc.clientX - rect.left ) / rect.width ) * 2 ) - 1.0);
				var curY = -((((( eventSrc.clientY - rect.top )  / rect.height ) * 2 ) - 1.0));
				var deltaX = (curX - _this.latest_mouse.x);
				var deltaY = (curY -  _this.latest_mouse.y);
				_this.latest_mouse.x = curX;
				_this.latest_mouse.y = curY;
				if (isDown) {
					dragDistanceTravelled = 0;
					startMousePos.set(_this.latest_mouse.x, _this.latest_mouse.y);
					isCursorDragging = (true && !isTouch);
				} else {
					dragDistanceTravelled += Math.sqrt( Math.pow(tempMousePos.x - _this.latest_mouse.x,2) + Math.pow(tempMousePos.y - _this.latest_mouse.y,2) );
				}
				if (isUp || isCancel) {
					isCursorDragging = false;
				}
				tempMousePos.set(_this.latest_mouse.x, _this.latest_mouse.y);
				//_this.latest_mouse = getMouseOnScreen(eventSrc.pageX, eventSrc.pageY);
				//evn_outputString('result x=' + _this.latest_mouse.x + " y=" + _this.latest_mouse.y);

				var isAssumeTouchMachineIsFast = true;
				var isUpdateRaycast = (isAssumeTouchMachineIsFast || (!isTouch) || (isTapSoFar) || (isDown || isUp));
				var isTapSoFar = (dragDistanceTravelled < 0.1);
				var isUpdateCameraThisFrame = (enableMouseMotion || isTouch) && (!isDown) && (!isUp) && (!isTapSoFar);
				if (isUpdateRaycast) {
					evxToucherConfigure(_this.toucher, _this.camera, tempMousePos.x, tempMousePos.y );

					var didChange = evxToucherDoTouch(_this.toucher, __evn_currentMain, evn_updateMetaData );
					if (isDown) {
						isDownOnSameObj = !didChange;
					}
					__evn_latestMetaData = _this.toucher.latestMetaData;
				}
				if (isDown) {
					enableDragCamera = !evxToucherIsOverSomething(_this.toucher);
				}
				isUpdateCameraThisFrame = isUpdateCameraThisFrame && enableDragCamera && (!isCursorDragging);

				if ((!enableDragCamera) && (!(isUp || isDown)) && (!isTapSoFar)) {
					// then drag/scroll the items
					innerScroll2d(deltaX,deltaY);
				}

				var cameraOffsetScale = 1.0;
				if (isUp && isTapSoFar && isTouch) {
					// touch controls:
					if (!evxToucherIsOverSomething(_this.toucher)) {
						//cameraOffsetScale = 0; // i.e. reset the camera
						//isUpdateCameraThisFrame = true;
						if (true) { //cameraIsReset) {
							//evn_NextSlide(); // if already reset, then do next slide
						}
						evnPageCallback('customClickCallback')(false, isTouch);
					} else if (isDownOnSameObj) {
						evnPageCallback('customClickCallback')(true, isTouch);
						evn_ClickedOnSpecificItem();
					}
				}

				if (isUp && (!isTouch) && (isTapSoFar) && (!isEventRightClick())) {
					// mouse click:
					if (evxToucherIsOverSomething(_this.toucher)) {
						evnPageCallback('customClickCallback')(true, isTouch);
						evn_ClickedOnSpecificItem(); // TODO: alternate 0 and 1
					} else {
						//evn_NextSlide();
						evnPageCallback('customClickCallback')(false, isTouch);
					}
				}

				if ((isCursorDragging) && (!isTapSoFar) && (!isDown) && (!isUp) && (!isCancel)) {
					var cb = evnPageCallback('customDragCallback');
					if (evxToolsNotNull(cb)) {
						cb(deltaX, deltaY);
					}
				}

				if (isUpdateCameraThisFrame) {
					cameraIsReset = (cameraOffsetScale == 0.0);
					_this.innerMoveCamera( 
						_this.latest_mouse.x * cameraOffsetScale,
						_this.latest_mouse.y * cameraOffsetScale, cameraIsReset );
				}
				// send the command to update the screen:
				_this.requestUpdate();
			}

			var latestCameraPos = null;
			var latestCameraGoal = null;
			var latestLookAtPos = null;
			var latestLookAtGoal = null;
			var lookAtOriginal = null;
			var wasdCamera = null;
			this.innerMoveCamera = function(mouseX, mouseY,isSnap=false) {

				var isAdjust = true;
				if (evnPageCallback('customCameraCallback')(_this.camera, scene, mouseX, mouseY, isSnap)) {
					return;
				}

				var extraXScale = 2.2;
				var aroundCosX = Math.cos( mouseX * Math.PI * 0.61 );
				if (!(evnCameraDynamic)) {
					aroundCosX = 1;
					extraXScale = 1;
				}
				var worldX = ( - mouseX - 0 ) * evnCameraSetting_MotionScale * extraXScale;
				var worldY = ( - mouseY - 0 ) * evnCameraSetting_MotionScale;

				if (latestCameraPos == null) {
					latestCameraPos = _this.camera.position.clone();
					latestCameraGoal = _this.camera.position.clone();
					latestLookAtPos = scene.position.clone();
					latestLookAtGoal = scene.position.clone();
					lookAtOriginal = scene.position.clone();
				}


				latestCameraGoal.x = worldX * (1 + ((1 - aroundCosX) * 0.61));
				latestCameraGoal.y = worldY;
				latestCameraGoal.z = evnCameraSetting_ZPos * aroundCosX;
				latestLookAtGoal.copy( lookAtOriginal );
				latestLookAtGoal.z += (-2.0) * (1.0 - aroundCosX);
				var dist = latestCameraPos.distanceTo(latestCameraGoal);
				if (dist < 0.05) {
					latestCameraPos.copy( latestCameraGoal );
					latestLookAtPos.copy( latestLookAtGoal );
				} else {
					latestCameraPos = latestCameraPos.lerp( latestCameraGoal, 0.061 );
					latestLookAtPos = latestLookAtPos.lerp( latestLookAtGoal, 0.061 );
				}
				if (isSnap) {
					latestCameraPos.copy( latestCameraGoal );
					latestLookAtPos.copy( latestLookAtGoal );
				}

				if (wasdCamera && wasdCamera.enabled) {
					wasdCamera.updateAndApplyToObjThree( _this.camera );
				} else {
					_this.camera.position.copy( latestCameraPos );
					_this.camera.lookAt( latestLookAtPos );
				}
			};

			this.init = function() {


				renderer = new THREE.WebGLRenderer( { canvas:targetCanvas });
				//renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize(targetCanvas.width, targetCanvas.height);
				//renderer.setSize( window.innerWidth, window.innerHeight );
				//document.body.appendChild( renderer.domElement );
				renderer.localClippingEnabled  = true;

				// TEMP: disable shader logging, due to Mac issue:
				renderer.context.getShaderInfoLog = function () { return '' };

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x556655 );

				camera = new THREE.PerspectiveCamera( evnCameraSetting_FOV, targetCanvas.width / targetCanvas.height, 1, 1000 );
				camera.position.set( 0, 0, evnCameraSetting_ZPos );

				this.camera = camera;

				scene.add( new THREE.AmbientLight( 0xccCCcc ) );
				_this.scene = scene;

				var light = new THREE.PointLight( 0x333333 );
				light.position.copy( camera.position );
				scene.add( light );

				targetCanvas.addEventListener( 'touchstart', _this.innerTouchStart, false );
				targetCanvas.parentElement.addEventListener( 'touchmove', _this.innerTouchMove, false );
				targetCanvas.addEventListener( 'touchend', _this.innerTouchEnd, false );
				targetCanvas.addEventListener( 'touchcancel', _this.innerTouchCancel, false );
				targetCanvas.addEventListener( 'gesturechange', _this.innerGestureChange, false );

				targetCanvas.addEventListener( 'mousewheel', _this.innerMouseWheel, false );
				targetCanvas.addEventListener( 'mousedown', _this.innerMouseDown, false );
				targetCanvas.addEventListener( 'mouseout', _this.innerMouseOut, false );
				targetCanvas.parentElement.addEventListener( 'mousemove', _this.innerMouseMove, false );
				targetCanvas.addEventListener( 'mouseup', _this.innerMouseUp, false );
			
				wasdCamera = evxWASDCreateAndSetup(targetCanvas);
				wasdCamera.enabled = false;
			};

			
			this.onRenderUpdated = function() {};

			this.animate = function() {

				try {
				//this.isRequestInQueue = false;

					renderer.setSize(targetCanvas.width, targetCanvas.height);

					__evxGlobalAntsTime.value += 0.1;

					//requestAnimationFrame( animate );

			

					renderer.render( scene, camera );

					evxTextLabelsUpdate( scene, camera, targetCanvas.width, targetCanvas.height );

					if (onRenderUpdated in _this) {
						_this.onRenderUpdated();
					}
				} catch(ex) {
					this.isRequestInQueue = false;
					throw ex;
				}
				this.isRequestInQueue = false;

				if (evxToolsNotNull(__evn_CallOnceAfterRender)) {
					var cb = __evn_CallOnceAfterRender;
					__evn_CallOnceAfterRender = undefined;
					cb();
				}
			};

			return this;

}

function evn_ExampleElement() {
	// Example model, this is a "corners" model of a cube with little lines at each corner:
	return {'Name':'LayEl',
		'OutputScope':{'Vector':[
			{'Id':'x','Inputs':[{'Id':'one','Weight':0.190983},{'Id':'x','Weight':0.618034}],'Weight':1},
			{'Id':'y','Inputs':[{'Id':'one','Weight':0.2527864},{'Id':'y','Weight':0.4944272}],'Weight':1},
			{'Id':'z','Inputs':[{'Id':'one','Weight':0.190983},{'Id':'z','Weight':0.618034}],'Weight':1}]},
		'Shape':{
			'Scope':{'Vector':[{'Id':'x','Weight':1},{'Id':'y','Weight':1},{'Id':'z','Weight':1},
				{'Id':'i','IsPacking':true,'Resolution':{'Count':32},'Weight':1}],
			'Packing':{'VertexWidth':3,'VertexCount':32,'FrameCount':1}},
			'PackedUnitVertices':[0,0,0,1,0,0,0,1,0,1,1,0,0,0,1,1,0,1,0,1,1,1,1,1,0.07294901,0,0,0.927051,0,0,0.07294901,1,0,0.927051,1,0,0.07294901,0,1,0.927051,0,1,0.07294901,1,1,0.927051,1,1,0,0.07294901,0,1,0.07294901,0,0,0.927051,0,1,0.927051,0,0,0.07294901,1,1,0.07294901,1,0,0.927051,1,1,0.927051,1,0,0,0.07294901,1,0,0.07294901,0,1,0.07294901,1,1,0.07294901,0,0,0.927051,1,0,0.927051,0,1,0.927051,1,1,0.927051],
			'IndexSets':[
				{'IndexType':'Lines','IndexWidth':2,'Weight':1,
					'Indices':[0,8,0,16,0,24,1,9,1,17,1,25,2,10,2,18,2,26,3,11,3,19,3,27,4,12,4,20,4,28,5,13,5,21,5,29,6,14,6,22,6,30,7,15,7,23,7,31]
				}
			]
		},
		'Version':2};
}

function evn_SetupShapeTest() {

	var exData = evn_ExampleElement();
	var positions = exData.Shape.PackedUnitVertices;
	var colors = positions; // COPY for now
	var defaultIndex = 0;
	var indices = exData.Shape.IndexSets[defaultIndex].Indices;

	var vertexWidth = exData.Shape.Packing.VertexWidth;

	var bufferGeo = new THREE.BufferGeometry();
	if (true) {
		evxToolsTODO(); // OOPS! might be broken, test first
		bufferGeo.addAttribute( 'position', new THREE.Float32BufferAttribute( interleaved, 3 ));
		bufferGeo.addAttribute( 'color', new THREE.Float32BufferAttribute( interleaved, 3 ));	

	}
	bufferGeo.setIndex( indices );
	bufferGeo.computeBoundingSphere();

	var geometry = bufferGeo;

	//var mat = new THREE.MeshLambertMaterial( { color: Math.random() * 0xccffcc } );
	var mat = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 1, linewidth: 3, vertexColors: THREE.VertexColors } );
	//var mat = new THREE.PointsMaterial( { size: 35, sizeAttenuation: false, map: sprite, alphaTest: 0.5, transparent: true } );
	//var mat = new THREE.PointsMaterial( { size: 35, sizeAttenuation: false, alphaTest: 0.5, transparent: true } );
	group = new THREE.Group();

	var gridSize = 3;
	{
		//var mesh = new THREE.Mesh( geometry, mat );
		var mesh = new THREE.LineSegments( geometry, mat );
		//var mesh = new THREE.Points( geometry, mat );

		var sz = 7;
		mesh.position.x = 0; //(((i % gridSize) / (gridSize-1)) - 0.5) * sz;
		mesh.position.y = 0; //((((Math.floor(i / gridSize)) / (gridSize-1))) - 0.5) * sz;
		mesh.position.z = 0.0; //Math.random() * 10 - 5;
		mesh.rotation.x = 0; //Math.random() * 2 * Math.PI;
		mesh.rotation.y = 0; //Math.random() * 2 * Math.PI;
		var scl = 1.6;
		mesh.scale.x = scl;
		mesh.scale.y = scl;
		mesh.scale.z = scl;
		
		//mesh.matrixAutoUpdate = false;
		mesh.updateMatrix();
		group.add( mesh );


	}

	evn3d_root.scene.add( group );
	evn3d_root.requestUpdate();
}

function evn_ExampleElementWithTextLinesPoints() {
	return {'Name':'LayEl[summaryGraph]','OutputScope':{'Vector':[{'Id':'x','Inputs':[{'Id':'one','Weight':0.6842861},{'Id':'x','Weight':0.241184}],'Weight':1},{'Id':'y','Inputs':[{'Id':'one','Weight':0.147993},{'Id':'y','Weight':0.2557382}],'Weight':1},{'Id':'z','Inputs':[{'Id':'one','Weight':0.190983},{'Id':'z','Weight':0.618034}],'Weight':1}]},
	'Shape':{'Scope':{'Vector':[{'Id':'x','Weight':1},{'Id':'y','Weight':1},{'Id':'z','Weight':1},{'Id':'i','IsPacking':true,'Resolution':{'Count':34},'Weight':1}],'Packing':{'VertexWidth':3,'VertexCount':34,'FrameCount':1}},
		'PackedUnitVertices':[0.5,0.6418787,0.5,0.5525782,0.632008,0.5,0.5980553,0.6037291,0.5,0.7605792,0.6260156,0.5,0.7898551,0.5226808,0.5,0.6399922,0.4557048,0.5,0.6451877,0.3855963,0.5,0.5766214,0.3714288,0.5,0.5468028,0.2442613,0.5,0.4264527,0.1005782,0.5,0.4233786,0.3714288,0.5,0.2096246,0.275486,0.5,0.3600078,0.4557049,0.5,0.3550724,0.5091938,0.5,0.3697104,0.5608612,0.5,0.4019446,0.6037291,0.5,0.4079882,0.734234,0.5,0.5,1,0.5,0.6813946,0.9659462,0.5,0.8382909,0.8683839,0.5,0.9494991,0.7204896,0.5,1,0.542237,0.5,0.9829731,0.3577003,0.5,0.900718,0.1918021,0.5,0.7643437,0.06694792,0.5,0.5922683,0,0.5,0.4077316,3.267198E-08,0.5,0.2356562,0.06694799,0.5,0.09928194,0.1918022,0.5,0.01702688,0.3577003,0.5,0,0.542237,0.5,0.05050088,0.7204896,0.5,0.1617091,0.8683839,0.5,0.3186054,0.9659462,0.5],
		'IndexSets':[
			{'IndexType':'Points','IndexWidth':1,'Weight':1,'Options':{'Strings':{'pointCollision':'True'}},'Strings':['8','8','8','4','4','8','7','8','5','1','8','2','8','8','8','8','5','EmployeeID','LastName','FirstName','Title','TitleOfCourtesy','BirthDate','HireDate','Address','City','Region','PostalCode','Country','HomePhone','Extension','Photo','Notes','PhotoPath']},
			{'IndexType':'Lines','IndexWidth':2,'Weight':2,'Indices':[0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,30,30,31,31,32,32,33]},
			{'IndexType':'Lines','IndexWidth':2,'Weight':1,'Indices':[0,17,1,18,2,19,3,20,4,21,5,22,6,23,7,24,8,25,9,26,10,27,11,28,12,29,13,30,14,31,15,32,16,33]}]},'Version':3};
}

function evn_ExampleMultipleElements() {
	return {"Name":"ElFor:ListView",
	"OutputScope":{"Vector":[{"Id":"x","Scope":{"From":0,"To":1},"Resolution":{"Count":15},"Inputs":[{"Id":"x","Weight":1.524088},{"Id":"y","Weight":0},{"Id":"z","Weight":0},{"Id":"one","Weight":2.88}],"Weight":1},{"Id":"y","Scope":{"From":0,"To":1},"Resolution":{"Count":10},"Inputs":[{"Id":"x","Weight":0},{"Id":"y","Weight":0.9887725},{"Id":"z","Weight":0},{"Id":"one","Weight":1.95}],"Weight":1},{"Id":"z","Scope":{"From":0,"To":1},"Resolution":{"Count":8},"Inputs":[{"Id":"x","Weight":0},{"Id":"y","Weight":0},{"Id":"z","Weight":0.7514333},{"Id":"one","Weight":-1.16}],"Weight":1}]},
	"Elements":[
		{"Name":"LayEl='Lewcid List'","OutputScope":{"Vector":[{"Id":"x","Inputs":[{"Id":"one","Weight":0},{"Id":"x","Weight":0.7333333}],"Weight":1},{"Id":"y","Inputs":[{"Id":"one","Weight":0.9},{"Id":"y","Weight":0.1}],"Weight":1},{"Id":"z","Inputs":[{"Id":"one","Weight":0},{"Id":"z","Weight":0.125}],"Weight":1}]},"Shape":{"Scope":{"Vector":[{"Id":"x","IsPacking":true,"Resolution":{"Count":2},"Weight":1},{"Id":"y","IsPacking":true,"Resolution":{"Count":2},"Weight":1},{"Id":"z","IsPacking":true,"Resolution":{"Count":2},"Weight":1}],"Packing":{"VertexWidth":0,"VertexCount":8,"FrameCount":1}},"PackedUnitVertices":[],"IndexSets":[{"IndexType":'Lines',"IndexWidth":2,"Weight":1,"Indices":[]},{"IndexType":'Points',"IndexWidth":1,"Weight":0,"Options":{"Strings":{"worldspace":"true","placement3":"true"}},"Indices":[2,0,3],"Strings":["Lewcid List"]}]},"Version":2},
		{"Name":"LayEl","OutputScope":{"Vector":[{"Id":"x","Inputs":[{"Id":"one","Weight":0},{"Id":"x","Weight":1}],"Weight":1},{"Id":"y","Inputs":[{"Id":"one","Weight":0.09999999},{"Id":"y","Weight":0.8}],"Weight":1},{"Id":"z","Inputs":[{"Id":"one","Weight":0},{"Id":"z","Weight":1}],"Weight":1}]},"Shape":{"Scope":{"Vector":[{"Id":"x","IsPacking":true,"Resolution":{"Count":2},"Weight":1},{"Id":"y","IsPacking":true,"Resolution":{"Count":2},"Weight":1},{"Id":"z","IsPacking":true,"Resolution":{"Count":2},"Weight":1}],"Packing":{"VertexWidth":0,"VertexCount":8,"FrameCount":1}},"PackedUnitVertices":[],"IndexSets":[{"IndexType":'Lines',"IndexWidth":2,"Weight":1,"Indices":[0,1,2,3,4,5,6,7]}]},"Version":2},
		{"Name":"LayEl","OutputScope":{"Vector":[{"Id":"x","Inputs":[{"Id":"one","Weight":0.190983},{"Id":"x","Weight":0.618034}],"Weight":1},{"Id":"y","Inputs":[{"Id":"one","Weight":0.2527864},{"Id":"y","Weight":0.4944272}],"Weight":1},{"Id":"z","Inputs":[{"Id":"one","Weight":0.190983},{"Id":"z","Weight":0.618034}],"Weight":1}]},"Shape":{"Scope":{"Vector":[{"Id":"x","Weight":1},{"Id":"y","Weight":1},{"Id":"z","Weight":1},{"Id":"i","IsPacking":true,"Resolution":{"Count":32},"Weight":1}],"Packing":{"VertexWidth":3,"VertexCount":32,"FrameCount":1}},"PackedUnitVertices":[0,0,0,1,0,0,0,1,0,1,1,0,0,0,1,1,0,1,0,1,1,1,1,1,0.07294901,0,0,0.927051,0,0,0.07294901,1,0,0.927051,1,0,0.07294901,0,1,0.927051,0,1,0.07294901,1,1,0.927051,1,1,0,0.07294901,0,1,0.07294901,0,0,0.927051,0,1,0.927051,0,0,0.07294901,1,1,0.07294901,1,0,0.927051,1,1,0.927051,1,0,0,0.07294901,1,0,0.07294901,0,1,0.07294901,1,1,0.07294901,0,0,0.927051,1,0,0.927051,0,1,0.927051,1,1,0.927051],"IndexSets":[{"IndexType":'Lines',"IndexWidth":2,"Weight":1,"Indices":[0,8,0,16,0,24,1,9,1,17,1,25,2,10,2,18,2,26,3,11,3,19,3,27,4,12,4,20,4,28,5,13,5,21,5,29,6,14,6,22,6,30,7,15,7,23,7,31]}]},"Version":2},
		{"Name":"LayEl='Close'","OutputScope":{"Vector":[{"Id":"x","Inputs":[{"Id":"one","Weight":0},{"Id":"x","Weight":0.3333333}],"Weight":1},{"Id":"y","Inputs":[{"Id":"one","Weight":2.235174E-08},{"Id":"y","Weight":0.1}],"Weight":1},{"Id":"z","Inputs":[{"Id":"one","Weight":0},{"Id":"z","Weight":0.125}],"Weight":1}]},"Shape":{"Scope":{"Vector":[{"Id":"x","IsPacking":true,"Resolution":{"Count":2},"Weight":1},{"Id":"y","IsPacking":true,"Resolution":{"Count":2},"Weight":1},{"Id":"z","IsPacking":true,"Resolution":{"Count":2},"Weight":1}],"Packing":{"VertexWidth":0,"VertexCount":8,"FrameCount":1}},"PackedUnitVertices":[],"IndexSets":[{"IndexType":'Lines',"IndexWidth":2,"Weight":1,"Indices":[]},{"IndexType":'Points',"IndexWidth":1,"Weight":0,"Options":{"Strings":{"worldspace":"true","placement3":"true"}},"Indices":[2,0,3],"Strings":["Close"]}]},"Version":2}],"Version":6}
		;
}


/* ------------ HELPERS FOR ECOVOXEL (EVX) API ------------------------- */


var __evn_currentMain = null;
var __evn_currentJsRoot = null;
var __evn_content_fixed = null;
var __evn_content_anim = null;
var __evn_evx_root = null;

var __evn_slide_current = (evxToolsUrlHasArg("lion_app") ? 8 : 0);
var __evn_slide_filtered = false;
var __evn_slide_filter_key = "";

var __evn_ServerRequestId = "";


var evnMetaFilterCallback = null;
var __env_MainHistory = [];
var __env_IsOnEcoSlide = undefined;
var __evn_CallOnceAfterRender = undefined;

function evn_GotoEcoSlide(ecoNdx) {

	var ecoSlideId = 'ecoSlide' + ecoNdx;
	var ecoSlideData;
	if (ecoNdx == 0) {
		ecoSlideData = ecoSlide0;
	} else if (ecoNdx == 1) {
		ecoSlideData = ecoSlide1;
	} else if (ecoNdx == 2) {
		ecoSlideData = ecoSlide2;
	} else if (ecoNdx == 3) {
		ecoSlideData = ecoSlide3;
	} else {
		evxToolsAssert(false);
	}
	partnerTempSlideOverride = ecoSlideId;
	__env_IsOnEcoSlide = ecoSlideId;
	evn_ChangeMainElement(ecoSlideData,false); // this resets __env_IsOnEcoSlide
	__env_IsOnEcoSlide = ecoSlideId;
}

function evn_ChangeMainElement(rootEl,skipScaling=false) {

	__env_IsOnEcoSlide = undefined;

	var oldScrollItem = ((evxToolsNotNull(__evn_currentJsRoot)) ? evxElementFindScrollChild(__evn_currentJsRoot) : null);

	evnPageCallback('customSlideExitCallback')();

	evxTextLabelsClear();
	__evn_currentJsRoot = rootEl;
	evnPageCallback('customSlidePreEnterCallback')(); // just after change
	var isFirstTime = (!evxToolsNotNull(rootEl.evxTagEl));
	var res = evxElementCreateFromJsonElement(rootEl);
	
	__env_MainHistory.push({
		el:rootEl, skipScaling:skipScaling, 
	});

	// Hacky stuff:
    var defScale = 4.0;
    if (!skipScaling) {
		res.objThree.scale.x = 4.0;
		res.objThree.scale.y = 4.0;
		res.objThree.scale.z = 4.0;
	
		res.objThree.position.x = -2.0;
		res.objThree.position.y = -2.0;
		res.objThree.position.z = -2.0;
	} else {
		res.objThree.position.x = -1.0;
	}


    if (__evn_currentMain != null) {
        __evn_evx_root.remove(__evn_currentMain.objThree);
    }
    __evn_currentMain = res;

    __evn_evx_root.add(res.objThree);
	
	// hide based on active filtering:
	if (evxToolsNotNull(evnMetaFilterCallback)) {
		evxElementApplyMetaFilter(rootEl, evnMetaFilterCallback);
	}
	evnMetaFilterCallback = null;

	// setup the first meta data:
	var mu = evxElementFindFirstMetaData(rootEl, evn_updateMetaData, evn_updateAllMetaData);
	if (mu == false) {
		// no meta-data to show...
		var tryMeta = evnPageCallback('customSlideMetadataCallback')();
		if (evxToolsNotNull(tryMeta)) {
			evn_updateAllMetaData(tryMeta);
		} else {
			evn_updateAllMetaData();
		}
		
	}

	// request final update:
	evn3d_root.requestUpdate();

	// ensure all the stuff is setup:
	var newScrollItem = ((evxToolsNotNull(__evn_currentJsRoot)) ? evxElementFindScrollChild(__evn_currentJsRoot) : null);
	if ((!isFirstTime) && evxToolsNotNull(oldScrollItem) && evxToolsNotNull(newScrollItem)) {
		//evxElementInputScopeCopy(newScrollItem, oldScrollItem);
		evn3d_root.requestUpdate();
	} else if (evxToolsNotNull(newScrollItem)) {
		//evxElementInputScopeUpdate(newScrollItem); // helps ensure the tracks and such are correctly aligned
		//evn3d_root.requestUpdate();
	}

	__env_IsOnEcoSlide = undefined;

	__evn_CallOnceAfterRender = function() {
		evn3d_root.innerScroll1d(0);
		evn3d_root.innerMoveCamera(0,0);
	};

	evnPageCallback('customSlideEnterCallback')();
}

function evn_PopOneHistory() {
	__env_MainHistory.pop();
}

function evn_GoBack() {
	if (__env_MainHistory.length > 1) {
		var current = __env_MainHistory.pop();
		var before = __env_MainHistory.pop();
		evn_ChangeMainElement(before.el, before.skipScaling);
	} else {
		//window.history.back();
	}
}

var __evn_3dModelHolder = null;
var __evn_3dModelsActive = null;

function evn_Setup3DModelNearby() {

	var placer = new THREE.Group();

	var scl = 0.2;
	placer.scale.set(scl, scl, scl);
	placer.position.set(1.5, -1.8, -1 );
	//placer.rotation.y = Math.PI * 1.0;

	__evn_3dModelHolder = placer;

	evn3d_root.scene.add( placer );
}

var __evn_Thumbnail3d = null;

function evn_Update3dModel(src, createModelCallback, sceneCallback) {

	if (!evxToolsNotNull(__evn_3dModelHolder)) {
		return;
	}

	var common = __evn_Thumbnail3d;
	if (!evxToolsNotNull(__evn_Thumbnail3d)) {
		var manager = new THREE.LoadingManager();
		common = {
			placer: __evn_3dModelHolder,
			currentSrc: "",
			all : [],
		};
		__evn_Thumbnail3d = common;
	}

	if (common.currentSrc == src) {
		return;
	}
	
	// update other models:
	{
		var already = common.all[src];
		common.currentSrc = src;
		for (var ci in common.all) {
			var c = common.all[ci];
			var isShow = (ci == src);
			c.showing = isShow;
			if (evxToolsNotNull(c.objThree)) {
				c.objThree.visible = isShow;
			}
		}
		if (src in common.all) {
			return; // already did it above
		}
	}

	common.currentSrc = src;
	var ctx = { 
		'showing' : true,
		'src' : src,
	};
	common.all[src] = ctx;

	var onLoadCallback = function(loadedScene) {
		if (evxToolsNotNull(loadedScene)) {
			ctx.objThree = loadedScene;
			ctx.objThree.visible = ctx.showing;

			common.placer.add( loadedScene );

			if (evxToolsNotNull(sceneCallback)) {
				sceneCallback(loadedScene);
			}

			requestUpdate();

		} else {
			// model failed to load
		}
	};
	
	if (evxToolsNotNull(createModelCallback)) {
		onLoadCallback(createModelCallback());
	} else {
		evx_3dPack_LoadModelGeneric(src, onLoadCallback );
	}
}


function evn_SetupShape() {

	__evn_content_fixed = evxObjThreeCreateZFlipGroup();
	__evn_content_fixed.position.z = -2;
	__evn_content_fixed.updateMatrix();
	__evn_content_fixed.add( evxObjectThreeCreateBackgroundSphere(partnerGeneralInfo().bgImagePath) );

	__evn_content_anim = new THREE.Group();
	__evn_content_fixed.add( __evn_content_anim );

	__evn_evx_root = new THREE.Group();
	__evn_content_anim.add( __evn_evx_root );
	evn3d_root.scene.add( __evn_content_fixed );


	var elData = evn_ExampleWithMediumAmountOfElements(); //evn_ExampleMultipleElements(); //evn_ExampleElementWithTextLinesPoints();
	var res = evxElementCreateFromJsonElement(elData);

	if ((!evxToolsUrlHasArg("lion_app")) && (!evxToolsUrlHasArg("business"))) {
		evn_GotoEcoSlide(0); // SHOULD BE 0 for STADIUM DEMO
	} else {
		evn_ChangeMainElement(elData);
	}

	

	evn_Setup3DModelNearby();
}

function evn_GetSlidesData() {
	var __evn_slide_sequence = [
		evxPanelSlide0,
		evxPanelSlide1,
		evxPanelSlide2,
		evxPanelSlide3,
		evxPanelSlide4,
		evxPanelSlide5,
		evxPanelSlide6,
		evxPanelSlide7,
		evxPanelSlide8,
		evxPanelSlide9,
	];
	return __evn_slide_sequence;
}

function evn_ExampleWithMediumAmountOfElements() {
	return evn_GetSlidesData()[__evn_slide_current];
	//return evxPanelSlide0;
	//return evxExampleDatabaseView; // see import file.	
}


function evn_GotoSlide(slideIndex, isFiltered=false) {
	var __evn_slide_sequence = evn_GetSlidesData();
	__evn_slide_current = slideIndex % __evn_slide_sequence.length;
	__evn_slide_filtered = isFiltered;
	if (!isFiltered) {
		__evn_slide_filter_key = "";
	}
	var cur = __evn_slide_sequence[ __evn_slide_current ];
	if (!evxToolsNotNull(cur)) {
		return; // OOPS! Not loaded yet... um... just ignore it...
	}
	//alert("Going to slide " + __evn_slide_current );
	evn_ChangeMainElement( cur );
}

function evn_GotoSpecificView(isPersonFilter, uid, slideOverride=null, callback=null) {
	__evn_slide_filter_key = uid;
	var nextSlide = isPersonFilter?0:2;
	if (evxToolsNotNull(slideOverride)) {
		nextSlide = slideOverride;
	}
	if (evn_ServerIsConnected()) {
		evn_ServerDoFilteredGraph( nextSlide, uid, callback);
	}else {
		nextSlide = (isPersonFilter ? 1 : 3 );
		evnMetaFilterCallback = function(meta) {
			var itemData = meta; //evxToolsJsonFromString(str);
			if (isPersonFilter) {
				if (itemData.Person == uid) {
					return true;
				}
			} else {
				if (itemData.Mission == uid) {
					return true;
				}
			}
			return false;
		};
		evn_GotoSlide(nextSlide, true);
	}
}

function evn_ClickedOnSpecificItem(indexA=0, indexB=2) {

	var nextSlide = ((indexA != __evn_slide_current) ? indexA : indexB );
	var isPersonFilter = (__evn_slide_current >= 2);

	if (evxToolsNotNull( __evn_latestMetaData)) {
		var data = __evn_latestMetaData;
		var filterTo = (isPersonFilter ? data.Person : data.Mission);
		if (!evxToolsNotNull(filterTo)) {
			return; // no mission or person
		}

		var isGo = true;
		if (evxToolsNotNull(partnerTryFilterInto)) {
			if (partnerTryFilterInto(filterTo, isPersonFilter, data)) {
				isGo = false;
			}
		}

		if (isGo) {
			evn_GotoSpecificView(isPersonFilter, filterTo);
		}

	}

}

function evn_NextSlide() {
	__evn_slide_current++;
	if (evxToolsNotNull(__env_IsOnEcoSlide)) {
		__evn_slide_current = 0;
	}
	evn_GotoSlide(__evn_slide_current);
}

var __evnAnimTimePrevious = new Date();
var __evnAnimTimeScalar = 0.2;
var __evnAnimTimeInitial = (Math.PI * 0.5) / __evnAnimTimeScalar;
var __evnAnimTimeTotal = __evnAnimTimeInitial;
var __evnIsFirstTransition = true;
var evn_AnimationCallback = undefined;
var __evnAnimIsInTick = false;

function __evnAnimTimeUnitCircle() {
	return ( ( __evnAnimTimeTotal * __evnAnimTimeScalar ) / ( Math.PI * 2.0 ) ) - 0.5;
}

function evn_AnimationTick() {

	if (!__evnAnimIsInTick) {
		__evnAnimIsInTick = true;

	if (evnIsAnimating) {
		let timeNow = new Date();
		var dt = (timeNow.getTime() - __evnAnimTimePrevious.getTime()) / 1000;
		//__evnAnimTimePrevious = timeNow;
		//dt = Math.min( dt, 0.1 );

		__evnAnimTimeTotal = __evnAnimTimeInitial + dt;

		if (evn_AnimationCallback) {
			__evnAnimTimePrevious = timeNow;
			evn_AnimationCallback(dt, __evnAnimTimeTotal, false);
		} else {
			var prevSlide = Math.floor(__evnAnimTimeUnitCircle());
			// old hacky animated slide system:
			if (Math.floor(__evnAnimTimeUnitCircle()) != prevSlide) {
				if (__evnIsFirstTransition) {
					__evnIsFirstTransition = false;
					evn_GotoSlide(3);
				} else {
					evn_NextSlide();
				}
			} else {
				evn3d_root.innerScroll1d(Math.cos(3.0 * __evnAnimTimeTotal * __evnAnimTimeScalar) * 0.001 );
			}
			__evn_content_anim.rotation.y = Math.cos(__evnAnimTimeTotal * __evnAnimTimeScalar) * 1.61;
		}

	} else {
		if (evn_AnimationCallback) {
			evn_AnimationCallback(0, __evnAnimTimeTotal, true);
		} else {
			__evn_content_anim.rotation.y = 0.00;
			__evnAnimTimeTotal = __evnAnimTimeInitial;
		}
	}
		
		evn3d_root.requestUpdate();
		__evnAnimIsInTick = false;
	}

	if (evnIsAnimating) {
		setTimeout(evn_AnimationTick, 1000/60 );
	}
}

function evn_AnimationEnable(isOn) {
	evnIsAnimating = isOn;
	__evnAnimTimePrevious = new Date();
	//mainAnimateButton.innerHTML = (evnIsAnimating ? "PAUSE" : "ANIMATE");
	evn_AnimationTick();
}

function evn_AnimationToggle() {
	evn_AnimationEnable( ! evnIsAnimating );
}

// -------------- SERVER MANAGEMENT STUFF -------------


function evn_ServerRequestIdUpdate(id) {
	__evn_ServerRequestId = id;
}

function evn_ServerRequestId() {
	return __evn_ServerRequestId;
}

function evn_ServerIsConnected() {
	return (__evn_ServerRequestId != "");
}

function evn_ServerBeginConnection(skipApply=false) {
    evxToolsWebServiceBegin("PanelService", (skipApply ? "&just_req_id=true" : ""), function (strRes) {
        var jsData = evxToolsJsonFromString(strRes);
        var el = jsData.web_result.Element;
		evn_ServerRequestIdUpdate( jsData.web_result.RequestId );
		if (evxToolsNotNull(skipApply) && skipApply) {
			// special case
		} else {
			// usually apply the change:
			evn_ChangeMainElement(el);
		}
		
    });
}
function evn_ServerDoUpdate() {
    evxToolsWebServiceUpdate(evn_ServerRequestId(), "", function (strRes) {
        var jsData = evxToolsJsonFromString(strRes);
        var el = jsData.web_result.Element;
        evn_ChangeMainElement(el);
    });
}
function evn_ServerDoFilteredGraph(slideIndex,filterBy,callback=null) {
    evxToolsWebServiceUpdate(evn_ServerRequestId(), "&slide=" + slideIndex + "&filter=" + filterBy, function (strRes) {
		if (evxToolsNotNull(callback)) {
			callback(el);
		}        
		var jsData = evxToolsJsonFromString(strRes);
        var el = jsData.web_result.Element;
		__evn_slide_current = slideIndex;
		__evn_slide_filtered = false;
		evn_ChangeMainElement(el);

    });
}




