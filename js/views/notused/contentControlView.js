var app = app || {};

app.ContentControlView = app.BaseView.extend({

    className: 'content-control-view',

    template: _.template($('#content-control-template').html()),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.facebook_model = options.facebook_model;

        this.listenTo(Backbone, "changeContent", this.render);
    },

    render: function () {

        var self = this;

        this.$el.html(this.template({}));

        return this;
    }

});
