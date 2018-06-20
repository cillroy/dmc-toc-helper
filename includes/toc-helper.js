var newline = "\n";
var missingNodeMsg = "No node selected!" + newline + "Please select a node and try again.";
var msgYamlGenerated = "Table of Contents yaml code was generated." + newline + newline + "You will need to save this as a .yml file.";
var msgTreeUpdated = "Table of Content updated from code";
var codeTextDefaultText = "Please enter your docs table of content here...";
var jsonSource = [{
        title: "Node 1",
        toc: "Node 1",
        href: "node1.md",
        uid: "uid1"
    },
    {
        title: "Folder 2",
        toc: "Folder 2",
        href: "node2.md",
        uid: "uid2",
        "folder": true,
        "children": [{
                title: "Node 2.1",
                toc: "Node 2.1",
                href: "node2.1.md",
                uid: "uid2.1"
            },
            {
                title: "Node 2.2",
                toc: "Node 2.2",
                href: "node2.2.md",
                uid: "uid2.2"
            }
        ]
    },
    {
        title: "Folder 3",
        toc: "Folder 3",
        href: "node3.md",
        uid: "uid3",
        "folder": true,
        "children": [{
            title: "Node 3.1",
            toc: "Node 3.1",
            href: "node3.1.md",
            uid: "uid3.1"
        }]
    }
];

function titleFormat(val) {
    var outString = ($("#showHref").is(":checked")) ? " <em style='color: blue;'>(" + val + ")</em>" : "";
    return outString;
}

function manageNodeTitles() {
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
}

function checkParameterExists(parameter) {
    //Get Query String from url
    fullQString = window.location.search.substring(1);

    paramCount = 0;
    queryStringComplete = "?";

    if (fullQString.length > 0) {
        //Split Query String into separate parameters
        paramArray = fullQString.split("&");

        //Loop through params, check if parameter exists.  
        for (i = 0; i < paramArray.length; i++) {
            currentParameter = paramArray[i].split("=");
            if (currentParameter[0] == parameter) //Parameter already exists in current url
            {
                return true;
            }
        }
    }

    return false;
}

function updateActiveNode(event, node, toc, href, uid, expanded) {
    //var node = $("#tree").fancytree("getActiveNode");
    $("#statusLine").text("event.type: " + event +
        newline + "data.node: " + node +
        newline + "data.node.data['toc']: " + toc +
        newline + "data.node.data['href']: " + href +
        newline + "data.node.data['uid']: " + uid +
        newline + "data.node['expanded']:" + expanded);
}

function clearEditFields() {
    $("#nodeTitle").val("");
    $("#nodeHref").val("");
    $("#nodeUid").val("");
}

function clearNewFields() {
    $("#newNodeTitle").val("");
    $("#newNodeHref").val("");
    $("#newNodeUid").val("");
}

