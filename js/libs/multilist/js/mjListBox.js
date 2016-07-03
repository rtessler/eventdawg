$(document).ready(function() {


    // http://learn.jquery.com/plugins/basic-plugin-creation/
    
(function ($) {

    var mjListBox = {

        _init: function (options, el) {

            var default_options = {
                data: null,
                image_path: "images/",
                type: "checkbox",           // checkbox, radiobutton, input, text
                filter: false,
                template_id: null           // element id of a underscore.js list item template
            };

            this.settings = $.extend({}, default_options, options);
            this.el = el;
            this.$el = $(el);

            //var wheelEvent     = ("onwheel" in document || document.documentMode >= 9) ? "wheel" :
                             //(document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll");

            //this.el.addEventListener(wheelEvent, this._wheel, false );

            var hasTouchEvents = ("ontouchstart" in document.documentElement);

            // plugin have been applied previously
            // blow away any existing instance

            this.close();

            this._render();
            this._startListening();

            return this;
        },

        _render: function () {

            if (this.settings.template_id) {

                // use the template
                // underscore.js template for each list item

                var self = this;

                var template = _.template($("#" + this.settings.template_id).html());

                $.each(this.settings.data, function (i, o) {

                    // we need an index for tabindex 

                    o.index = i;
                    var str = template(o);

                    var e = $(str);

                    self.$el.append(e);

                    // dont need to attach data to the item
                    //e.data(o);

                    // for each data-action within the current item attach data

                    $.each(e.find("[data-action]"), function (j, x) {
                        $.data(x, "data", o);
                    });
                });
            }
            else {

                this._fixData();

                this.save();        // save state

                this.$el.html(this._buildHTML());

                if (this.settings.filter) {

                    var h = this.$el.find(".mj-listbox-container .mj-listbox").height();

                    // leave some room for the filter

                    var FILTER_HEIGHT = 36;

                    if (this.settings.data.length > 0)
                        this.$el.find(".mj-listbox-container .mj-listbox").height(h - FILTER_HEIGHT);
                }
            }

            return this;
        },

        _buildItemHTML: function (o, index) {

            var c = "";

            if (o.disabled)
                c += "disabled ";

            // can be disabled and selected

            if (o.selected == 1)
                c += "selected ";
            else
                if (o.selected == 2)
                    c += "half-selected ";

            // ths tabindex is so we can use the up,down arrow keys
            // the mj-cell is so that we dont need to use float left and we can center items vertically

            var str = "<li class='mj-item " + c + "' tabindex=" + index + ">";

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

            // input comes after text/label

            if (this.settings.type == "input") {

                str += "<div class='mj-cell'>";
                str += "<div class='mj-label'>" + o.text + "</div>"
                str += "</div>";

                str += "<div class='mj-cell'>";
                str += "<input class='mj-input' value='" + o.value + "' />";
                str += "</div>";
            }
            else {

                str += "<div class='mj-cell'>";
                str += "<div class='mj-text'>" + o.text + "</div>"
                str += "</div>";
            }

            str += "</li>";

            var output = $(str);

            // attach some data

            output.data("data", o);

            return output;
        },

        _buildHTML: function () {

            var self = this;
            
            var b = $("<ul>", {class: 'mj-listbox'});

            // need this loop to be fast

            $.each(this.settings.data, function (index, o) {
                b.append(self._buildItemHTML(o, index * 10));
            });

            var a = $("<div>", { class: 'mj-listbox-container', html: b });

            //a.html(b);

            if (this.settings.filter) {
                
                var str = "<div class='filter-box'>";
                str += " <div class='searchbox-container'>";
                str += "  <input class='searchbox' />";        // on ipad we autofocus cases the keyboard to appear
                str += " </div>";
                str += "<div class='search-btn'></div>";
                str += "</div>";

                a.append($(str));
            }
           
            return a;
        },

        _fixDataItem: function(o)
        {
            if (o.id == null || o.id == undefined)
                o.id == o.text;
        },

        _fixData: function () {

            var self = this;

            if (this.settings.data == null)
                this.settings.data = [];

            // we need everything to have an id

            $.each(this.settings.data, function (index, o) {

                self._fixDataItem(o);
            });
        },

        _startListening: function () {

            var self = this;

            this._stopListening();

            if (this.settings.template_id) {

                // user template provided

                this.$el.on("click", "[data-action]", function (e) {

                    e.preventDefault();

                    self.$el.find("li").removeClass("mj-active");

                    var x = $(e.currentTarget);

                    // x.data() will get data for the whole element including the action
                    
                    self.$el.trigger("select", x.data());

                    x.parent().addClass("mj-active");
                });
            }
            else {

                this.$el.on("click", ".mj-listbox .mj-item", function (e) {

                    e.preventDefault();

                    self.$el.find("li").removeClass("mj-active");

                    var ee = $(e.currentTarget);

                    ee.addClass("mj-active");

                    var o = ee.data("data");

                    if (!o) {
                        $.error("listbox item click: item data not found");
                        return;
                    }

                    // cant click on disabled item

                    if (o.disabled)
                        return;

                    switch (self.settings.type)
                    {
                        case "checkbox":

                            if (o.selected == 1) {
                                self._deselect(ee, o);
                                self.$el.trigger("checked", o);
                            }
                            else {
                                self._select(ee, o);
                                self.$el.trigger("checked", o);
                            }
                            break;

                        case "radiobutton":

                            // if we clicked on an unselected item do something
  
                            self._select(ee, o);
                            self.$el.trigger("checked", o);
                            break;                        
                    }
                });

                this.$el.on("change", ".mj-listbox .mj-item input", function (e) {

                    var ee = $(e.currentTarget);
                    var val = ee.val();

                    var x = ee.closest(".mj-item");

                    if (x) {

                        var o = x.data("data");

                        o.value = val;

                        self.$el.trigger("textChange", o);
                    }
                });
            }

            this.$el.on("keyup", ".mj-listbox-container .filter-box .searchbox", function (e) {

                var str = $(e.currentTarget).val();

                self.filter(str);
            });

            this._enableKeyEvents();
        },

        _enableKeyEvents: function () {

            var self = this;

            //return;

            // assumes list is made of list items

            this.$el.on("keydown", "li", function (e) {                

                var key = e.keyCode;
                var target = $(e.currentTarget);

                self.$el.find("li").removeClass("mj-active");

                var KEY_SPACE = 32;
                var KEY_UP = 38;
                var KEY_DOWN = 40;

                switch (key) {

                    case KEY_SPACE:

                        e.preventDefault();

                        var o = $(target).data();

                        if (o)
                            self.toggle(o.id);

                        break;

                    case KEY_UP: // arrow up

                        e.preventDefault();

                        target.prev().focus();

                        var o = $(target.prev()).data();

                        if (o)
                            self.$el.trigger("prev", o);

                        break;

                    case KEY_DOWN: // arrow down

                        e.preventDefault();

                        target.next().focus();

                        var o = $(target.next()).data();

                        if (o)
                            self.$el.trigger("next", o);

                        break;
                }
            });

            this.$el.on("focusin", "li", function (e) {

                $(e.currentTarget).addClass("mj-active");
            });

            this.$el.on("focusout", "li", function (e) {

                //$(e.currentTarget).removeClass("mj-active");
            });

            // select the 1st selected

            var n = -1;

            for (var i = 0, len = this.settings.data.length; i < len; i++)
            {
                var o = self.settings.data[i];

                if (o.selected == 1)
                {
                    n = i;
                    break;
                }
            }

            if (n != -1) {

                if (this.$el.find("li:eq(" + n + ")"))
                    this.$el.find("li:eq(" + n + ")").focus();

            }
        },

        _stopListening: function()
        {
            this.$el.off();
        },

        _getElement: function (id) {

            return this.$el.find(".mj-listbox .mj-item").filter(
               function () { return $(this).data("data").id == id; }
            );
        },

        //-----------------------------------------------------------------------------------
        // public methods

        getItem: function (id) {

            // find the element in the data array with this id

            if (id == undefined || id == null)
                return null;

            for (var i = 0, len = this.settings.data.length; i < len; i++) {

                var o = this.settings.data[i];

                if (o.id == id)
                    return o;
            }

            $.error("mjListBox.getItem: item '" + id + "' not found");

            return null;
        },

        getItemAt: function (n) {

            var e = this.$el.find(".mj-listbox .mj-item:eq(" + n + ")");

            if (e)            
                return e.data("data");

            return null;
        },

        filter: function (str) {

            $.expr[':'].containsIgnoreCase = function (n, i, m) {
                return jQuery(n).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
            };

            this.$el.find(".mj-listbox li").show();
            this.$el.find(".mj-listbox li:not(:containsIgnoreCase('" + str + "'))").hide();
        },

        save: function () {

            // save the state of the list

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

        toggle: function(id)
        {
            var o = this.getItem(id);

            if (o)
            {
                if (o.selected == 1)
                    this.deselect(id);
                else
                    this.select(id);
            }
        },

        _select: function(e, o)
        {
            if (!e || !o)
                return false;
            
            o.selected = 1;
            e.addClass("selected").removeClass("half-selected");

            //if (e.find(".mj-radio").length > 0) {

            if (this.settings.type == "radiobutton") {

                // if radio deselect other radio buttons, deselect everything and re-select

                this.$el.find(".mj-listbox .mj-item.selected").removeClass("selected").removeClass("half-selected");
                e.addClass("selected");

                $.each(this.settings.data, function (index, q) {

                    if (q.id != o.id)
                        q.selected = 0;
                });
            }

            return true;
        },

        select: function (id) {

            var o = this.getItem(id);

            if (!o) 
                return;

            var e = this._getElement(id);

            return this._select(e, o);
        },

        selectAt: function(n)
        {
            var e = this.$el.find(".mj-listbox .mj-item:eq(" + n + ")");

            if (e)
            {
                var o = e.data("data");               
                return this._select(e, o);                
            }

            return false;
        },

        _deselect: function (e, o) {

            if (!e || !o)
                return false;

            o.selected = 0;
            e.removeClass("selected").removeClass("half-selected");
            return true;
        },

        deselect: function (id) {

            var o = this.getItem(id);

            if (!o)
                return;

            var e = this._getElement(id);
            return this._deselect(e, o);
        },

        deselectAt: function(n)
        {
            var e = this.$el.find(".mj-listbox .mj-item:eq(" + n + ")");

            if (e)
            {
                var o = e.data("data");              
                return this._deselect(e, o);                
            }

            return false;
        },

        _disable: function(e, o)
        {
            if (!e || !o)
                return;

            o.disabled = 1;
            e.addClass("disabled");
        },

        disable: function (id) {

            var o = this.getItem(id);
            var e = this._getElement(id);
            this._disable(e, o);
        },

        disableAt: function(n)
        {
            var e = this.$el.find(".mj-listbox .mj-item:eq(" + n + ")").first();

            if (e)
            {
                var o = e.data("data");
                this._disable(e, o);
            }
        },

        disableAll: function()
        {
            this.$el.find(".mj-listbox .mj-item").addClass("disabled");

            $.each(this.settings.data, function (index, o) {
                o.disabled = 1;
            });
        },

        _enable: function (e, o) {

            if (!e || !o)
                return;

            o.disabled = 0;
            e.removeClass("disabled");
        },

        enable: function (id) {

            var o = this.getItem(id);
            var e = this._getElement(id);
            this._enable(e, o);
        },

        enableAt: function (n) {

            var e = this.$el.find(".mj-listbox .mj-item:eq(" + n + ")").first();

            if (e) {
                var o = e.data("data");
                this._enable(e, o);
            }
        },

        enableAll: function () {

            this.$el.find(".mj-listbox .mj-item").removeClass("disabled");

            $.each(this.settings.data, function (index, o) {
                o.disabled = 0;
            });
        },

        halfTick: function (id) {

            var o = this.getItem(id);

            if (!o)
                return;

            var e = this._getElement(id);

            this.deselect(id);

            o.selected = 2;

            if (e)
                e.removeClass("selected").addClass("half-selected");
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

            var o = this.getItem(id);

            if (o)
                return o.selected == 1;

            return false;
        },

        selectAll: function () {

            // dont call select for every item, too slow

            $.each(this.settings.data, function (index, o) {
                o.selected = 1;
            });

            this.$el.find(".mj-listbox .mj-item").addClass("selected").removeClass("half-selected");
        },

        deselectAll: function () {

            // dont call deselect for every item, too slow

            $.each(this.settings.data, function (index, o) {
                o.selected = 0;
            });

            this.$el.find(".mj-listbox .mj-item").removeClass("selected").removeClass("half-selected");
        },

        halfTickAll: function () {

            // dont call halfTick for every item, too slow

            this.$el.find(".mj-listbox .mj-item").removeClass("selected").addClass("half-selected");

            var data = this.settings.data;

            $.each(this.settings.data, function (index, o) {
                o.selected = 2;
            });
        },

        deselectHalfTicked: function () {

            // dont call halfTick for every item, too slow

            // deselect all items which are half ticked

            this.$el.find(".mj-listbox .mj-item.half-selected").removeClass("half-selected");

            $.each(this.settings.data, function (index, o) {

                if (o.selected == 2)
                    o.selected = 0;
            });
        },

        add: function(data)
        {            
            this.settings.data.push(data);

            var str = this._buildItemHTML(data);
            
            this.$el.find(".mj-listbox").append(str);
        },

        insert: function(id, data)
        {
            var e = this._getElement(id);

            if (e) {

                this._fixDataItem(data);
                this.settings.data.push(data);                
                e.append( this._buildItemHTML(data) );
            }
        },
        
        insertAt: function(n, data)
        {
            var e = this.$el.find(".mj-listbox .mj-item:eq(" + n + ")").first();

            if (e)
            {
                this._fixDataItem(data);
                this.settings.data.push(data);
                e.append( this._buildItemHTML(data) );
            } 
        },

        update: function(id, data)
        {
            var e = this._getElement(id);

            if (!e)
                return false;

            var o = e.data("data");

            $.removeData(e, 'data');

            this._fixDataItem(data);

            o = $.extend(o, data);

            var str = this._buildItemHTML(data);
            e.html(str);
        },

        updateAt: function(n, data)
        {
            var e = this.$el.find(".mj-listbox .mj-item:eq(" + n + ")").first();

            if (e)
            {
                var o = e.data("data");

                if (o)                
                    this.update(o.id);                
            }             
        },

        remove: function(id)
        {
            var found = false;

            this.settings.data = $.grep(this.settings.data, function (o) {

                if (o.id == id)
                    found = true;

                return o.id != id;
            });

            var e = this._getElement(id);

            if (!e || e.length == 0)
                return false;

            e.remove();        // remove the li

            return true;
        },

        removeAt: function(n)
        {
            var e = this.$el.find(".mj-listbox .mj-item:eq(" + n + ")").first();

            if (e)
            {
                var o = e.data("data");

                if (o)                
                    return this.remove(o.id);
            }            
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

            console.log("mjListBox.close");

            // dont clear the data
            // important to turn off events

            this._stopListening();

            // we may still want to get the data after the listbox has closed so dont remove the data

            $.removeData(this.el, 'mj-listbox-instance');
           
            this.$el.html("");            
        },

        scrollTo: function (n) {

            var e = this._getElement(n);

            if (e) {

                // need to use position rather than offset

                var pos = e.position().top;

                this.$el.find(".mj-listbox").animate({ scrollTop: pos }, 300);
            }
        }
    }

    $.fn.mjListBox = function (options) {

/*
        function create(name) {
            function F() { };
            F.prototype = mjListBox;
            var f = new F;
            return f;
        }
*/

        // within a plugin use this not $(this) to refer to the element to attach to
        // this refers to the element we are attaching to
        // needs to return this for chainability

        if (mjListBox[options]) {

            // options is the name of a method in mjListBox

            var o = $(this).data('mj-listbox-data');

            // cant call slice directly on arguments

            if (o)
                return o[options].apply(o, Array.prototype.slice.call(arguments, 1));

            // if o is not found then the mjListBox has not been attached to the element
            // its not an necessarily and error

            return null;
        }
        else if (!options || typeof options === 'object') {

            // options is empty or an object
            // create the listbox            
            // check that element exists using this.length

            if (!this.length) {
                $.error("mjListBox: cant create, the html element to attach to does not exist.");
                return null;
            }

            // Note: a jquery query select can refer to any number of html elements
            // return is for chainability, dont have to return anything

            return this.each(function (index, o) {

                // remove any previous data

                //$.removeData(this, 'mj-listbox-instance');

                var x = Object.create(mjListBox);
                   
                x._init(options, o);

                // attach object instance to this html element

                $.data(o, 'mj-listbox-data', x);
            });
        }
        else {

            // method does not exist

            $.error('Method ' + options + ' does not exist in mjListBox');
        }
    };
})(jQuery);     // pass jQuery as an argument to the immiediatly executed javascript function so that $ always refers to jquery

}); // document.ready
