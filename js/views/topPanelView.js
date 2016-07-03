var app = app || {};

app.TopPanelView = app.BaseView.extend({

    el: '#top-panel',

    template: _.template($('#top-panel-template').html()),

    initialize: function (options) {

        this.render();

        var view = new app.NetworkView(options);
        //view.facebookInfo();

        new app.WhereView(options);
        new app.WhenView(options);
        new app.SliderView(options);              
    },

    render: function () {
              
        this.$el.html(this.template());
    }
});
