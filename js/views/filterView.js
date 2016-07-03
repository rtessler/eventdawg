var app = app || {};

app.FilterView = Backbone.View.extend({
        
    className: "filters-view",

    child_views: null,

    FRIEND_VIEW: 1,
    EVENT_VIEW: 2,
    PUBLIC_VIEW: 3,

    current_view: 0,

    expanded: false,

    template: _.template($('#facebook-filter-template').html()),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.facebook_model = options.facebook_model;
        //this.render();

        this.listenTo(Backbone, "dateRangeChange", this.render);
        this.listenTo(Backbone, "loggedOut", this.loggedOut);
        this.listenTo(Backbone, "gotEvents", this.gotEvents);

        //this.listenTo(Backbone, "publicEventsLoaded", this.renderPublicEvents);
    },

    gotEvents: function ()
    {
        this.current_view = this.FRIEND_VIEW;
        this.render();
    },

    render: function () {

        this.$el.html(this.template());

        switch (this.current_view) {

            case this.FRIEND_VIEW:
                this.showFriends();
                break;

            case this.EVENT_VIEW:
                this.showEvents();
                break;

            case this.PUBLIC_VIEW:
                this.showPublicEvents();
                break;
        }

    //  var data = [{ id: 1, text: "attending", selected: 1, image: "js/lib/multilist/images/test.png" },
    //{ id: 2, text: "unsure", selected: 1, image: "js/lib/multilist/images/test.png" },
    //{ id: 3, text: "declined", selected: 1, image: "js/lib/multilist/images/test.png" },
    //{ id: 4, text: "not replied", selected: 1, image: "js/lib/multilist/images/test.png" }];

    //  this.$(".rsvp-status").multilist({ data: data, type: "checkbox" });

    //  var data = [{ id: 1, text: "date", selected: 1, image: "js/lib/multilist/images/test.png" },
    //{ id: 2, text: "name", selected: 0, image: "js/lib/multilist/images/test.png" }];

    //  this.$(".sort").multilist({ data: data, type: "radiobutton" });

        return this;
    },

    events: {
        'click .friends-btn': 'showFriends',
        'click .events-btn': 'showEvents',
        'click .public-btn': 'showPublicEvents',
        'click .add-btn': 'add',
        'click .expand-btn': 'expandCollapse',
        //'click .search': 'findPublicEvents',
        'click .list-btn': 'toggleList'
    },

    toggleList: function() {

        if ($(".event-list-view").is(":visible"))
        {
            this.$(".list-btn img").attr("src", "img/list3.png");
            Backbone.trigger("showMap");  
        }
        else
        {
            
            this.$(".list-btn img").attr("src", "img/public2.png");
            Backbone.trigger("showList");  
        }
    },

    loggedOut: function()
    {
        this.closeChildViews();
        this.current_view = null;
    },

    showFriends: function (e) {

        var self = this;

        if (e)
            e.preventDefault();

        Backbone.trigger("closeEventDetails");

        this.closeChildViews();
        this.$(".list").html("");

        if (self.facebook_model.get("event_type") == "public") {

            this.facebook_model.set("event_type", "friend");
            Backbone.trigger("redraw", { network: app.NETWORK_FACEBOOK });
        }
              
        this.facebook_model.getLoginStatus()
        .then(function (response) {

            if (response.authResponse && response.status == "connected") {

                var view = new app.FriendsView({ search_model: self.search_model, facebook_model: self.facebook_model });
                self.$(".list").append(view.render().el);
                self.child_views.push(view);
                self.current_view = self.FRIEND_VIEW;
            }
            else {

                Backbone.trigger("login");
            }
        });

        //$("#main-content").css("height", "");
    },

    showEvents: function (e) {

        var self = this;

        if (e)
            e.preventDefault();

        Backbone.trigger("closeEventDetails");
        
        this.closeChildViews();

        this.$(".list").html("");

        if (self.facebook_model.get("event_type") == "public") {

            this.facebook_model.set("event_type", "friend");
            Backbone.trigger("redraw", { network: app.NETWORK_FACEBOOK });
        }

        this.facebook_model.set("event_type", "friend");

        this.facebook_model.getLoginStatus()
        .then(function (response) {

            if (response.authResponse && response.status == "connected") {

                var view = new app.EventsView({ search_model: self.search_model, facebook_model: self.facebook_model });
                self.$(".list").append(view.render().el);
                self.child_views.push(view);
                self.current_view = self.EVENT_VIEW;
            }
            else {
                Backbone.trigger("login");
            }
        });

        //$("#main-content").css("height", "");
    },

    showPublicEvents: function(e)
    {
        var self = this;

        if (e)
            e.preventDefault();

        Backbone.trigger("closeEventDetails");

        if (self.facebook_model.get("event_type") == "friend") {

            this.facebook_model.set("event_type", "public");
            Backbone.trigger("redraw", { network: app.NETWORK_FACEBOOK });
        }

        self.closeChildViews();

        self.$(".list").html("");

        var view = new app.PublicEventsView({ search_model: self.search_model, facebook_model: self.facebook_model });

        self.$(".list").append(view.render().el);
        self.child_views.push(view);

        self.current_view = this.PUBLIC_VIEW;

        //$("#main-content").css("height", "");
    },

    /*
    findPublicEvents: function (e) {

        var self = this;

        if (e)
            e.preventDefault();

        this.facebook_model.getLoginStatus()
        .then(function (response) {

            if (response.authResponse && response.status == "connected") {

                self.facebook_model.getPublicEvents();
            }
            else {
                Backbone.trigger("login");
            }
        });
    },
    */

    add: function(e)
    {
        e.preventDefault();

        Backbone.trigger("closeEventDetails");

        var view = new app.EditEventView({ search_model: this.search_model, facebook_model: this.facebook_model });

        var options =
            {
                //fadeInDuration: 150,
                //fadeOutDuration: 150,
                showCloseButton: false,
                bodyOverflowHidden: false
                //closeImageUrl: "img/x-light.png",
                //closeImageHoverUrl: "img/x-dark.png",
            };

        view.render().showModal(options);
    },

    expandCollapse: function(e)
    {
        if (this.expanded) {

            this.$(".friend-events").slideUp("fast", function () { });
            this.$(".events .people").slideUp("fast", function () { });

            this.$(".expand-btn").html(app.TRIANGLE_DOWN);                  

            this.expanded = false;
        }
        else {

            this.$(".friend-events").slideDown("fast", function () { });
            this.$(".events .people").slideDown("fast", function () { });

            this.$(".expand-btn").html(app.TRIANGLE_UP);

            this.expanded = true;
        }
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
