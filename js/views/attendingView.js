var app = app || {};

app.AttendingView = app.BaseView.extend({

    className: "attending-view",

    template: _.template($('#attending-template').html()),

    initialize: function (options) {

        this.event = options.event;
        this.facebook_model = options.facebook_model;
    },

    events: {
        'mouseover a.user': 'mouseoverUser',
        'click a.user': 'showUser'
    },

    render: function () {

        var self = this;

        var going = [];
        var maybe = [];
        var invited = [];

        var me = self.facebook_model.get("me");
        var friends = self.facebook_model.get("friends");
        var event_members = this.facebook_model.get("event_members");

        event_members.forEach(function (o) {

            if (o.get("eid") == self.event.get("eid")) {

                // this person is attenging the event

                var f = friends.get(o.get("uid"));

                if (!f)
                {
                    // maybe its me

                    if (me.get("uid") == o.get("uid"))
                        f = me;
                }

                if (f)
                {
                    switch (o.get("rsvp_status")) {
                        case "attending":
                            going.push({ uid: f.get("uid"), name: f.get("name"), pic_square: f.get("pic_square") });
                            break;
                        case "maybe":
                        case "unsure":
                        
                            maybe.push({ uid: f.get("id"), name: f.get("name"), pic_square: f.get("pic_square") });
                            break;
                        case "invited":
                        case "not_replied":
                            invited.push({ uid: f.get("id"), name: f.get("name"), pic_square: f.get("pic_square") });
                            break;
                    }

                }
            }

            return this;
        });

        this.$el.html(this.template({ going: going, maybe: maybe, invited: invited }));

        return this;
    },

    mouseoverUser: function (e) {

        e.preventDefault();
    },

    showUser: function (e) {

        e.prevendDefault();

    }
});