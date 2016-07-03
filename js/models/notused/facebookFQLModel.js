//-------------------------------------------------------------------------------
        // FQL
        //-------------------------------------------------------------------------------

        getAppUsersFQL: function () {
            var q = "select name from user  where uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1";
        },        

        getFriendEventsFQL: function (start_date, lat, lng) {

            var self = this;
            var deferred = jQuery.Deferred();
            var msg;

            if (!this.statusOK(msg)) {
                deferred.reject(msg);
                return;
            }

            //var t = startOfDay();
            var t = moment().startOf('day').unix();

            //pic	        Event picture
            //pic_big	    Large event picture
            //pic_cover	    struct Cover picture of Event
            //pic_small	    Small event picture
            //pic_square    Square event picture

            var fql = "SELECT eid, name, description, venue, pic, pic_big, pic_cover, pic_small, pic_square, location, start_time, end_time, privacy, ticket_uri FROM event ";

            //var fql = "SELECT " + this.EVENT_FIELDS + " from event ";
            fql += " WHERE eid IN ( ";
            fql += " SELECT eid FROM event_member ";
            fql += " WHERE (uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) OR uid = me())) ";
            fql += " AND start_time >= " + t;
            //fql += " AND start_time > now() ";
            //fql += " AND venue.latitude > '" + (SYDNEY_LAT - 1) + "'";
            //fql += " AND venue.latitude < '" + (SYDNEY_LAT + 1) + "'";
            //fql += " AND venue.longitude > '" + (SYDNEY_LON - 1) + "'",
            //fql += " AND venue.latitude < '" + (SYDNEY_LON + 1) + "'";
            fql += " ORDER BY start_time";

            //var privacy_types = [];
            var t = timeStart(t);

            FB.api(
                {
                    method: 'fql.query',
                    query: fql
                },
                function (response) {

                    if (response.error) {
                        Backbone.trigger("error", response.error.message);
                        deferred.reject(response.error.message);
                    }
                    else {

                        debug("getFriendEventsFQL: finish " + timeEnd(t) + " ms, found " + response.length + " events");

                        //_.each(response, function (o) {

                        //    //debug(o.location);

                        //    if (!_.contains(privacy_types, o.privacy)) {
                        //        privacy_types.push(o.privacy);
                        //    }
                        //});

                        //debug("privacy_types = ");
                        //debug(privacy_types);

                        //self.addEvents(response);

                        var start_date = self.search_model.get("start_date");
                        var end_date = self.search_model.get("end_date");

                        _.each(response, function (e) {

                            // event common fields {id,name,imgurl,dm1,dm2,in_range}

                            // add some dates

                            self._getMomentDates(e);

                            e.in_range = start_date.overlap(start_date, end_date, e.dm1.toDate(), e.dm2.toDate());
                        });

                        self.get("friend_events").reset(response);

                        //self.saveEvents();
                        //self.getServerEvents();

                        Backbone.trigger("gotFriendEvents");
                        deferred.resolve(response);
                    }
                });

            return deferred.promise();
        },

        getEventMembersFQL: function () {

            var self = this;
            var deferred = jQuery.Deferred();

            var msg;

            if (!this.statusOK(msg))
            {
                deferred.reject(msg);
                return;
            }

            //var t = startOfDay();
            var t = moment().startOf('day').unix();

            //"YYYY-MM-DDTHH:mm:ss-0300"

            //moment("2010-10-20 4:30 +0000", "YYYY-MM-DD HH:mm Z"); // parsed as 4:30 GMT

            //var t = moment.utc().format();

            var fql = "SELECT eid, uid, rsvp_status, start_time FROM event_member ";
            fql += " WHERE (uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) OR uid = me()) ";
            fql += " AND start_time > " + t;
            fql += " ORDER BY start_time";

            var t = timeStart(t);

            FB.api(
                {
                    method: 'fql.query',
                    query: fql
                },
                function (response) {

                    if (response.error) {
                        Backbone.trigger("error", response.error.message);
                        deferred.reject(response.error.message);
                    }
                    else {

                        debug("getEventMembersFQL: finish " + timeEnd(t) + " ms found " + response.length + " event members");

                        //_.each(response, function (o) {
                        //    debug(moment(o.start_time).format());
                        //});

                        //var d = _.groupBy(response, function (p) {
                        //    return p.uid;
                        //});

                        //var x = _.map(d, function (uid) {
                        //    return { uid: uid };
                        //});

                        //debug(x);
                        //debug("found " + x.length + " distinct users");

                        self.get("event_members").reset(response);
                        Backbone.trigger("gotEventMembers");

                        deferred.resolve(response);
                    }
                });

            return deferred.promise();
        },

        getPublicEventsFQL: function()
        {
            var self = this;
            var msg;
            var deferred = jQuery.Deferred();            

            if (!this.statusOK(msg)) {
                deferred.reject(msg);
                return;
            }

            /*
            var country_code = getCookie("country_code");
            var country_name = getCookie("country_name");
            var city = getCookie("city");
            var region = getCookie("region");

            if (empty(country_code))
            {
                country_code = geoplugin_countryCode();
                country_name = geoplugin_countryName();
                city = geoplugin_city();
                region = geoplugin_region();

                createCookie("country_code", country_code);
                createCookie("country_name", country_name);
                createCookie("city", city);
                createCookie("region", region);
            }
                
            debug("getPublicEventsFQL: city = " + city + " country code = " + country_code + " country_name = " + country_name + " region = " + region);
            */

            var search_string = this.search_model.get("search_string");

            //debug("getPublicEventsFQL: search_string = " + search_string);

            if (empty(search_string))
                search_string = "sydney";

            //var bounds = this.search_model.get("bounds");
            //var start_time = moment().format("YYYY-MM-DDThh:mm:ssZZ");
            //var end_time = moment().add('years', 1).format("YYYY-MM-DDThh:mm:ssZZ");

            //var now = moment().unix();
            var start_time = moment().startOf('day').unix();            
            var end_time = moment().add('years', 1).unix();

            var start_date = this.search_model.get("start_date");
            var end_date = this.search_model.get("end_date");

            // ticket_uri causes error

            var fql = "SELECT eid,name,description,venue,pic,pic_big,pic_cover,pic_small,pic_square,location,start_time,end_time,privacy ";
            fql += " FROM event ";
            fql += " WHERE contains('" + search_string + "')";
            fql += " AND privacy = 'OPEN'";
            //fql += " AND venue.latitude > '" + bounds.sw_lat + "'";
            //fql += " AND venue.latitude < '" + bounds.ne_lat + "'";
            //fql += " AND venue.longitude > '" + bounds.sw_lng + "'",
            //fql += " AND venue.latitude < '" + bounds.ne_lng + "'";
            fql += " AND start_time > " + start_time;
            fql += " AND start_time < " + end_time;
            //fql += " AND start_time > '2013-12-09T10:00:00-0400'";
            //fql += " AND end_time < '2014-12-09T10:00:00-0400'";
            fql += " order by start_time asc";
            fql += " limit 100";

            // this works if the event is a user

            //var center = this.search_model.get("center");

            //var lat = center.lat;
            //var lng = center.lng;

            //var fql = "SELECT eid, name, description, pic_cover, pic_big, start_time, end_time, venue, location, privacy, ticket_uri";
            //fql += " FROM event WHERE eid  ";
            //fql += " IN (SELECT eid FROM event_member WHERE uid IN ";
            //fql += " (SELECT page_id FROM place WHERE ";
            //fql += " distance(latitude, longitude, '" + lat + "','" + lng + "') < 50000)) ";
            //fql += " AND start_time > '" + start_time + "' AND start_time < '" + end_time + "'";
            //fql += " ORDER BY start_time asc ";
            //fql += " limit 100";
            
            //debug(fql);

            this.get("public_events").reset();
            var events = [];

            Backbone.trigger("tasksStart");
            var t = timeStart();

            FB.api(
                {
                    method: 'fql.query',
                    query: fql
                },
                function (response) {

                    Backbone.trigger("tasksStop");

                    if (response.error) {
                        Backbone.trigger("error", "getPublicEventsFQL: " + response.error.message);
                        deferred.reject(response.error.message);
                    }
                    else {

                        debug("getPublicEventsFQL: finished " + timeEnd(t) + " ms. returned " + response.length + " events");

                        _.each(response, function (e) {

                            self._getMomentDates(e);                       

                            var in_range = start_date.overlap(start_date, end_date, dm1.toDate(), dm2.toDate());

                            //if (dm1.unix() >= now || (!empty(e.end_time) && dm2.unix() >= now)) {
                            var x = {
                                eid: e.eid,
                                name: e.name,
                                description: e.description,
                                location: e.location,
                                start_time: e.start_time,
                                end_time: e.end_time,
                                pic: e.pic,
                                pic_small: e.pic_small,
                                pic_big: e.pic_big,
                                pic_square: e.pic_square,
                                pic_cover: (e.pic_cover) ? e.pic_cover.source : null,
                                dm1: e.dm1,
                                dm2: e.dm2,
                                privacy: e.privacy,
                                ticket_uri: null,
                                in_range: in_range
                            };

                            if (e.venue && e.venue.latitude && e.venue.longitude) {
                                x.latitude = e.venue.latitude;
                                x.longitude = e.venue.longitude;
                                x.city = e.venue.city;
                                x.country = e.venue.country;
                                x.state = e.venue.state;
                                x.street = e.venue.street;
                                x.zip = e.venue.zip;
                                x.venue_id = e.venue.id;
                            }

                            events.push(x);
                            //}
                        });

                        self.set("public_events", new app.EventCollection(events));

                        //self._addPublicEvents(response);
                        
                        //var list = self.get("public_events").sortBy(function (o) { return o.get("dm1").unix(); });
                        //self.get("public_events").reset(list);

                        //self.get("public_events").filterByDate(self.search_model.get("start_date"), self.search_model.get("end_date"));                        

                        Backbone.trigger("publicEventsLoaded", { network: app.NETWORK_FACEBOOK });

                        deferred.resolve(response);
                    }
                }
            );

            return deferred.promise();
        },

        getEventRSVPStatusFQL: function(eid)
        {            
            var self = this;
            var deferred = jQuery.Deferred();

            if (!this.isLoggedIn()) {
                deferred.reject("getEventRSVPStatusFQL: not logged in");
                return;
            }

            FB.api(
            {
                method: "fql.query",
                query: "select rsvp_status from event_member where eid = " + eid + " and uid=me()"
            }, function (response) {

                deferred.resolve(response);

            });

            return deferred.promise();
        },        

        //---------------------------------------------------------------------------
        // dawg server functions
        //---------------------------------------------------------------------------

        getServerEvents: function()
        {
            //url = "http://eventdawg.local3:8080/server/index.php/event/list/format/json";
            url = "/server/index.php/event/list/format/json";

            this.jqxhr = $.ajax({
                type: "GET",
                url: url,
                //dataType: "json",
                dataType: 'json',
                //contentType: "application/json; charset=utf-8",
                success: function (d) {

                    debug("getServerEvents: success");
                    debug(d);
                },
                error: function (xhr, ajaxOptions, thrownError) {

                    debug("getServerEvents: error " + thrownError);
                }
            });

            return self.jqxhr;

        },

        replaceNonPrintingCharacters: function(str)
        {
            var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;

            return str.replace(re, "");
        },

