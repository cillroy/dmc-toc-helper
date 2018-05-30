var missingNodeMsg = "No node selected!\r\nPlease select a node and try again."

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
                    if (key == "href") {
                        toc += addIndents(depth) + "  href : " + val + "\r\n";
                    }
                    if (key == "expanded" && toc != "" && val == true) {
                        tmpExpand = addIndents(depth) + "  expanded: " + val + "\r\n";
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
    var tree = $("#tree").fancytree("getTree");
    tree.source = document.getElementById("code_text").value;
}

function add_child() {
    var node = $("#tree").fancytree("getActiveNode");
    if (!node || node === "undefined") node = $("#tree").fancytree("getRootNode");
    node.folder = true;
    var newNode = node.editCreateNode("child", {
        title: $("#nodeTitle").val(),
        href: $("#nodeHref").val()
    });
    node.render();
}

function toggle_folder() {
    var node = $("#tree").fancytree("getActiveNode");
    if (node) {
        node.folder = (node.folder) ? false : true;
        node.render();
    } else {
        alert(missingNodeMsg);
    }
}

function resetSearch() {
    var tree = $("#tree").fancytree("getTree");
    tree.clearFilter;
}

function sortBranch() {
    var node = $("#tree").fancytree("getActiveNode");
    if (node) {
        // Custom compare function (optional) that sorts case insensitive
        var cmp = function (a, b) {
            a = a.title.toLowerCase();
            b = b.title.toLowerCase();
            return a > b ? 1 : a < b ? -1 : 0;
        };
        node.sortChildren(cmp, false);
    } else {
        alert(missingNodeMsg);
    }
}

function sortTree() {
    var node = $("#tree").fancytree("getRootNode");
    node.sortChildren(null, true);
}