var app = app || {};

app.WhenView = app.BaseView.extend({

    DATE_FORMAT: "DD MMM YYYY",

    el: '.when-controls',

    template: _.template($('#when-template').html()),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.dawg_model = options.dawg_model;
        this.facebook_model = options.facebook_model;

        this.render();
    },

    render: function () {
            
        this.$el.html(this.template());

        //debug("whenView: start = " + moment(this.search_model.get("start_date")).format());
        //debug("whenView: end = " + moment(this.search_model.get("end_date")).format());

        this.$("#start_date").datepicker({ dateFormat: "dd M yy", changeMonth: true, changeYear: true });
        this.$("#end_date").datepicker({dateFormat: "dd M yy", changeMonth: true, changeYear: true });

        this.setDates();
    },

    events: {
        'click .day': 'day',
        'click .week': 'week',
        'click .month': 'month',
        'click .year': 'year',
        'click .range': 'range',
        'change #start_date': 'dateChange',
        'change #end_date': 'dateChange'
    },

    setDates: function()
    {
        this.$("#start_date").val(moment(this.search_model.get("start_date")).format(this.DATE_FORMAT));
        this.$("#end_date").val(moment(this.search_model.get("end_date")).format(this.DATE_FORMAT));
    },

    day: function(e) {

        e.preventDefault();          

        this.$(".active").removeClass("active");      
        $(e.currentTarget).addClass("active");
        this.search_model.set("date_range", app.DATE_RANGE_DAY);

        var d = new Date();
        d.setHours(0, 0, 0, 0);
        this.search_model.set("start_date", d);            
        this.search_model.set("end_date", d.addDays(1));

        this.$("#start_date").hide();
        this.$("#end_date").hide();
        this.setDates();             

        this.filter();
    },
  
    week: function(e) {

        e.preventDefault();
                
        this.$(".active").removeClass("active");
        $(e.target).addClass("active");
        this.search_model.set("date_range", app.DATE_RANGE_WEEK);

        var d = new Date();
        d.setHours(0, 0, 0, 0);
        this.search_model.set("start_date", d);
        this.search_model.set("end_date", d.addDays(7));

        this.$("#start_date").hide();
        this.$("#end_date").hide();
        this.setDates();

        this.filter();
    },
          
    month: function(e) {

        e.preventDefault();
                
        this.$(".active").removeClass("active");
        $(e.currentTarget).addClass("active");
        this.search_model.set("date_range", app.DATE_RANGE_MONTH);

        var d = new Date();
        d.setHours(0, 0, 0, 0);
        this.search_model.set("start_date", d);
        this.search_model.set("end_date", d.addMonths(1));

        this.$("#start_date").hide();
        this.$("#end_date").hide();
        this.setDates();

        this.filter();
    },
  
    year: function(e) {

    e.preventDefault();
                
    this.$(".active").removeClass("active");
    $(e.currentTarget).addClass("active");
    this.search_model.set("date_range", app.DATE_RANGE_YEAR);

    var d = new Date();
    d.setHours(0, 0, 0, 0);
    this.search_model.set("start_date",  d);
    this.search_model.set("end_date", d.addMonths(12));

    this.$("#start_date").hide();
    this.$("#end_date").hide();
    this.setDates();

    this.filter();
    },

    range: function (e) {

        e.preventDefault();

        this.$(".active").removeClass("active");
        $(e.currentTarget).addClass("active");
        this.search_model.set("date_range", app.DATE_RANGE_CUSTOM);

        this.$("#start_date").show();
        this.$("#end_date").show();

        Backbone.trigger("redrawSlider");
    },

    dateChange: function () {

        this.search_model.set("start_date", moment(this.$("#start_date").val()).toDate());
        this.search_model.set("end_date", moment(this.$("#end_date").val()).toDate());

        this.filter();
    },

    filter: function () {

        var events = this.facebook_model.getCurrentEvents();

        events.filterByDate(this.search_model.get("start_date"), this.search_model.get("end_date"));
        Backbone.trigger("closeEventDetails");
        Backbone.trigger("dateRangeChange");
        Backbone.trigger("search");       // search all networks
    }
});
