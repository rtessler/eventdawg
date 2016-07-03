var app = app || {};

app.SearchModel = Backbone.Model.extend({

    defaults: {
        EVENT_LIMIT: 1000,
        MAX_EVENTS: 5000,
        TIMEOUT: 50000,
        date_range: app.DATE_RANGE_DAY,
        bounds: { sw_lat: -90, sw_lng: -180, ne_lat: 90, ne_lng: 180 },
        center: { lat: 51.517, lng: 0.106},     // london
        search_string: app.location.city, //geoip_city(),
        where_string: null
    },

    initialize: function (options) {

        //this.listenTo(Backbone, 'search', this.search);
        this.listenTo(Backbone, 'saveBounds', this.saveBounds);
        this.listenTo(Backbone, 'saveCenter', this.saveCenter);

        var m = moment().startOf('day');

        this.set('start_date', m.toDate());
        this.set('end_date', m.add('days', 1).toDate());
    },

    clear: function()
    {
        this.date_range = app.DATE_RANGE_DAY;
        this.bounds = { sw_lat: -90, sw_lng: -180, ne_lat: 90, ne_lng: 180 };
        this.center = { lat: 51.517, lng: 0.106 };
        //this.start_date = new Date();
        //this.end_date = new Date().addDays(1);

        var m = moment().startOf('day');

        this.set('start_date', m.toDate());
        this.set('end_date', m.add('days', 1).toDate());

        this.search_string = app.location.city;     //geoip_city();
        this.where_string = null;
    },

    saveBounds: function (bounds) {

        this.set("bounds", bounds);
    },

    saveCenter: function (center) {

        this.set("center", center);
    }

});