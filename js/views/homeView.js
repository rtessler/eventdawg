var app = app || {};

app.HomeView = app.BaseView.extend({

    el: '#content',
    id: null,

    template: _.template($('#home-template').html()),

    initialize: function (options) {

        var self = this;

        app.getMyLocation();

        this.listenTo(Backbone, "locationChange", function () {

            self.render();

            self.search_model = app.search_model;
            //this.dawg_model = new app.DawgModel({ search_model: this.search_model });
            self.facebook_model = new app.FacebookModel({ search_model: self.search_model });

            var o = { search_model: self.search_model, dawg_model: self.dawg_model, facebook_model: self.facebook_model };

            self.header_view = new app.HeaderView(o);

            self.sidebar_view = new app.SidebarView(o);
            self.top_panel_view = new app.TopPanelView(o);

            self.map_view = new app.MapView(o);
            self.$("#main-content .map").html(self.map_view.render().el);
            self.map_view.init();

            self.list_view = null;

            new app.FooterView();

            //Backbone.trigger("dawg:search", true);

            if (options && options.id)
                self.id = options.id;

            self.facebook_model.loadAPI(self.getEvents, self);

            self.listenTo(Backbone, "showMap", self.showMap);
            self.listenTo(Backbone, "showList", self.showList);
            self.listenTo(Backbone, "showEventDetails", self.showEventDetails);
            self.listenTo(Backbone, "featuredEventsLoaded", self.showFeaturedEvents);
        });
    },

    showEventDetails: function(e)
    {
        var view = new app.EventDetailsView({model: e,
            facebook_model: this.facebook_model
        });

        this.$(".right-panel .event-details").html(view.render().el);
        view.postRender();
    },

    showFeaturedEvents: function () {

        var view = new app.FeaturedEventsView({
            facebook_model: this.facebook_model
        });

        this.$(".right-panel .featured-events").html(view.render().el);
    },

    getEvents: function(self)
    {
        self.facebook_model.getLoginStatus()
        .then(function (response) {

            if (response.authResponse && response.status == 'connected')

                if (self.id)
                    self.facebook_model.getEvents({ id: self.id, force: false });
                else
                    self.facebook_model.getEvents({ id: null, force: false });
                
        });
    },

    showList: function()
    {
        var self = this;

        //if (this.map_view)
        //{
        //    this.map_view.close();
        //    this.map_view = null;
        //}

        if (this.map_view)
            this.map_view.$el.hide();

        if (this.list_view) {
            this.list_view.$el.show();
            this.list_view.render();
            this.list_view.postRender();
        }
        else {

            var options = { search_model: this.search_model, dawg_model: this.dawg_model, facebook_model: this.facebook_model };

            this.list_view = new app.EventListView(options);

            this.$("#main-content .list").html(this.list_view.render().el);

            self.list_view.postRender();

            //setTimeout(function() {
            //self.list_view.postRender();
            //}, 200);
        }

        //$("#main-content").css("height", "");
    },

    showMap: function()
    {
        //if (this.list_view)
        //{
        //    this.list_view.close();
        //    this.list_view = null;
        //}

        if (this.list_view)
            this.list_view.$el.hide();

        if (this.map_view) {
            this.map_view.$el.show();
        }
        else {

            var options = { search_model: this.search_model, dawg_model: this.dawg_model, facebook_model: this.facebook_model };

            this.map_view = new app.MapView(options);
            this.$("#main-content .map").html(this.map_view.render().el);
            this.map_view.init();
        }

        //$("#main-content").css("height", "");
    },

    render: function () {
              
        this.$el.html(this.template());
    }
});
