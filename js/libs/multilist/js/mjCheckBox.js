$(document).ready(function () {

    (function ($) {

        var mjCheckBox = {

            _init: function (options, el) {

                var default_options = {
                    id: 1,
                    text: "select",
                    selected: 0,                    
                    disabled: false,
                    image: null,
                    data: null,
                    original_value: 0
                };

                this.settings = $.extend({}, default_options, options);
                this.el = el;
                this.$el = $(el);

                // plugin have been applied previously
                // blow away any existing instance

                this.close();

                this._render();
                this._startListening();

                return this;
            },

            _render: function () {

                this.settings.original_value = this.settings.selected;

                var x = "";

                if (this.settings.disabled)
                    x += "disabled ";

                switch (this.settings.selected) {
                    case 1: x += "selected"; break;
                    case 2: x += "half-tick"; break;                    
                    default:  break;
                }

                var str = "<div class='mj-checkbox-container mj-table' data-id='" + this.settings.id + "'>";
                
                str += "<div class='mj-cell'><div class='mj-checkbox " + x + "'></div></div>";

                if (this.settings.image)
                    str += "<img class='mj-image mj-cell' src='" + this.settings.image + "' />";

                str += "<div class='mj-cell'>";

                str += "<div class='mj-text'>" + this.settings.text + "</div>";

                str += "</div>";

                str += "</div>";

                this.$el.html(str);

                return this;
            },

            _startListening: function () {

                var self = this;

                this._stopListening();

                this.$el.on("click", ".mj-checkbox-container", function (e) {                    

                    e.preventDefault();

                    var id = $(e.currentTarget).find(".mj-checkbox").attr("data-id");

                    //self.message("click: id = " + id);

                    if (self.settings.disabled)
                        return;

                    if (!$(e.currentTarget).find(".mj-checkbox").hasClass("disabled")) {

                        if (self.settings.selected == 1) {

                            $(e.currentTarget).find(".mj-checkbox").removeClass("selected");
                            self.settings.selected = 0;
                        }
                        else {
                            $(e.currentTarget).find(".mj-checkbox").addClass("selected");
                            self.settings.selected = 1;
                        }

                        self.$el.trigger("select", self.settings);
                    }
                });
            },

            _stopListening: function () {
                this.$el.off();
            },

            //-----------------------------------------------------------------------------------
            // public methods

            hasChanged: function () {

                return (this.settings.selected != this.settings.original_value);
            },

            select: function () {

                //if (this.settings.disabled)
                //    return;

                this.$el.find(".mj-checkbox").addClass("selected").removeClass("half-ticked");
                this.settings.selected = 1;
            },

            deselect: function (id) {

                //if (this.settings.disabled)
                //    return;

                this.$el.find(".mj-checkbox").removeClass("selected").removeClass("half-ticked");
                this.settings.selected = 0;
            },

            enable: function () {

                this.$el.find(".mj-checkbox").removeClass("disabled");
                this.settings.disabled = false;
            },

            disable: function () {

                this.$el.find(".mj-checkbox").addClass("disabled");
                this.settings.disabled = true;
            },

            halfTick: function (id) {

                this.$el.find(".mj-checkbox").removeClass("disabled").addClass("half-ticked");
                this.settings.selected = 2;
            },

            get: function () {

                return this.settings;
            },

            message: function (msg) {

                if (window.console && window.console.log) {
                    console.log(msg);
                }
            },

            close: function () {

                // dont clear the data
                // important to turn off events

                this._stopListening();
                this.$el.data(this, 'mj-checkbox-data', null);
                this.$el.html("");                
            }
        }

        $.fn.mjCheckBox = function (options) {
            
            function createMCheckbox(name) {
                function F() { };
                F.prototype = mjCheckBox;
                var f = new F;
                return f;
            }
            
            if (mjCheckBox[options]) {

                // options is the name of a method in Checkbox

                if ($(this).data('mj-checkbox-data')) {

                    return $(this).data('mj-checkbox-data')[options].apply($(this).data('mj-checkbox-data'), Array.prototype.slice.call(arguments, 1));

                }
            }
            else if (typeof options === 'object' || !options) {

                // options is empty or an object
                // within a plugin use this not $(this)
                // check that element exists using this.length

                if (!this.length) {
                    $.error("mjCheckBox cant create since the base element to attach to does not exist");
                    return null;
                }

                // return is for chainability, dont have to return anything
                // if the selector was multiply defined you would be creating plugin for each selector

                return this.each(function (index, o) {

                    var o = Object.create(mjCheckBox);
                    //var o = createmjCheckBox();

                    o._init(options, this);
                    $.data(this, 'mj-checkbox-data', o);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + method + ' does not exist on mjCheckBox');
            }
        };
    })(jQuery);

});