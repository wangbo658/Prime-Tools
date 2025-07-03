(function (thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Layer Maker", undefined, { resizeable: true });
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];

        var buttonSize = [32, 32];

        // ===== SECTION 1: MATCHED LAYER (SELECTION BASED) =====
        win.add("statictext", undefined, "📌 Match Layer");

        var matchGroup = win.add("group", undefined);
        matchGroup.orientation = "row";

        addSmallButton(matchGroup, "N", "null", true);
        addSmallButton(matchGroup, "A", "adjustment", true);
        addSmallButton(matchGroup, "S", "solid", true);
        addSmallButton(matchGroup, "Sh", "shape", true);

        // ===== SECTION 2: INDEPENDENT LAYER (COMP BASED) =====
        win.add("statictext", undefined, "📎 Independent Layer");

        var newGroup = win.add("group", undefined);
        newGroup.orientation = "row";

        addSmallButton(newGroup, "N", "null", false);
        addSmallButton(newGroup, "A", "adjustment", false);
        addSmallButton(newGroup, "S", "solid", false);
        addSmallButton(newGroup, "Sh", "shape", false);

        return win;

        function addSmallButton(group, label, type, matchLayer) {
            var btn = group.add("button", undefined, label);
            btn.size = buttonSize;
            btn.helpTip = (matchLayer ? "Match" : "New") + " " + type;
            btn.onClick = function () {
                createLayer(type, matchLayer);
            };
        }
    }

    function createLayer(type, matchSelected) {
        app.beginUndoGroup("Create " + type + " Layer");

        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please open a composition.");
            app.endUndoGroup();
            return;
        }

        var baseLayer = (matchSelected && comp.selectedLayers.length > 0) ? comp.selectedLayers[0] : null;

        var width = baseLayer ? (baseLayer.width || comp.width) : comp.width;
        var height = baseLayer ? (baseLayer.height || comp.height) : comp.height;
        var inPoint = baseLayer ? baseLayer.inPoint : 0;
        var outPoint = baseLayer ? baseLayer.outPoint : comp.duration;

        var newLayer;

        if (type === "null") {
            newLayer = comp.layers.addNull();
            newLayer.label = matchSelected ? 2 : 9; // red or green
        } else if (type === "adjustment") {
            newLayer = comp.layers.addSolid([1, 1, 1], "Adjustment Layer", width, height, 1);
            newLayer.adjustmentLayer = true;
            newLayer.label = matchSelected ? 11 : 7; // violet or orange
        } else if (type === "solid") {
            newLayer = comp.layers.addSolid([0.2, 0.4, 1], "Solid Layer", width, height, 1);
            newLayer.label = matchSelected ? 5 : 6; // blue or teal
        } else if (type === "shape") {
            newLayer = comp.layers.addShape();
            newLayer.name = "Shape Layer";
            var shapeGroup = newLayer.property("Contents").addProperty("ADBE Vector Group");
            shapeGroup.name = "Rectangle Group";
            var rect = shapeGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
            rect.property("Size").setValue([width, height]);
            var fill = shapeGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
            fill.property("Color").setValue([1, 1, 1]);
            newLayer.label = matchSelected ? 10 : 4; // light blue or yellow
        }

        if (newLayer) {
            newLayer.inPoint = inPoint;
            newLayer.outPoint = outPoint;
            newLayer.name += matchSelected ? " (Matched)" : " (New)";
        }

        app.endUndoGroup();
    }

    var panel = buildUI(thisObj);
    if (panel instanceof Window) {
        panel.center();
        panel.show();
    } else {
        panel.layout.layout(true);
    }

})(this);
