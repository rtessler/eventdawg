var app = app || {};

app.FooterView = app.BaseView.extend({

    el: '#footer',

    template: _.template($('#footer-template').html()),

    initialize: function (options) {

        this.render();
    },

    render: function () {

        this.$el.html(this.template());
        return this;
    }
});
