var app = app || {};

app.FriendView = app.BaseView.extend({

    tagName: 'li',

    template: _.template($('#facebook-friend-template').html()),

    initialize: function (options) {

        this.model = options.model;
        this.in_range_events = options.in_range_events;
        this.facebook_model = options.facebook_model;
        this.rsvp_status = options.rsvp_status;
    },

    render: function () {

        var self = this;
        var count = "0 events";              

        if (this.in_range_events.length == 1)
            count = "1 event";
        else 
            count = this.in_range_events.length + " events";

        //if (this.model.get("pic_square"))
            this.$el.html(this.template({ id: this.model.id, image: this.model.get("pic_square"), name: this.model.get("name"), count: count, events: this.in_range_events, rsvp_status: this.rsvp_status }));
        //else
        //    this.$el.html(this.template({ id: this.model.id, image: this.model.get("picture").data.url, name: this.model.get("name"), count: count, events: this.in_range_events, rsvp_status: this.rsvp_status }));

        return this;
    },

    events: {
        'click a.item.friend': 'select',
        'click .event': 'selectEvent'
    },

    select: function (e) {

        e.preventDefault();

        this.$(".friend-events").slideToggle("fast");
    },
          
    selectEvent: function (e) {

        e.preventDefault();

        var id = $(e.currentTarget).attr("data-id");

        var events = this.facebook_model.get("friend_events");
        //var events = this.facebook_model.events;

        var f = events.get(id);

        Backbone.trigger("showEventDetails", f);
    }
          
});
