//
// SearchBuilder -- see <https://github.com/kengruven/search-builder> for more information.
//
(function ($) {
    $.fn.searchbuilder = function(spec, options) {
        var config = {  // defaults
            when: "change",
            nesting: true
        };
        if (options) {
            $.extend(config, options);
        }
        $(this).data("options", config);

        // add logical groupings
        var spec2 = spec;
        if (config['nesting']) {
            spec2 = spec2.concat([
                {label: "Logic Groupings", type: "grouping"},
                {key: "and", label: "All of...", type: "branch"},
                {key: "or", label: "Any of...", type: "branch"},
                {key: "not", label: "None of...", type: "branch"}
            ]);
        }

        // save the user's spec in my "spec" data slot
        $(this).data("spec", spec2);

        // add a header bar, with a message, and an initial "+" button
        var headerBar = $("<div/>").attr({"class": "header"}).appendTo(this);
        var topLabel = $("<label/>").text("Find all items where:").appendTo(headerBar);

        // add a container for putting the criteria
        var criteriaDiv = $("<div/>").attr({"class": "criteria"}).appendTo(this);

        // add an initial criterion, so the user has something to start with
        appendCriterion(criteriaDiv);

        return this;
    };

    function values_for_criteria(criteria) {
        return criteria.map(function(i, criterionDiv) {
            var key = $(criterionDiv).children("div.row").find("select.variable :selected").val();
            var editor = $(criterionDiv).children("div.row").children("span.editor");

            var value = editor.data("read")();
            value.key = key;
            return value;
        }).get();
    }

    // walk a div.searchbuilder tree, and collect all the variables and their ops/values, and return a JS tree.
    $.fn.searchbuilder_tree = function() {
        var criteria = $(this).find("div.criteria > div.criterion");  // toplevel criteria
        var result = values_for_criteria(criteria);

        // give the user a top-level AND, to be consistent
        return {key: "and", children: result};
    };

    // build a <select> popup for all of the user's requested variables, and return it.
    function buildPopup(spec) {
        var popup = $("<select/>").attr({"class": "variable"});

        var container = popup;  // what to add options to -- by default, the <select>, but it could be an <optgroup>
        $.each(spec, function(i, variable) {
            if (variable.type === "grouping") {
                // a grouping: {label: "My Heading", type: "grouping"}
                container = $("<optgroup/>").attr({"label": variable.label}).appendTo(popup);  // can't nest optgroups
            } else {
                // an option: {label: "My Variable", type: "integer", key: "my_var"}
                $("<option/>").attr({"value": variable.key}).text(variable.label).appendTo(container);
            }
        });

        return popup;
    }

    function createStringEditor(params) {
        var editor = $("<span/>").attr({"class": "editor string"});

        editor.append(" ");

        var popup = $("<select/>").attr({"class": "stringops"}).appendTo(editor);
        $.each([{label: "contains", key: "contains"},
                {label: "starts with", key: "starts"},
                {label: "ends with", key: "ends"},
                {label: "is exactly", key: "exactly"}], function(i, op) {
                    $("<option/>").attr({"value": op.key}).text(op.label).appendTo(popup);
                });

        editor.append(" ");

        var field = $("<input/>").attr({"class": "value"}).appendTo(editor);

        editor.append(" ");

        var caseLabel = $("<label/>");
        var caseCheck = $("<input/>").attr({"class": "case_sensitive", "type": "checkbox"});
        caseLabel.append(caseCheck);
        caseLabel.append("Match case");
        caseLabel.appendTo(editor);

        editor.data("read", function() {
            return {"comparison": $(editor).find("select.stringops :selected").val(),
                    "value": $(editor).find("input.value").val(),
                    "case_sensitive": $(editor).find("input.case_sensitive").is(":checked")};
        });

        return editor;
    }

    function createEnumEditor(params) {
        var editor = $("<span/>").attr({"class": "editor enum"});
        $("<label/>").text(" is ").appendTo(editor);

        var popup = $("<select/>").attr({"class": "choices"}).appendTo(editor);
        $.each(params.choices, function(i, choice) {
            $("<option/>").attr({"value": choice}).text(choice).appendTo(popup);
        });

        editor.data("read", function() {
            return {"value": $(editor).find("select.choices :selected").val()};
        });

        return editor;
    }

    function createIntegerEditor(params) {
        var editor = $("<span/>").attr({"class": "editor integer"});

        editor.append(" ");

        var popup = $("<select/>").attr({"class": "comparison"}).appendTo(editor);
        $.each([{label: "=", key: "eq"},
                {label: "≠", key: "ne"},
                {label: ">", key: "gt"},
                {label: "≥", key: "ge"},
                {label: "<", key: "lt"},
                {label: "≤", key: "le"}], function(i, op) {
                    $("<option/>").attr({"value": op.key}).text(op.label).appendTo(popup);
                });

        editor.append(" ");

        var field = $("<input/>").attr({"class": "value", "pattern": "-?\\d+"}).appendTo(editor);

        editor.data("read", function() {
            return {"comparison": $(editor).find("select.comparison :selected").val(),
                    "value": $(editor).find("input.value").val()};
        });

        return editor;
    }

    function createBranchEditor(params) {
        var editor = $("<span/>").attr({"class": "editor branch"});

        editor.data("read", function() {
            var criterionDivs = $(editor).parent("div.row").siblings("div.criterion");
            var childValues = values_for_criteria(criterionDivs);
            return {children: childValues};
        });

        return editor;
    }

    // TO ADD A NEW TYPE:
    // - make a create*Editor(params) method
    // - it should make a span.editor
    // - it should have a jquery .data("read"), which is a function to call (with no parameters) to get a JS object out
    // - params is the 'params' key in the user's spec (can be any type-specific crap you want)
    // - add it to var editorsByType

    // parent_node (required) is the DOM node to insert the new div.criterion into.
    // after_node (optional) is the DOM node of the div.criterion where the user clicked "+",
    // so the new criterion will be inserted directly after this.  if not specified, the new
    // criterion will go at the end.
    function appendCriterion(parent_node, after_node) {
        var sb_div = parent_node.parents("div.searchbuilder");

        var criterionDiv = $("<div/>").attr({"class": "criterion"});
        var rowDiv = $("<div/>").attr({"class": "row"}).appendTo(criterionDiv);

        // compute new depth, from parent
        var parent_depth = $(parent_node).data("depth");
        if (typeof parent_depth === 'undefined') {
            parent_depth = -1;
        }
        var depth = parent_depth + 1;
        $(criterionDiv).data("depth", depth);
        $(rowDiv).css("padding-left", (0.5 + 2 * depth) + "em");
        $(rowDiv).css("padding-right", "0.5em");

        // popup for variable
        var popup = buildPopup($(sb_div).data("spec"));
        rowDiv.append(popup);
        popup.change(function(event) {
            // the user changed the variable popup, so we need to rebuild the editor.

            var criterionDiv = $(event.currentTarget).parent("div.row").parent("div.criterion");

            // figure out what variable was selected
            var variable = criterionDiv.children("div.row").find("select.variable :selected").val();
            var spec_items = $.grep(sb_div.data("spec"), function(spec_item, i) {
                return spec_item.key == variable;
            });
            var type = spec_items[0].type;
            var params = spec_items[0].params;

            // are we changing from one 'branch' to another?  (e.g., AND to OR)  if so, do nothing at all.
            if ($(criterionDiv).hasClass("branch") && type === "branch") {
                return;
            }

            // are we changing to a branch, from a non-branch?  then add a default criterion.
            var shouldAddStarterCriterion = (!$(criterionDiv).hasClass("branch") && type === "branch");

            // are we changing from a branch, to a non-branch?  then kill all children.
            if ($(criterionDiv).hasClass("branch") && type !== "branch") {
                $(criterionDiv).children("div.criterion").remove();
            }

            // remove old editor
            criterionDiv.find("span.editor").remove();

            // update the parent class to "branch"/"leaf"
            criterionDiv.removeClass("leaf").removeClass("branch").addClass(type == "branch" ? "branch" : "leaf");

            // create new editor based on the variable
            var editorsByType = {"string": createStringEditor,
                                 "enum": createEnumEditor,
                                 "integer": createIntegerEditor,
                                 "branch": createBranchEditor};
            var editorMaker = editorsByType[type];
            if (editorMaker === undefined) {
                if (window.console && console.log) {
                    console.log("variable '" + variable + "' has type '" + type + "', but no such type exists");
                }
                return;
            }
            var editor = editorMaker(params);
            editor.appendTo(rowDiv);

            editor.find("input:text").focus();  // focus first text field of editor

            if (shouldAddStarterCriterion) {
                appendCriterion(criterionDiv);
            }

            // trigger whenever any value changes anywhere
            var trigger = function(event) {
                $(event.currentTarget).parents("div.searchbuilder").trigger("searchchanged");
            };
            editor.find("input, select").on($(sb_div).data("options")["when"], trigger);
            if ($(sb_div).data("options")["when"] == 'input') {
                editor.find("input, select").on('change', trigger);  // still need 'change' for popups and checkboxes
            }
        });

        // add the editor (as if you had changed the popup)
        popup.trigger("change");

        // add +/- buttons, at right edge
        var addButton = $("<button/>").text("+").attr({"class": "addremove"}).click(function(event) {
            var button = event.currentTarget;

            // make a new sibling next to it
            var parentNode = $(button).parent("div.row").parent("div.criterion").parent();  // either div.criterion.branch or div.criteria
            var myNode = $(button).parent("div.row").parent("div.criterion");
            appendCriterion(parentNode, myNode);
        }).appendTo(rowDiv);
        var remButton = $("<button/>").text("-").attr({"class": "addremove"}).click(function(event) {
            var container = $(event.currentTarget).parent("div.row").parent("div.criterion").parent();  // container for them, whatever it is
            var isLastOne = (container.children("div.criterion").length === 1);

            $(event.currentTarget).parent("div.row").parent("div.criterion").remove();

            if (isLastOne) {
                var message = $("<div/>").attr({"class": "emptymessage"}).text("No criteria here!  This will match every item.").append(" ").appendTo(container);
                $("<button/>").text("+ Add one now").click(function(event) {
                    $(event.currentTarget).parent("div.emptymessage").remove();
                    appendCriterion(container);
                }).appendTo(message);
            }

            $(sb_div).trigger("searchchanged");
        }).appendTo(rowDiv);

        if (after_node) {
            after_node.after(criterionDiv);
        } else {
            parent_node.append(criterionDiv);
        }
        
        // tell observers that the search changed
        $(sb_div).trigger("searchchanged");

        // also trigger whenever the 'variable' popup changes
        popup.change(function() {
            $(sb_div).trigger("searchchanged");
        });
    }

}(jQuery));
