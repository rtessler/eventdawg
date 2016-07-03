var app = app || {};

app.BaseView = Backbone.View.extend({

    close: function () {

        this.stopListening();
        this.unbind();
        this.remove();
    }
});
