var app = app || {};

app.DawgModel = Backbone.Model.extend({

    defaults: {
        active: true,
	    events: new app.DawgEventCollection(), 
	    start: 1,       // record to start from 
	    searching: false
	},

    initialize: function (options) {

        this.search_model = options.search_model;

        this.fetchXHR = null;
        this.searching = false;

        //this.listenTo(Backbone, 'dawg:search', this.search);
        //this.listenTo(Backbone, 'search', this.search);
    },

    abort: function()
    {
        // if we are searching stop

        if (this.fetchXhr && this.fetchXhr.readyState > 0 && this.fetchXhr.readyState < 4) {
            this.fetchXhr.abort();
            this.fetchXhr = null;
            Backbone.trigger("taskStop");
            this.searching = false;
        }
    },

    search: function()
    {
        this.abort();
                     
        //resetSlider();           
        //clearEventList();   
        //resetCategories();

        //closeEventDetails();            
        //event_image_start = 0;
            

            var bounds = this.search_model.get("bounds");

        // build search data
           
        this.search_data = { start: 0,
            limit: this.search_model.get("EVENT_LIMIT"),
            tags: this.search_model.get("search_string"), 
            sw_lat: bounds.sw_lat,
            sw_lng: bounds.sw_lng,
            ne_lat: bounds.ne_lat,
            ne_lng: bounds.ne_lng,
            start_date: this.search_model.get("start_date").toMySQLDate(), 
            end_date: this.search_model.get("end_date").toMySQLDate()
        };

        debug("dawg search:");
        debug(this.search_date);

        Backbone.trigger("taskStart");

        // collect input data and reset everything

        this.get("events").reset();

        this.search2();
    },

    search2: function()
    {
        var self = this;
        //var collection = new DawgEventCollection();

        this.fetchXhr = self.get("events").fetch({ data: this.search_data, timeout: this.search_model.get("TIMEOUT") })
        .done(function (res) {

            //debug(collection.toJSON());

            self.get("events").forEach(function (o) {

                // convert to javascript dates
                                        
                o.set("sd", new Date(o.get("sd") * 1000));
                o.set("ed", new Date(o.get("ed") * 1000));
                o.set("bookmarked", false);
                    
                var q = [];

                // split category ids

                /*
                if (o.get("ct"))
                    q = o.get("ct").split(",");
                                            
                for (var i = 0; i < q.length; i++)
                    q[i] = parseInt(q[i]);
                    
                o.set("ct", q);
                //this.marked = false;
                */
            });

            //if (collection.length == 0) {
                self.onSearchFinish();
                //return;
            //}

            self.search_data.start += self.get("events").length;
            //self.get("events").add(collection.toJSON());

            //mgr.refresh();	
            //map.fitBounds(bounds);                	 
            //overlay.draw();
            //preProcessSlider();      

            /*
            debug("search2: found " + collection.length + " events");

            if (self.events.length > self.MAX_EVENTS)
                self.onSearchFinish();
            else
                self.search2();       // recursive
                */
        })
        .fail(function (msg) {
               
            Backbone.trigger("taskStop");
            Backbone.trigger("error", msg.status + ": " + msg.statusText);
        });
    },

    onSearchFinish: function()
    {
        this.fetchXhr = null;
        Backbone.trigger("taskStop");
        Backbone.trigger("statusMessage", "found " + this.get("events").length + " dawg events");
        Backbone.trigger("dawgEventCountChange", this.get("events").length);

        debug("dawg search finished");                                                          

        //overlay.clear();                    
        //createEventList();
        //this.markerCluster.addMarkers(this.dawg_markers);                  

        // set the bookmarked field for each event

        var bookmarks = app.getBookmarks(app.NETWORK_DAWG);

        for (var i = 0; i < bookmarks.length; i++)
        {
            var o = this.get("events").get(bookmarks[i]);

            if (o)
                o.set("bookmarked", true);
        }
    }
});
