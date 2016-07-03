$(document).ready(function() {
    
(function ($) {

/*
    var Ratiofix = {
        init: function(options, elem) {
            this.options = $.extend({},this.options,options);
            this.elem  = elem;
            this.$elem = $(elem);
            this.setListeners();
            return this;
        },
        options: {
            message: "No message"
        },
        printMsg: function(){
            console.log(this.options._message);
        },
        setListeners:function (){
            var self=this;
            this.$elem.on('click',function (){
                console.log(self.options._message);
            });
            $(window).on('resize',$.proxy(self.printMsg, self));
        }
    };
*/

    var Multilist = {

        _init: function (options, el) {

            var default_options = {
                data: null,
                image_path: "images/",
                type: "checkbox"
            };

            this.settings = $.extend({}, default_options, options);
            this.el = el;
            this.$el = $(el);
            this._render();
            this._startListening();

            return this;
        },

        _render: function () {

            this.save();

            this.$el.html("<ul class='multilist '>" + this._buildHTML() + "</ul>");

            //console.log(this.el);

            //document.getElementById("list1").innerHTML = "<ul class='multilist '>" + this.buildHTML() + "</ul>";

            return this;
        },

        _startListening: function () {

            var self = this;

            this._stopListening();            

            this.$el.on("click", "ul.multilist li a.node", function (e) {
                
                e.preventDefault();

                var id = $(e.currentTarget).attr("nodeid");

                var o = self.getNode(id);

                if (o) {

                    if (o.disabled)
                        return;

                    if (self.settings.type != "radiobutton") {

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

                        // if we clicked on an unselected node do something

                        //if (o.selected != 1 || o.selected) {
                        self.select(id);
                        self.$el.trigger("select", o);
                        //}
                    }
                }
                else {
                    self._message("multilist node click: node " + id + " not found");
                }
            });

            /*
            this.$el.on("mouseover", "ul.multilist li a.node", function (e) {

                e.preventDefault();

                var id = $(e.currentTarget).attr("nodeid");
                var o = self.getNode(id);

                if (o)
                    self.$el.trigger("mouseover", o);
                else
                    self._message("multilist mouseover: node " + id + " not found");
            });

            this.$el.on("mouseout", "ul.multilist li a.node", function (e) {

                e.preventDefault();

                var id = $(e.currentTarget).attr("nodeid");
                var o = self.getNode(id);

                if (o)
                    self.$el.trigger("mouseout", o);
                else
                    self._message("multilist mouseout: node " + id + " not found");
            });
            */
        },

        _stopListening: function()
        {
            this.$el.off();
        },

        _buildNode: function(o)
        {
            var self = this;           

            var c = "";

            if (o.disabled)
                c += "disabled ";

            // can be disabled and selected

            if (o.selected == 1)
                c += "selected ";
            else
            if (o.selected == 2)
                c += "half-selected ";

            var str = "<li><a class='node " + c + "' nodeid='" + o.id + "'>";

            switch (self.settings.type) {

                case "image":

                    str += "<img class='image ' src='" + self.settings.image_path + o.image + "' />";
                    break;

                case "checkbox":

                    str += "<div class='checkbox'></div>";
                    break;

                case "radiobutton":

                    str += "<div class='radio'><div class='dot'></div></div>";
                    break;
            }

            str += "<div class='text'>" + o.text + "</div></a></li>";

            return str;
        },

        _buildHTML: function () {

            var self = this;
            var output = "";

            // need this loop to be fast

            $.each(this.settings.data, function (index, o) {
                output += self._buildNode(o);
            });

            return output;
        },

        //-----------------------------------------------------------------------------------
        // public methods

        save: function () {

            this.original = [];

            for (var i = 0, len = this.settings.data.length; i < len; i++) {
                var d = this.settings.data[i];
                this.original.push(d.selected);
            }
        },

        hasChanged: function () {

            for (var i = 0, len = this.settings.data.length; i < len; i++) {
                var a = this.settings.data[i];
                var b = this.original[i];

                // if new state is undefined dont count it as a change

                if (a.selected != b)
                    return true;
            }

            return false;
        },

        select: function (id) {

            var self = this;
            var o = this.getNode(id);

            if (o) {
                var e = this.getNodeElement(id);

                if (e) {
                    o.selected = 1;
                    e.addClass("selected").removeClass("half-selected");

                    if (e.find(".radio").length > 0) {
                        // if radio deselect other radio buttons

                        this.$el.find("ul.multilist li a.node.selected:not([nodeid='" + id + "'])").removeClass("selected").removeClass("half-selected");

                        $.each(this.settings.data, function (index, o) {

                            if (o.id != id)
                                o.selected = 0;
                        });
                    }
                }
            }
            else {
                this._message("multilist.select: node " + id + " not found");
            }
        },

        deselect: function (id) {

            var self = this;
            var o = this.getNode(id);

            if (o) {
                var e = this.getNodeElement(id);

                o.selected = 0;

                e.removeClass("selected").removeClass("half-selected");
            }
            else {
                this._message("multilist.deselect: node " + id + " not found");
            }
        },

        disable: function (id, state) {

            var self = this;
            var o = this.getNode(id);

            if (o) {
                o.disabled = state;

                var e = this.getNodeElement(id);

                if (state)
                    e.addClass("disabled");
                else
                    e.removeClass("disabled");
            }
        },

        halfTick: function (id) {

            var o = this.getNode(id);

            if (o) {
                var e = this.getNodeElement(id);

                this.deselect(id);

                o.selected = 2;

                e.removeClass("selected").addClass("half-selected");
            }
            else {
                this._message("multilist.halfTick: node " + id + " not found");
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
                return o.selected == 1;

            return false;
        },

        selectAll: function () {
            // dont call select for every node, too slow

            $.each(this.settings.data, function (index, o) {
                o.selected = 1;
            });

            this.$el.find("ul.multilist li a.node").addClass("selected").removeClass("half-selected");
        },

        deselectAll: function () {
            // dont call deselect for every node, too slow

            $.each(this.settings.data, function (index, o) {
                o.selected = 0;
            });

            this.$el.find("ul.multilist li a.node").removeClass("selected").removeClass("half-selected");
        },

        halfTickAll: function () {

            // dont call halfTick for every node, too slow

            this.$el.find("ul.multilist li a.node").removeClass("selected").addClass("half-selected");

            var data = this.settings.data;

            $.each(this.settings.data, function (index, o) {
                o.selected = 2;
            });
        },

        deselectHalfTicked: function () {

            // dont call halfTick for every node, too slow

            // deselect all nodes which are half ticked

            this.$el.find("ul.multilist li a.node.half-selected").removeClass("half-selected");


            $.each(this.settings.data, function (index, o) {

                if (o.selected == 2)
                    o.selected = 0;
            });
        },

        getNode: function (id) {

            if (id == undefined || id == null)
                return null;

            // cant break out of $.each, use nomal for

            for (var i = 0, len = this.settings.data.length; i < len; i++) {

                var o = this.settings.data[i];

                if (o.id == id)
                    return o;
            }

            return null;
        },

        getNodeElement: function(id)
        {
            return this.$el.find("ul.multilist li a.node[nodeid='" + id + "']");
        },

        message: function (msg) {

            if (window.console && window.console.log) {
                console.log(msg);
            }
        },

        add: function(data)
        {            
            this.settings.data.push(data);

            this._message(this.settings.data);

            var str = this._buildNode(data);
            
            this.$el.find("ul.multilist").append(str);
        },

        insert: function(id, data)
        {
            var e = this.getNodeElement(id);

            if (e) {

                this.settings.data.push(data);
                var str = this._buildNode(data);

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
            this._render();
            this._startListening();
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
            this.$el.data(this, 'multilist', null);
            this.$el.html("");            
        }
    }

    $.fn.multilist = function (options) {

        function createMultilist(name) {
            function F() { };
            F.prototype = Multilist;
            var f = new F;
            return f;
        }

        if (Multilist[options]) {

            // options is the name of a method in Multilist

            //console.log(arguments);
            //console.log("slice = " + Array.prototype.slice.call(arguments, 1));
            //return $(this).data('multilist')[options](Array.prototype.slice.call(arguments, 1)); //.apply(this, Array.prototype.slice.call(arguments, 1));
            //return $(this).data('multilist')[options].apply(this, Array.prototype.slice.call(arguments, 1));

            return $(this).data('multilist')[options].apply($(this).data('multilist'), Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof options === 'object' || !options) {

            // options is empty or an object

            // within a plugin use this not $(this)
            // check that element exists using this.length

            if (!this.length)
                return null;

            // return is for chainability, dont have to return anything
            // if the selector was multiply defined you would be creating plugin for each selector

            return this.each(function (index, o) {

                var x = Object.create(Multilist);
                //var multilist = createMultilist();
                   
                x._init(options, this);
                //$.removeData(this, 'multilist');
                $.data(this, 'multilist', x);
            });
        }
        else {

            // method does not exist

            $.error('Method ' + method + ' does not exist on jQuery.multilist');
        }
    };
})(jQuery);

});