var app = app || {};

app.PublicEventView = app.BaseView.extend({

    tagName: 'li',

    template: _.template($('#facebook-public-event-template').html()),

    initialize: function (options) {

        this.model = options.model;
        this.index = options.index;
        this.render();
    },

    render: function () {

        var marker = "facebook-marker.png";

        //if (this.index < 11)
        //    marker = this.index + ".png";

        this.$el.html(this.template({ model: this.model.toJSON(), marker: marker }));

        return this;
    },

    events: {
        'click .public-event': 'select'
    },

    select: function (e) {

        e.preventDefault();

        Backbone.trigger("showEventDetails", this.model);
    }
});
