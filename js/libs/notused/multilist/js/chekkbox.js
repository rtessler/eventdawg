$(document).ready(function () {

    (function ($) {

        var Chekkbox = {

            _init: function (options, el) {

                var default_options = {
                    id: 1,
                    selected: 0,
                    text: "select",
                    disabled: false,
                    image: null,                //"images/",
                    data: null
                };

                this.settings = $.extend({}, default_options, options);
                this.el = el;
                this.$el = $(el);
                this._render();
                this._startListening();

                return this;
            },

            _render: function () {

                this.original_value = this.settings.selected;

                var x = "";

                if (this.settings.disabled)
                    x += "disabled ";

                switch (this.settings.selected) {
                    case 1: x += "selected"; break;
                    case 2: x += "half-tick"; break;                    
                    default:  break;
                }

                var str = "<div class='chekkbox " + x + "' data-id='" + this.settings.id + "'>";
                str += "<div class='box'></div>";

                if (this.settings.image)
                    str += "<img class='image ' src='" + self.settings.image + "' />";

                str += "<div class='text'>" + this.settings.text + "</div>";
                str += "</div>";

                this.$el.html(str);

                return this;
            },

            _startListening: function () {

                var self = this;

                this._stopListening();

                this.$el.on("click", ".chekkbox", function (e) {                    

                    e.preventDefault();

                    var id = $(e.currentTarget).attr("data-id");

                    self.message("click: id = " + id);

                    if (self.settings.disabled)
                        return;

                    if (self.settings.selected == 1) {

                        self.$el.find(".chekkbox").removeClass("selected");
                        self.settings.selected = 0;
                    }
                    else {
                        self.$el.find(".chekkbox").addClass("selected");
                        self.settings.selected = 1;
                    }

                    self.$el.trigger("select", self.settings);
                });
            },

            _stopListening: function () {
                this.$el.off();
            },

            //-----------------------------------------------------------------------------------
            // public methods

            hasChanged: function () {

                return (this.settings.selected != this.original_value);
            },

            select: function () {

                this.$el.find(".chekkbox").addClass("selected");
                this.settings.selected = 1;
            },

            deselect: function (id) {

                this.$el.find(".chekkbox").removeClass("selected");
                this.settings.selected = 0;
            },

            enable: function () {

                this.$el.find(".chekkbox").removeClass("disabled");
            },

            disable: function () {

                this.$el.find(".chekkbox").addClass("disabled");
            },

            halfTick: function (id) {

                this.$el.find(".chekkbox").removeClass("disabled").addClass("half-selected");
                this.settings.selected = 2;
            },

            isSelected: function () {

                return (this.settings.selected == 1);
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
                this.$el.data(this, 'chekkbox-data', null);
                this.$el.html("");                
            }
        }

        $.fn.chekkbox = function (options) {
            
            function createChekkbox(name) {
                function F() { };
                F.prototype = Chekkbox;
                var f = new F;
                return f;
            }
            
            if (Chekkbox[options]) {

                // options is the name of a method in Checkbox

                return $(this).data('chekkbox-data')[options].apply($(this).data('chekkbox-data'), Array.prototype.slice.call(arguments, 1));
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

                    var o = Object.create(Chekkbox);
                    //var o = createChekkbox();

                    o._init(options, this);
                    $.data(this, 'chekkbox-data', o);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + method + ' does not exist on jQuery.chekkbox');
            }
        };
    })(jQuery);

});