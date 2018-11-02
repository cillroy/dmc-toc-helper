var newline = "\n";
var missingNodeMsg = "No node selected!" + newline + "Please select a node and try again.";
var msgYamlGenerated = "Table of Contents yaml code was generated." + newline + newline + "You will need to save this as a .yml file.";
var msgTreeUpdated = "Table of Content updated from code";
var codeTextDefaultText = "Please enter your docs table of content here...";
var metaDataTemplate = 'metadata:' + newline + '  experimental: experiment_checkbox' + newline + '  experiment_id: "experiment_value"' + newline + 'items:' + newline;
var jsonSource = [{
        title: "Node 1",
        toc: "Node 1",
        displayName: "node.1",
        href: "node1.md",
        uid: "uid1",
        tocHref: "/",
        topicHref: "/",
        maintainContext: true
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

function updateActiveNode(event, node, toc, href, uid, expanded, displayName, tocHref, topicHref, maintainContext) {
    $("#statusLine").text("event.type: " + event +
        newline + "data.node: " + node +
        newline + "data.node.data['displayName']: " + displayName +
        newline + "data.node.data['toc']: " + toc +
        newline + "data.node.data['maintainContext']: " + maintainContext +
        newline + "data.node.data['href']: " + href +
        newline + "data.node.data['uid']: " + uid +
        newline + "data.node.data['tocHref']: " + tocHref +
        newline + "data.node.data['topicHref']: " + topicHref +
        newline + "data.node['expanded']:" + expanded);
}

function clearExperimentFields() {
    $('#experiment_checkbox')[0].checked = false;
    $('#experiment_id').val("");
}

function clearEditFields() {
    $("#nodeTitle").val("");
    $("#nodeSearch").val("");
    $("#nodeHref").val("");
    $("#nodeUid").val("");
    $("#nodeToCHref").val("");
    $("#nodeTopicHref").val("");
    $("#nodeMaintainContext")[0].checked = false;
}

function clearNewFields() {
    $("#newNodeTitle").val("");
    $("#newNodeSearch").val("");
    $("#newNodeHref").val("");
    $("#newNodeUid").val("");
    $("#newNodeToCHref").val("");
    $("#newNodeTopicHref").val("");
    $("#nodeMaintainContext")[0].checked = false;
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
        clearExperimentFields();
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
        var experimentDepth = 0;

        toc = evalExperiment();

        $.each(treeCode, function (key, val) {
            recursiveFunction(key, val);
        });

        var tmpExpand = "";
        var isRoot = true;

        function evalExperiment() {
            strOut = "";
            if ($('#experiment_checkbox')[0].checked || $('#experiment_id').val().trim().length > 0) {
                experimentDepth = 2;
                strOut = metaDataTemplate.replace("experiment_checkbox", $('#experiment_checkbox')[0].checked);
                strOut = strOut.replace("experiment_value", $('#experiment_id').val());
            }
            return strOut;
        }

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
                    if (node.data['displayName']) toc += indent + "  displayName: " + node.data['displayName'] + newline;
                    if (node.data['href']) toc += indent + "  href: " + node.data['href'] + newline;
                    if (node.data['maintainContext']) toc += indent + "  maintainContext: " + node.data['maintainContext'] + newline;
                    if (node.data['uid']) toc += indent + "  uid: " + node.data['uid'] + newline;
                    if (node.data['tocHref']) toc += indent + "  tocHref: " + node.data['tocHref'] + newline;
                    if (node.data['topicHref']) toc += indent + "  topicHref: " + node.data['topicHref'] + newline;
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
            for (var i = 0; i < count + experimentDepth; i++) strOut += "  ";
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

        clearExperimentFields();

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
                    case "experimental":
                        $('#experiment_checkbox')[0].checked = (tmpLine.trim() == 'true');
                        break;
                    case "experiment_id":
                        $('#experiment_id').val(tmpLine.trim().substring(1, tmpLine.trim().length - 1));
                        break;
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
                    //href = spaces + "  href: " + hrefArr[1].substring(0, hrefArr[1].length - 1) + newline;
                    href = spaces + "  " + evalHref(hrefArr[1].substring(0, hrefArr[1].length - 1)) + newline;
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

            function evalHref(inStr) {
                var sOut = "";
                if (inStr.toLowerCase().substring(0, 4) === "xref") {
                    var splitXref = inStr.split(":");
                    sOut = "uid: " + splitXref[1];
                    console.log("uid found: " + sOut);
                } else {
                    sOut = "href: " + inStr;
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
        node.data['toc'] = $("#nodeTitle").val();
        node.data['displayName'] = $('#nodeSearch').val();
        node.data['href'] = $("#nodeHref").val();
        node.data['uid'] = $("#nodeUid").val();
        node.data['tocHref'] = $("#nodeToCHref").val();
        node.data['topicHref'] = $("#nodeTopicHref").val();
        node.title = $("#nodeTitle").val() + titleFormat($("#nodeHref").val());
        node.data['maintainContext'] = $('#nodeMaintainContext')[0].checked;

        node.renderTitle();

        updateActiveNode(e.type, node, node.data['toc'], node.data['href'], node.data['uid'], node['expanded'], node.data['displayName'], node.data['tocHref'], node.data['topicHref'], node.data['maintainContext']);

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
            displayName: $("#newNodeSearch").val(),
            href: $("#newNodeHref").val(),
            uid: $("#newNodeUid").val(),
            tocHref: $("#newNodeToCHref").val(),
            topicHref: $("#newNodeTopicHref").val(),
            maintainContext: $("#newNodeMaintainContext")[0].checked,
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