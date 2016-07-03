var app = app || {};

app.NetworkView = app.BaseView.extend({

    el: '#networks',

    template: _.template($('#network-template').html()),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.dawg_model = options.dawg_model;
        this.facebook_model = options.facebook_model;

        this.current_view = null;

        this.render();

        //this.listenTo(Backbone, "dawgEventCountChange", this.dawgEventCountChange);
        this.listenTo(Backbone, "facebookEventCountChange", this.facebookEventCountChange);
        this.listenTo(Backbone, "facebookFriendCountChange", this.facebookFriendCountChange);
        //this.listenTo(Backbone, "bookmark:change", this.bookmarkChange);
        this.listenTo(Backbone, "gotFriends", this.gotFriends);
    },

    gotFriends: function(count)
    {
        this.$(".message").html(count + " friends");
    },

    render: function () {

        this.$el.html(this.template());

        // by default make the facebook view

        //this.facebookInfo();

        //this.bookmarkChange();
    },

    events: {
        //'click .dawg': 'dawg',
        //'click .facebook': 'facebook',
        //'click .favourites': 'favourites',
    },

    facebookFriendCountChange: function (msg) {

        this.$(".facebook .message").html(msg);
    },

    facebookEventCountChange: function (msg) {

        this.$(".facebook .count").html(msg);
    },

    dawgEventCountChange: function(msg)
    {
        this.$(".dawg .count").html(msg);
    },

    bookmarkChange: function()
    {
        var a = app.getBookmarks(app.NETWORK_DAWG);
        var b = app.getBookmarks(app.NETWORK_FACEBOOK);

        //var str = "facebook: " + b.length + " dawg: " + a.length;
        var str = "facebook: " + b.length;
        this.$(".favourites .count").html(str);
    },

    switchActive: function (e) {
        e.preventDefault();
        this.$("#networks .active").removeClass("active");
        $(e.target).parent().addClass("active");
    },

    dawg: function (e) {
        this.switchActive(e);
        //Backbone.trigger("dawg:search");
        this.dawgInfo();
    },

    dawgInfo: function()
    {
        if (this.current_view)
            this.current_view.close();
    },

    facebook: function (e) {

        this.switchActive(e);
        //Backbone.trigger("facebook:search");
        //Backbone.trigger("eventsLoaded", app.NETWORK_FACEBOOK);
        //this.facebookInfo();
    }

    //facebookInfo: function()
    //{
    //    if (this.current_view)
    //        this.current_view.close();

    //    //this.current_view = new app.InfoView({ search_model: this.search_model, facebook_model: this.facebook_model });
    //    this.current_view = new app.FilterView({ search_model: this.search_model, facebook_model: this.facebook_model });
    //    this.$el.html(this.current_view.render().el);

    //    this.render();
    //}

    /*
    favourites: function (e) {
        this.switchActive(e);
        Backbone.trigger("getFavoutites");
    }
    */
});
