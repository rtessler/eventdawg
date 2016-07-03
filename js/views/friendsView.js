var app = app || {};

app.FriendsView = Backbone.View.extend({

    className: 'friends-view',

    child_views: null,

    template: _.template($('#facebook-friends-template').html()),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.facebook_model = options.facebook_model;
    },

    render: function () {

        var self = this;

        this.closeChildViews();

        this.$el.html(this.template());
            
        // me first

        var me = this.facebook_model.get("me");
        var friends = this.facebook_model.get("friends");

        if (me) {

            o = this.facebook_model.getUserEvents(me.get("uid"));

            // always show me

            var view = new app.FriendView({ model: me, in_range_events: o.in_range_events, facebook_model: this.facebook_model, rsvp_status: o.rsvp_status });

            this.$("ul.friends").append(view.render().el);
            this.child_views.push(view);
        }

        // friends 

        var n = 1;

        friends.forEach(function (f) {

            var o = self.facebook_model.getUserEvents(f.get("uid"));

            if (o.in_range_events.length > 0) {

                var view = new app.FriendView({ model: f, in_range_events: o.in_range_events, facebook_model: self.facebook_model, rsvp_status: o.rsvp_status });

                self.$("ul.friends").append(view.render().el);
                self.child_views.push(view);

                n++;
            }
        });

        var msg = n + "/" + friends.length + " friends";
        Backbone.trigger("facebookFriendCountChange", msg);

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
