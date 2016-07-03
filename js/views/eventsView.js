var app = app || {};

app.EventsView = Backbone.View.extend({

        className: 'events-view',

        child_views: null,

        template: _.template($('#facebook-events-template').html()),

        initialize: function (options) {

            this.search_model = options.search_model;
            this.facebook_model = options.facebook_model;
        },
          
        render: function()
        {
            var self = this;

            var events = this.facebook_model.get("friend_events");

            this.closeChildViews();

            this.$el.html(this.template({ title: "" }));

            events.forEach(function (o, index) {

                if (o.get("in_range"))
                {
                    var view = new app.EventView({ model: o, facebook_model: self.facebook_model, index: index + 1 });

                    self.$("ul.events").append(view.render().el);
                    self.child_views.push(view);
                }
            });

            //this.$(".facebook-filter-nano").nanoScroller();

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
