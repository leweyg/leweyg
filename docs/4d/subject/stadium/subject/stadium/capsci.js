

function partnerSetupExtension_UnitScroller(res) {
	res.customScrollCallback = function(unitDelta) {

		var el = res.objJs;
		var axs = el.InputScope.Vector[0];
		var w = (axs.Scope.To - axs.Scope.From);
		var w2 = (w * (1 - ( unitDelta * 0.5)));
		w2 = Math.max( 0.1, Math.min(w2, 4.0));

		for (var ai in el.InputScope.Vector) {
			var ax = el.InputScope.Vector[ai];
			ax.Scope.To = ax.Scope.From + w2;
			evxHoloScope1DUpdateTransform(ax);
		}

		// will automatically call evxElementInputScopeUpdate at the end
	};
}
evxExtensions["unitscroller"] = partnerSetupExtension_UnitScroller;

function partnerSetupExtension_UnitModel(res) {
	var clip = evxShaderStateStore();
	var isUseClipping = false;

	var modelPath = "subject/stadium/model/OutlineModel/USM_Stadium.obj";
	//var modelPath = "subject/stadium/model/FloorDetails_0/USM_Stadium_FloorDetails_0.obj";

	evx_3dPack_LoadModelObj(modelPath, function(stadiumModel) {
		if (!evxToolsNotNull(stadiumModel)) {
			return;
		}
		var sysClip = evxShaderStateStore();
		evxShaderStateRestore(isUseClipping ? clip : undefined);
		var mat = evxShaderMaterialCreateForLitTriangles(new THREE.Color( 0xA9F3B3 ));
		mat.side = THREE.DoubleSide;
		evxShaderStateRestore(sysClip);

		stadiumModel.traverse(function(mesh) {
			if (evxToolsNotNull(mesh.material)) {
				mesh.material = mat;
			}
		});
		var scl = 0.001;
		stadiumModel.scale.set( scl, scl, scl );
		stadiumModel.position.set(0,0,1);
		res.objThree.add(stadiumModel);
		//var person = evx_3dPack_CreateItemInstance(stadiumModel);
	});
}
evxExtensions["unitmodel"] = partnerSetupExtension_UnitModel;

