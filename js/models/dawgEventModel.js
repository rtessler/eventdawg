var app = app || {};

app.DawgEvent = Backbone.Model.extend({

    idAttribute: "id",

    url: "/api/v1/getEventDetails/format/json",
        
    defaults: {
        nm: "NA",
        sd: null,
        ed: null,
        ct: [],
        lat: -33.848352,
        lng: 151.207873,
        marked: null
    },

    initialize: function (options) {
    }

});
