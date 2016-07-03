var app = app || {};

app.EventCollection = Backbone.Collection.extend({

    model: app.EventModel,

    initialize: function()
    {

    },

    comparator: function (a, b) {

        if (!a || !b)
            return 0;

        var aval = a.get("dm1");
        var bval = b.get("dm1");

        if (!empty(aval) && !empty(bval)) {

            aval = a.get("dm1").unix();
            bval = b.get("dm1").unix();

            if (aval > bval) {
                //return (q.order != "desc") ? 1 : -1;
                return 1;
            } else if (aval < bval) {
                return -1;
            }

            return 0;
        }
        else {

            if (!aval)
                debug("facebookEventCollection:comparator: no aval");

            if (!bval)
                debug("facebookEventCollection:comparator: no bval");

            return 0;
        }
    },

    filterByDate: function (start_date, end_date) {

        //var t = timeStart();

        //var range = moment().range(start_date, end_date);

        var n = 0;

        this.forEach(function (o, index) {

            //if (start_date.overlap(start_date, end_date, o.get("d1"), o.get("d2"))) {
            if (start_date.overlap(start_date, end_date, o.get("dm1").toDate(), o.get("dm2").toDate())) {
                //if (start_date.between(o.get("d1"), o.get("d2")))
                //if (o.get("dm1").within(range))
                o.set("in_range", true);
                n++;
            }
            else {
                o.set("in_range", false);

                //debug(o.get("dm1").format() + " " + o.get("dm2").toDate());
            }
        });

        this.updateEventCount();

        //t = timeEnd(t);

        //debug("filterByDate: finish " + n + " in range events " + t + " milliseconds");

        return n;
    },

    updateEventCount: function ()
    {
        var n = 0;

        this.forEach(function (o, index) {

            if (o.get("in_range"))
                n++;
        });

        var msg = n + "/" + this.length + " events";

        Backbone.trigger("facebookEventCountChange", msg);
    }
});