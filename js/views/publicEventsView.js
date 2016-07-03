var app = app || {};

app.PublicEventsView = Backbone.View.extend({

    className: 'public-events-view',

    child_views: null,

    template: _.template($('#facebook-public-events-template').html()),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.facebook_model = options.facebook_model;

        this.listenTo(Backbone, "publicEventsLoaded", this.render);
    },
          
    render: function()
    {
        var self = this;

        var search_string = this.search_model.get("search_string");

        var events = this.facebook_model.get("public_events");

        this.closeChildViews();

        this.$el.html(this.template({ search_string: search_string }));

        events.forEach(function (o, index) {

            if (o.get("in_range")) {
                var view = new app.PublicEventView({ model: o, index: index + 1 });

                self.$("ul.public-events").append(view.render().el);
                self.child_views.push(view);
            }
        });

        return this;
    },

    events: {
        'click .search': 'search'
    },

    search: function(e)
    {
        e.preventDefault();

        var search_string = this.$(".search-string").val();

        this.$(".error-text").html("");

        if (empty(search_string)) {
            this.$(".error-text").html("must enter a search string");
            return false;
        }

        this.search_model.set("search_string", search_string);

        //this.facebook_model.getPublicEventsFQL();
        this.facebook_model.getEvents({type: "public", search_string: search_string});
        this.facebook_model.set("event_type", "public");
    },

    closeChildViews: function () {

        _.each(this.child_views, function (o) {
            o.close();
        });

        this.child_views = [];
    },

    close: function () {

        this.closeChildViews();

        this.stopListening();
        this.unbind();
        this.remove();
    }
});
