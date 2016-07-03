var app = app || {};

app.MapView = app.BaseView.extend({

    map: null,
    search_on_idle: false,
    offline: false,

    dawg_markers: [],
    facebook_markers: [],
    featured_event_markers: [],
    google_markers: [],
    planvine_markers: [],

    markerCluster: null,

    marker_active_image: {},
    marker_active_dark_image: {},

    DETAILS_DATE_FORMAT: "D-M-Y h:m",

    //MAP_MODE_LIGHT: 1,
    //MAP_MODE_DARK: 2,

    MARKER_INACTIVE: 0,
    MARKER_ACTIVE: 1,

    //map_mode: this.MAP_MODE_DARK,

    // main categories

    CAT_ALL_YEAR_ROUND: 9,
    CAT_EXHIBITIONS: 2,
    CAT_FESTIVALS: 3,
    CAT_MUSIC: 5,
    CAT_FAMILY: 4,
    CAT_SPORT: 8,
    CAT_TALKS_AND_WORKSHOPS: 6,
    CAT_THEATRE: 7,
    CAT_CHARITY: 1,
      
    //el: '#map-canvas',

    template: _.template($('#map-template').html()),

    info_window: null,

    initialize: function (options) {

        this.search_model = options.search_model;
        this.dawg_model = options.dawg_model;
        this.facebook_model = options.facebook_model;

        //this.render();
        //this.init();          
    },

    startListening: function()
    {
        this.listenTo(Backbone, "dateRangeChange", this.dateRangeChange);
        this.listenTo(Backbone, "sliderChange", this.dateRangeChange);
        this.listenTo(Backbone, "showEventDetails", this.showEventDetails);
          
        //this.listenTo(this.dawg_model.get("events"), "reset", this.deleteDawgMarkers);
        //this.listenTo(this.facebook_model.get("events"), "reset", this.deleteFacebookMarkers);
        //this.listenTo(Backbone, "taskStart", this.clearMap);
        //this.listenTo(Backbone, "taskStop", this.createMarkers);

        this.listenTo(Backbone, "gotEvents", this.gotEvents);
        this.listenTo(Backbone, "publicEventsLoaded", this.gotEvents);
        this.listenTo(Backbone, "gotMoreEvents", this.gotMoreEvents);
        this.listenTo(Backbone, "redraw", this.eventsLoaded);
        this.listenTo(Backbone, "loggedOut", this.loggedOut);
        this.listenTo(Backbone, "closeEventDetails", this.closeEventDetails);

        this.listenTo(Backbone, "gotFeaturedEvents", this.gotFeaturedEvents);
    },

    clearMap: function()
    {
        this.markerCluster.clearMarkers();
        this.deleteMarkers(app.NETWORK_DAWG);
        this.deleteMarkers(app.NETWORK_FACEBOOK);
    },

    loggedOut: function()
    {
        this.clearMap();
    },

    gotEvents: function ()
    {
        var options = { network: app.NETWORK_FACEBOOK };

        this.createMarkers(options);        
    },

    gotMoreEvents: function(options)
    {
        var self = this;
        //var in_range_count = 0;
        var friend_events = this.facebook_model.get("friend_events");

        _.each(options.ids, function(id) {

            var o = friend_events.get(id);
            var v = o.get("venue");

            if (v) {

                if (v.id) {

                    var position = new google.maps.LatLng(v.latitude, v.longitude);
                    var title_html = o.get("name") + " " + o.get("dm1").format(self.DETAILS_DATE_FORMAT) + " - " + o.get("dm2").format(self.DETAILS_DATE_FORMAT);
                    var image = app.IMAGE_DIR + "markers/facebook/facebook-marker.png";

                    //if (index < 11)
                    //    image = app.IMAGE_DIR + "markers/facebook/" + index + ".png";

                    var marker = new google.maps.Marker({
                        position: position,
                        map: self.map,
                        title: title_html,
                        //icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + index + "|3b5f97|fff",
                        icon: image,
                        id: o.id,
                        visible: o.get("in_range")
                    });

                    //if (o.get("in_range"))
                    //    in_range_count++;

                    self.facebook_markers.push(marker);

                    o.set("marker", marker);

                    google.maps.event.addListener(marker, 'click', function () {
                        //self.showEventDetails(o);

                        Backbone.trigger("showEventDetails", o);
                    });
                }
            }
        });

        //this.markerCluster.clearMarkers();
        this.markerCluster.addMarkers(this.facebook_markers);
    },
/*
    getLocation: function() {

        this.my_position = new google.maps.LatLng(geoplugin_latitude(), geoplugin_longitude());
        this.initMap();
            
        // see: http://code.google.com/p/geo-location-javascript/wiki/JavaScriptAPI

        if (geo_position_js.init()){                    
            geo_position_js.getCurrentPosition(success_callback,error_callback,{enableHighAccuracy:true});
        }
        else{
            alert("Functionality not available");
        }

        function success_callback(p)
        {
            if (google)
            {
                my_position = new google.maps.LatLng(p.coords.latitude, p.coords.longitude); 
                initMap();
            }
        }

        function error_callback(p)
        {
            if (google)
            {
                my_position = LONDON;

                $.getScript('http://www.geoplugin.net/javascript.gp', function()
                {
                    // see: http://www.jquery4u.com/api-calls/geo-location-2-lines-javascript/
                    // 
                    //var country = geoplugin_countryName();

                    my_position = new google.maps.LatLng(geoplugin_latitude(),geoplugin_longitude());

                    initMap();
                }); 
            }                        
        }                
    },
*/

    setMapStyle: function()
    {           
    // make some styles

    /*
        var styles = {"Dark": [
            {
                featureType: "all",
                stylers: [ { lightness: -85 }, { saturation:-120} ]
            },
            {featureType: "road", stylers: [{ visibility: "off" } ]},
            {featureType: "poi", stylers: [{ visibility: "off" } ]},
            {featureType: "administrative", stylers: [{ visibility: "off" } ]},
            {featureType: "transit", stylers: [{ visibility: "off" } ]},
            {featureType: "landscape", stylers: [{ lightness: -50 }, { saturation:-0} ]}
            ],
    */

    var styles = {"Dark":                    
    [
        {
        "stylers": [{ "color": "#000000" }]
        },{
        "featureType": "road.arterial",
        "stylers": [
            { "visibility": "simplified" },
            { "color": "#060505" }
        ]
        },{
        "featureType": "road.highway",
        "stylers": [
            { "visibility": "simplified" },
            { "color": "#161616" }
        ]
        },{
        "featureType": "water",
        "stylers": [
            { "visibility": "simplified" },
            { "color": "#1d1e1e" }
        ]
        },{
        "featureType": "transit",
        "stylers": [
            { "color": "#000b10" },
            { "visibility": "simplified" }
        ]
        },{
        "elementType": "labels",
        "stylers": [
            { "visibility": "off" }
        ]
        },{
        }
    ],                                      
        "Light": [
            /*
        {
            featureType: "all",
            stylers: [ { lightness: 0 }, { saturation:0} ]
            },
            {featureType: "road", stylers: [{ visibility: "on" } ]},
            {featureType: "poi", stylers: [{ visibility: "on" } ]},
            {featureType: "administrative", stylers: [{ visibility: "on" } ]},
            {featureType: "transit", stylers: [{ visibility: "on" } ]},
            {featureType: "landscape", stylers: [{ lightness: 0 }, { saturation: 0} ]}
            */
        ],
    "Chilled": [       
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{'visibility': 'simplified'}]
    }, {
        featureType: 'road.arterial',
        stylers: [
        {hue: 149},
        {saturation: -78},
        {lightness: 0}
        ]
    }, {
        featureType: 'road.highway',
        stylers: [
        {hue: -31},
        {saturation: -40},
        {lightness: 2.8}
        ]
    }, {
        featureType: 'poi',
        elementType: 'label',
        stylers: [{'visibility': 'off'}]
    }, {
        featureType: 'landscape',
        stylers: [
        {hue: 163},
        {saturation: -26},
        {lightness: -1.1}
        ]
    }, {
        featureType: 'transit',
        stylers: [{'visibility': 'off'}]
    }, {
        featureType: 'water',
        stylers: [
        {hue: 3},
        {saturation: -24.24},
        {lightness: -38.57}
        ]
    }             
    ]
    };

    for (var s in styles) {                
        var type = new google.maps.StyledMapType(styles[s], {name: s});    
        this.map.mapTypes.set(s, type); 
    }

    this.map.setMapTypeId('Light');
           
    //if (this.map_mode == this.MAP_MODE_DARK)
    //{             
        //this.map.setMapTypeId('Dark'); 
        //map.setOptions({styles: styles1});                                
    //}
    //else
    //{
        //this.map.setMapTypeId('Light'); 
        //map.setOptions({styles: styles2});
    //}            
},
    savePosition: function()
    {
        Backbone.trigger("saveBounds", this.getBounds());
        Backbone.trigger("saveCenter", this.getCenter());
        //Backbone.trigger("search");       // search all networks
    },

    getMyPosition: function()
    {
        return {lat: app.location.lat, lng: app.location.lng}; //{lat: geoip_latitude(), lng: geoip_longitude()};
    },

    init: function ()
    {    
        var self = this;

        if (this.offline)
            return;
      
        this.initMarkers();

        var lat = getCookie("lat");
        var lng = getCookie("lng");

        //if (lat && lng) {

            //my_position = new google.maps.LatLng(lat, lng);

            //this.reverseGeocode(lat, lng);
        //}
        //else {

            // use geoplugin to get position

            //debug("mapView: getting position");

            //if (geoplugin) {
            //if (geoip) {

                //lat = geoplugin_latitude();
                //lng = geoplugin_longitude();

                lat = app.location.lat; //lat = geoip_latitude();
                lng = app.location.lon; //geoip_longitude();

                //this.reverseGeocode(lat, lng);
            //}
            //else {

                //var SYDNEY = new google.maps.LatLng(-33.848352, 151.207873);
                //var LONDON = new google.maps.LatLng(51.517, 0.106);

                //lat = -33.848352;
                //lng = 151.207873;

                //this.reverseGeocode(lat, lng);
            //}

            this.my_position = new google.maps.LatLng(lat, lng);

            createCookie("lat", lat);
            createCookie("lng", lng);
        //}
        
        var myOptions = {
            zoom: 11,
            center: this.my_position,
            mapTypeControl: true,
            mapTypeId: 'Dark', //google.maps.MapTypeId.ROADMAP,
            mapTypeControlOptions: {
                    mapTypeIds: ['Light', /*google.maps.MapTypeId.ROADMAP*/, 
                    google.maps.MapTypeId.HYBRID, 
                    google.maps.MapTypeId.SATELITE, 
                    google.maps.MapTypeId.TERRAIN, 
                    'Dark', 
                    'Chilled' ]
                //style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            },

            panControl: true,
            panControlOptions: {
                position: google.maps.ControlPosition.TOP_RIGHT
            },

            zoomControl: true,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.LARGE,
                position: google.maps.ControlPosition.RIGHT_CENTER
            }
        }            

        // create the map

        //this.map = new google.maps.Map($("map_canvas")[0], myOptions);
        this.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

        var mcOptions = {gridSize: 30, maxZoom: 8};
        this.markerCluster = new MarkerClusterer(this.map, [], mcOptions);

        //this.mgr = new MarkerManager(this.map);
        
        this.setMapStyle();

        // add listeners

        //google.maps.event.addListener(this.map, 'bounds_changed', function() {
                    //bounds = map.getBounds();
        //});

        google.maps.event.addListener(this.map, 'idle', function() {

            //bounds = map.getBounds();

            debug("mapview idle");

            Backbone.trigger("saveBounds", self.getBounds());

            if (self.search_on_idle)
            {
                //debug("idle: saveBounds, saveCenter and search");

                self.savePosition();

                self.search_on_idle = false;
            }
        });
        
        // hide event details
        
        google.maps.event.addListener(this.map, 'click', function() {           

            self.closeEventDetails();
        });
        
        // bounds changed need to search again
        
        google.maps.event.addListener(this.map, 'zoom_changed', function() {
            self.search_on_idle = true;
        });
        
        // bounds changed need to search again
        
        google.maps.event.addListener(this.map, 'center_changed', function() {
            self.search_on_idle = true;
        });            

        // using google maps places api
                    
        var input = document.getElementById('where');
        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', this.map);
        
        google.maps.event.addListener(autocomplete, 'place_changed', function() {

            var place = autocomplete.getPlace();                         

            if (!place.geometry) {
                // Inform the user that the place was not found and return.
                $("#where").addClass("notfound");
                return;
            }
            
            $("#where").removeClass("notfound");

            // If the place has a geometry, then present it on a map.

            if (place.geometry.viewport) {
                self.map.fitBounds(place.geometry.viewport);
            } else {
                self.map.setCenter(place.geometry.location);
                self.map.setZoom(17);  // Why 17? Because it looks good.
            }           

            Backbone.trigger("what:clear");

            self.savePosition();

            
            //var image = {
            //  url: place.icon,
            //  size: new google.maps.Size(71, 71),
            //  origin: new google.maps.Point(0, 0),
            //  anchor: new google.maps.Point(17, 34),
            //  scaledSize: new google.maps.Size(35, 35)
            //};
            //marker.setIcon(image);
            //marker.setPosition(place.geometry.location);
            //marker.setVisible(true);

            //var address = '';
            //if (place.address_components) {
            //  address = [
            //    (place.address_components[0] && place.address_components[0].short_name || ''),
            //    (place.address_components[1] && place.address_components[1].short_name || ''),
            //    (place.address_components[2] && place.address_components[2].short_name || '')
            //  ].join(' ');
            //}
            
            });    
          
        //this.overlay = new MarkerOverlay();

        // create the info overlay

        //this.overlay = new InfoOverlay(map);   

        this.startListening();

        Backbone.trigger("saveCenter", this.getCenter());

        var d = document.createElement('div');
        var control = new this.HomeControl(d, this.map, this);

        d.index = 2;
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(d);

        var d = document.createElement('div');
        var control = new this.FrameAllControl(d, this.map, this);

        d.index = 1;
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(d);

        debug("mapInitialized");
        Backbone.trigger("mapInitialized");
    },

    reverseGeocode: function(lat, lng)
    {
        geocoder = new google.maps.Geocoder();

        var latlng = new google.maps.LatLng(lat, lng);

        geocoder.geocode({'latLng': latlng}, function(results, status) {

            debug("reverseGeocode");
            debug(results);
            /*
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    map.setZoom(11);
                    marker = new google.maps.Marker({
                        position: latlng,
                        map: map
                    });
                    infowindow.setContent(results[1].formatted_address);
                    infowindow.open(map, marker);
                } else {
                    alert('No results found');
                }
            } else {
                alert('Geocoder failed due to: ' + status);
            }
            */
        });          
    },

    render: function () {
            
        this.$el.html(this.template());
        return this;
    },

    initMarkers: function()
    {
        /*
        self.facebook_marker = {
            //url: app.IMAGE_DIR + "markers/pushpins/blue-pushpin30x30.png",
            url: app.IMAGE_DIR + "markers/facebook/2.png",
            size: new google.maps.Size(20.0, 20.0),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0.0, 0.0)
        };
        */

        //self.facebook_marker = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=7|3b5f97|fff";


        var arr = [ 
            {"key": this.CAT_ALL_YEAR_ROUND, "name": "red"},
            {"key": this.CAT_EXHIBITIONS, "name": "darkgreen"},
            {"key": this.CAT_FESTIVALS, "name": "blue"},
            {"key": this.CAT_MUSIC, "name": "magenta"},
            {"key": this.CAT_FAMILY, "name": "cyan"},
            {"key": this.CAT_SPORT, "name": "purple"},
            {"key": this.CAT_TALKS_AND_WORKSHOPS, "name": "orange"},
            {"key": this.CAT_THEATRE, "name": "green"},
            {"key": this.CAT_CHARITY, "name": "yellow" }];

        for (var i = 0; i < arr.length; i++)
        {
            this.marker_active_image[arr[i].key] = {
                url: app.IMAGE_DIR + "markers/pushpins/" + arr[i].name + "-pushpin30x30.png",            
                size: new google.maps.Size(30.0, 30.0),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(15.0, 30.0) }; 

            this.marker_active_dark_image[arr[i].key] = {
                url: app.IMAGE_DIR + "markers/pixel_markers/" + arr[i].name + "-dot.png",
                size: new google.maps.Size(7,7),
                origin: new google.maps.Point(0,0),
                anchor: new google.maps.Point(3,3),
                scaledSize: new google.maps.Size(7, 7)
                };                 
        }

        this.white_marker = {url: app.IMAGE_DIR + "markers/pushpins/white-pushpin30x30.png",
            size: new google.maps.Size(30.0, 30.0),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15.0, 15.0)
        }

        this.white_dark_marker = {url: app.IMAGE_DIR + "markers/pixel_markers/white-dot.png",
            size: new google.maps.Size(7,7),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(3,3)
        }           

        this.shadow_marker = {url: app.IMAGE_DIR + "markers/pushpins/shadow-red-pushpin30x30.png",
            size: new google.maps.Size(46.0, 30.0),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15.0, 30.0)
        }           
    },

    createMarkers: function(options)
    {
        var self = this;

        // see: https://developers.google.com/maps/documentation/javascript/training/customizing/custom-markers
        // also: http://www.cycloloco.com/shadowmaker/shadowmaker.htm

        this.markerCluster.clearMarkers();
        this.deleteMarkers(options.network);

        if (options.network == app.NETWORK_DAWG) {

            this.dawg_model.get("events").forEach(function (e) {

                var position = new google.maps.LatLng(e.get("lt"), e.get("ln"));
                var image = self.marker_active_image[1];

                /*
                if (e.get("tc") == undefined || e.get("tc") == null || e.get("tc") == -1)      // no category
                    image = self.white_marker;
                else
                if (self.map_mode == self.MAP_MODE_LIGHT)
                    image = self.marker_active_image[e.get("tc")];
                else
                    image = self.marker_active_dark_image[e.get("tc")];
                */

                var title_html = e.get("nm") + " " + moment(e.get("sd")).format(self.DETAILS_DATE_FORMAT) + " - " + moment(e.get("ed")).format(self.DETAILS_DATE_FORMAT);

                //var d1str = moment(d1).format(DATE_FORMAT4);
                //var d2str = moment(d2).format(DATE_FORMAT4);

                //var title_html = this.nm + " " + d1str + " - " + d2str;                                    
                //var info_html = "<div class='hover_div'><h3>" + this.nm + "</h3><p id='sd" + this.id + "'></p><p>" + d1str + " - " + d2str + "</p></div>";

                var marker = new google.maps.Marker({
                    position: position,
                    map: self.map,
                    title: title_html,
                    icon: image,
                    shadow: self.shadow_marker,
                    //optimized: false,
                    //html: info_html,
                    //shape: shape,
                    //animation: google.maps.Animation.DROP,
                    event_id: e.id
                });

                //if (self.map_mode == self.MAP_MODE_DARK)
                    marker.setFlat(true);      // still need to create the shadow in case we switch to light mode

                //mgr.addMarker(marker, 0);
                //bounds.extend(position);

                // add event handler

                self.dawg_markers.push(marker);

                google.maps.event.addListener(marker, 'click', function () {

                    //if (app.event_details_view)
                    //app.event_details_view.close();

                    var html = "hello";

                    var str = this.infoWindowTemplate(e.toJSON());

                    var info_window = new google.maps.InfoWindow({
                        content: str,
                        position: this.position
                    });

                    info_window.open(map);
                });
            }); // for

            
            this.markerCluster.addMarkers(this.dawg_markers);
        }

        if (options.network == app.NETWORK_FACEBOOK) {

            var index = 1;
            //var in_range_count = 0;
            var events = this.facebook_model.getCurrentEvents();

            events.forEach(function (e) {                    

                var venue_id = e.get("venue_id");
                var latitude = e.get("latitude");
                var longitude = e.get("longitude");

                if (venue_id && latitude && longitude) {

                    //if (v.id) {

                        var position = new google.maps.LatLng(latitude, longitude);

                        var title_html = e.get("name") + " " + e.get("dm1").format(self.DETAILS_DATE_FORMAT) + " - " + e.get("dm2").format(self.DETAILS_DATE_FORMAT);
                        //var title_html = v.name + " " + moment(o.get("d1")).format(self.DETAILS_DATE_FORMAT) + " - " + moment(o.get("d2")).format(self.DETAILS_DATE_FORMAT);

                        /*
                        var marker = new google.maps.Marker({
                            position: position,
                            map: self.map,
                            title: title_html,
                            icon: self.facebook_marker,
                            event_id: o.id
                        });
        
                        if (self.map_mode == self.MAP_MODE_DARK)
                            marker.setFlat(true);      // still need to create the shadow in case we switch to light mode
                        */

                        var image = app.IMAGE_DIR + "markers/facebook/facebook-marker.png";

                        //if (index < 11)
                            //image = app.IMAGE_DIR + "markers/facebook/" + index + ".png";

                        var marker = new google.maps.Marker({
                            position: position,
                            map: self.map,
                            title: title_html,
                            //icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + index + "|3b5f97|fff",
                            icon: image,
                            id: e.get("eid"),
                            visible: e.get("in_range")
                        });

                        //if (o.get("in_range"))
                        //    in_range_count++;

                        //if (!o.get("in_range"))
                            //marker.setVisible(false);

                        self.facebook_markers.push(marker);

                        e.set("marker", marker);

                        google.maps.event.addListener(marker, 'click', function () {
                            //self.showEventDetails(o);

                            Backbone.trigger("showEventDetails", e);
                        });

                        index++;
                    }
                //}
            });

            //debug("mapView:createMarkers: created " + index + " markers " + in_range_count + " in range");

            this.markerCluster.addMarkers(this.facebook_markers);
        }
    },

    gotFeaturedEvents: function()
    {
        var self = this;
        var index = 1;
        var events = this.facebook_model.get("featured_events");

        events.forEach(function (e) {                    

            var venue_id = e.get("venue_id");
            var latitude = e.get("latitude");
            var longitude = e.get("longitude");

            if (venue_id && latitude && longitude) {

                var p = new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude));

                var title_html = e.get("name") + " " + e.get("dm1").format(self.DETAILS_DATE_FORMAT) + " - " + e.get("dm2").format(self.DETAILS_DATE_FORMAT);

                if (index < 11)
                    image = app.IMAGE_DIR + "markers/facebook/" + index + ".png";

                var marker = new google.maps.Marker({
                    position: p,
                    map: self.map,
                    title: title_html,
                    //icon: "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=" + index + "|3b5f97|fff",
                    icon: image,
                    id: e.get("eid"),
                    visible: true // e.get("in_range")
                });

                self.featured_event_markers.push(marker);

                e.set("marker", marker);

                google.maps.event.addListener(marker, 'click', function () {

                    Backbone.trigger("showEventDetails", e);
                });

                index++;
            }
        });
    },

    showEventDetails: function(o)
    {
        var self = this;

        if (o) {

            if (o.get("venue_id") && o.get("latitude") && o.get("longitude")) {
                var p = new google.maps.LatLng(parseFloat(o.get("latitude")), parseFloat(o.get("longitude")));
                this.map.panTo(p);
            }
        }

        return;
/*
        this.closeEventDetails();

        var view = new app.EventDetailsDialogView({
            model: o,
            network: app.NETWORK_FACEBOOK,
            map_type: this.map.getMapTypeId(),
            map: this.map,
            facebook_model: this.facebook_model
        });

        //if (!this.infowindow) {

        this.info_window = new google.maps.InfoWindow({ content: view.render().el });
        //}
        //else {
            //var markerLatLng = marker.getPosition();
            //this.infowindow.setContent( view.render().el );
        //}

        if (o.get("marker")) {
            this.info_window.open(this.map, o.get("marker"));
        }
        else {

            var position = new google.maps.LatLng(this.map.getCenter().lat(), this.map.getCenter().lng());

            this.info_window.open(this.map);
            this.info_window.setPosition(position);
        }

        google.maps.event.addListener(this.info_window, 'closeclick', function () {

            self.closeEventDetails();
        });

        google.maps.event.addListener(this.info_window, 'domready', function () {
            view.postRender();
        }); 
*/
    },

    closeEventDetails: function()
    {
        if (this.info_window) {

            Backbone.trigger("closeEventDetailsDialog");
            this.info_window.close();
            this.info_window = null;
        }
    },

    dateRangeChange: function ()
    {
        var self = this;

        //if ($(".event-list-view").is(":visible"))
        //    return;

        //if (this.searching)
            //return;                  
            
        if (this.offline)
            return;

        var events = this.facebook_model.getCurrentEvents();

        _.each(this.facebook_markers, function (m) {

            var o = events.get(m.id);
                
            if (o) {

                if (o.get("in_range")) {                    
                    m.setVisible(true);
                }
                else {
                    m.setVisible(false);                   
                }

            }
        });


        $.each(this.dawg_markers, function() {
                                
            if (this.marker)
            {
                if (this.st == 1 || start_date.overlap(start_date, end_date, this.sd, this.ed))
                {
                    // event is inside slider active area                                         

                    if (this.marker_state != self.MARKER_ACTIVE)
                    {   
                        // marker is not active
                            
                        this.marker.setVisible(true);
                        this.marker_state = self.MARKER_ACTIVE;
                            
                        /*
                            
                        if (map_mode == MAP_MODE_DARK)
                        {
                            //this.marker.setIcon( marker_active_dark_image[this.tc] );
                            this.marker.setVisible(true);
                        }
                        else
                            this.marker.setIcon( marker_active_image[this.tc] );
                        */                                                       
                    }
                }
                else
                {
                    // event is outside active slider area                        

                    if (this.marker_state == self.MARKER_ACTIVE)
                    {
                        // switch to inactive mode
                            
                        this.marker.setVisible(false);
                        this.marker_state = self.MARKER_INACTIVE; 
                            
                        /*
                        if (map_mode == MAP_MODE_DARK)
                        {
                            //this.marker.setIcon( null );
                            this.marker.setVisible(false);
                        } else                            
                            this.marker.setIcon( marker_inactive_image[this.tc] );
                        */
                           
                        //this.marker_state = MARKER_TRANSITION;                               
                    }  
                }
            }
        }); 
    },

    getBounds: function()
    {
        var b = this.map.getBounds();

        var swPoint = b.getSouthWest();
        var nePoint = b.getNorthEast();

        var bounds = { sw_lat: swPoint.lat(), sw_lng: swPoint.lng(), ne_lat: nePoint.lat(), ne_lng: nePoint.lng() };

        return bounds;
    },

    getCenter: function()
    {
        return {lat: this.map.getCenter().lat(), lng: this.map.getCenter().lng()};
    },

    deleteMarkers: function (network) {

        var markers = null;

        switch (network)
        {
            case app.NETWORK_DAWG: markers = this.dawg_markers; break;
            case app.NETWORK_FACEBOOK: markers = this.facebook_markers; break;
            case app.NETWORK_GOOGLE: markers = this.google_markers; break;
            case app.NETWORK_PLANVINE: markers = this.planvine_markers; break;
        }

        for (var i = 0, len = markers.length; i < len; i++)
            markers[i].setMap(null);

        markers.length = 0;
        markers = [];
    },

    deleteFeaturedMarkers: function()
    {
        for (var i = 0, len = this.featured_event_markers.length; i < len; i++)
            this.featured_event_markers[i].setMap(null);

        this.featured_event_markers.length = 0;
        this.featured_event_markers = [];
    },

    //close: function () {

    //    this.stopListening();
    //    this.unbind();
    //    this.remove();
    //},

    HomeControl: function (controlDiv, map, context) {

        // Set CSS styles for the DIV containing the control
        // Setting padding to 5 px will offset the control
        // from the edge of the map.
        controlDiv.style.padding = '5px';

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = 'white';
        controlUI.style.borderStyle = 'solid';
        controlUI.style.borderWidth = '0px';
        controlUI.style.cursor = 'pointer';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to go home';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.fontFamily = 'Arial,sans-serif';
        controlText.style.fontSize = '12px';
        controlText.style.paddingLeft = '4px';
        controlText.style.paddingRight = '4px';
        controlText.innerHTML = '<strong>Home</strong>';
        controlUI.appendChild(controlText);

        google.maps.event.addDomListener(controlUI, 'click', function () {

            context.home();
        });
    },

    home: function()
    {
        this.map.setCenter(this.my_position);
        this.map.setZoom(11); 
    },

    FrameAllControl: function (controlDiv, map, context) {

          // Set CSS styles for the DIV containing the control
          // Setting padding to 5 px will offset the control
          // from the edge of the map.
          controlDiv.style.padding = '5px';

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = 'white';
        controlUI.style.borderStyle = 'solid';
        controlUI.style.borderWidth = '0px';
        controlUI.style.cursor = 'pointer';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to frame all events';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.fontFamily = 'Arial,sans-serif';
        controlText.style.fontSize = '12px';
        controlText.style.paddingLeft = '4px';
        controlText.style.paddingRight = '4px';
        controlText.innerHTML = '<strong>Frame All</strong>';
        controlUI.appendChild(controlText);

        google.maps.event.addDomListener(controlUI, 'click', function() {

            context.frameAll();
        });
    },

    frameAll: function()
    {
        var bounds = new google.maps.LatLngBounds ();

        _.each(this.facebook_markers, function(m) {

            bounds.extend (m.position);
        });

        this.map.fitBounds (bounds);
    }
});
