$(document).ready(function () {

    (function ($) {

        var mjMenu = {

            init: function (options, el) {

                var default_options = {
                    data: null,                 // if data is provided build menu from json rather than underlying html element
                    orientation: "horizontal",  // vertical or horizontal
                    disabled: false,
                    animation: false,           // animate opening of submenus
                    hover: true,                // change background when cursor is over an item
                    open_on_click: false,       // if true only open submenus on click
                    show_arrows: true,
                    template_id: null
                };

                this.settings = $.extend({}, default_options, options);

                this.el = el;
                this.$el = $(el);

                // plugin have been applied previously
                // blow away any existing instance

                if (this.settings.data)
                    this.close();

                this.render();
                this.startListening();

                return this;
            },

            createNode: function(o, level)
            {
                var self = this;

                var e;

                if (o.id)
                    e = $("<li>", {"data-id": o.id});
                else
                    e = $("<li>");

                e.html(o.text).data(o);

                if (o.items && o.items.length > 0)
                {
                    // create a sub tree

                    if (self.settings.show_arrows)
                    {
                        if (level == 0)
                            var x = $("<div class='mj-arrow-down'></div>");
                        else
                            var x = $("<div class='mj-arrow-right'></div>");

                        e.append(x);
                    } 

                    var q = $("<ul>");

                    $.each(o.items, function(index, x) {

                       q.append(self.createNode(x, level+1)); 
                    });

                    e.append(q);
                }

                return e;
            },

            render: function () {

                var self = this;

                if (this.settings.data)
                {
                    // create top level node

                    var e = $("<ul>", {class: 'mj-menu mj-horizontal'});

                    for (var i = 0; i < this.settings.data.length; i++)
                    {
                        var o = this.settings.data[i];

                        e.append(self.createNode(o,0));
                    }

                    this.$el.html(e);
                }
                else
                {
                    this.$el.addClass("mj-menu").addClass("mj-horizontal");
                }

                if (!self.settings.hover)
                {
                    //this.$el.find("li:hover").css("background-color", "transparent");

                    this.$el.find("li").hover(
                        function () { $(this).css("background-color", "inherit"); },
                        function () { $(this).css("background-color", "inherit"); }
                    );
                }

                // add span elements so we can style the text

                if (!self.settings.data) {

                    //self.settings.data = [];

                    this.$el.find("li").each(function (i, e) {

                        //var str = $(e).clone().children().remove().end().text().trim();
                        var str = $(e)[0].firstChild.textContent.trim();

                        var d = {text: str};

                        //self.settings.data.push(d);
                        $(e).data(d);
                    });
                }

                return this;
            },

            startListening: function () {

                var self = this;

                self.stopListening();

                if (!self.settings.open_on_click) {

                    self.$el.on("mouseover", "li", function (e) {
                        self.openSubmenu(e.currentTarget);
                    });

                    self.$el.on("mouseout", "li", function (e) {
                        self.closeSubmenu(e.currentTarget);
                    });

                }
                else {

                    self.$el.on("mouseover", "li", function (e) {

                        if (!self.isTopLevel(e.currentTarget))
                            self.openSubmenu(e.currentTarget);
                    });

                    self.$el.on("mouseout", "li", function (e) {

                        if (!self.isTopLevel(e.currentTarget))
                            self.closeSubmenu(e.currentTarget);
                    });

                    $(document).on("click", function (e) {

                        // clicked off the menu

                        var container = $(".mj-menu");
                        
                        if (!container.is(e.target) // if the target of the click isn't the container...
                            && container.is(":visible")
                            && container.has(e.target).length === 0) // ... nor a descendant of the container
                        {                            
                            self.closeAllSubmenus(e);                           
                        }
                        
                    });
                }

                // mouseleave event is useless because in nested list a ul is child of li

                self.$el.on("click", "li", function (e) {

                    e.stopPropagation();

                    var d = $(e.currentTarget).data();

                    self.$el.trigger("select", d);      // trigger an event

                    if (self.settings.open_on_click) {
                        self.closeAllSubmenus(e);
                        self.openSubmenu(e.currentTarget);
                    }
                    else {
                        self.closeAllSubmenus();
                    }
                });
            },

            isTopLevel: function(e)
            {
                return $(e).parent().first().hasClass("mj-menu");
            },

            openSubmenu: function(e)
            {
                $(e).find('ul').first().show();       // find the ul under this li and open it

                // move submenu to right of li if li has a ul parent

                var n = $(e).parents('ul').length;

                if (n > 1) {

                //if ( !$(e).parent().has(".mj-menu")) {
                
                    var w = $(e).width() + 10;    // allow for padding
                    $(e).find('ul').first().css({ left: w + "px", top: "0px" });
                }
            },

            closeSubmenu: function(e)
            {
                $(e).find('ul').first().css('display', 'none');
            },

            closeAllSubmenus: function()
            {
                this.$el.find('ul.mj-menu ul').css('display', 'none');
                this.$el.trigger("allClosed");
            },

            stopListening: function () {
                this.$el.off();
            },

            debug: function (msg) {

                if (window.console && window.console.log) {
                    console.log(msg);
                }
            },

            //-----------------------------------------------------------------------------------
            // public methods

            disable: function () {

                this.$el.addClass("disabled");
                this.settings.disabled = true;
            },

            enable: function () {

                this.$el.removeClass("disabled");
                this.settings.disabled = false;
            },

            add: function () {

            },

            insert: function () {

            },

            remove: function () {

            },

            open: function () {


            },

            close: function () {

                // dont clear the data
                // important to turn off events

                this.stopListening();
                this.$el.data(this, 'mj-menu-data', null);
                this.$el.html("");
            }
        }

        $.fn.mjMenu = function (options) {

            //function createmjMenu(name) {
            //    function F() { };
            //    F.prototype = mjMenu;
            //    var f = new F;
            //    return f;
            //}

            if (mjMenu[options]) {

                // options is the name of a method in mjMenu

                if ($(this).data('mj-menu-data')) {

                    return $(this).data('mj-menu-data')[options].apply($(this).data('mj-menu-data'), Array.prototype.slice.call(arguments, 1));

                }
            }
            else if (typeof options === 'object' || !options) {

                // options is empty or an object
                // within a plugin use this not $(this)
                // check that element exists using this.length

                if (!this.length) {
                    $.error("mjMenu cant create since the base element to attach to does not exist");
                    return null;
                }

                // return is for chainability, dont have to return anything
                // if the selector was multiply defined you would be creating plugin for each selector

                return this.each(function (index, o) {

                    var o = Object.create(mjMenu);
                    //var o = createmjMenu();

                    o.init(options, this);
                    $.data(this, 'mj-menu-data', o);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + options + ' does not exist in mjMenu');
            }
        };
    })(jQuery);

});