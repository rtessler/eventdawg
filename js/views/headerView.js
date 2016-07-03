var app = app || {};

app.HeaderView = app.BaseView.extend({

    el: '#header',

    template: _.template($('#header-template').html()),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.dawg_model = options.dawg_model;
        this.facebook_model = options.facebook_model;
              
        this.render();

        this.listenTo(Backbone, "facebookGotMyDetails", this.facebookGotMyDetails);
        this.listenTo(Backbone, "loggedOut", this.loggedOut);
        this.listenTo(Backbone, "login", this.login);
        this.listenTo(Backbone, "showMessage", this.showMessage);
    },

    render: function () {

        this.$el.html(this.template({ name: 'EVENT DAWG' }));

        this.$(".menu li").hover(

            // show submenu

            function (e) {
                $(this).find('ul.submenu.enabled').show();
            },
            function (e) {
                $(this).find('ul.submenu.enabled').hide();
            }
        );

        return this;
    },

    events: {
        'click .login': 'login',
        'click .details': 'details',
        'click .change-password': 'changePaassword',
        'click .logout': 'logout'
    },

    login: function(e)
    {
        var self = this;

        this.facebook_model.login()
        .then(function (response) {

            if (response.authResponse && response.status == 'connected') {
                self.facebook_model.getEvents({ id: null, force: null });
            }

        });
    },

    details: function(e)
    {
    },

    changePassword: function(e)
    {
    },

    logout: function(e)
    {
        this.facebook_model.logout()
        .then(function (response) {

            Backbone.trigger("loggedOut");
        });
    },

    facebookGotMyDetails: function () {

        var me = this.facebook_model.get("me");

        this.$(".submenu").addClass("enabled");              

        this.$(".login span.text").html(me.get("name"));
        this.$(".login img.image").attr("src", me.get("pic_square"));            
    },

    loggedOut: function () {

        this.$(".submenu").removeClass("enabled");
        this.$('ul.submenu').hide();

        this.$(".login span.text").html("login");
        this.$(".login img.image").attr("src", "");
    },

    showMessage: function (message) {

        var self = this;

        debug("showMessage: " + message);

        this.$(".message").html(message);

        this.$(".message").addClass("message-flash");
        
        setTimeout(function () { self.$(".message").removeClass("message-flash"); self.$(".message").html(""); }, 2000);
    }
});
