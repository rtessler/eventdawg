$(document).ready(function () {

    /*
		Requirements:

		- merge columns
		- automatic resizing of columns
		- custom rendering of cells
		- center text in columns
		- virtual mode
		- phone/ipad scrolling
		- freeze columns
	*/

    (function ($) {

        var mjGrid = {

            _init: function (options, el) {

                this.message("init");

                var default_options = {                    
                    columns: null,
                    rows: null,
                    pagesize: 10,                   // number of rows visible
                    columnFormatter: null,          // function to draw column header
                    cellFormatter: null              // function to draw a row                    
                };

                this.start = 0;

                this.settings = $.extend({}, default_options, options);
                this.el = el;
                this.$el = $(el);

                // plugin have been applied previously
                // blow away any existing instance

                this.close();

                this.render();
                this._startListening();

                return this;
            },

            render: function () {

                this.message("render");

                var str = "<div class='mj-grid'>";
               
                str += this.drawColumns();

                this.message(str);

                //str += "<div class='mj-grid-body'>";

                str += this.drawRows();
                //str += "</div>";

                str += "</div>";

                this.$el.html(str);

                return this;
            },

            drawColumns: function()
            {
                var self = this;

                var str = "<div class='mj-grid-row'>";

                if (self.settings.columns) {

                    $.each(self.settings.columns, function (index, o) {

                        str += "<div class='mj-grid-col-header mj-grid-cell' data-id='" + o.id + "'>";

                        if (self.settings.columnFormatter)
                        {
                            str + self.settings.columnFormatter(o);
                        }
                        else
                        {
                            str += o.text;
                        }

                        str += "</div>";
                    });
                }

                str += "</div>";

                return str;
            },

            drawRows: function (r) {

                var self = this;

                var str = "";

                if (self.settings.rows && this.settings.rows.length > 0) {

                    var n = this.start + this.settings.pagesize;
                    var m = this.settings.rows.length;
                    var len = this.settings.rows[0].length;

                    // virtual grid

                    for (var i = this.start; i < n && i < m; i++)
                    {
                        var r = self.settings.rows[i];

                        str += "<div class='mj-grid-row' data-id='" + i + "'>";

                        for (var j = 0; j < len; j++) {

                            str += "<div class='mj-grid-cell'>";

                            if (self.settings.cellFormatter) {
                                str + this.settings.cellFormatter(i, j);
                            }
                            else {
                                str += r[j];
                            }

                            str += "</div>";
                        }

                        str += "</div>";
                    }
                }

                return str;
            },

            _startListening: function () {

                var self = this;

                this._stopListening();

                this.$el.on("click", "div.mj-grid-cell", function (e) {

                    e.preventDefault();
                    var id = $(e.currentTarget).attr("mj-grid-cell-id");

                    var o = self.getRow(id);
                    self.$el.trigger("click", o);
                });

                this.$el.on("mouseover", "div.mj-grid-cell", function (e) {
    
                    e.preventDefault();    
                    var id = $(e.currentTarget).attr("mj-grid-cell-id");
                });
    
                this.$el.on("mouseout", "div.mj-grid-cell", function (e) {
    
                    e.preventDefault();    
                    var id = $(e.currentTarget).attr("mj-grid-cell-id");
                });
            },

            _stopListening: function () {
                this.$el.off();
            },

            //-----------------------------------------------------------------------------------
            // public methods


            disableRow: function (id) {
            },

            getRow: function (id) {

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

            getRowElement: function (id) {
                return this.$el.find("div.mj-grid li a.node[nodeid='" + id + "']");
            },

            message: function (msg) {

                if (window.console && window.console.log) {
                    console.log(msg);
                }
            },

            addRow: function (data) {

                this.settings.data.push(data);

                this._message(this.settings.data);

                var str = this._buildNode(data);

                this.$el.find("div.mj-grid").append(str);
            },

            insertRow: function (id, data) {

                var e = this.getRowElement(id);

                if (e) {

                    this.settings.data.push(data);
                    var str = this._buildNode(data);

                    e.parent().append(str);
                }
            },

            updateRow: function (data) {

                var e = this.getNodeElement(data.id);

                if (e) {

                    var node = this.getNode(data.id);
                    node = data;

                    var str = this._buildNode(data);
                    e.html(str);
                }
            },

            updateCell: function(data, i, j)
            {
            },

            deleteRow: function (id) {

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

            clear: function () {

                // clears the data

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
                this.$el.data(this, 'mj-grid-data', null);
                this.$el.html("");
            },

            colSpan: function (i, j, n) {

            },

            colSplit: function (i, j, data) {

            }
        }

        $.fn.mjGrid = function (options) {

            //function createmjGrid(name) {
            //    function F() { };
            //    F.prototype = mjGrid;
            //    var f = new F;
            //    return f;
            //}

            if (mjGrid[options]) {

                if ($(this).data('mj-grid-data')) {

                    return $(this).data('mj-grid-data')[options].apply($(this).data('mj-grid-data'), Array.prototype.slice.call(arguments, 1));

                }
            }
            else if (!options || typeof options === 'object') {

                // options is empty or an object

                // within a plugin use this not $(this)
                // check that element exists using this.length

                if (!this.length) {
                    $.error("mjGrid cant create since the base element to attach to does not exist");
                    return null;
                }

                // return is for chainability, dont have to return anything
                // if the selector was multiply defined you would be creating plugin for each selector

                return this.each(function (index, o) {

                    var x = Object.create(mjGrid);
                    //var mjGrid = createmjGrid();

                    x._init(options, this);
                    //$.removeData(this, 'griddata');
                    $.data(this, 'mj-grid-data', x);
                });
            }
            else {

                // method does not exist

                $.error('Method ' + options + ' does not exist on mjGrid');
            }
        };
    })(jQuery);

});

// grid = new Slick.Grid("#myGrid", data, columns, options);