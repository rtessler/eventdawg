$(document).ready(function () {

    (function ($) {

        var TreeView = {

            _init: function (options, el) {

                //this.settings = $.extend(this.settings, options);

                var default_settings = {
                    data: null,
                    image_path: "images/",
                    type: "checkbox",       // image or checkbox
                    expand_selected: false, // if true show subitems for selected nodes
                    animated: true,         // if true nodes animate when opening and closing
                    recursive: true         // if true selecting a node selects all child nodes and their parents
                };

                // node data structure

                // {id: int, mandatory
                // pid: int optional
                // text: string optional
                // image: string optional
                // selected: 0|1|2, 0 is not selected, 1 is selected, 2 is half ticked
                // disabled: true or false optional

                this.settings = $.extend({}, default_settings, options);

                this._fixData();                     // turn undefined text and selected into values

                this.save();      // save original data

                this._buildHierarchy();               // create hierarchy

                this.el = el;
                this.$el = $(el);
                this._render();
                this._startListening();
            },

            _fixData: function()
            {
                for (var i = 0, len = this.settings.data.length; i < len; i++) {

                    var o = this.settings.data[i];

                    if (o.id === undefined) {
                        this._message("treeview:fixData: treeview data contains node with no id");      // fatal error
                        return;
                    }

                    if (o.text == undefined)
                        o.text = "";

                    if (o.selected == undefined)
                        o.selected = 0;
                }
            },

            save: function () {

                // save selected value in original

                this.original = [];

                for (var i = 0, len = this.settings.data.length; i < len; i++) {
                    var d = this.settings.data[i];
                    this.original.push(d.selected);
                }
            },        

            _startListening: function () {

                var self = this;

                // we may be recreating the plugin for the second time
                // if we do not stop listening to events on the element we get strange behaviour

                this._stopListening();

                this.$el.on("click", "ul.treeview li:has(ul) > a.expand", function (e) {

                    // expand/collapse	

                    var id = $(this).parent().find(".node").attr("nodeid");

                    var o = self.getNode(id);

                    if ($(this).parent().find("ul").is(":visible")) {
                        // collapse

                        $(this).removeClass("open-image").addClass("closed-image");
                        self.$el.trigger("collapse", o);
                    }
                    else {
                        // expand

                        $(this).removeClass("closed-image").addClass("open-image");
                        self.$el.trigger("expand", o);
                    }

                    if (self.settings.animated)
                        $(this).parent().find("ul").first().slideToggle(100);
                    else
                        $(this).parent().find("ul").first().slideToggle(0);
                });

                this.$el.find("click", "ul.treeview li a.node").unbind('click');

                this.$el.on("click", "ul.treeview li a.node", function (e) {

                    e.preventDefault();

                    var id = $(e.currentTarget).attr("nodeid");

                    var o = self.getNode(id);

                    if (o) {

                        if (o.disabled)
                            return;

                        if (o.selected == 1) {
                            self.deselect(id);
                            self.$el.trigger("select", o);
                        }
                        else {
                            self.select(id);
                            self.$el.trigger("select", o);
                        }
                    }
                    else {
                        self._message("treeview node click: node " + id + " not found");
                    }
                });
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

                    if (o.pid != undefined && o.pid != null) {                        

                        var p = self.getNode(o.pid);        // get parent

                        if (p) {

                            if (!p.items)
                               p.items = [];

                            p.items.push(o);             
                        }
                        else {
                            // parent does not exists
                            // error in data or node appears before its parent

                            $.error("treeview.buildHierarchy: error in data, parent node " + o.pid + " not found.");
                        }
                    }
                });
            },

            _buildNode: function (o) {

                // makes a leaf node

                var c = "node ";

                if (o.disabled)
                    c += "disabled ";

                // cant be selected and and disabled

                if (o.selected == 1 && !o.disabled)
                    c += "selected ";

                var str = "<li><a class='" + c + "' nodeid='" + o.id + "' >";

                switch (this.settings.type) {

                    case "image":

                        str += "<img class='image' src='" + this.settings.image_path + o.image + "' />";
                        break;

                    case "checkbox":

                        str += "<div class='checkbox'></div>";
                        break;
                }

                var text = (o.text == undefined) ? "" : o.text;

                str += "<div class='text'>" + text + "</div></a></li>";

                return str;
            },

            _buildHTML: function (items, level) {

                // build a string which can be inserted into the DOM

                var self = this;
                var output = "";

                // this loop to needs to be fast

                $.each(items, function (index, o) {

                    o.level = level;

                    var c = "node ";

                    if (o.disabled)
                        c += "disabled ";

                    // cant be selected and and disabled

                    if (o.selected == 1 && !o.disabled)
                        c += "selected ";

                    var str = "<a class='" + c + "' nodeid='" + o.id + "' >";

                    switch (self.settings.type) {

                        case "image":

                            str += "<img class='image' src='" + self.settings.image_path + o.image + "' />";
                            break;

                        case "checkbox":

                            str += "<div class='checkbox'></div>";
                            break;
                    }

                    var text = (o.text == undefined) ? "" : o.text;

                    str += "<div class='text'>" + text + "</div></a>";

                    if (o.items && o.items.length > 0) {

                        // has child items

                        //str = "<a class='expand closed-image' id='expand" + o.id + "'></a>" + str;

                        if (self.settings.expand_selected && o.selected == 1) {

                            str = "<a class='expand open-image'></a>" + str;
                            str += "<ul class='treeview'>";

                        }
                        else {

                            str = "<a class='expand closed-image'></a>" + str;
                            str += "<ul class='treeview' style='display:none'>";        // child node are closed by default

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

                    var li = "<li>" + str + "</li>";

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

                this.$el.html("<ul class='treeview '>" + this._buildHTML(rootnodes, 0) + "</ul>");

                return this;
            },

            _message: function (msg) {

                if (window.console && window.console.log)
                    console.log(msg);
            },

            //----------------------------------------------------------------------------
            // public interface
            //----------------------------------------------------------------------------

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
                var o = this.getNode(id);

                if (o)
                {

                    if (o.pid != undefined && o.pid != null)
                    {
                        var p = this.$el.find("ul.treeview li a.node[nodeid='" + o.pid + "']");                        

                        o = this.getNode(o.pid);
                                        
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
                var o = this.getNode(id);

                if (o) {
                    var e = this.$el.find("ul.treeview li a.node[nodeid='" + id + "']");

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
                    this._message("treeview.select: node " + id + " not found");
                }
            },

            deselect: function (id) {

                var self = this;
                var o = this.getNode(id);

                if (o) {
                    var e = this.$el.find("ul.treeview li a.node[nodeid='" + id + "']");

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
                    this._message("treeview.deselect: node " + id + " not found");
                }
            },

            disable: function (id, state) {

                var o = this.getNode(id);

                if (o) {
                    o.disabled = state;

                    var e = this.$el.find("ul.treeview li a.node[nodeid='" + id + "']");

                    if (state)
                        e.addClass("disabled");
                    else
                        e.removeClass("disabled");
                }
            },

            halfTick: function (id) {

                var o = this.getNode(id);

                if (o) {
                    var e = this.$el.find("ul.treeview li a.node[nodeid='" + id + "']");

                    this.deselect(id);

                    o.selected = 2;

                    e.removeClass("selected").addClass("half-selected");
                }
                else {
                    this._message("treeview.halfTick: node " + id + " not found");
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

                var o = this.getNode(id);

                if (o)
                    return (o.selected == 1);

                return false;
            },

            selectAll: function () {

                // dont call select for every node, too slow

                $.each(this.settings.data, function (index, o) {
                    o.selected = 1;
                });

                this.$el.find(" ul.treeview li a.node").addClass("selected").removeClass("half-selected");
            },

            deselectAll: function () {

                // dont call deselect for every node, too slow

                $.each(this.settings.data, function (index, o) {
                    o.selected = 0;
                });

                this.$el.find("ul.treeview li a.node").removeClass("selected").removeClass("half-selected");
            },

            halfTickAll: function () {

                // dont call halfTick for every node, too slow

                $.each(this.settings.data, function (index, o) {
                    o.selected = 2;
                });

                this.$el.find("ul.treeview li a.node").removeClass("selected").addClass("half-selected");
            },

            deselectHalfTicked: function () {

                // dont call halfTick for every node, too slow
                // deselect all nodes which are half ticked

                $.each(this.settings.data, function (index, o) {

                    if (o.selected == 2)
                        o.selected = 0;
                });

                this.$el.find("ul.treeview li a.node.half-selected").removeClass("half-selected");
            },

            getNode: function (id) {

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

            getNodeElement: function (id) {

                return this.$el.find("ul.treeview li a.node[nodeid='" + id + "']");
            },

            getAll: function()
            {
                return this.settings.data;
            },

            isRootNode: function(id)
            {
                var o = this.getNode(id);

                if (!o)
                    return false;

                if (o.pid == undefined || o.pid == null)
                    return true;

                return false;
            },

            getSiblings: function (id) {

                var self = this;

                var n = this.getNode(id);

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
                var e = this.getNodeElement(id);

                if (e) {

                    this.settings.data.push(data);
                    var str = this._buildNode(data);

                    this._message(e);

                    e.parent().append(str);
                }
            },

            update: function(data)
            {
                var e = this.getNodeElement(data.id);

                if (e) {

                    var node = this.getNode(data.id);
                    node = data;

                    var str = this._buildNode(data);
                    e.html(str);
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

                var e = this.getNodeElement(id);

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
                var self = this;
                var o = this.getNode(id);

                if (!o.items)
                    return;

                var e = this.getNodeElement(id);

                if (!e.prev().hasClass("closed-image"))
                    return;     // already expanded

                e.prev().removeClass("closed-image").addClass("open-image");
                //this.$el.trigger("expand", o);

                if (this.settings.animated)
                    e.next().slideDown(100);
                else
                    e.next().slideDown(0);
            },

            collapse: function(id)
            {
                var self = this;
                var o = this.getNode(id);

                if (!o.items)
                    return;

                // collapse children first

                for (var i = 0; i < o.items.length; i++)
                    this.collapse(o.items[i].id);

                var e = this.getNodeElement(id);

                if (!e.prev().hasClass("open-image"))
                    return;     // already closed

                e.prev().removeClass("open-image").addClass("closed-image");
                //this.$el.trigger("expand", o);

                if (this.settings.animated)
                    e.next().slideUp(100);
                else
                    e.next().slideUp(0);
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
                this.$el.html("");
            }
        }


        $.fn.treeview = function (options) {
            
            if (TreeView[options]) {

                //console.log("its a method: args: " + Array.prototype.slice.call(arguments, 1));
                //console.log($(this).data('treeview'));
                //return $(this).data('treeview')[options](Array.prototype.slice.call(arguments, 1)); //.apply(this, Array.prototype.slice.call(arguments, 1));

                return $(this).data('treeview')[options].apply($(this).data('treeview'), Array.prototype.slice.call(arguments, 1));
            }
            else if (typeof options === 'object' || !options) {

                // options is empty or an object

                // within a plugin use this not $(this)
                // check that element exists using this.length

                if (!this.length)
                    return null;

                // return is for chainability, dont have to return anything
                // if the selector was multiply defined you would be creating plugin for each selector

                return this.each(function () {
                    var treeview = Object.create(TreeView);
                    treeview._init(options, this);
                    $.data(this, 'treeview', treeview);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + method + ' does not exist on jQuery.treeview');
            }
        };
    })(jQuery);

});