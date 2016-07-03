$(document).ready(function () {

    (function ($) {

        var mjRadioButton = {

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

                var c = "";

                if (this.settings.disabled)
                    c += "disabled ";

                if (this.settings.selected) 
                    c += "selected";

                var str = "<div class='mj-radiobutton mj-table " + c + "' data-id='" + this.settings.id + "'>";               

                str += "<div class='mj-cell'>";

                str += "<div class='mj-radio '><div class='mj-dot'></div></div>";

                str += "</div>";

                if (this.settings.image)
                    str += "<img class='mj-image mj-cell ' src='" + this.settings.image + "' />";

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

                this.$el.on("click", ".mj-radiobutton", function (e) {

                    e.preventDefault();

                    var id = $(e.currentTarget).attr("data-id");

                    //self.message("click: id = " + id);

                    if (self.settings.disabled)
                        return;

                    if (!$(e.currentTarget).hasClass("disabled")) {

                        if (self.settings.selected == 1) {

                            $(e.currentTarget).removeClass("selected");
                            self.settings.selected = 0;
                        }
                        else {
                            $(e.currentTarget).addClass("selected");
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

                this.$el.find(".mj-radiobutton").addClass("selected").removeClass("half-ticked");
                this.settings.selected = 1;
            },

            deselect: function (id) {

                //if (this.settings.disabled)
                //    return;

                this.$el.find(".mj-radiobutton").removeClass("selected").removeClass("half-ticked");
                this.settings.selected = 0;
            },

            enable: function () {

                this.$el.find(".mj-radiobutton").removeClass("disabled");
                this.settings.disabled = false;
            },

            disable: function () {

                this.$el.find(".mj-radiobutton").addClass("disabled");
                this.settings.disabled = true;
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
                this.$el.data(this, 'mj-radiobutton-data', null);
                this.$el.html("");
            }
        }

        $.fn.mjRadioButton = function (options) {

            function createMRadiobutton(name) {
                function F() { };
                F.prototype = mjRadioButton;
                var f = new F;
                return f;
            }

            if (mjRadioButton[options]) {

                // options is the name of a method in Radiobutton

                if ($(this).data('mj-radiobutton-data')) {

                    return $(this).data('mj-radiobutton-data')[options].apply($(this).data('mj-radiobutton-data'), Array.prototype.slice.call(arguments, 1));

                }
            }
            else if (typeof options === 'object' || !options) {

                // options is empty or an object
                // within a plugin use this not $(this)
                // check that element exists using this.length

                if (!this.length) {
                    $.error("mjRadioButton cant create since the base element to attach to does not exist");
                    return null;
                }

                // return is for chainability, dont have to return anything
                // if the selector was multiply defined you would be creating plugin for each selector

                return this.each(function (index, o) {

                    var o = Object.create(mjRadioButton);
                    //var o = createmjRadioButton();

                    o._init(options, this);
                    $.data(this, 'mj-radiobutton-data', o);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + options + ' does not exist on mjRadioButton');
            }
        };
    })(jQuery);

});