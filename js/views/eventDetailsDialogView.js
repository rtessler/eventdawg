var app = app || {};

app.EventDetailsDialogView = app.BaseView.extend({
      
    EVENT_DETAILS_DATE_FORMAT: "DD MMM YYYY hh:mm",
    MAX_EVENT_NAME_LEN: 23,
    MAX_ADDRESS_LEN: 45,
    FADE_IN_DURATION: 250,

    className: "event-details-dialog",

    template: _.template($('#event-details-dialog-template').html()),

    initialize: function (options) {

        this.model = options.model;
        this.network = options.network;
        this.map_type = options.map_type.toLowerCase();
        this.map = options.map;
        this.facebook_model = options.facebook_model;        

        this.listenTo(Backbone, "closeEventDetailsDialog", this.close);
    },

    //close: function()
    //{
    //    app.router.navigate(app.starturl);
        
    //    this.stopListening();
    //    this.unbind();
    //    this.remove();
    //},

    events: {
        //'click .bookmark': 'bookmark'
        //'click .btn-join': 'join',
        //'click .btn-maybe': 'maybe',
        //'click .btn-decline': 'decline',
        'click .btn-facebook': 'facebook',
        'click .btn-twitter': 'twitter',
        'click .btn-google': 'google',
        'click .btn-linkedin': 'linkedin'
    },

    join: function(e)
    {
        e.preventDefault();

        //this.facebook_model.attendEvent(this.model.id);
        this.facebook_model.setRSVPStatus(this.model.id, "attending", this.facebook_model.get("userid"));
    },

    maybe: function(e)
    {
        e.preventDefault();

        this.facebook_model.setRSVPStatus(this.model.id, "maybe", this.facebook_model.get("userid"));
    },

    decline: function(e)
    {
        e.preventDefault();

        this.facebook_model.setRSVPStatus(this.model.id, "declined", this.facebook_model.get("userid"));
    },

    //facebook: function(e)
    //{
    //    e.preventDefault();

    //    if (!empty(this.model.get("pic_cover"))) {
    //        picture = this.model.get("pic_cover").source;
    //    }
    //    else
    //    if (!empty(this.model.get("cover"))) {
    //        picture = this.model.get("cover").source;
    //    }

    //    //picture = this.model.get("imgurl");

    //    picture = "http://www.eventdawg.com/client/img/paw-print-logo.png";

    //    var options = {
    //        picture: picture,
    //        link: "https://www.eventdawg.com/client?event=" + this.model.id,         
    //        caption: this.model.get("name").substring(0, 80),
    //        description: this.model.get("description").substring(0, 200)
    //    };

    //    this.facebook_model.uiPostFeed(options);
    //},

    newPopup: function (url) {

        var w = 626;
        var h = 436;

        var left = (screen.width / 2) - (w / 2);
        var tops = (screen.height / 2) - (h / 2);

        popupWindow = window.open(
		    url, 'popUpWindow', 
            'resizable = yes, scrollbars = yes, toolbar = yes, menubar = no, location = no, directories = no, status = yes,width = ' + w + ', height = ' + h + ', top = ' + tops + ', left = ' + left);      
    },

    facebook: function(e)
    {
        e.preventDefault();

        var url = "https://www.facebook.com/sharer/sharer.php?u=" + this.dawgurl;

        this.newPopup(url);
    },

    google: function(e)
    {
        e.preventDefault();

        var url = "https://plus.google.com/share?url=" + this.dawgurl;

        this.newPopup(url);
    },

    linkedin: function(e)
    {
        e.preventDefault();

        var url = "http://www.linkedin.com/shareArticle?mini=true&url=" + this.dawgurl + "/&title=" + this.model.get("name") + "&source=EventDawg";

        this.newPopup(url);
    },

    twitter: function(e)
    {
        e.preventDefault();

        var url = "https://twitter.com/intent/tweet?text=" + this.model.get("name") + "&url=" + this.dawgurl + "/&via=EventDawg";

        this.newPopup(url);
    },

    render: function()
    {
        //is_facebook_event = typeof scrollToTop !== 'undefined' ? false : this.is_facebook_event;

        var self = this;
        
        if (this.network == app.NETWORK_FACEBOOK)
        {
            var address = ""

            if (!empty(this.model.get("location")))
                address += this.model.get("location");

            var v = this.model.get("venue");

            if (v) {

                if (!empty(v.street))
                    address += " " + v.street;

                if (!empty(v.city))
                    address += " " + v.city;

                if (!empty(v.state))
                    address += " " + v.state;

                if (!empty(v.zip))
                    address += " " + v.zip;

                if (!empty(v.country))
                    address += " " + v.country;
            }

            var picture = "";

            if (!empty(this.model.get("pic_cover"))) {
                picture = this.model.get("pic_cover").source;
            }
            else
            if (!empty(this.model.get("cover"))) {
                picture = this.model.get("cover").source;
            }
            else
            if (!empty(this.model.get("picture")))
            {
                picture = this.model.get("picture").data.url;
            }
            else
            if (this.model.get("pic_square"))
            {
                picture = this.model.get("pic_square");
            }

            //picture = this.model.get("imgurl");

            var location = "";

            if (!v || empty(v.latitude) || empty(v.longitude)) {
                location = "(no map location)";
            }

            var ticket_uri = "";

            if (!empty(this.model.get("ticket_uri"))) {

                ticket_uri = "<a class='_42ft _42fu _42g-' href='" + this.model.get("ticket_uri") + "' target='_blank'>Get Tickets</a>";
            }

            privacy = this.model.get("privacy");

            if (privacy) {
                privacy = privacy.toLowerCase();

                if (privacy == "open")
                    privacy = "Public";
            }

            var me = this.facebook_model.get("me");
            var event_members = this.facebook_model.get("event_members");

            var id = this.model.id + me.id;        

            var x = event_members.get(id);

            var rsvp_status = "";

            if (x)
                rsvp_status = x.get("rsvp_status");

            //var url = "https://www.facebook.com/events/" + this.model.id;
            //var dawgurl = window.location.href.replace("#", "") + "#event/" + this.model.id;
            var dawgurl = "http://eventdawg.com/client?event=" + this.model.id;

            this.dawgurl = escape(dawgurl);

            //app.router.navigate(dawgurl);

            //dawgurl = htmlEncode(dawgurl);

            //var facebook_url = "https://www.facebook.com/sharer/sharer.php?u=" + this.dawgurl;
            //var twitter_url = "https://twitter.com/intent/tweet?text=" + this.model.get("name") + "&url=" + this.dawgurl + "/&via=EventDawg";
            ////var twitter_url = "http://twitter.com/share?url=" + dawgurl;
            //var google_url = "https://plus.google.com/share?url=" + this.dawgurl;
            //var linkedin_url = "http://www.linkedin.com/shareArticle?mini=true&url=" + this.dawgurl + "/&title=" + this.model.get("name") + "&source=EventDawg";
            //var stumbleupon_url = "http://www.stumbleupon.com/submit?url=" + this.dawgurl + "&title=" + this.model.get("name");

            var facebook_url = "#";
            var twitter_url = "#";
            var twitter_url = "#";
            var google_url = "#";
            var linkedin_url = "#";
            var stumbleupon_url = "#";
                
            var data = {id: this.model.id, 
                        name: this.model.get("name"), //.substring(0, this.MAX_EVENT_NAME_LEN), 
                        address: address, //.substring(0, this.MAX_ADDRESS_LEN),
                        description: this.model.get("description"),
                        start_date: this.model.get("dm1").format(this.EVENT_DETAILS_DATE_FORMAT),
                        end_date: this.model.get("dm2").format(this.EVENT_DETAILS_DATE_FORMAT),
                        image: picture,
                        location: location,
                        ticket_uri: ticket_uri,
                        privacy: privacy,
                        rsvp_status: rsvp_status,
                        dawgurl: this.dawgurl,
                        facebook_url: facebook_url,
                        twitter_url: twitter_url,
                        google_url: google_url,
                        linkedin_url: linkedin_url,
                        stumbleupon_url: stumbleupon_url                        
            };

            this.$el.html(this.template(data));

            var view = new app.AttendingView({ event: this.model, facebook_model: this.facebook_model });

            this.$(".people").html(view.render().el);

            //this.facebook_model.getEventDetails(this.model.id)
            //.then(function (response) {

            //    //self.$(".description").html(response.description);

            //    if (response.attending)
            //        self.$(".attending").html(response.attending.data.length);

            //    if (response.invited)
            //        self.$(".invited").html(response.invited.data.length);

            //    if (response.maybe)
            //        self.$(".maybe").html(response.maybe.data.length);

            //    if (response.declined)
            //        self.$(".declined").html(response.declined.data.length);
            //});

            //this.facebook_model.getEventRSVPStatusFQL(this.model.id)
            //.then(function (response) {

            //    var rsvp_status = "";

            //    if (response.length > 0) {
            //        rsvp_status = response[0].rsvp_status;
            //    }

            //    self.$(".rsvp-status").html(rsvp_status);
            //});
        }
        else
        {       
            var api = Api();    
            
            api.getEventDetails(event_id, function(d) {

                var e = d[0];
                var cat1 = "", cat2 = "";

                if (e.cats.length > 0)
                    cat1 = e.cats[0].name;

                if (e.cats.length > 1)
                    cat2 = "/" + e.cats[1].name;                    

                var data = {event_id: id, 
                            name: e.name, 
                            address:  e.address,
                            description: e.short_description,
                            start_date:  moment(new Date(e.start_date * 1000)).format(EVENT_DETAILS_DATE_FORMAT),
                            end_date: moment(new Date(e.end_date * 1000)).format(EVENT_DETAILS_DATE_FORMAT),
                            cat1: cat1,
                            cat2: cat2,
                            image: ""};                    

                var s = _.template($("#event-details-template").html(), data);

                $el.html(s);

                $el.find(".contents .image").css("background-image", "url('" + app.EVENT_IMAGE_UPLOAD_DIR + e.filename + "')");
                
                var bookmark_image = app.IMAGE_DIR + "star_empty.png";

                if (isBookmarked(id))  
                    bookmark_image = app.IMAGE_DIR + "star.png";
                                        
                    $el.find(".contents .star").attr("src", bookmark_image);                                              

                    var site = d[0].website;

                    if (site && site.indexOf("http://") == -1)
                        site = "http://" + site;

                $el.find(".contents .link").attr("href", site);                        

                $el.fadeIn(250, function() {  });
                $el.css("visibility", "visible");

                initNanoScroller("nano3", false);
            });           
        }

        //this.bindMapEvents();

        return this;
    },

    postRender: function () {

        /*
        var bg_image = app.IMAGE_DIR + "event-details-background-light.png";

        if (this.map_type == "dark")
            bg_image = app.IMAGE_DIR + "event-details-background.png";

        this.$el.css("background-image", "url('" + bg_image + "')");
        */

        //this.$(".contents .image").css("background-image", "url('" + this.model.get("picture").data.url + "')");

        var image = "star_empty.png";

        //if (app.isBookmarked(app.NETWORK_FACEBOOK, this.model.id))
        //    image = "star.png";

        //this.$(".star").attr("src", app.IMAGE_DIR + image);

        this.$el.fadeIn(this.FADE_IN_DURATION, function () { });

        this.$(".event-details-nano").nanoScroller();
    }

    /*
    bindMapEvents: function (mapEvents) {
        mapEvents || (mapEvents = this.mapEvents);

        for (var event in mapEvents) {
            var handler = mapEvents[event];
            google.maps.event.addListener(this.map, event, this[handler]);
        }
    },
    */

    /*
        bookmark: function(e)
        {
            e.preventDefault();
    
            var id = this.model.id;
            var bookmarks = app.getBookmarks(this.network);
            var found = false;
    
            for (var i = 0; i < bookmarks.length; i++) {
    
                if (bookmarks[i] == id) {
                    found = true;
                    break;
                }
            }
    
            if (found) {
    
                this.$(".star").attr("src", app.IMAGE_DIR + "star_empty.png");
                bookmarks.remove(i);
    
                //if (e)
                    //e.marked = false;
            }
            else {
    
                this.$(".star").attr("src", app.IMAGE_DIR + "star.png");
                bookmarks.push(id);
    
                //if (e)
                    //e.marked = true;
            }
    
            switch (this.network) {
                case app.NETWORK_FACEBOOK:
                    createCookie("facebook_bookmarks", bookmarks.join());
                    break;
                case app.NETWORK_DAWG:
                    createCookie("dawg_bookmarks", bookmarks.join());
                    break;
            }
    
            Backbone.trigger("bookmark:change");
        },
    */

    //close: function()
    //{

    //    var self = this;

    //    //this.$el.fadeOut(this.FADE_IN_DURATION, function () {
    //        self.unbind();
    //        self.stopListening();
    //        self.remove();
    //    //});
    //},

});
