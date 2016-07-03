var app = app || {};

app.PromoteView = Backbone.ModalView.extend({

    className: 'promote-view',

    template: _.template($('#promote-template').html()),

    initialize: function (options) {

        this.model = options.model;
        this.search_model = options.search_model;
        this.facebook_model = options.facebook_model;
    },

    events: {
        'click button.ok': 'ok',
        'click button.cancel': 'cancel',
        'keypress form': 'keypress',
        'change .start_date': 'dateChange',
        'change .end_date': 'dateChange'
    },

    getAddress: function()
    {
        var address = "";

        var m = this.model.toJSON();

        if (!empty(m.location))
            address += m.location;

        var venue_id = m.venue_id;

        if (venue_id) {

            if (!empty(m.street))
                address += " " + m.street;

            if (!empty(m.city))
                address += " " + m.city;

            if (!empty(m.state))
                address += " " + m.state;

            if (!empty(m.zip))
                address += " " + m.zip;

            if (!empty(m.country))
                address += " " + m.country;
        }

        var location = "";

        if (!venue_id || empty(m.latitude) || empty(m.longitude)) {
            location = " (no map location)";
        }

        return address + location;
    },

    render: function () {

        var self = this;

        this.$el.html(this.template({ model: this.model.toJSON(), address: this.getAddress() }));

        this.$(".start-date").datepicker({ dateFormat: "d M yy", changeMonth: true, changeYear: true, minDate: "-7D", maxDate: "+1Y" });   // "+1M +10D" 
        this.$(".end-date").datepicker({ dateFormat: "d M yy", changeMonth: true, changeYear: true, minDate: "-7D", maxDate: "+1Y" });

        this.$(".start-time").timepicker();
        this.$(".end-time").timepicker();

        this.$(".start-date").val(moment().format("D MMM YYYY"));
        this.$(".end-date").val(moment().add('d', 1).format("D MMM YYYY"));

        this.$(".start-time").val("12:00am");
        this.$(".end-time").val("12:00am");

        return this;
    },

    dateChange: function () {

        this.search_model.set("start_date", moment(this.$(".start_date").val()).toDate());
        this.search_model.set("end_date", moment(this.$(".end_date").val()).toDate());
    },

    keypress: function (e) {

        //_.bindAll();

        var ENTER_KEY = 13;

        //if (e.keyCode != ENTER_KEY) return;
        if (e.which === ENTER_KEY) {

            // need to save values in model

            //var name = this.$(".name").val();
            //this.model.set("name", name);
            this.ok(e);
        }
    },

    ok: function (e) {

        e.preventDefault();

        debug("ok");

        app.hideIOSKeyboard();

        this.$(".error-msg").html("");

        var start_date = moment(this.$(".start-date").val());
        var end_date = moment(this.$(".end-date").val());

        var start_time = this.$(".start-time").val();
        var end_time = this.$(".end-time").val();

        debug("start_date = " + start_date);
        debug("end_date = " + end_date);
        debug("start_time = " + start_time);
        debug("end_time = " + end_time);

        var dt = this.$(".start-time").timepicker('getTime', new Date());
        start_date.hour(dt.getHours());
        start_date.minute(dt.getMinutes());

        dt = this.$(".end-time").timepicker('getTime', new Date());
        end_date.hour(dt.getHours());
        end_date.minute(dt.getMinutes());

        debug(moment(start_date).format());
        debug(moment(end_date).format());

        if (moment(start_date).unix() > moment(end_date).unix()) {

            this.$(".error-msg.start").html("Start date must be before end date");
            return;
        }

        this.hideModal();
        this.close();

        this.facebook_model.addFeaturedEvent({
            event: this.model,
            featured_start_date: moment(start_date).unix(),
            featured_end_date: moment(end_date).unix(),
            social_network_id: app.NETWORK_FACEBOOK
        });

        Backbone.trigger("showMessage", "event promoted");
    },

    cancel: function () {
        this.hideModal();
        this.close();
    },

    close: function () {

        this.stopListening();
        this.unbind();
        this.remove();
    }

});