/*
        saveEvents: function () {

            var self = this;
            var events = self.get("friend_events");
            //var url = app.API_BASEPATH + "event/save/format_json";
            //var userid = this.get("userid");
            var data = events.toJSON();
            //var data = { userid: userid, events: events.toJSON() };

            var url = "/server/index.php/event/save";
            
            //data = data.splice(0, 5);

            data = _.map(data, function (o) {
                return {
                    
                    //description: escape(o.description), 
                    eid: o.eid,
                    start_time: o.start_time,
                    end_time: o.end_time,

                    start_date: o.dm1.unix(),
                    end_date: o.dm2.unix(),

                    //location: o.location,
                    name: self.replaceNonPrintingCharacters(o.name)
                    //pic: o.pic,
                    //pic_big: o.pic_big,
                    //pic_cover: Object
                    //cover: o.cover,
                    //pic_small: o.pic_small,
                    //pic_square: o.pic_square,
                    //picture: o.picture,
                    //privacy: o.privacy,                    
                    //ticket_uri: o.ticket_uri,
                    //venue: Object});
                }
            });
           
           
            //data = { events: [{ eid: "a", name: "t1" }, { eid: "b", name: "t2" }] };
            //data = { eid: "a", name: "t1" };

            var data2 = { events: data };

            debug("saveEvents: " + url);
            debug(data);

            this.jqxhr = $.ajax({
                type: "POST",
                url: url,
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data2),
                success: function (d) {

                    debug("success");
                    debug(d);
                },
                error: function (xhr, ajaxOptions, thrownError) {

                    debug("error " + thrownError);

                    if (thrownError != "abort")
                        Backbone.trigger("error", thrownError);
                }
            });

            return self.jqxhr;
        },


        allInOneFQL: function () {

            var self = this;
            var msg;

            if (!this.statusOK(msg)) {
                debug(msg);
                return;
            }

            Backbone.trigger("getEvents:start");

            //self.get("friends").reset();
            //self.get("event_members").reset();
            //self.get("friend_events").reset();

            var t = timeStart();
            var startOfDay = moment().startOf('day').unix();
            var now = moment().unix();
            var start_date = this.search_model.get("start_date");
            var end_date = this.search_model.get("end_date");

            var events = [];

            FB.api({
                method: 'fql.multiquery',
                queries: {
                    query1: 'SELECT uid,name,email,pic_square from user where uid = me()',
                    query2: 'SELECT uid,name,email,pic_square from user where uid in (SELECT uid1 FROM friend WHERE uid2 = me())',
                    query3: 'SELECT eid,uid,rsvp_status from event_member where (uid = me() OR uid in (SELECT uid FROM #query2)) AND start_time >= ' + startOfDay,
                    query4: 'SELECT eid,name,description,venue,pic,pic_big,pic_cover,pic_small,pic_square,location,start_time,end_time,privacy,ticket_uri from event where eid in (SELECT eid FROM #query3)'
                }
            },
              function (response) {
                
                  if (response[0])
                    self.get("me").set(response[0].fql_result_set[0]);
                    //self.set("me", new app.FriendModel(response[0].fql_result_set[0]));

                  if (response[1])
                    self.get("friends").reset(response[1].fql_result_set);
                    //self.set("friends", new app.FriendCollection(response[1].fql_result_set));

                  if (response[2])
                    self.get("event_members").reset(response[2].fql_result_set);
                    //self.set("event_members",  new app.EventMemberCollection(response[2].fql_result_set));

                  if (response[3])
                  {
                    _.each(response[3].fql_result_set, function (e) {

                        self._getMomentDates(e);                         

                        var in_range = start_date.overlap(start_date, end_date, e.dm1.toDate(), e.dm2.toDate());

                          //if (dm1.unix() >= now || (!empty(e.end_time) && dm2.unix() >= now)) {
                              var x = {
                                  eid: e.eid,
                                  name: e.name,
                                  description: e.description,
                                  location: e.location,
                                  start_time: e.start_time,
                                  end_time: e.end_time,
                                  pic: e.pic,
                                  pic_small: e.pic_small,
                                  pic_big: e.pic_big,
                                  pic_square: e.pic_square,
                                  pic_cover: (e.pic_cover) ? e.pic_cover.source : null,
                                  dm1: e.dm1,
                                  dm2: e.dm2,
                                  privacy: e.privacy,
                                  ticket_uri: e.ticket_uri,
                                  in_range: in_range
                              };

                              if (e.venue && e.venue.latitude && e.venue.longitude) {
                                  x.latitude = e.venue.latitude;
                                  x.longitude = e.venue.longitude;
                                  x.city = e.venue.city;
                                  x.country = e.venue.country;
                                  x.state = e.venue.state;
                                  x.street = e.venue.street;
                                  x.zip = e.venue.zip;
                                  x.venue_id = e.venue.id;
                              }

                              events.push(x);
                          //}
                      });
                  }

                  //self.set("friend_events", new app.EventCollection(events));
                  self.get("friend_events").reset(events);

                  debug("allInOneFQL: finished: " + timeEnd(t) + " ms, found " + self.get("friends").length + " friends, " + events.length + " events");
                  //debug("rejected: " + response[3].fql_result_set.length);

                  Backbone.trigger("getEvents:stop");
                  Backbone.trigger("gotEvents");
                  Backbone.trigger("gotFriends", self.get("friends").length);
                  Backbone.trigger("gotEventMembers");
                  Backbone.trigger("gotFriendEvents");
                  Backbone.trigger("facebookGotMyDetails");

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
              });
        }        
*/

