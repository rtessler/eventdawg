var app = app || {};

app.EventView = app.BaseView.extend({

    tagName: 'li',

    template: _.template($('#facebook-event-template').html()),

    initialize: function (options) {

        this.model = options.model;
        this.facebook_model = options.facebook_model;
        this.index = options.index;
        this.render();
    },

    render: function () {

        var self = this;
        var marker = "facebook-marker.png";

        //if (this.index < 11)
        //    marker = this.index + ".png";

        var people = [];

        var event_members = this.facebook_model.get("event_members");
        var friends = this.facebook_model.get("friends");

        var who = event_members.filter(function (o) { return o.get("eid") == self.model.get("eid") });
             
        who.forEach(function (o) {

            var f = friends.get(o.get("uid"));

            if (f)
            {
                people.push(f.get("name"));
            }
        });

        this.$el.html(this.template({ model: this.model.toJSON(), marker: marker, people: people }));

        return this;
    },

    events: {
        'click .event': 'select'
    },

    select: function (e) {

        e.preventDefault();

        this.$(".people").slideToggle("fast");

        Backbone.trigger("showEventDetails", this.model);
    }

});
