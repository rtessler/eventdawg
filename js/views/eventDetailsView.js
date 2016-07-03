var app = app || {};

app.EventDetailsView = app.BaseView.extend({

    EVENT_DETAILS_DATE_FORMAT: "DD MMM YYYY hh:mm",
    MAX_EVENT_NAME_LEN: 23,
    MAX_ADDRESS_LEN: 45,
    FADE_IN_DURATION: 250,

    className: "event-details-view",

    template: _.template($('#event-details-template').html()),

    initialize: function (options) {

        this.model = options.model;
        //this.network = options.network;
        //this.map_type = options.map_type.toLowerCase();
        //this.map = options.map;
        this.facebook_model = options.facebook_model;
    },

    events: {

        'click .btn-facebook': 'facebook',
        'click .btn-twitter': 'twitter',
        'click .btn-google': 'google',
        'click .btn-linkedin': 'linkedin',
        'click .btn.promote': 'promote'
    },

    promote: function(e)
    {
        e.preventDefault();

        var view = new app.PromoteView({ model: this.model, search_model: this.search_model, facebook_model: this.facebook_model });

        var options =
            {
                //fadeInDuration: 150,
                //fadeOutDuration: 150,
                showCloseButton: false,
                bodyOverflowHidden: false
                //closeImageUrl: "img/x-light.png",
                //closeImageHoverUrl: "img/x-dark.png",
            };

        view.render().showModal(options);


        //this.facebook_model.promoteEvent(this.model);
    },

    join: function (e) {

        e.preventDefault();

        //this.facebook_model.attendEvent(this.model.id);
        this.facebook_model.setRSVPStatus(this.model.get("eid"), "attending", this.facebook_model.get("userid"));
    },

    maybe: function (e) {

        e.preventDefault();

        this.facebook_model.setRSVPStatus(this.model.get("eid"), "maybe", this.facebook_model.get("userid"));
    },

    decline: function (e) {

        e.preventDefault();

        this.facebook_model.setRSVPStatus(this.model.get("eid"), "declined", this.facebook_model.get("userid"));
    },

    newPopup: function (url) {

        var w = 626;
        var h = 436;

        var left = (screen.width / 2) - (w / 2);
        var tops = (screen.height / 2) - (h / 2);

        popupWindow = window.open(
		    url, 'popUpWindow',
            'resizable = yes, scrollbars = yes, toolbar = yes, menubar = no, location = no, directories = no, status = yes,width = ' + w + ', height = ' + h + ', top = ' + tops + ', left = ' + left);
    },

    facebook: function (e) {

        e.preventDefault();

        var url = "https://www.facebook.com/sharer/sharer.php?u=" + this.dawgurl;

        this.newPopup(url);
    },

    google: function (e) {

        e.preventDefault();

        var url = "https://plus.google.com/share?url=" + this.dawgurl;

        this.newPopup(url);
    },

    linkedin: function (e) {

        e.preventDefault();

        var url = "http://www.linkedin.com/shareArticle?mini=true&url=" + this.dawgurl + "/&title=" + this.model.get("name") + "&source=EventDawg";

        this.newPopup(url);
    },

    twitter: function (e) {

        e.preventDefault();

        var url = "https://twitter.com/intent/tweet?text=" + this.model.get("name") + "&url=" + this.dawgurl + "/&via=EventDawg";

        this.newPopup(url);
    },

    render: function () {
        //is_facebook_event = typeof scrollToTop !== 'undefined' ? false : this.is_facebook_event;

        var self = this;
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

        var picture = "";

        if (!empty(m.pic_cover)) {
            picture = m.pic_cover;
        }
        else
        if (m.pic_square) {
            picture = m.pic_square;
        }

        //picture = this.model.get("imgurl");

        var location = "";

        if (!venue_id || empty(m.latitude) || empty(m.longitude)) {
            location = "(no map location)";
        }

        var ticket_uri = "";

        if (!empty(m.ticket_uri)) {

            //ticket_uri = "<a class='_42ft _42fu _42g-' href='" + this.model.get("ticket_uri") + "' target='_blank'>Get Tickets</a>";

            ticket_uri = m.ticket_uri;
        }

        privacy = m.privacy;

        if (privacy) {
            privacy = privacy.toLowerCase();

            if (privacy == "open")
                privacy = "Public";
        }

        var me = this.facebook_model.get("me");
        var event_members = this.facebook_model.get("event_members");

        var id = this.model.get("eid") + me.get("uid");

        var x = event_members.get(id);

        var rsvp_status = "";

        if (x)
            rsvp_status = x.get("rsvp_status");

        if (empty(rsvp_status))
            rsvp_status = "Not Going";

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

        var data = {
            id: this.model.get("eid"),
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
            stumbleupon_url: stumbleupon_url,
            pic_big: this.model.get("pic_big")
        };

        this.$el.html(this.template(data));

        var view = new app.AttendingView({ event: this.model, facebook_model: this.facebook_model });

        this.$(".people").html(view.render().el);     

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

        //var image = "star_empty.png";

        //if (app.isBookmarked(app.NETWORK_FACEBOOK, this.model.id))
        //    image = "star.png";

        //this.$(".star").attr("src", app.IMAGE_DIR + image);

        //this.$el.fadeIn(this.FADE_IN_DURATION, function () { });

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

});
