var app = app || {};

app.EventModel = Backbone.Model.extend({

    idAttribute: "eid",

    initialize: function () {

    },       

    defaults: {

        // facebook fields

        name: "",
        description: "",
        location: null,
        start_time: null,
        end_time: null,     
        privacy: null,
        ticket_uri: null,
        pic: null,
        pic_big: null,
        pic_small: null,
        pic_square: null,
        owner_id: null,   
        owner_name: null,
   
        // generated fields

        venue_id: null,
        in_range: false,
        dm1: null,
        dm2: null,        

        venue_id: null,
        latitude: null,
        longitude: null,
        city: null,
        country: null,
        state: null,
        street: null,
        zip: null,

        in_range: false
    },

    // venue: {street, city, state, zip, country, latitude, longitude}

    validation: {

        name: {
            required: true,
            msg: 'Please enter a valid name'
        },

        start_date: {
            required: true,
            msg: 'Please enter a start date'
        }
    },

    filterByDate: function (start_date, end_date) {

        var range = moment().range(start_date, end_date);

        if (this.get("dm1").within(range)) {
            this.set("in_range", true);
            return true;
        }

        this.set("in_range", false);

        return false;
    },

    inBounds: function(bounds)
    {
        if ( !empty(bounds) && !empty(this.get("latitude")) && !empty(this.get("longitude")) ) {

            if (this.get("latitude") >= bounds.sw_lat && this.get("latitude") <= bounds.ne_lat &&
                this.get("longitude") >= bounds.sw_lng && this.get("longitude") <= bounds.ne_lng)
                return true;
        }

        return false;
    }

});
