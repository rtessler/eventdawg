var app = app || {};
    
app.FacebookModel = Backbone.Model.extend({

    API_PATH: "../client/api/index.php/",

    // common to every instance

    DOMINIC_REID: "782640483",
    CRAIG_WALKER: "514314208",

    SYDNEY_LAT: -33.848352,
    SYDNEY_LNG: 151.207873,

    LONDON_LAT: 51.517,
    LONDON_LNG: 0.106,

    task_count: 0,

    onComplete: null,   // function to run when all search requests have finished

    connections: [],

    app_domains: ["rtessler.com",
                "nicepontes.com",
                "eventdawg.com",      // see facebook event dawg app
                "roberttessler.com",
                "eventdawg.local",
                "eventdawg.local3"],

    APP_ID: 162428367246974,
    APP_DOMAIN_NAME: 'eventdawg.com',
    //APP_ID: 430187960397694,
    //APP_DOMAIN_NAME: 'roberttessler.com',
    api_loaded: false,
    access_token: null,
    userid: null,

    event_type: "friend",
    USER_FIELDS: "id,name,email,picture",
    PUBLIC_EVENT_FIELDS: "id,name,description,location,start_time,end_time,privacy,ticket_uri,cover,picture,venue,owner",   // no rsvp_status
    EVENT_FIELDS: "id,name,description,location,start_time,end_time,rsvp_status,privacy,ticket_uri,cover,picture,venue,owner",      //picture.width(200)
    FQL_EVENT_FIELDS: "eid, name, venue, pic_square, pic_cover, location, start_time, end_time, privacy, ticket_uri",
    BASEPATH: "/",

    // can listen for changes on get, set properties
    // also get and set properties are persisted

    defaults: {

        // models and collections

        me: null,
        friends: null,
        event_members: null,
        friend_events: null,
        public_events: null,
        featured_events: null
    },

    initialize: function (options) {

        this.search_model = options.search_model;

        this.set("me", new app.FriendModel());
        this.set("friends", new app.FriendCollection());
        this.set("event_members", new app.EventMemberCollection());
        this.set("friend_events", new app.EventCollection());
        this.set("public_events", new app.EventCollection());
        this.set("featured_events", new app.EventCollection());            

        this.jqxhr = null;
    },  

    initSearch: function()
    {
        this.task_count = 0;
        this.onComplete = null;
        this.connections = [];
    }, 

    appDomainOK: function ()
    {
        // current domain must match facebook app url

        var url = document.location.href;

        return _.some(this.app_domains, function (o) { return url.indexOf(o) >= 0; });
    },

    isAPILoaded: function () {
        return this.api_loaded;
    },

    loadAPI: function (callback, o) {

        var self = this;

        if (!this.appDomainOK()) {
            var msg = "cant load facebook api, bad app domain";
            Backbone.trigger("error", msg);
            debug("error", msg);
            // deferred.reject(response.error.message);
            return;
        }

        // fbAsyncInit runs as soon as the SDK is loaded

        //window.fbAsyncInit = function () {

        FB.init({
            appId: self.APP_ID, // App ID
            channelUrl: "//www." + self.APP_DOMAIN_NAME + "/channel.html", // Channel File for avoiding cross domain issues
            status: true, // check login status
            cookie: true, // enable cookies to allow the server to access the session
            xfbml: true  // parse XFBML
        });     // init

        self.api_loaded = true;

        FB.Event.subscribe('auth.logout', function (response) {

            // User is now logged out

            self.access_token = null;
            self.userid = null;

            debug("logged out of facebook");
        });

        if (callback)
            callback(o);

        //};      // fbAsyncInit

        // Load the facebook SDK Asynchronously
        /*
        (function (d) {

            var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
            if (d.getElementById(id)) { return; }
            js = d.createElement('script'); js.id = id; js.async = true;
            js.src = "//connect.facebook.net/en_US/all.js";
            ref.parentNode.insertBefore(js, ref);

        }(document));
        */
    },

    statusOK: function (msg) {

        // api loaded and logged into facebook

        if (!this.isAPILoaded()) {
            msg = "api not loaded";
            return false;
        }

        if (!this.isLoggedIn()) {
            msg = "not logged in";
            return false;
        }

        return true;
    },

    getLoginStatus: function () {

        var self = this;
        var deferred = jQuery.Deferred();

        if (!this.isAPILoaded()) {
            deferred.reject("api not loaded");
            return;
        }

        FB.getLoginStatus(function (response) {

            if (response.error) {

                Backbone.trigger("error", "getLoginStatus: " + response.error.message);
                deferred.reject(response.error.message);
            }
            else {

                if (response.status === 'connected') {

                    self.access_token = response.authResponse.accessToken;
                    self.userid = response.authResponse.userID;

                } else if (response.status === 'not_authorized')      // not_authorized  
                {
                    debug("getLoginStatus: not_authorized");
                }
                else      // not_logged_in
                {
                    debug("getLoginStatus: not_logged_in");
                }

                deferred.resolve(response);

            }
        });

        return deferred.promise();
    },

    login: function () {

        var self = this;
        var deferred = jQuery.Deferred();

        if (!this.isAPILoaded()) {
            deferred.reject("api not loaded");
            return;
        }

        FB.login(function (response) {

            if (response.error) {
                Backbone.trigger("error", "login: " + response.error.message);
                deferred.reject(response.error.message);
            }
            else
                if (response.authResponse) {

                    // user connected to facebook successfully
                    // this person signed into facebook successfully through the app
                    // therefore they are a valid user
                    // therefore thay can login into dawg
                    // if they have never logged into dawg before an account is created
                    // otherwise they are just logged in

                    // the facebook login popup will only ever be asked for permissions they have not already granted
                    // similarly the response from login will only contain email, user_events,friends_events,create_event,rsvp_event the first time it was called

                    if (response.authResponse && response.status == 'connected') {

                        self.userid = response.authResponse.userID;
                        self.access_token = response.authResponse.accessToken;
                        Backbone.trigger("facebookLogin");
                    }

                    deferred.resolve(response);

                    /*
                    if (!response.email)
                    {
                        // no email, this means facebook has provided the email before and does not provide it again
                        // we have to specifically ask for it 

                        var q = "/me?email";                        

                        FB.api(q, function(response2) {

                            if (response2.email)
                            {
                                api.facebookLogin(response2.id, response2.email, response2.name, function(d) {

                                });
                            }
                        });
                    }
                    else
                    {
                        api.facebookLogin(uid, response.email, response.name, function(d) {

                        });
                    }
                    */
                } else {
                    // user cancelled

                    deferred.reject("user cancelled login");
                }
        }, { scope: 'email,user_events,friends_events,rsvp_event,friends_online_presence' });       // create_event removed in v2
        //}, { scope: 'email,user_events,friends_events,create_event,rsvp_event,friends_online_presence' });

        return deferred.promise();
    },   // login        

    logout: function () {

        var self = this;
        var deferred = jQuery.Deferred();

        if (!this.isAPILoaded()) {
            deferred.reject("api not loaded");
            return;
        }

        FB.logout(function (response) {

            if (response.authResponse) {

                self.access_token = null;
                self.userid = null;

                deferred.resolve(response);

                Backbone.trigger("facebookLogout");
            } else {
                deferred.reject(thrownError);
            }
        });

        return deferred.promise();
    },

    isLoggedIn: function()
    {
        // access_token and userid are set by login and getLoginStatus

        return ( !empty(this.access_token) && !empty(this.userid) );
    },

    getPermissions: function () {

        var msg;
        var deferred = jQuery.Deferred();

        if (!this.statusOK(msg)) {
            deferred.reject(msg);
            return;
        }

        if (empty(this.access_token)) {
            deferred.reject("getPermissions: access_token is null");
            return;
        }

        FB.api(this.userid + '/permissions?access_token=' + this.access_token, function (response) {
            deferred.resolve(response);
        });

        return deferred.promise();
    },

    //------------------------------------------------------------------------------------------------
    // private functions

    taskStart: function()
    {
        this.task_count++;
    },

    taskStop: function()
    {
        this.task_count--;

        if (this.task_count <= 0)
        {
            this.task_count = 0;

            debug("facebookModel.taskStop: all tasks complete");

            if (this.onComplete)
            {
                this.onComplete();
                this.onComplete = null;
            }
        }
    },

    _abortAjax: function () {

        // abort all ajax calls

        _.each(this.connections, function(jqxhr) {

            if (jqxhr && !jqxhr.complete) {
                jqxhr.abort();
                jqxhr = null;
            }
        });

        this.task_count = 0;
        this.connections = [];
        this.onComplete = null;
    },        

    _setMomentDates: function(e)
    {
        // add moment dates to an event

        var dm1 = null, dm2 = null;

        if (!empty(e.start_time))
            dm1 = moment(e.start_time);
        else
            dm1 = moment();     // now

        if (!empty(e.end_time)) {
           var dm2 = moment(e.end_time);
        }
        else {

            // default is midnight today

            dm2 = dm1.add('days', 1);
            dm2.hour(0);
            dm2.minute(0);
            dm2.second(0);
        }

        e.dm1 = dm1;
        e.dm2 = dm2;
    },

    _createUser: function(f)
    {
        return {uid: f.id, name: f.name, email: f.email, pic_square: (f.picture && f.picture.data) ? f.picture.data.url : null};
    },

    _createEvent: function(e)
    {
        var q = {
            eid: e.id,
            name: e.name,
            description: e.description,
            pic: null,
            pic_big: (e.cover) ? e.cover.source : null,
            pic_cover: (e.cover) ? e.cover.source : null,
            pic_small: (e.picture && e.picture.data) ? e.picture.data.url : null,
            pic_square: (e.picture && e.picture.data) ? e.picture.data.url : null,
            location: e.location,
            start_time: e.start_time,
            end_time: e.end_time,
            privacy: e.privacy,
            ticket_uri: e.ticket_uri,
            owner_id: (e.owner) ? e.owner.id : null,
            owner_name: (e.owner) ? e.owner.name : null
        }

        this._setMomentDates(e);

        // face book returns events which started in the past

        //var now = moment();

        //if (e.dm1.isBefore(now))
            //return false;

        q.dm1 = e.dm1;
        q.dm2 = e.dm2;

        var start_date = this.search_model.get("start_date");
        var end_date = this.search_model.get("end_date");

        q.in_range = start_date.overlap(start_date, end_date, e.dm1.toDate(), e.dm2.toDate());

        if (e.venue && e.venue.latitude && e.venue.longitude) {
            q.venue_id = e.venue.id;
            q.latitude = e.venue.latitude;
            q.longitude = e.venue.longitude;
            q.city = e.venue.city;
            q.country = e.venue.country;
            q.state = e.venue.state;
            q.street = e.venue.street;
            q.zip = e.venue.zip;                    
        }  

        return q;
    },

    _addEvent: function(e, uid)
    {
        // add event to the friend_events collection
        // if event already exists return false

        var events = this.get("friend_events");
        var event_members = this.get("event_members");

        // even if the event already exists this may be a different user attending

        var id = e.id + uid;

        if (!event_members.get(id))
        {
            event_members.add( { id: id, eid: e.id, uid: uid, rsvp_status: e.rsvp_status });
        }

        // actually if event already exists in events backbone will not add it

        if (!events.get(e.id)) {
                        
            events.add( this._createEvent(e) );
            return true;
        }

        return false;
    },

    _addPublicEvent: function(e)
    {
        // add event to the public_events collection
        // if event already exists return false

        var events = this.get("public_events");

        // we dont bother with event members

        // actually if event already exists in events backbone will not add it

        if (!events.get(e.id)) {
                        
            events.add( this._createEvent(e) );
            return true;
        }

        return false;
    },        

    getMyDetailsAndEvents: function()
    {
        var self = this;
        var msg;
        var deferred = jQuery.Deferred();
        
        if (!this.statusOK(msg)) {
            deferred.reject(msg);
            return;
        }

        var q = this.userid + "?fields=" + this.USER_FIELDS + ",events.fields(" + this.EVENT_FIELDS + ").limit(100000)";

        //attending,invited,maybe,declined,pic_square,pic_cover,pic_small

        var t = timeStart(t);
        this.taskStart();

        FB.api(q, function (response) 
        {
            debug("getMyDetailsAndEvents: completed in " + timeEnd(t) + " ms");                

            if (response.error) 
            {
                Backbone.trigger("error", "getMyDetailsAndEvents: " + response.error.message);
                deferred.reject(response.error.message);
            }
            else {

                // build a list of event ids
                // events will be in descending time order by default

                // me is a FriendModel

                self.get("me").set(self._createUser(response));

                if (response.events) {

                    var past_event_found = false;
                    var now = moment().unix();

                    _.each(response.events.data, function (e) {

                        self._setMomentDates(e);
                    
                        // start_time or end_time must be in the future

                        if (e.dm1.unix() >= now || e.dm2.unix() >= now) {

                            self._addEvent(e, response.id);
                        }
                        else {

                            past_event_found = true;

                            // should break out
                        }
                    });

                    //if (response.events.paging && response.events.paging.next && !past_event_found) {
                        if (response.events.paging && response.events.paging.next ) {

                        // paging always seems to be set regardless of whether there are past events

                        self.getNextEvents(response.events.paging.next, response.id, 0);
                    }
                }

                //Backbone.trigger("facebookGotMyDetails");                    
            }

            self.taskStop();

            //if (response.events && response.events.data) {
            //    response.events.data = _.sortBy(response.events.data, function (o) { return moment(o.start_time).unix(); });
            //    self.addEvents2(response);
            //}

            deferred.resolve(response);                    
        });

        return deferred.promise();
    },

    getMyDetails: function () {

        // get my details only

        var self = this;
        var msg;
        var deferred = jQuery.Deferred();            
        
        if (!this.statusOK(msg)) {
            deferred.reject(msg);
            return;
        }

        var q = "me?fields=" + this.USER_FIELDS;
        var t = timeStart();
        Backbone.trigger("tasksStart");

        FB.api(q, function (response) {

            if (response.error) {
                Backbone.trigger("error", "getMyDetails: " + response.error.message);
                deferred.reject(response.error.message);
            }
            else {

                debug("getMyDetails: completed in " + timeEnd(t) + " ms");

                self.get("me").set( self.createUser(response) );

                Backbone.trigger("gotMyDetails");
                deferred.resolve(response);
            }

            Backbone.trigger("tasksStop");
        });

        return deferred.promise();
    },

    getFriendsAndEvents: function()
    {
        var self = this;
        var msg;
        var deferred = jQuery.Deferred();
        //var ptypes = [];

        // this also gets FRIENDS and SECRET events
        // start_time is either of the form: 2025-12-30 for events with no time or 2012-07-04T19:00:00-0700 for events with a time            

        if (!this.statusOK(msg)) {
            deferred.reject(msg);
            return;
        }

        var q = this.userid + "/friends?fields=" + this.USER_FIELDS + ",events.fields(" + this.EVENT_FIELDS + ").limit(100000)";

        var friends = self.get("friends");
        var event_members = self.get("event_members");
        var friend_events = self.get("friend_events");

        var t = timeStart();
        this.taskStart(); 

        FB.api(q, function (response) {
            
            if (response.error) {
                Backbone.trigger("error", "getFriends: " + response.error.message);
                deferred.reject(response.error.message);
            }
            else {

                debug("getFriendsAndEvents: complete: found " + response.data.length + " friends in " + timeEnd(t) + " ms");

                _.each(response.data, function (f) {

                    if (f.events) {

                        var past_event_found = false;
                        var now = moment().unix();

                        _.each(f.events.data, function (e) {

                            self._setMomentDates(e);

                            // start_time or end_time must be in the future

                            if (e.dm1.unix() >= now || e.dm2.unix() >= now)
                            {                                                                  
                                //if (e.start_time.indexOf("T") == -1)
                                //    debug(e);

                                self._addEvent(e, f.id);
                            }
                            else
                            {                                
                                past_event_found = true;        // we are now in the past

                                // should break out here
                            }                                     
                        });

                        if (f.events.paging && f.events.paging.next && !past_event_found)
                        {
                            // paging always seems to be set regardless of whether there are past events

                            self.getNextEvents(f.events.paging.next, f.id, 0);
                        }
                    }

                    // add the friend even if they have no events

                    friends.add( self._createUser(f) );
                });

                if (response.paging && response.paging.next)  
                {          
                    self.getNextFriends(response.paging.next);  
                }
                                                  
                Backbone.trigger("gotFriends", response.data.length);
                deferred.resolve(response.data);
            } 

            self.taskStop();   
        });

        return deferred.promise();
    },

    getFriends: function () {

        // get friends only

        var self = this;
        var msg;
        var deferred = jQuery.Deferred();
        
        if (!this.statusOK(msg)) {
            deferred.reject(msg);
            return;
        }

        var q = "me/friends?fields=" + this.USER_FIELDS;
        var t = timeStart();
        Backbone.trigger("tasksStart");

        FB.api(q, function (response) {

            if (response.error) {
                Backbone.trigger("error", "getFriends: " + response.error.message);
                deferred.reject(response.error.message);
            }
            else {

                debug("getFriends: complete: found " + response.data.length + " friends in " + timeEnd(t) + " ms");

                self.get("friends").reset();
                var friends = self.get("friends");

                _.each(response.data, function (f) {

                    friends.add( self._createUser(f) );
                });

                Backbone.trigger("gotFriends", response.data.length);
                deferred.resolve(response.data);
            }

            Backbone.trigger("tasksStop");
        });

        return deferred.promise();
    },     

    getNextFriends: function(url)
    {
        var self = this;

        this.taskStart();
    
        var jqXHR = $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json; charset=utf-8",
            success: function (d) {

                debug("getNextFriends: success");       

                var friends = self.get("friends");

                _.each(d.data, function(f) {

                    friends.add( self.createUser(f) );

                    if (f.events) {

                        var past_event_found = false;
                        var now = moment().unix();

                        _.each(f.events.data, function (e) {

                            self._setMomentDates(e);

                            // start_time or end_time must be in the future

                            if (e.dm1.unix() >= now || e.dm2.unix() >= now)
                            { 
                                self._addEvent(e, f.id);
                            }
                            else
                            {
                                // we are now in the past

                                past_event_found = true;
                            }                                     
                        });

                        if (f.events.paging && f.events.paging.next && !past_event_found)
                        {
                            // paging always seems to be set regardless of whether there are past events

                            self.getNextEvents(f.events.paging.next, f.id, 0);
                        }
                    }
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {

                debug(thrownError);
            },
            complete: function (jqXHR, status) {

                jqXHR.complete = true; 
                self.taskStop();                    
            }
        });
        
        self.connections.push(jqXHR);
    }, 

    getNextEvents: function(url, uid, depth)
    {
        var self = this;

        self.taskStart();
    
        var jqXHR = $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json; charset=utf-8",
            success: function (d) {

                debug("getNextEvents: success: depth " + depth);

                var past_event_found = false;
                var now = moment().unix();

                _.each(d.data, function (e) {

                    self._setMomentDates(e);

                    // start_time or end_time must be in the future

                    if (e.dm1.unix() >= now || e.dm2.unix() >= now)
                    {
                        self._addEvent(e, uid);
                    }
                    else
                    {
                        // we are now in the past

                        past_event_found = true;
                    }                                     
                });

                if (d.paging && d.paging.next && !past_event_found)
                {
                    // paging always seems to be set regardless of whether there are past events

                    self.getNextEvents(d.paging.next, uid, depth+1);
                }


            },
            error: function (xhr, ajaxOptions, thrownError) {

                debug(thrownError);
            },
            complete: function (jqXHR, status) {

                jqXHR.complete = true; 
                self.taskStop();
            }
        });

        self.connections.push(jqXHR);
    },    

    friendEventSearchComplete: function()
    {       
        var self = this;

        debug("friendEventSearchComplete: found " + this.get("friend_events").length + " events");
        
        //debug(_.uniq(this.events, function(o) { return o.rsvp_status; }));
        
        //debug(_.groupBy(this.events, function(p){ return p.rsvp_status; }) );
        
        // sort events by time
        
        //this.events.sort(function(a,b) {
        
            //return a.dm1.unix() > b.dm1.unix() ? 1 : -1;
        //});    


          Backbone.trigger("getEvents:stop");
          Backbone.trigger("gotEvents");
          Backbone.trigger("gotFriends", self.get("friends").length);
          Backbone.trigger("gotEventMembers");
          Backbone.trigger("gotFriendEvents");
          Backbone.trigger("facebookGotMyDetails");
          Backbone.trigger("tasksStop");

          // select 1st event

          var list = self.get("friend_events");

          list.updateEventCount();

          var bounds = self.search_model.get("bounds");
          //debug(bounds);

          if (list.length > 0) {

              var found = false;

              list.forEach(function (e) {

                  //debug(e.toJSON());

                  if (e.get("in_range") && e.inBounds(bounds) ) { 
                      found = true;
                      Backbone.trigger("showEventDetails", e);
                      return;
                  }
              });

              if (!found)
                  Backbone.trigger("showEventDetails", list.at(0));
          }
    },

    publicEventSearchComplete: function()
    {
        Backbone.trigger("publicEventsLoaded", { network: app.NETWORK_FACEBOOK });
        Backbone.trigger("tasksStop");
    },

/*
    getMoreEvents: function(uid, url) 
    {
        var self = this;
        var msg;

        if (!this.statusOK(msg)) {
            deferred.reject(msg);
            return;
        }

        var friend_events = self.get("friend_events");
        this.taskStart();

        var jqXHR = $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json; charset=utf-8",
            //data: JSON.stringify(data),
            //timeout: app.AJAX_TIMEOUT,
            success: function (d) {

                var ids = [];

                _.each(d.data, function (e) {

                    if (self._addEvent(e)) {
                        debug("getMoreEvents: found more events in the future");
                        ids.push(e.id);
                    }
                });

                if (ids.length > 0) {

                    console.log("getMoreEvents: next success");

                    Backbone.trigger("gotMoreEvents", { uid: uid, ids: ids });
                    friend_events.facebookEventCount();
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {

                Backbone.trigger("error", "getMoreEvents: " + thrownError);
            },
            complete: function (jqXHR, status) {

                jqXHR = null;
                self.taskStop();
            }
        });
    },
*/
    getCurrentEvents: function()
    {
        var events = this.get("friend_events");

        if (this.get("event_type") == "public")
            events = this.get("public_events");            

        return events;
    },        

    getEventDetails: function(id)
    {
        var self = this;
        var deferred = jQuery.Deferred();
        var msg;

        if (!this.statusOK(msg)) {
            deferred.reject(msg);
            return;
        }

        var q = "/" + id + "?fields=" + this.EVENT_FIELDS;

        //q += "invited,attending,maybe,declined";
        //q += "invited.fields(id,name,picture),";
        //q += "attending.fields(id,name,picture),";
        //q += "maybe.fields(id,name,picture),";
        //q += "declined.fields(id,name,picture)";

        Backbone.trigger("tasksStart");

        FB.api(q, function (response) {

            if (response.error) {
                Backbone.trigger("error", "getEventDetails: " + response.error.message);
                deferred.reject(response.error.message);
            }
            else {

                deferred.resolve(response);
            }

            Backbone.trigger("tasksStop");
        });

        return deferred.promise();
    },   

    getPublicEventDetails: function(id)
    {
        var self = this;

        // cant get rsvp_status

        var q = "/" + id + "?fields=" + this.PUBLIC_EVENT_FIELDS; 

        this.taskStart();

        FB.api(q, function (response) {                

            if (response.error) {
                Backbone.trigger("error", "getPublicEventDetails: " + response.error.message);
                deferred.reject(response.error.message);
            }
            else {
                self._addPublicEvent(response);
            }

            self.taskStop();
        });
    },    

   getPlace: function (str, center) {

        var self = this;
        var deferred = jQuery.Deferred();
        var msg;

        if (!this.statusOK(msg)) {
            deferred.reject(msg);
            return;
        }

        //limit
        // list
        // offset
        // center=-33.848352, 151.207873

        //FB.api("/search?q=" + str + "&type=place&center=-33.848352, 151.207873&distance=1000&fields=id,name,location,picture",
        FB.api("/search?q=" + str + "&type=place&center=" + center.lat + "," + center.lng + "&fields=location,name,id,picture&limit=10",
        function (response) {
            deferred.resolve(response);

        });

        return deferred.promise();
    },

    postEvent: function(data)
    {
        var self = this;
        var deferred = jQuery.Deferred();

        if (!this.isLoggedIn()) {
            deferred.reject("postEvent: not logged in");
            return;
        }

        FB.api(this.userid + '/events', 'post', {
            name: data.name,
            start_time: data.start_time, //"YYYY-MM-DDThh:mm:ssZZ"),  //'2013-12-03T15:00:00-0700',
            end_time:   data.end_time, //"YYYY-MM-DDThh:mm:ssZZ"),   // '2013-12-03T19:00:00-0700',
            description: data.description,
            //location:'Sydney',
            //ticket_uri: data.ticket_uri,
            location_id: data.location_id,
            privacy_type: data.privacy_type       // enum{'OPEN','SECRET','FRIENDS','CLOSED'}
        }, function (response) {
            //debug("facebookModel: postEvent");
            //debug(response);
            //debug(response.id);

            deferred.resolve(response);
        }); 
            
        return deferred.promise();
    },

    getRSVPStatus: function(eid, status, uid)
    {
        // eid: event id
        // status: attending, maybe, declined, noreply, invited
        // uid: optional userid

        //debug("getRSVPStatus: eid = " + eid + " status = " + status + " uid = " + uid);

        var self = this;
        var deferred = jQuery.Deferred();

        if (!this.isLoggedIn()) {
            deferred.reject("getRSVPStatus: not logged in");
            return;
        }

        if (!empty(uid)) {

            var cmd = eid + '/' + status + '/' + uid;

            FB.api(cmd, 'get', {}, function (response) {

                deferred.resolve(response);
            });
        }
        else {

            FB.api(eid + '/' + status, 'get', {}, function (response) {

                deferred.resolve(response);
            });
        }

        return deferred.promise();
    },

    setRSVPStatus: function (eid, status, uid) {

        // eid: event id
        // status: attending, maybe, declined, noreply
        // uid: userid

        var self = this;
        var deferred = jQuery.Deferred();

        if (!this.isLoggedIn()) {
            deferred.reject("setRSVPStatus: not logged in");
            return;
        }

        FB.api(eid + '/' + status + '/' + uid, 'post', {}, function (response) {

            deferred.resolve(response);
        });

        return deferred.promise();
    },

    myEvents: function (eid) {

        // this will get events which are either unsure or attending

        var self = this;
        var deferred = jQuery.Deferred();

        FB.api(this.userid + "/events", 'get', {}, function (response) {

            deferred.resolve(response);
        });

        return deferred.promise();
    },        

    getUserEvents: function (uid) {

        // get the events a user is attending filtered by the current date range
        // also get their rsvp status for the event

        var events = [];
        var rsvp_status = [];
        var friend_events = this.get("friend_events");
        var event_members = this.get("event_members");

        event_members.forEach(function (o) {

            if (o.get("uid") == uid) {

                var x = friend_events.get(o.get("eid"));

                if (x && x.get("in_range")) {

                    events.push(x);
                    rsvp_status.push(o.get("rsvp_status"));
                }
            }
        });


        //_.each(events, function (e) {

        //    var x = friend_events.get(e);

        //    if (x && x.get("in_range")) {

        //        in_range_events.push(x);
        //    }

        //    var id = e + uid;

        //    var q = event_members.get(id);

        //    if (q) {
        //        rsvp_status.push(q.get("rsvp_status"));
        //    }
        //});

        return { in_range_events: events, rsvp_status: rsvp_status };
    },

    uiPostFeed: function (options) {

        var self = this;

        FB.ui({
            method: 'feed',
            //display: 'iframe',
            //picture: options.picture,
            picture: 'http://www.eventdawg.com/client/img/paw-print-md-50x50-black.png',
            link: options.link,
            caption: options.caption,
            description: options.description
        }, function (response) {

            if (response && response.post_id) {
                Backbone.trigger("showMessage", 'Post was published.');
            } else {
                debug('Post was not published.');
            }
        });
    },

    uiSendMessage: function (options) {

        FB.ui({
            method: 'send',
            link: options.link,
            redirect_uri: options.redirect_uri
        });
    },

    uiFriendPicker: function (message) {

        var self = this;
        var deferred = jQuery.Deferred();

        FB.ui({
            method: 'apprequests',
            message: message
        }, function (response) {

            debug("facebookModel: friendPicker");
            debug(response);
            //debug(response.to);

            deferred.resolve(response);
        });

        return deferred.promise();
    },

    eventSearch: function(options)
    {
        var self = this;
        var t = timeStart();
        var q = "/search?q=" + options.search_string + "&type=event&limit=1000";            

        //q += "&fields(id,name,description,location,start_time,end_time,rsvp_status,privacy,ticket_uri,cover,picture,venue,owner)";

        // debug(q);
        // at the most returns: id, start_time, end_time, location, name, timezone. Never seem to get the rest

        if (empty(options.clear) || options.clear == true)
            this.get("public_events").reset();      // clear existing events

        this.taskStart();

        FB.api(q,

            function(response) {   

                if (response && response.data && response.data.length > 0)
                {                   
                    _.each(response.data, function(e) {
                        self.getPublicEventDetails(e.id);       // get the event details and save the result
                    });
                }

                self.taskStop();
            });
    },
    
    getFeaturedEvents: function()
    {
        var self = this;

        var url = this.API_PATH + "featured";

        var featured_events = self.get("featured_events");
        featured_events.reset();

        var start_date = this.search_model.get("start_date");
        var end_date = this.search_model.get("end_date"); 

        var bounds = self.search_model.get("bounds");

        params = "?sw_lat=" + bounds.sw_lat;
        params += "&sw_lng=" + bounds.sw_lng;
        params += "&ne_lat=" + bounds.ne_lat;
        params += "&ne_lng=" + bounds.ne_lng;

        Backbone.trigger("featuredEventsLoading");     

        this.jqxhr = $.ajax({
            type: "GET",
            //crossDomain: true,
            url: url + params,
            dataType: 'json',       // this is what we get back
            success: function (d) {

                _.each(d.events, function (e) {

                    self._setMomentDates(e);               

                    e.in_range = start_date.overlap(start_date, end_date, e.dm1.toDate(), e.dm2.toDate());
                });
             
                featured_events.reset(d.events);

                Backbone.trigger("featuredEventsLoaded");
            },
            error: function (xhr, ajaxOptions, thrownError) {

                if (thrownError != "abort")
                    Backbone.trigger("error", thrownError);
            }
        });

        return self.jqxhr;
    },

    addFeaturedEvent: function(options)
    {
        var self = this;

        var url = this.API_PATH + "addFeaturedEvent";

        var e = options.event;

        var o = e.toJSON();

        var data = {

            eid: o.eid,

            name: o.name,
            description: o.description.substring(0, 5000), 

            start_time: o.start_time,
            end_time: o.end_time,
            start_date: e.get("dm1").unix(),
            end_date: e.get("dm2").unix(),

            location: o.location,

            pic: o.pic,
            pic_big: o.pic_big,
            pic_small: o.pic_small,
            pic_cover: o.pic_cover,
            pic_square: o.pic_square,

            privacy: o.privacy,
            ticket_uri: o.ticket_uri,

            venue_id: o.venue_id,

            latitude: o.latitude,
            longitude: o.longitude,              

            city: o.city,
            country: o.country,
            state: o.state,
            street: o.street,
            zip: o.zip,

            userid: self.userid,

            featured_start_date: options.featured_start_date,
            featured_end_date: options.featured_end_date
        };

        Backbone.trigger("addFeaturedEventStart");

        debug("addFeaturedEvent: post data");
        debug(data);

        this.jqxhr = $.ajax({
            type: "POST",
            url: url,
            dataType: 'text',       // this is what we get back
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function (d) {

                debug("success");
                debug(d);

                Backbone.trigger("addFeaturedEventComplete");

                self.getFeaturedEvents();

                Backbone.trigger("infoMessage", "event promoted");
            },
            error: function (xhr, ajaxOptions, thrownError) {

                Backbone.trigger("addFeaturedEventComplete");

                debug("error " + thrownError);

                if (thrownError != "abort")
                    Backbone.trigger("error", thrownError);
            }
        });

        return self.jqxhr;
    },

    //--------------------------------------------------------------------------------    
          
    getEvents: function(options)
    {
        this._abortAjax();

        if (options.type == "public")
        {            
            this.onComplete = this.publicEventSearchComplete;

            Backbone.trigger("tasksStart");

            this.eventSearch(options); 
        }
        else
        {
            this.onComplete = this.friendEventSearchComplete;

            // reset lists

            this.get("friends").reset();
            this.get("event_members").reset();
            this.get("friend_events").reset();

            Backbone.trigger("tasksStart");

            this.getMyDetailsAndEvents();
            this.getFriendsAndEvents();
            this.getFeaturedEvents();
        }
    }

});     // model
