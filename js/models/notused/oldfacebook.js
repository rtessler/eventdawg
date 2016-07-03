
        /*                   
            
                    getMyDetails: function()
                    {
                        // my picture: https://graph.facebook.com/" + me.id + "/picture'
            
                        var self = this;
                        var deferred = jQuery.Deferred();
            
                        if (!this.isAPILoaded()) {
                            deferred.reject("api not loaded");
                            return;
                        }
            
                        // assume we are logged in
            
                        Backbone.trigger("taskStart");
                        var t = timeStart(t);
                            
                        FB.api({
                            method: 'fql.multiquery',
                            queries: {
                                query1: 'SELECT uid,name,pic_square from user where uid = me() ',
                                query2: "SELECT eid,uid from event_member where uid in (SELECT uid FROM #query1) " +
                                        " and start_time > '" + moment().format("YYYY-MM-DDThh:mm:ssZZ") + "' " +
                                        " and start_time < '" + moment().add("years", 1).format("YYYY-MM-DDThh:mm:ssZZ") + "' " +
                                        " order by start_time asc",
                                query3: "SELECT eid,name,start_time,end_time,pic_square,pic_cover,pic_small,location,venue " +
                                " from event where eid in " +
                                " (SELECT eid FROM #query2) " +
                                " order by start_time asc"
                            }
                        },
                            function (response) {
            
                                t = timeEnd(t);
                                debug("getMyDetails complete: " + t + "ms");            
                                Backbone.trigger("taskStop");
            
                                if (response.error) {
                                    Backbone.trigger("error", response.error.message);
                                    deferred.reject(response.error.message);
                                }
                                else {
            
                                    if (response)
                                        self.addEvents(response[0].fql_result_set, response[1].fql_result_set, response[2].fql_result_set);                          
            
                                    self.set("me", response[0].fql_result_set[0]);
                                    Backbone.trigger("facebookGetMyDetails");
                                    deferred.resolve(response);
                                }
            
                            });
                              
                        return deferred.promise();
                    },
            
                    getFriends: function () {
            
                        var self = this;
                        var deferred = jQuery.Deferred();
            
                        if (!this.isAPILoaded()) {
                            deferred.reject("api not loaded");
                            return;
                        }
            
                        // assume logged in
            
                        // invited, declined and maybe generate an error
                        // asking for attending slows things down considerably
            
                        Backbone.trigger("taskStart");
                        var t = timeStart(t);
            
                        FB.api({
                            method: 'fql.multiquery',
                            queries: {
                                query1: 'SELECT uid,name,pic_square from user where uid in (SELECT uid1 FROM friend WHERE uid2 = me()) order by last_name limit 1000',
                                query2: "SELECT eid,uid from event_member where uid in (SELECT uid FROM #query1) " +
                                        " and start_time > '" + moment().format("YYYY-MM-DDThh:mm:ssZZ") + "' " +
                                        " and start_time < '" + moment().add("years", 1).format("YYYY-MM-DDThh:mm:ssZZ") + "' " +
                                        " order by start_time asc",
                                query3: "SELECT eid,name,start_time,end_time,pic_square,pic_cover,location,venue " +
                                " from event where eid in " +
                                " (SELECT eid FROM #query2) "
                                //" order by start_time asc"
                            }
                        },
                            function (response) {
            
                                Backbone.trigger("taskStop");
            
                                if (response.error) {
                                    Backbone.trigger("error", response.error.message);
                                    deferred.reject(response.error.message);
                                }
                                else {
            
                                    debug("getFriends complete: " + timeEnd(t) + "ms");
            
                                    //debug(response);
            
                                    if (response) 
                                        self.addEvents(response[0].fql_result_set, response[1].fql_result_set, response[2].fql_result_set);                          
            
                                    self.get("friends").reset(response[0].fql_result_set);
                                    Backbone.trigger("gotFriends", response[0].fql_result_set.length);
                                    deferred.resolve(response);
                                }
                            });
            
                        return deferred.promise();
                    },
                    */

        //----------------------------------------------------------------------------------------------

        /*
        addEvents: function (f) {

            if (!f || !f.events || !f.events.data)
                return;

            // add friend events to master list of all friend events

            var friend_events = this.get("friend_events");

            var arr = [];

            for (var i = 0, len = f.events.data.length; i < len; i++) {

                var d = f.events.data[i];
                var x = friend_events.get(d.id);

                arr.push(d.id);

                if (!x) {

                    // new event

                    //var venue = d.venue;// if event has an id it has a location
                    //if (venue && venue.id)

                    d.dm1 = moment(d.start_time);

                    if (d.end_time) {
                        d.dm2 = moment(d.end_time);
                    }
                    else {

                        d.dm2 = moment(d.start_time).add('days', 1);
                        d.dm2.hour(0);
                        d.dm2.minute(0);
                        d.dm2.second(0);
                    }
                        
                    d.people = [];
                    friend_events.add(d);
                    x = friend_events.get(d.id);
                }

                // save details of persion who is attending this event

                x.get("people").push({ id: f.id, name: f.name });
            }

            f.events = arr;
        },     
        */


        /*

            
                    getMyFriends: function ()
                    {
                        var self = this;
                        var deferred = jQuery.Deferred();
            
                        var q = "SELECT uid,name,pic_square from user where uid in (SELECT uid1 FROM friend WHERE uid2 = me())";
            
                        var t = timeStart();
                
                        FB.api({
                            method: 'fql.query',
                            query: q}, function(response) {
                                debug("getMyFriends response: " + response.length + " friends " + timeEnd(t) + "ms");
                                //debug(response);
            
                                self.get("friends").reset(response);
                                Backbone.trigger("gotFriends", response.length);
            
                                deferred.resolve(response);
                            });
            
                        return deferred.promise();
                    },
            
            
            
                    getEventMembersFQL: function ()
                    {
                        var self = this;
                        var deferred = jQuery.Deferred();
            
                        var d = new Date();
                        var n = Math.floor(d.getTime() / 1000);
                        var t = timeStart();
                
                        var q = "SELECT eid,uid,rsvp_status FROM event_member where  uid in (select uid1 from friend where uid2 = me()) and start_time >= " + n + " order by start_time asc ";
            
                        FB.api({
                            method: 'fql.query',
                            query: q}, function(response) {
                                debug("getEventMembersFQL response: " + response.length + " event members " + timeEnd(t) + "ms");
                                //debug(response);
            
                                _.each(response, function (o) {
                                    o.id = o.uid + o.eid;
                                });
            
                                self.get("event_members").reset(response);
            
                                deferred.resolve(response);
                            });
            
                        return deferred.promise();
                    },
            
                    getFriendEventsFQL: function ()
                    {
                        var self = this;
                        var deferred = jQuery.Deferred();
            
                        var d = new Date();
                        var n = Math.floor(d.getTime() / 1000);
                        var t = timeStart();
                
                        var q = "SELECT eid,name,start_time,end_time,pic_square,pic_cover,location,venue from event " +
                        " where eid in (SELECT eid FROM event_member where uid == me() or uid in (select uid1 from friend where uid2 = me())) and start_time >= " + n +
                            " order by start_time asc ";
            
                        FB.api({
                            method: 'fql.query',
                            query: q}, function(response) {
                                debug("getFriendEventsFQL response: " + response.length + " events " + timeEnd(t) + "ms");
                                //debug(response);
            
                                _.each(response, function (d) {
            
                                    // give the event an id field
            
                                    d.id = d.eid;
            
                                    // new event
            
                                    // in facebook all events have a start time but not necessarily an end time
            
                                    //d.d1 = new Date(Date.parse(d.start_time));
                                    d.dm1 = moment(d.start_time);
                                    //d.d1 = d.dm1.toDate();
            
                                    if (d.end_time) {
                                        d.dm2 = moment(d.end_time);
                                        //d.d2 = d.dm2.toDate();
                                    }
                                    else {
                                        d.dm2 = moment(d.start_time).add('days', 1);
                                        d.dm2.hour(0);
                                        d.dm2.minute(0);
                                        d.dm2.second(0);
                                        //d.d2 = d.dm2.toDate();
                                    }
            
                                    d.people = [];
                                });
            
                                self.get("friend_events").reset(response);
            
                                deferred.resolve(response);
                            });
                
                        return deferred.promise();
                    },
        */