$(function () {
    if (checkParameterExists("debug")) {
        $("#debug").show();
    }

    $("#showHref")[0].checked = true;
    $("#codeText").attr("placeholder", codeTextDefaultText);

    $("#copy").click(function (e) {
        //var copyTextarea = document.querySelector('codeText');
        var copyTextarea = document.getElementById("codeText");
        copyTextarea.focus();
        copyTextarea.select();
        var msg;

        try {
            var successful = document.execCommand('copy');
            msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
            alert("Table of Contents was copied." + newline + newline + "You will need to save this as a .yml file.");
        } catch (err) {
            console.log('Copying text command was ' + msg);
            alert('Oops, unable to copy');
        }
    });

    $("#reset").click(function (e) {
        $("#tree").fancytree("option", "source", jsonSource);
        $("#codeText").val("");
        $("#codeText").attr("placeholder", codeTextDefaultText);
        clearEditFields();
        clearNewFields();
        manageNodeTitles();
    });

    $("input[name=search]").keyup(function (e) {

        var n,
            tree = $.ui.fancytree.getTree(),
            args = "autoApply autoExpand fuzzy hideExpanders highlight leavesOnly nodata".split(
                " "),
            opts = {},
            filterFunc = $("#branchMode").is(":checked") ? tree.filterBranches : tree.filterNodes,
            match = $(this).val();

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

        $("#btnResetSearch").attr("disabled", false);
        $("span#matches").text("(" + n + " matches)");
    }).focus();

    $("#expand").click(function (e) {
        var tree = $("#tree").fancytree("getTree");

        tree.visit(function (node) {
            node.setExpanded(true);
        });
    });

    $("#collapse").click(function (e) {
        var tree = $("#tree").fancytree("getTree");

        tree.visit(function (node) {
            node.setExpanded(false);
        });
    });

    $("#makeCode").click(function (e) {
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
                    var name = "";
                    name = String(node.data['toc']);
                    if (name.includes(":")) name = '"' + name + '"';
                    isRoot = false;
                    toc += indent + "- name: " + name + newline;
                    if (node.data['href']) toc += indent + "  href: " + node.data['href'] + newline;
                    if (node.data['uid']) toc += indent + "  uid: " + node.data['uid'] + newline;
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
        $("#yamlGenerate").text(JSON.stringify(treeCode, null, 4));
        $("#tocLanguage").val("yaml");
        alert(msgYamlGenerated);
    });

    $("#makeTree").click(function (e) {
        var treeSource = $("#codeText").val();
        var tocJSON = "";
        var clean = true;
        var nativeObject;
        var yamlString;

        switch ($("#tocLanguage").val()) {
            case "yaml":
                try {
                    treeSource = processYaml(treeSource);
                    nativeObject = YAML.parse(treeSource);
                    yamlString = JSON.stringify(nativeObject, null, 4);

                    $("#jsonGenerate").text(yamlString);

                    tocJSON = JSON.parse(yamlString);
                } catch (err) {
                    alert("There was an error with the yaml code." + newline + err + newline + "Please resolve it and try again.");
                    clean = false;
                }
                break;
            case "markdown":
                try {
                    treeSource = processMarkdown(treeSource);
                    console.log("processMarkdown" + newline + treeSource);
                    nativeObject = YAML.parse(treeSource);
                    yamlString = JSON.stringify(nativeObject, null, 4);

                    $("#jsonGenerate").text(yamlString);

                    tocJSON = JSON.parse(yamlString, null, 4);
                } catch (err) {
                    alert("There was an problem with your markdown code." + newline + err + newline + "Please resolve it and try again.");
                    clean = false;
                }
                break;
        }

        if (clean) {
            clearEditFields();
            $("#tree").fancytree("option", "source", tocJSON);
            alert(msgTreeUpdated);
        }

        function processYaml(yaml) {
            var sOut = "";

            var lines = yaml.split(newline);
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].split(":");
                var tmpLine = "";
                for (var j = 1; j <= line.length; j++) {
                    if (line[j]) tmpLine += ((j > 1) ? ":" : "") + line[j];
                }
                var spaces;
                var tmpSpace;
                switch (line[0].trim()) {
                    case "- name":
                        spaces = line[0].split("- name");
                        tmpSpace = spaces[0];
                        sOut += tmpSpace + "- title: " + tmpLine + newline + tmpSpace + "  toc: " + tmpLine + newline;
                        break;
                    case "items":
                        spaces = line[0].split("items");
                        tmpSpace = spaces[0];
                        sOut += tmpSpace + "folder: true" + newline;
                        sOut += tmpSpace + "children: " + newline;
                        break;
                    default:
                        sOut += lines[i] + newline;
                        break;
                }
            }

            return sOut;
        }

        function processMarkdown(markdown) {
            var sOut = "";
            var hashtagCount = 0;
            var lines = markdown.split(newline);

            for (var i = 0; i < lines.length; i++) {
                if (lines[i].substring(0, 1) == "#") {
                    sOut += walkLine(lines[i]);
                }
            }

            function walkLine(inStr) {
                var sOut = "";
                var title = "";
                var href = "";
                var lineArr = inStr.split(" ", 1);
                var titleArr;
                var hrefArr;
                var showItems = false;
                showItems = hashtagCount < (lineArr[0].length - 1);
                hashtagCount = lineArr[0].length - 1;
                spaces = evalIndent(hashtagCount);

                if (inStr.includes("# ") && inStr.includes(" [")) {
                    lineArr = inStr.split("[");
                    titleArr = lineArr[1].split("]");
                    title = titleArr[0] + newline;
                    hrefArr = titleArr[1].split("(");
                    href = spaces + "  href: " + hrefArr[1].substring(0, hrefArr[1].length - 1) + newline;
                } else {
                    title = inStr.replace(lineArr[0] + " ", "") + newline;
                }

                sOut = ((showItems) ? spaces + "folder: true" + newline + spaces + "children: " + newline : "") +
                    spaces + "- title: " + title + spaces + "  toc: " + title +
                    ((href.length > 0) ? href : "");
                return sOut;
            }

            function evalIndent(inStr) {
                var sOut = "";
                var spaces = (inStr) * 2;
                for (var i = 1; i <= spaces; i++) {
                    sOut += " ";
                }
                return sOut;
            }

            return sOut;
        }
    });

    $("#btnResetSearch").click(function (e) {
        var tree = $("#tree").fancytree("getTree");
        $("input[name=search]").val("");
        $("span#matches").text("");
        tree.clearFilter();
    }).attr("disabled", true);
    $("#updateNode").click(function (e) {
        var node = $("#tree").fancytree("getActiveNode");
        node.data['href'] = $("#nodeHref").val();
        node.data['toc'] = $("#nodeTitle").val();
        node.data['uid'] = $("#nodeUid").val();
        node.title = $("#nodeTitle").val() + titleFormat($("#nodeHref").val());

        node.renderTitle();

        updateActiveNode(event.type, node, node.data['toc'], node.data['href'], node.data['uid'], node['expanded']);

    }).attr("disabled", true);

    $("#toggleFolder").click(function (e) {
        var node = $("#tree").fancytree("getActiveNode");
        if (node) {
            node.folder = (node.folder) ? false : true;
            node.render();
        } else {
            alert(missingNodeMsg);
        }
    });

    $("#delete").click(function (e) {
        var activeNode = $("#tree").fancytree("getActiveNode");
        if (activeNode) {
            if (confirm('Are you sure you want to delete this node and all children nodes?')) {
                activeNode.remove();
            }
        } else {
            alert(missingNodeMsg);
        }
    });

    $("#sortTree").click(function (e) {
        var node = $("#tree").fancytree("getRootNode");
        node.sortChildren(null, true);
    });

    $("#sortBranch").click(function (e) {
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

    $("#showHref").click(function (e) {
        manageNodeTitles();
    });

    $("#showHref").prop('checked', true);

    $("#buttonEdit").click(function (e) {
        $("span", this).text("Edit Node [" + (($("#editTopLevel").is(":hidden")) ? "-" : "+") + "]");
        $("#editTopLevel").toggle();
    });

    $("#menu").click(function (e) {
        $("span", this).text("Manage Tree [" + (($("#menuNav").is(":hidden")) ? "-" : "+") + "]");
        $("#menuNav").toggle();
    });

    $("#createNode").click(function (e) {
        $("span", this).text("Create Node [" + (($("#newNode").is(":hidden")) ? "-" : "+") + "]");
        $("#newNode").toggle();
    });

    /* DO I SET FOCUS ON NEW NODE OR KEEP FOCUS ON ACTIVE NODE? */
    $("#addNode").click(function (e) {
        var node = $("#tree").fancytree("getActiveNode");
        if (!node || node === "undefined") node = $("#tree").fancytree("getRootNode");
        node.folder = true;
        node.addChildren({
            title: $("#newNodeTitle").val() + titleFormat($("#newNodeHref").val()),
            toc: $("#newNodeTitle").val(),
            href: $("#newNodeHref").val(),
            uid: $("#newNodeUid").val()
        });

        node.setExpanded();
        node.render();

        clearNewFields();
    });

    $("#activeNode").click(function (e) {
        $("span", this).text("active node [" + (($("#statusLine").is(":hidden")) ? "-" : "+") + "]");
        $("#statusLine").toggle();
    });

    $("#jsonValues").click(function (e) {
        $("span", this).text("tree > code [" + (($("#yamlGenerate").is(":hidden")) ? "-" : "+") + "]");
        $("#yamlGenerate").toggle();
    });

    $("#yamlValues").click(function (e) {
        $("span", this).text("tree < code [" + (($("#jsonGenerate").is(":hidden")) ? "-" : "+") + "]");
        $("#jsonGenerate").toggle();
    });
});