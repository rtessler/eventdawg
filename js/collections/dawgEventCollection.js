var app = app || {};

app.DawgEventCollection = Backbone.Collection.extend({

    model: app.DawgEvent,

    url: "/api/v1/search/format/json"
});