var app = app || {};

app.EventListView = app.BaseView.extend({

    className: 'event-list-view',

    template: _.template($('#event-list-template').html()),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.facebook_model = options.facebook_model;

        this.listenTo(Backbone, "sliderChange", this.redraw);
        this.listenTo(Backbone, "dateRangeChange", this.redraw);
        this.listenTo(Backbone, "publicEventsLoaded", this.redraw);
        this.listenTo(Backbone, "redraw", this.redraw);
    },

    render: function () {

        var self = this;

        var events = this.facebook_model.getCurrentEvents();

        // filter returns an array of models

        this.filtered_events = events.filter(function (e) { return e.get("in_range"); });

        this.filtered_events = new Backbone.Collection(this.filtered_events);

        //this.$el.html(this.template({ events: this.filtered_events }));

        this.image_count = 0;

        this.$el.html(this.template({ events: this.filtered_events.toJSON() }));

        return this;
    },

    imageLoaded: function(e)
    {
        var self = e.data.self;

        self.image_count++;

        if (self.image_count == self.filtered_events.length)
        {
            self.$('ul.tiles li').trigger('refreshWookmark');
        }
    },

    postRender: function()
    {
        var handler = this.$('ul.tiles li');
      
        var loadedImages = 0;

        var options = {
            align: "left",
            // Prepare layout options.
            autoResize: true, // This will auto-update the layout when the browser window is resized.
            container: this.$el, // Optional, used for some extra CSS styling
            offset: 5, // Optional, the distance between grid items
            outerOffset: 5, // Optional, the distance to the containers border
            itemWidth: 195, // Optional, the width of a grid item
            fillEmptySpace: true
        };

        //handler.wookmark(options);

        //this.$("ul.tiles li a.link img").on("load", { self: this }, this.imageLoaded);

        Backbone.trigger("tasksStart");

        this.$('ul.tiles').imagesLoaded(function () {
            // Call the layout function.
            handler.wookmark(options);

            // Capture clicks on grid items.
            //handler.click(function () {
            //    // Randomize the height of the clicked item.
            //    var newHeight = $('img', this).height() + Math.round(Math.random() * 300 + 30);
            //    $(this).css('height', newHeight + 'px');

            //    // Update the layout.
            //    handler.wookmark();
            //});
        }).progress(function (instance, image) {

            // Update progress bar after each image load

            loadedImages++;

            if (loadedImages == handler.length)
                Backbone.trigger("tasksStop");

            
        });

        //handler.wookmarkInstance.filter(activeFilters, 'or');
    },

    redraw: function () {

        this.render();
        this.postRender();
        //this.$('.tiles li').trigger('refreshWookmark');
    }
});
