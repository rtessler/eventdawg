var app = app || {};

app.SidebarView = app.BaseView.extend({

    el: '#sidebar',

    template: _.template($('#sidebar-template').html()),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.dawg_model = options.dawg_model;
        this.facebook_model = options.facebook_model;

        this.render(options);
    },

    render: function (options) {
              
        this.$el.html(this.template());

        view = new app.FilterView({ search_model: this.search_model, facebook_model: this.facebook_model });
        this.$("#network-info .facebook-info").html(view.render().el);

        return this;
    }

});
