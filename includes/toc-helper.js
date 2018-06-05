var missingNodeMsg = "No node selected!\r\nPlease select a node and try again.";
var newline = "\n";

$(function () {
    function titleFormat(val) {
        var outString = ($("#showHref").is(":checked")) ? " <em style='color: blue;'>(" + val + ")</em>" : "";
        return outString;
    }

    $("input[name=search]").keyup(function (e) {
        var n,
            tree = $.ui.fancytree.getTree(),
            args = "autoApply autoExpand fuzzy hideExpanders highlight leavesOnly nodata".split(
                " "),
            opts = {},
            filterFunc = $("#branchMode").is(":checked") ? tree.filterBranches : tree.filterNodes,
            match = $(this).val();

        /*
        $.each(args, function (i, o) {
            opts[o] = $("#" + o).is(":checked");
        });
        */

        /*
        opts.mode = $("#hideMode").is(":checked") ? "hide" : "dimm";
        */

        if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
            $("button#btnResetSearch").click();
            return;
        }

        if ($("#regex").is(":checked")) {
            // Pass function to perform match
            n = filterFunc.call(tree, function (node) {
                return new RegExp(match, "i").test(node.title);
            }, opts);
        } else {
            // Pass a string to perform case insensitive matching
            n = filterFunc.call(tree, match, opts);
        }

        $("button#btnResetSearch").attr("disabled", false);
        $("span#matches").text("(" + n + " matches)");
    }).focus();

    /*
    $("fieldset input:checkbox").change(function (e) {
        var id = $(this).attr("id"),
            flag = $(this).is(":checked");

        // Some options can only be set with general filter options (not method args):
        switch (id) {
            case "counter":
            case "hideExpandedCounter":
                tree.options.filter[id] = flag;
                break;
        }
        tree.clearFilter();
        $("input[name=search]").keyup();
    });
    */

    $("button#makeCode").click(function (e) {
        var tree = $("#tree").fancytree("getTree");
        var treeCode = tree.toDict(true);
        var toc = "";

        $.each(treeCode, function (key, val) {
            recursiveFunction(key, val);
        });

        var tmpExpand = "";
        var isRoot = true;

        function recursiveFunction(key, val, depth = -2, tmpStr = "") {
            if (key == "key") {
                var indent = addIndents(depth);
                var node = $("#tree").fancytree("getTree").getNodeByKey(val);
                if (val != "root_1" && node.title != "root") {
                    isRoot = false;
                    toc += indent + "- name: " + node.data['toc'] + newline;
                    if (node.data['href']) toc += indent + "  href: " + node.data['href'] + newline;
                    if (node.expanded) toc += indent + "  expanded: " + node.expanded + newline;
                    if (node.children instanceof Object) toc += indent + "  items: " + newline;
                }
            }

            var value = val;
            if (value instanceof Object) {
                if (!isRoot) depth++;
                $.each(value, function (key, val) {
                    recursiveFunction(key, val, depth, tmpStr);
                });
            }
        }

        function addIndents(count) {
            strOut = "";
            for (var i = 0; i < count; i++) strOut += "  ";
            return strOut;
        }

        $("#codeText").val(toc);
        //$("#codeText").val(toc + "\r\n\r\n--- END ---\r\n\r\n" + JSON.stringify(treeCode, null, 4));
        $("#yamlGenerate").text(JSON.stringify(treeCode, null, 4));
        console.log(JSON.stringify(treeCode, null, 4));
    });

    /* Use yamljs? */
    $("button#makeTree").click(function (e) {
        var treeSourceStart = "---" + newline + "expanded: true" + newline + "key: root_1" + newline + "title: root" + newline + "children: " + newline;
        var treeSource = treeSourceStart + $("#codeText").val();
        /*
        treeSource = treeSource.replace(/items:/g, "children:");
        treeSource = treeSource.replace(/name:/g, "title:");
        */
        var nativeObject = YAML.parse(treeSource);
        var lines = $("#codeText").val().split(newline);
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].split(":");
            switch (line[0]) {
                case "- name":
                    treeSource += '"title: "' + line[1] + ',';
                    break;
                case "href":
                    treeSource += '"data": { href: "' + line[1] + ',';
                    break;
                case "toc":
                    treeSource += '"toc: "' + line[1] + '}';
                    break;
                case "expanded":
                    treeSource += '"expanded: "' + line[1] + ',';
                    break;
                case "items:":
                    treeSource += '"children: [{"' + line[1];
                    break;
            }
        }
        $("#codeText").val(treeSource);
        var yamlString = JSON.stringify(treeSourceStart + nativeObject, null, 4);
        yamlString = JSON.stringify(nativeObject, null, 4);

        $("#jsonGenerate").text(yamlString);
        console.log(yamlString);
    });

    $("button#btnResetSearch").click(function (e) {
        $("input[name=search]").val("");
        $("span#matches").text("");
        tree.clearFilter();
    }).attr("disabled", true);

    /* DO I SET FOCUS ON NEW NODE OR KEEP FOCUS ON ACTIVE NODE? */
    $("button#updateNode").click(function (e) {
        var node = $("#tree").fancytree("getActiveNode");
        node.data['href'] = $("#nodeHref").val();
        node.data['toc'] = $("#nodeTitle").val();
        node.title = $("#nodeTitle").val() + titleFormat($("#nodeHref").val());
        node.renderTitle();

        $("#statusLine").text("event.type: " + e.type + "\r\ndata.node: " + node +
            "\r\ndata.node.data['toc']: " + node.data['toc'] +
            "\r\ndata.node.data['href']: " + node.data['href'] +
            "\r\ndata.node['expanded']:" + node['expanded']);
    }).attr("disabled", true);

    $("button#sortTree").click(function (e) {
        var node = $("#tree").fancytree("getRootNode");
        node.sortChildren(null, true);
    });

    $("button#sortBranch").click(function (e) {
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
    });

    $("button#toggleFolder").click(function (e) {
        var node = $("#tree").fancytree("getActiveNode");
        if (node) {
            node.folder = (node.folder) ? false : true;
            node.render();
        } else {
            alert(missingNodeMsg);
        }
    });

    $("#showHref").click(function () {
        var tree = $("#tree").fancytree("getRootNode");
        var treeCode = tree.toDict(true);
        var isChecked = this.checked;

        $.each(treeCode.children, function (key, val) {
            recursiveFunction(key, val, isChecked);
        });

        var currTitle = "";
        var tmpTitle = "";
        var keyId = "";

        function recursiveFunction(key, val, isChecked = false) {
            if (key == "key") {
                var node = $("#tree").fancytree("getTree").getNodeByKey(val);
                node.title = node.data['toc'] + titleFormat(node.data['href']);
                node.renderTitle();
            }

            var value = val;
            if (value instanceof Object) {
                $.each(value, function (key, val) {
                    recursiveFunction(key, val, isChecked);
                });
            }
        }
    });

    $("#createNode").click(function () {
        $("span", this).text("Create Node [" + (($("#newNode").is(":hidden")) ? "-" : "+") + "]");
        $("#newNode").toggle();
    });

    $("button#addNode").click(function (e) {
        var node = $("#tree").fancytree("getActiveNode");
        if (!node || node === "undefined") node = $("#tree").fancytree("getRootNode");
        node.folder = true;

        node.addChildren({
            title: $("#newNodeTitle").val() + titleFormat($("#newNodeHref").val()),
            href: $("#newNodeHref").val(),
            toc: $("#newNodeTitle").val()
        });

        node.setExpanded();
        node.render();
        //$("#tree").fancytree("getTree").activateKey(node.key);
        $("#newNodeTitle").val("");
        $("#newNodeHref").val("");
    });

    $("button#activeNode").click(function () {
        $("span", this).text("active node [" + (($("#statusLine").is(":hidden")) ? "-" : "+") + "]");
        $("#statusLine").toggle();
    });

    $("button#jsonValues").click(function () {
        $("span", this).text("tree > code [" + (($("#yamlGenerate").is(":hidden")) ? "-" : "+") + "]");
        $("#yamlGenerate").toggle();
    });

    $("button#yamlValues").click(function () {
        $("span", this).text("tree < code [" + (($("#jsonGenerate").is(":hidden")) ? "-" : "+") + "]");
        $("#jsonGenerate").toggle();
    });
});