var app = app || {};

app.LoadingView = app.BaseView.extend({

    el: '.loading',

    template: _.template($('#loading-template').html()),

    initialize: function (options) {

        this.render();
    },

    render: function () {
              
        this.$el.html(this.template());
    }
});
