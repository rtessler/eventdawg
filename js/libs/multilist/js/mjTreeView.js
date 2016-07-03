$(document).ready(function () {

    (function ($) {

        var mjTreeView = {

            _init: function (options, el) {

                var default_settings = {
                    data: null,
                    image_path: "images/",
                    type: "checkbox",       // image or checkbox
                    expand_selected: false, // if true show subitems for selected nodes
                    animated: true,         // if true nodes animate when opening and closing
                    recursive: true,         // if true selecting a node selects all child nodes and their parents
                    has_hierarchy: false,     // if true, data is already hierarchly defined (each node has a items element if it has children)
                    filter: false
                };

                // node data structure

                // {id: int, mandatory
                // pid: int optional, if pid is null its a root node with no parent
                // text: string optional
                // image: string optional
                // selected: 0|1|2, 0 is not selected, 1 is selected, 2 is half ticked
                // disabled: true or false optional

                this.settings = $.extend({}, default_settings, options);

                // if the filter is enabled we need to save the original data before we filter it out

                if (this.settings.filter)
                    this._copyData();

                if (!this.settings.has_hierarchy) {
                    this._fixData();                      // turn undefined text and selected into values
                    this._buildHierarchy();               // create hierarchy
                }
                else {
                    this._setParents(this.settings.data, null);
                    var output = [];
                    this._createNodeMap(this.settings.data, output);
                    this.settings.data = output;
                    this._fixData();
                }

                this.save();      // save original data so we can tell if comething has changed

                this.el = el;
                this.$el = $(el);

                // plugin have been applied previously
                // blow away any existing instance

                this.close();

                this._render();
                this._startListening();
            },

            _copyData: function()
            {
                this.original_data = $.map(this.settings.data, function (obj) {
                    return $.extend(true, {}, obj);
                });
            },

            _fixParent: function(o)
            {
                // if element is selected
                // make sure parent is selected

                if (o.selected == 1 && o.pid != null) {

                    // find the parent

                    for (var i = 0, len = this.settings.data.length; i < len; i++) {
                            
                        var q = this.settings.data[i];

                        if (q.id == o.pid && q.selected == 0) {
                            q.selected = 1;
                            this._fixParent(q);
                            break;
                        }
                    }
                }
            },

            _fixData: function()
            {
                // go through data adding text and selected fields where necessary

                for (var i = 0, len = this.settings.data.length; i < len; i++) {

                    var o = this.settings.data[i];

                    if (o.id === undefined) {
                        this._message("mjTreeView.fixData: treeview data contains a node with no id");      // fatal error
                        return;
                    }

                    if (o.pid === undefined)                    
                        o.pid = null;

                    if (o.text === undefined)
                        o.text = "";

                    if (o.selected === undefined)
                        o.selected = 0;

                    this._fixParent(o);
                }
            },

       

            _startListening: function () {

                var self = this;

                // we may be recreating the plugin for the second time
                // if we do not stop listening to events on the element we get strange behaviour

                this._stopListening();

                this.$el.on("click", ".mj-treeview .mj-item:has(.mj-treeview) > .mj-expander", function (e) {

                    // expand/collapse	

                    //var id = $(this).parent().find(".mj-content").attr("nodeid");
                    //var o = self.getData(id);

                    var o = $(this).parent().find(".mj-content").data("d");

                    if ($(this).parent().find(".mj-treeview").is(":visible")) {
                        // collapse

                        $(this).removeClass("mj-open").addClass("mj-closed");
                        self.$el.trigger("collapse", o);
                    }
                    else {
                        // expand

                        $(this).removeClass("mj-closed").addClass("mj-open");
                        self.$el.trigger("expand", o);
                    }

                    if (self.settings.animated)
                        $(this).parent().find(".mj-treeview").first().slideToggle(50);
                    else
                        $(this).parent().find(".mj-treeview").first().slideToggle(0);
                });

                this.$el.find("click", ".mj-treeview .mj-item .mj-content").unbind('click');

                this.$el.on("click", ".mj-treeview .mj-item .mj-content", function (e) {

                    e.preventDefault();

                    //var id = $(e.currentTarget).attr("nodeid");
                    //var o = self.getData(id);

                    var o = $(e.currentTarget).data("d");                    

                    if (o) {

                        if (o.disabled)
                            return;

                        if (o.selected == 1) {
                            self.deselect(o.id);
                            self.$el.trigger("select", o);
                        }
                        else {
                            self.select(o.id);
                            self.$el.trigger("select", o);
                        }
                    }
                    else {
                        self._message("mjTreeView: node click: node " + id + " not found");
                    }
                });

                if (this.settings.filter) {

                    this.$el.on("keyup", ".mj-treeview-container .searchbox-container .searchbox", function (e) {

                        e.preventDefault();

                        var str = self.$el.find(".mj-treeview-container .searchbox-container .searchbox").val();

                        self._filter(str);
                    });
                }
            },

            _stopListening: function()
            {
                this.$el.off();
            },

            _buildHierarchy: function()
            {
                var self = this;

                // build the hierarchy
                // add array of child nodes (items) to each node

                $.each(this.settings.data, function (index, o) {

                    // destroy any existing hierarchy

                    o.items = null;
                });

                $.each(this.settings.data, function (index, o) {

                    if (o.pid != undefined && o.pid != null) {                        

                        var p = self.getData(o.pid);        // get parent

                        if (p) {

                            if (!p.items)
                               p.items = [];

                            p.items.push(o);             
                        }
                        else {
                            // parent does not exists
                            // error in data or node appears before its parent

                            $.error("mjTreeView.buildHierarchy: error in data, parent node " + o.pid + " not found.");
                        }
                    }
                });
            },

            _setParents: function(data, pid)
            {
                var self = this;
            
                // set the pid element for each node

                $.each(data, function (index, o) {

                    o.pid = pid;

                    if (o.items && o.items.length > 0)
                        self._setParents(o.items, o.id);                    
                });
            },

            _createNodeMap: function (data, output) {

                // this flattens the hierarchy into a normal node array

                var self = this;

                // set the pid element for each node

                $.each(data, function (index, o) {

                    output.push(o);

                    if (o.items && o.items.length > 0)
                        self._createNodeMap(o.items, output);
                });
            },
/*
            _buildNodeHTML: function (o) {

                // makes a leaf node

                var c = "mj-content ";

                if (o.disabled)
                    c += "disabled ";

                // cant be selected and and disabled

                if (o.selected == 1 && !o.disabled)
                    c += "selected ";

                var str = "<div class='" + c + "' nodeid='" + o.id + "' >";

                switch (this.settings.type) {

                    case "checkbox":

                        str += "<div class='mj-cell'>";
                        str += "<div class='mj-checkbox'></div>";
                        str += "</div>";
                        break;

                    case "radiobutton":

                        str += "<div class='mj-cell'>";
                        str += "<div class='mj-radio'><div class='mj-dot'></div></div>";
                        str += "</div>";
                        break;
                }

                if (o.image) {

                    str += "<div class='mj-cell'>";
                    str += "<img class='mj-image ' src='" + this.settings.image_path + o.image + "' />";
                    str += "</div>";
                }

                var text = (o.text == undefined) ? "" : o.text;

                str += "<div class='mj-cell'>";
                str += "<span class='mj-text'>" + text + "</span></div>";
                str += "</div>";

                return str;
            },

            _buildHTML: function (items, level) {

                // build a string which can be inserted into the DOM

                var self = this;
                var output = "";

                // this loop to needs to be fast

                $.each(items, function (index, o) {

                    o.level = level;

                    var str = self._buildNodeHTML(o);

                    if (o.items && o.items.length > 0) {

                        // has child items

                        if (self.settings.expand_selected && o.selected == 1) {

                            str = "<div class='expand mj-open'></div>" + str;
                            str += "<div class='clear'></div>";
                            str += "<ul class='mj-treeview'>";

                        }
                        else {

                            str = "<div class='expand mj-closed'></div>" + str;
                            str += "<div class='clear'></div>";
                            str += "<ul class='mj-treeview' style='display:none'>";        // child node are closed by default

                        }
                        
                        str += self._buildHTML(o.items, level+1);

                        str += "</ul>"
                    }
                    else {
                        // leaf node

                        if ((o.pid == undefined || o.pid == null) && (!o.items || o.items.length == 0))
                        {
                            // root node with no children

                            str = "<div class='treeview-spacer'></div>" + str;
                        }
                    }

                    var li = "<li class='mj-item'>" + str + "</li>";

                    output += li;
                });

                return output;
            },

            _render: function () {

                var rootnodes = [];

                $.each(this.settings.data, function (index, o) {

                    if (o.pid == undefined || o.pid == null) {
                        rootnodes.push(o);
                    }
                });

                var output = "<div class='mj-treeview-container'>";
                output += "<div class='the-tree'>";
                output += "<ul class='mj-treeview '>" + this._buildHTML(rootnodes, 0) + "</ul>";
                output += "</div>";

                if (this.settings.filter) {

                    // add on a filter box

                    output += "<div class='filter-box'>";
                    output += " <div class='searchbox-container'>";
                    output += "  <input class='searchbox' />";        // on ipad we autofocus cases the keyboard to appear
                    output += " </div>";
                    output += " <div class='search-btn'></div>";
                    output += "</div>";
                }

                output += "</div>";

                this.$el.html(output);

                if (this.settings.filter) {

                    // leave space for the filter

                    this.$el.find(".mj-treeview-container .the-tree").css("bottom", "36px");
                }

                return this;
            },
*/
            _buildItemHTML: function (o) {

                var c = "mj-content ";

                if (o.disabled)
                    c += "disabled ";

                // cant be selected and and disabled

                if (o.selected == 1 && !o.disabled)
                    c += "selected ";

                var e = $("<div>", { class: c, nodeid: o.id });
                
                switch (this.settings.type) {

                    case "checkbox":

                        var str = "<div class='mj-cell'>";
                        str += "<div class='mj-checkbox'>";
                        str += "</div>";

                        e.append(str);

                        break;

                    case "radiobutton":

                        var str = "<div class='mj-cell'>";
                        str += "<div class='mj-radio'><div class='mj-dot'></div></div>";
                        str += "</div>";

                        e.append(str);
                        break;
                }                

                if (o.image) {

                    var str = "<div class='mj-cell'>";
                    str += "<img class='mj-image ' src='" + this.settings.image_path + o.image + "' />";
                    str += "</div>";

                    e.append(str);
                }

                var text = (o.text == undefined) ? "" : o.text;

                var str = "<div class='mj-cell'>";
                str += "<span class='mj-text'>" + text + "</span></div>";
                str += "</div>";

                e.append(str);

                e.data("d", o);

                return e;
            },

            _buildListHTML: function (items, level) {

                // build a string which can be inserted into the DOM

                var self = this;

                // start a new list

                var e = $("<ul>", {class: 'mj-treeview'});

                // this loop to needs to be fast

                //$.each(items, function (index, o) {
                for (var j = 0; j < items.length; j++) {

                    var o = items[j];

                    o.level = level;

                    // start a new item

                    var i = $("<li>", { class: 'mj-item' });

                    var x = self._buildItemHTML(o);

                    if (o.items && o.items.length > 0) {

                        // has child items

                        var new_list = self._buildListHTML(o.items, level + 1);

                        if (self.settings.expand_selected && o.selected == 1) {

                            i.append("<div class='mj-expander mj-open'></div>");
                            i.append(x);
                            i.append("<div class='clear'></div>");

                        }
                        else {

                            i.append("<div class='mj-expander mj-closed'></div>");
                            i.append(x);
                            i.append("<div class='clear'></div>");
                            new_list.css("display", "none");        // child node are closed by default
                        }

                        i.append(new_list);
                    }
                    else {

                        // leaf node
                        // root node with no children

                        i.append("<div class='treeview-spacer'></div>");
                        i.append(x);
                    }

                    e.append(i);
                    //});
                }

                return e;
            },

            _render: function () {

                var rootnodes = [];

                $.each(this.settings.data, function (index, o) {

                    if (o.pid == undefined || o.pid == null) {
                        rootnodes.push(o);
                    }
                });
                
                var a = $("<div>", {class: 'mj-treeview-container' });
                var b = $("<div>", {class: 'the-tree'});
                var c = this._buildListHTML(rootnodes, 0);

                b.html(c);
                a.html(b);

                if (this.settings.filter) {

                    // add on a filter box

                    var str = "<div class='filter-box'>";
                    str += " <div class='searchbox-container'>";
                    str += "  <input class='searchbox' />";        // on ipad we autofocus cases the keyboard to appear
                    str += " </div>";
                    str += " <div class='search-btn'></div>";
                    str += "</div>";

                    a.append(str);
                }

                this.$el.html(a);

                if (this.settings.filter) {

                    // leave space for the filter

                    this.$el.find(".mj-treeview-container .the-tree").css("bottom", "36px");
                }

                return this;
            },

            _message: function (msg) {

                if (window.console && window.console.log)
                    console.log(msg);
            },

            _filter: function (str) {

                var self = this;

                str = str.toLowerCase();

                for (var i = 0; i < this.original_data.length; i++) {
                
                    var o = this.original_data[i];

                    o.visible = false;
                }

                for (var i = 0; i < this.original_data.length; i++) {

                    var o = this.original_data[i];

                    if (o.text.toLowerCase().indexOf(str) >= 0) {

                        o.visible = true;

                        // need to display parents of any matching node

                        var node = o;                        
                        var parent = null;
                        
                        do {

                            parent = null;

                            if (node.id != null && node.pid != null) {

                                for (var j = 0; j < this.original_data.length; j++) {

                                    var x = this.original_data[j];

                                    if (x.id == node.pid) {
                                        parent = x;
                                        break;
                                    }
                                }
                            }

                            if (parent) {
                                parent.visible = true;
                                node = parent;
                            }

                        }
                        while (parent != null);

                    }
                }

                var data2 = [];

                for (var i = 0; i < this.original_data.length; i++) {

                    var o = this.original_data[i];

                    if (o.visible)
                        data2.push(o);
                }

                // replace the data

                this.settings.data = data2;

                //console.log(str + " found " + this.settings.data.length + " matching nodes");
                
                //if (!this.settings.has_hierarchy) {

                    for (var i = 0; i < this.settings.data.length; i++) {
                        var o = this.settings.data[i];

                        o.items = [];
                    }

                    this._fixData();                      // turn undefined text and selected into values

                    this._buildHierarchy();               // create hierarchy
                //}
                //else {

                //    this._setParents(this.settings.data, null);
                //    var output = [];
                //    this._createNodeMap(this.settings.data, output);
                //    this.settings.data = output;
                //    this._fixData();
                //}

                var rootnodes = [];

                $.each(this.settings.data, function (index, o) {

                    if (o.pid == undefined || o.pid == null) {
                        rootnodes.push(o);
                    }
                });

                this.$el.find(".the-tree").html("<ul class='mj-treeview '>" + this._buildHTML(rootnodes, 0) + "</ul>");
            },

            _getElement: function (id) {

                //return this.$el.find(".mj-treeview .mj-item .mj-content[nodeid='" + id + "']");

                return this.$el.find(".mj-treeview .mj-item .mj-content").filter(
                    function () { return $(this).data("d").id == id; }
                );
            },

            //----------------------------------------------------------------------------
            // public interface
            //----------------------------------------------------------------------------

            save: function () {

                // save selected value in original

                this.original = [];

                for (var i = 0, len = this.settings.data.length; i < len; i++) {
                    var d = this.settings.data[i];
                    this.original.push(d.selected);
                }
            },

            getData: function (id) {

                // find node by id in original data

                if (id == undefined || id == null)
                    return null;

                // cant break out of $.each, use normal for statement

                for (var i = 0, len = this.settings.data.length; i < len; i++) {

                    var o = this.settings.data[i];

                    if (o.id == id)
                        return o;
                }

                return null;
            },

            hasChanged: function () {

                for (var i = 0, len = this.settings.data.length; i < len; i++) {

                    var a = this.settings.data[i];
                    var b = this.original[i];

                    if (a.selected != b) {
                        //this._message("treeview:changed " + a.selected + " " + b);
                        return true;
                    }
                }

                //this._message("treeview:not changed");

                return false;
            },

            selectParent: function(id)
            {                
                var o = this.getData(id);

                if (o)
                {

                    if (o.pid != undefined && o.pid != null)
                    {
                        //var p = this.$el.find(".mj-treeview .mj-item .mj-content[nodeid='" + o.pid + "']");
                        var p = this._getElement(o.pid);

                        o = this.getData(o.pid);
                                        
                        if (o)
                        {
                            //this._message("selectparent: text = " + o.text + " nodes found " + p.length);
                            p.addClass("selected").removeClass("half-selected");
                            o.selected = 1;
                            this.selectParent(o.id);        // recursive
                        }
                    }
                }
                else
                {
                    $.error("treeview.selectParent: node " + id + " not found");
                }            
            },

            select: function (id) {

                var self = this;
                var o = this.getData(id);

                if (o) {

                    //var e = this.$el.find(".mj-treeview .mj-item .mj-content[nodeid='" + id + "']");
                    var e = this._getElement(id);

                    if (e) {

                        o.selected = 1;

                        e.addClass("selected").removeClass("half-selected");

                        if (this.settings.recursive) {

                            // select all parents of this node

                            this.selectParent(o.id);

                            // select the children of this node

                            if (o.items) {

                                $.each(o.items, function (index, n) {
                                    self.select(n.id);
                                });
                            }
                        }
                    }
                }
                else {
                    this._message("mjTreeView.select: node " + id + " not found");
                }
            },

            deselect: function (id) {

                var self = this;
                var o = this.getData(id);

                if (o) {
                    //var e = this.$el.find(".mj-treeview .mj-item .mj-content[nodeid='" + id + "']");
                    var e = this._getElement(id);

                    o.selected = 0;
                    e.removeClass("selected").removeClass("half-selected");

                    // deselect children of this node
                    // always do this, ignore settings.recursive, doesnt make sense to not deselect children
                    
                    if (o.items) {

                        $.each(o.items, function (index, n) {
                            self.deselect(n.id);
                        });
                    }
                }
                else {
                    this._message("mjTreeView.deselect: node " + id + " not found");
                }
            },

            disable: function (id, state) {

                var o = this.getData(id);

                if (o) {
                    o.disabled = state;

                    //var e = this.$el.find(".mj-treeview .mj-item .mj-content[nodeid='" + id + "']");
                    var e = this._getElement(id);

                    if (state)
                        e.addClass("disabled");
                    else
                        e.removeClass("disabled");
                }
            },

            halfTick: function (id) {

                var o = this.getData(id);

                if (o) {
                    //var e = this.$el.find(".mj-treeview .mj-item .mj-content[nodeid='" + id + "']");
                    var e = this._getElement(id);

                    this.deselect(id);

                    o.selected = 2;

                    e.removeClass("selected").addClass("half-selected");
                }
                else {
                    this._message("mjTreeView.halfTick: node " + id + " not found");
                }
            },

            getSelected: function () {

                var arr = [];

                $.each(this.settings.data, function (index, o) {

                    if (o.selected == 1)
                        arr.push(o);
                });

                return arr;
            },

            isSelected: function (id) {

                var o = this.getData(id);

                if (o)
                    return (o.selected == 1);

                return false;
            },

            selectAll: function () {

                // dont call select for every node, too slow

                $.each(this.settings.data, function (index, o) {
                    o.selected = 1;
                });

                this.$el.find(".mj-treeview .mj-item .mj-content").addClass("selected").removeClass("half-selected");
            },

            deselectAll: function () {

                // dont call deselect for every node, too slow

                $.each(this.settings.data, function (index, o) {
                    o.selected = 0;
                });

                this.$el.find(".mj-treeview .mj-item .mj-content").removeClass("selected").removeClass("half-selected");
            },

            halfTickAll: function () {

                // dont call halfTick for every node, too slow

                $.each(this.settings.data, function (index, o) {
                    o.selected = 2;
                });

                this.$el.find(".mj-treeview .mj-item .mj-content").removeClass("selected").addClass("half-selected");
            },

            deselectHalfTicked: function () {

                // dont call halfTick for every node, too slow
                // deselect all nodes which are half ticked

                $.each(this.settings.data, function (index, o) {

                    if (o.selected == 2)
                        o.selected = 0;
                });

                this.$el.find(".mj-treeview .mj-item .mj-content.half-selected").removeClass("half-selected");
            },

            getAll: function()
            {
                return this.settings.data;
            },

            isRootNode: function(id)
            {
                var o = this.getData(id);

                if (!o)
                    return false;

                if (o.pid == undefined || o.pid == null)
                    return true;

                return false;
            },

            getSiblings: function (id) {

                var self = this;

                var n = this.getData(id);

                var siblings = [];

                if (!n)
                    return siblings; 

                if (n) {
                    $.each(this.settings.data, function (index, o) {

                        // both root nodes or same parent

                        if ((o.pid == n.pid || (self.isRootNode(o.id) && self.isRootNode(n.id))) && o.id != n.id)
                            siblings.push(o);
                    });
                }

                return siblings;
            },

            insert: function(id, data)
            {
                var e = this._getElement(id);

                if (e) {

                    this.settings.data.push(data);
                    var o = this._buildItemHTML(data);
                    o.data(data);

                    e.parent().append(o);
                }
            },

            update: function(data)
            {
                var e = this._getElement(data.id);

                if (e) {

                    var o = this._buildItemHTML(data);
                    o.data(data);
                    e.html(o);
                }
            },

            remove: function(id)
            {
                // remove a single node

                if (this.settings.data.length == 0)
                    return;

                var index = 0;
                var len = this.settings.data.length;

                for (; index < len; index++) {

                    var o = this.settings.data[index];

                    if (o.id == id)
                        break;
                }

                if (index >= len)
                    return;

                var e = this._getElement(id);

                if (!e || e.length == 0)
                    return;

                this.settings.data.splice(index, 1);

                e.parent().remove();        // remove the li
            },

            refill: function(data)
            {
                // change entire contents of list

                this._stopListening();
                this.settings.data = data;
                this.save();
                this._buildHierarchy();
                this._render();
                this._startListening();
            },

            expand: function(id)
            {
                var o = this.getData(id);

                if (!o || !o.items)
                    return;

                var e = this._getElement(id);

                if (!e.prev().hasClass("mj-closed"))
                    return;     // already expanded

                e.prev().removeClass("mj-closed").addClass("mj-open");
                //this.$el.trigger("expand", o);

                if (this.settings.animated)
                    e.parent().find(".mj-treeview").first().slideDown(50);
                else
                    e.parent().find(".mj-treeview").first().slideDown();
            },

            collapse: function(id)
            {
                var o = this.getData(id);

                if (!o || !o.items)
                    return;

                // collapse children first

                for (var i = 0; i < o.items.length; i++)
                    this.collapse(o.items[i].id);

                var e = this._getElement(id);

                if (!e.prev().hasClass("mj-open"))
                    return;     // already closed

                e.prev().removeClass("mj-open").addClass("mj-closed");
                //this.$el.trigger("expand", o);

                if (this.settings.animated)
                    e.parent().find(".mj-treeview").first().slideUp(50);
                else
                    e.parent().find(".mj-treeview").first().slideUp(0);
            },

            expandAll: function()
            {
                var self = this;

                $.each(this.settings.data, function (index, o) {

                    self.expand(o.id);
                });
            },

            collapseAll: function()
            {
                var self = this;
                
                $.each(this.settings.data, function (index, o) {

                    self.collapse(o.id);
                });
            },

            clear: function()
            {
                // this one clears the data

                this._stopListening();
                this.settings.data = [];
                this.settings.data.length = 0;
                this.$el.html("");
                this._startListening();
            },      

            close: function () {

                // dont clear the data
                // important to turn off events

                this._stopListening();
                this.$el.data(this, 'mj-treeview-data', null);
                this.$el.html("");
            }
        }


        $.fn.mjTreeView = function (options) {
            
            if (mjTreeView[options]) {

                //console.log("its a method: args: " + Array.prototype.slice.call(arguments, 1));
                //console.log($(this).data('treeview'));
                //return $(this).data('treeview')[options](Array.prototype.slice.call(arguments, 1)); //.apply(this, Array.prototype.slice.call(arguments, 1));

                if ($(this).data('mj-treeview-data')) {

                    return $(this).data('mj-treeview-data')[options].apply($(this).data('mj-treeview-data'), Array.prototype.slice.call(arguments, 1));

                }
            }
            else if (!options || typeof options === 'object') {

                // options is empty or an object
                // within a plugin use this not $(this)
                // check that element exists using this.length

                if (!this.length) {
                    $.error("mjTreeView cant create since the base element to attach to does not exist");
                    return null;
                }

                // return is for chainability, dont have to return anything
                // if the selector was multiply defined you would be creating plugin for each selector

                return this.each(function () {
                    var treeview = Object.create(mjTreeView);
                    treeview._init(options, this);
                    $.data(this, 'mj-treeview-data', treeview);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + options + ' does not exist on mjTreeView');
            }
        };
    })(jQuery);

});