/*          
             var self = this;
            var msg;

            //this.allInOneFQL();

            if (!this.statusOK(msg)) {
                debug(msg);
                return;
            }

            Backbone.trigger("getEvents:start");

            var t = timeStart(t);

            $.when(self.getMyDetails2(),
                self.getFriends2(),
                self.getFriendEventsFQL(),
                self.getEventMembersFQL())
            .then(function (res) {

                debug("getEvents: all done in : " + timeEnd(t) + " ms, found " + self.get("friends").length + " friends, " + self.get("friend_events").length + " events");

                Backbone.trigger("getEvents:stop");
                Backbone.trigger("gotEvents");
            });

            return;

            var friends = self.get("friends");
            var event_members = self.get("event_members");
            var friend_events = self.get("friend_events");

            friends.reset();
            event_members.reset();
            friend_events.reset();

            //self.get("friend_events").reset();

            Backbone.trigger("tasksStart");

            $.when(self.getMyDetails(), self.getFriends())
            //self.getMyDetails().
            //then(function(res) {
            //    self.getFriends();
            //})
            .then(function (response) {

                debug("getEvents: complete found " + friend_events.length + " events");

                //if (!empty(self.get("me").more_url)) {
                //    self.getMoreEvents(self.get("me").id, self.get("me").more_url);
                //}

                //friends.forEach(function (f) {

                //    if (!empty(f.get("more_url"))) {
                //        self.getMoreEvents(f.id, f.get("more_url"));
                //    }
                //});

                friend_events.updateEventCount();                    

                Backbone.trigger("tasksStop");
                Backbone.trigger("friendEventsLoaded", { network: app.NETWORK_FACEBOOK });

                if (options.id)
                {
                    self.getEventDetails(options.id)
                    .then(function (res) {

                        self._addEvent(res, self.get("userid"));

                        var event = new app.EventModel(res);

                        Backbone.trigger("showEventDetails", event);
                    });
                }

            });
            //.fail(function (error) {
            //Backbone.trigger("error", error);
            //});   
                         */