var app = app || {};

app.SliderView = app.BaseView.extend({

    SLIDER_MAX: 300,
    T24_HOUR_TIME: true,

    el: '.time-slider-bar',

    template: _.template($('#slider-template').html()),

    initialize: function (options) {

        var self = this;

        this.search_model = options.search_model;
        this.facebook_model = options.facebook_model;

        this.render();

        this.listenTo(Backbone, "dateRangeChange", this.redraw);

        var events;

        $("#slider").dragslider({
            range: true,
            animate: true,
            rangeDrag: true,
            min: 0,
            max: self.SLIDER_MAX,
            values: [ 0, self.SLIDER_MAX ],
            //value: 1,
            slide: function( event, ui ) {
                    
                self.search_model.set("start_date", self.sliderToDate(ui.values[0]));
                self.search_model.set("end_date", self.sliderToDate(ui.values[1]));                

                events.filterByDate(self.search_model.get("start_date"), self.search_model.get("end_date"));

                Backbone.trigger("sliderChange");
            }
        });

        $("#slider").on('mousedown', function (e) {
            Backbone.trigger("closeEventDetails");
            events = self.facebook_model.getCurrentEvents();
        });
    },

    render: function () {
            
        this.$el.html(this.template());
        this.redraw();

        return this;
    },

    sliderToDate: function(val)
    {
        var offset = val / this.SLIDER_MAX;      // 0..1  
        var t;
            
        var start_date = this.search_model.get("start_date");
        var end_date = this.search_model.get("end_date");
        var t1 = start_date.getTime();
        var t2 = end_date.getTime();
            
        switch (this.search_model.get("date_range"))
        {
        case app.DATE_RANGE_DAY:
                t = 24.0 * offset;
                //t = 24.0 * offset;
                //dt = today.addHours(t);
                break;
        case app.DATE_RANGE_WEEK:                
                t = 7.0 * 24.0 * offset;
                //t = 7.0 * offset;
                //dt = today.addDays(t);
                break;
        case app.DATE_RANGE_MONTH:  
                t = 30.0 * 24.0 * offset;
                //t = 30 * offset;
                //dt = today.addDays(t);
                break;
        case app.DATE_RANGE_YEAR:
                t = 365.0 * 24.0 * offset;
                //t = 365.0 * offset;
                //dt = today.addDays(t);
                break;
        case app.DATE_RANGE_CUSTOM:

                t = offset * (t2 - t1);
                return new Date(t1 + t);
                break;
        }

        var today = new Date();
            
        return today.addHours(t);         
    },

    reset: function()
    {
        var self = this;

        this.$("#slider").dragslider({
            range: true,
            min: 0,
            max: self.SLIDER_MAX,
            values: [0, self.SLIDER_MAX]
        });
    },

    redraw: function () {

        this.reset();

        var str  = "<table cellpadding='0' cellspacing='0'><tr>";
        var i, j;

        var start_date = this.search_model.get("start_date");

        switch (this.search_model.get("date_range"))
        {
            case app.DATE_RANGE_DAY:

            j = start_date.getHours();

            for (i = 0; i < 24; i++)
            {
                if (j == 0)
                    str += "<td class='day'>12";
                else
                {
                    if (!this.T24_HOUR_TIME)
                        str += "<td class='day'>" + j;
                    else
                    {
                        str += "<td class='day'>";

                        if (j > 12)
                            str += j - 12;
                        else
                            str += j;
                    }
                }

                if (!this.T24_HOUR_TIME)
                {
                    if (j < 12)
                        str += "am"
                    else
                        str += "pm";
                }

                str += "</td>";

                j++;
                if (j > 23)
                    j = 0;
            }

            break;
            case app.DATE_RANGE_WEEK:

            j = start_date.getDay();

            for (i = 0; i < 7; i++)
            {
                str += "<td class='week'>" + Date.DAYS[j] + "</td>";

                j++;
                if (j > 6)
                    j = 0;
            }

            break;
            case app.DATE_RANGE_MONTH:

            j = start_date.getDate();
            var k = start_date.getMonth();

            for (i = 0; i < 31; i++)
            {
                str += "<td class='month'>" + j + "</td>";

                j++;

                if (start_date.isLeapYear() && k == 1 && j > 29)
                    j = 1;
                else
                if (j > start_date.daysPerMonth())
                    j = 1;
            }

            break;
            case app.DATE_RANGE_YEAR:

            j = start_date.getMonth();

            for (i = 0; i < 12; i++)
            {
                str += "<td class='year'>" + Date.MONTHS[j] + "</td>";
                j++;

                if (j > 11)
                    j = 0;
            }

            break;
                   
            case app.DATE_RANGE_CUSTOM:

            break;
        }

        str += "</tr></table>";
        this.$(".slider-markings").html(str);
    }

});
