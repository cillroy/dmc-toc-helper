function makeCode() {
    var tree = $("#tree").fancytree("getTree");
    var treeCode = tree.toDict(true);

    var toc = "";

    $.each(treeCode, function (key, val) {
        recursiveFunction(key, val)
    });

    var tmpExpand = "";

    function recursiveFunction(key, val, depth = 0, tmpStr = "") {
        var root = (key == "title" && val == "root");
        if (!root) {
            if (key == "title" || tmpStr != "") toc += addIndents(depth);
            switch (val instanceof Object) {
                case (true):
                    if (key == "children" && toc != "") {
                        if (tmpExpand != undefined) {
                            console.log(depth + " " + key)
                            toc += tmpExpand;
                        }
                        tmpExpand = "";
                        if (depth > 0) toc += addIndents(depth);
                        toc += "  items:\r\n";
                    }
                    break;
                default:
                    if (key == "title") {
                        toc += "- name : " + val + "\r\n";
                    }
                    if (key == "expanded" && toc != "" && val == true) {
                        tmpExpand = addIndents(depth + 1) + "expanded: " + val + "\r\n";
                    }
                    break;
            }
        }
        var value = val;
        if (value instanceof Object) {
            if (key == "children" && toc != "") depth++;
            $.each(value, function (key, val) {
                recursiveFunction(key, val, depth, tmpStr)
            });
        }
    }

    function addIndents(count) {
        strOut = "";
        for (var i = 0; i < count; i++) strOut += "  ";
        return strOut;
    }

    document.getElementById("code_text").value = toc
    //document.getElementById("code_text").value = toc + "\r\n\r\n--- END ---\r\n\r\n" + JSON.stringify(treeCode, null, 4);
    //console.log(JSON.stringify(treeCode, null, 4));
}

function updateTree() {
    alert("Update Tree");
}

function add_child() {
    var node = $("#tree").fancytree("getActiveNode");
    if (!node || node === "undefined") node = $("#tree").fancytree("getRootNode");
    node.folder = true;
    node.editCreateNode("child", "Node title");
}

function add_folder() {
    var node = $("#tree").fancytree("getActiveNode");
    if (!node || node === "undefined") {
        node = $("#tree").fancytree("getRootNode");
        node.addChildren({
            title: "Node title",
            folder: true
        });
    } else {
        node.editCreateNode("child", {
            title: "Node title",
            folder: true
        });
    }
}

function toggle_folder() {
    var node = $("#tree").fancytree("getActiveNode");
    // NEED TO CATCH WHEN A NODE IS NOT SELECTED
    node.folder = (node.folder) ? false : true;
    node.render();
}

function resetSearch() {
    var tree = $("#tree").fancytree("getTree");
    tree.clearFilter;
}