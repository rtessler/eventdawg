var app = app || {};

app.FeaturedEventsView = Backbone.View.extend({

    className: 'featured-events-view',

    child_views: null,

    template: _.template($('#facebook-events-template').html()),

    initialize: function (options) {

        this.facebook_model = options.facebook_model;
    },

    render: function () {

        var self = this;

        var events = this.facebook_model.get("featured_events");

        this.closeChildViews();

        this.$el.html(this.template({ title: "Featured Events" }));

        events.forEach(function (o, index) {

            var view = new app.EventView({ model: o, facebook_model: self.facebook_model, index: index + 1 });

            self.$("ul.events").append(view.render().el);
            self.child_views.push(view);
        });

        return this;
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
