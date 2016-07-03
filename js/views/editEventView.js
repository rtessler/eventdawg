var app = app || {};

app.EditEventView = Backbone.ModalView.extend({

    className: 'edit-event-view',

    template: _.template($('#edit-event-template').html()),

    model: new app.EventModel(),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.facebook_model = options.facebook_model;

        this.new_location_id = -1;

        this.selected_location = null;

        //this.facebook_model = options.facebook_model;
        //this.listenTo(this.facebook_model.get("friends"), "reset", this.render);
    },

    render: function () {

        var self = this;

        this.$el.html(this.template(this.model.toJSON()));

        this.$(".start-date").datepicker({ dateFormat: "d M yy", changeMonth: true, changeYear: true });
        this.$(".end-date").datepicker({ dateFormat: "d M yy", changeMonth: true, changeYear: true });

        this.$(".start-time").timepicker();
        this.$(".end-time").timepicker();

        this.$(".start-date").val(moment().format("D MMM YYYY"));
        this.$(".end-date").val(moment().add('d', 1).format("D MMM YYYY"));

        this.$(".start-time").val("7:00pm");
        this.$(".end-time").val("10:00pm");

/*
        function formatWhereResult(data) {

            var url = data.url;

            if (data.id < 0)
                url = "img/markers/facebook/facebook-marker.png";

            return "<p class='place-result' data-id='" + data.id + "' ><img src='" + url + "'  /><span >" + data.text + "</span></p>";
        }

        function formatWhereSelection(data) {

            var url = data.url;

            if (data.id < 0)
                url = "img/markers/facebook/facebook-marker.png";

            return "<p class='place-selection' data-id='" + data.id + "' ><img src='" + url + "' /><span >" + data.text + "</span></p>";
        }

        this.$(".where").select2({
            placeholder: "Add a place?",
            allowClear: true,
            minimumInputLength: 2,
            maximumSelectionSize: 1,

            query: function (query) {

                var data = { results: [] };

                self.facebook_model.getPlace(query.term, self.search_model.get("center"))
                .then(function (res) {

                    _.each(res.data, function(o) {

                        data.results.push({ id: o.id, text: o.name, url: o.picture.data.url });

                    });

                    query.callback(data);
                });

            },
            readonly: false,
            formatResult: formatWhereResult,
            formatSelection: formatWhereSelection,  
            dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
            escapeMarkup: function (m) { return m; }, // we do not want to escape markup since we are displaying html in results

            createSearchChoice: function (term, data) {

                //debug("term = " + term);

                if ($(data).filter(function () {
                    return this.text.localeCompare(term) === 0;
                }).length === 0) {

                    // give it a -ve location id

                    return { id: self.new_location_id--, text: term };
                }
            }

            //Allow manually entered text in drop down.
            //createSearchChoice: function (term, data) {
            //    if ($(data).filter(function () {
            //    return this.text.localeCompare(term) === 0;
            //    }).length === 0) {
            //        return { id: term, text: term };
            //    }
            //},
        });
*/

        self.$(".where").autocomplete({
            minLength: 2,
            source: function (request, response) {

                self.facebook_model.getPlace(request.term, self.search_model.get("center"))
                .then(function (res) {

                    if (!res) {
                        response([]);
                        return;
                    }

                    response($.map(res.data, function (item) {

                        //id: "133825703331224"
                        //location: Object
                        //name: "Sydney Town Hall"
                        //picture: Object

                        //debug(item.picture.data.url);

                        return {
                            label: item.name,
                            value: { id: item.id, location: item.location, name: item.name, icon: item.picture.data.url }
                        }
                    }));    // response
                });


                //if (!d) {
                //    response([]);
                //    return;
                //}

                //response($.map(d, function (item) {

                //    var k = "", c = "";

                //    if (item.keyword)
                //        k = " (keyword: " + item.keyword + ") ";

                //    if (item.category)
                //        c = " (category: " + item.category + ") ";

                //    return {
                //        label: item.name + k + c,
                //        value: item.name
                //    }
                //}));    // response

            },
            focus: function (event, ui) {

                // mouse is hovering over item in list

                self.$(".where").val(ui.item.label);
                self.selected_location = ui.item.value;

                return false;
            },
            select: function (event, ui) {

                debug("autocomplete select value = ");
                debug(ui.item);

                self.selected_location = ui.item.value;

                self.$(".where").val(ui.item.label);
                return false;
            }
        })
        .data("ui-autocomplete")._renderItem = function (ul, item) {

            var str = "<a style='position: relative; '>";
            str += "<img src='" + item.value.icon + "' style='width: 50px; '/>";
            str += "<div style='position: absolute; left: 70px; top: 15px;'>";
            str += "<span class='label' style='font-weight:bold;'>" + item.label + "</span> ";
            str += "</div>"
            str += "</a>";

            return $("<li>")
              .append(str)
              .appendTo(ul);
        };


        function formatPrivacyResult(o) {
            return "<p class='privacy-result'><img src='img/" + o.imgpath.toLowerCase() + ".png'/><span >" + o.text +"</span></p>";
        }


        function formatPrivacySelection(o) {
            return "<p class='privacy-selection'><img src='img/" + o.imgpath.toLowerCase() + ".png'/><span >" + o.text + "</span></p>";
        }

        //num{'OPEN','SECRET','FRIENDS','CLOSED'}

        this.$(".privacy-type").select2({
            data: [{ id: "OPEN", text: "Public", imgpath: "public" },
                { id: "FRIENDS", text: "Friends of Guests", imgpath: "friends-of-guests" },
                { id: "SECRET", text: "Invite Only", imgpath: "invite-only" }],
            formatResult: formatPrivacyResult,
            formatSelection: formatPrivacySelection,
            dropdownCssClass: "bigdrop", // apply css that makes the dropdown taller
            escapeMarkup: function (m) { return m; }
        });

        this.$(".privacy-type").select2("val", 'FRIENDS');

        return this;
    },

    events: {
        'click .create': 'save',
        'click .cancel': 'cancel',
        'keypress form': 'keypress',
        'change .start_date': 'dateChange',
        'change .end_date': 'dateChange'
    },

    dateChange: function () {

        this.search_model.set("start_date", moment(this.$(".start_date").val()).toDate());
        this.search_model.set("end_date", moment(this.$(".end_date").val()).toDate());
    },

    keypress: function (e) {

        //_.bindAll();

        var ENTER_KEY = 13;

        //if (e.keyCode != ENTER_KEY) return;
        if (e.which === ENTER_KEY) {

            // need to save values in model

            var name = this.$(".name").val();
            this.model.set("name", name);
            this.save(e);
        }
    },

    save: function (e) {

        e.preventDefault();

        //hideIOSKeyboard();

        //var isValid = this.model.isValid(true);

        //if (isValid) {

        this.$(".name-error-msg").html("");
        this.$(".description-error-msg").html("");
        this.$(".where-error-msg").html("");
        this.$(".start-time-error-msg").html("");
        this.$(".end-time-error-msg").html("");
        this.$(".privacy-error-msg").html("");

        var name = this.$(".name").val().trim();

        if (empty(name)) {
            this.$(".name-error-msg").html("Must enter an event name");
            return;
        }

        var description = this.$(".description").val().trim();

        if (empty(description)) {
            this.$(".description-error-msg").html("Must enter event details");
            return;
        }

        var start_date = moment(this.$(".start_date").val());
        var end_date = moment(this.$(".end_date").val());

        var start_time = this.$(".start-time").val();
        var end_time = this.$(".end-time").val();

        //debug("start_date = " + start_date);
        //debug("end_date = " + end_date);
        //debug("start_time = " + start_time);
        //debug("end_time = " + end_time);

        var dt = this.$(".start-time").timepicker('getTime', new Date());
        start_date.hour(dt.getHours());
        start_date.minute(dt.getMinutes());

        dt = this.$(".end-time").timepicker('getTime', new Date());
        end_date.hour(dt.getHours());
        end_date.minute(dt.getMinutes());

        //var location_id = this.$(".where").select2("val");
        //var location = this.$(".where").select2("data").text;

        var location_id = -1;
        var location = null;

        var str = this.$(".where").val();

        if (!empty(this.selected_location) && this.selected_location.name == str)
        {
            debug("selected location");
            debug(this.selected_location);

            var location_id = this.selected_location.id;
        }
        else
        {
            location = str;
            location_id = -1;

            debug("unknown location selected: " + location);
        }

        
        //debug("location_id - " + location_id + " location = ");
        //debug(location);

        if (empty(location_id)) {
            this.$(".where-error-msg").html("Must enter place");
            return;
        }

        var privacy_type = this.$(".privacy-type").select2("val");

        var data;

        if (parseInt(location_id) < 0) {

            // no specific location

            data = {
                name: name,
                description: description,
                start_time: start_date.format(), // "YYYY-MM-DDThh:mm:ssZZ"),  //'2013-12-03T15:00:00-0700',
                end_time: end_date.format(), // "YYYY-MM-DDThh:mm:ssZZ"),   // '2013-12-03T19:00:00-0700',
                location: location,
                ticket_uri: "http://www.roberttesslermusic.com",
                privacy_type: privacy_type // enum{'OPEN','SECRET','FRIENDS','CLOSED'}
            };
        }
        else
        {
            data = { name: name,
                description: description,
                location_id: (empty(location_id)) ? "" : location_id,
                start_time: start_date.format(), // "YYYY-MM-DDThh:mm:ssZZ"),  //'2013-12-03T15:00:00-0700',
                end_time:   end_date.format(), // "YYYY-MM-DDThh:mm:ssZZ"),   // '2013-12-03T19:00:00-0700',
                ticket_uri: "http://www.roberttesslermusic.com",
                privacy_type: privacy_type // enum{'OPEN','SECRET','FRIENDS','CLOSED'}
            };
        };

        this.hideModal();
        this.close();

        this.facebook_model.postEvent(data)
        .then(function (response) {

            //Backbone.trigger("search");            
            Backbone.trigger("showMessage", "event created");

            //alert("You have successfully created a Facebook event. To add a picture to this event go to <a href='http://facebook.com/events/" + response.id + "'>http://facebook.com/events/" + response.id + "</a>");
        });
    },

    cancel: function()
    {
        this.hideModal();
        this.close();
    },

    close: function () {

        this.$(".where").select2("close");

        this.$(".privacy-type").select2("close");

        this.stopListening();
        this.unbind();
        this.remove();
    }

});
