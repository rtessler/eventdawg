var app = app || {};

app.FacebookTestView = Backbone.ModalView.extend({

    className: 'facebook-test-view',

    template: _.template($('#facebook-test-template').html()),

    initialize: function (options) {

        $.ajaxSetup({ cache: true });

        debug("aaa");

        var APP_LJ = '225697090933659';
        var APP_TEST2 = '430187960397694';
        var APP_TESTV2 = "677594308942929";
        var FACEBOOK_EVENT_DAWG_APP_ID = '162428367246974';

        app.search_model = new app.SearchModel();

        this.facebook_model = new app.FacebookModel({ search_model: app.search_model });

        this.facebook_model.loadAPI(null, this);

        //this.facebook_model.loadAPI(APP_TESTV2).then(function (res) {

        //    this.facebook_model.getLoginStatus().then(function (res2) {

        //        if (res2.authResponse) {
        //            $(".controls a").removeClass("disabled");
        //            $(".status").html("logged in");
        //        }
        //        else {
        //            // not logged in

        //            this.facebook_model.login().then(function (res3) {

        //                if (res3.authResponse) {
        //                    $(".controls a").removeClass("disabled");
        //                    $(".status").html("logged in");
        //                }
        //            });
        //        }
        //    });
        //});
    },

    render: function()
    {
        this.$el.html(this.template());

        return this;
    },

//$("#birds").autocomplete({
//    source: "search.php",
//    minLength: 2,
//    select: function (event, ui) {
//        log(ui.item ?
//          "Selected: " + ui.item.value + " aka " + ui.item.id :
//          "Nothing selected, input was " + this.value);
//    }
//});

    events: {
        "click .get-my-details": "getMyDetails",
        "click .get-permissions": "getPermissions",
        "click .search": "search",
        "click .login": "login",
        "click .get-friend-events": "getFriendEvents",
        "click .post-feed": "postFeed",
        "click .send-mail": "sendMail",
        "click .compare": "compare",
        "click .upload": "upload",
        "click .post-event": "postEvent",

        
        "click .get-friend-events1": "getFriendEvents1",
        "click .get-friend-events2": "getFriendEvents2",
        "click .get-my-events": "getMyEventsFQL",
        "click .get-my-friends": "getMyFriendsFQL",
        "click .get-public-events": "getPublicEventsFQL",
        "c;ick .get-friends-event-members-and-events": "getFriendEventMembersAndEventsFQL",
        "click .get-event-members": "getEventMembersFQL",
    },

    getMyDetails: function (e) {

        e.preventDefault();

        debug(this.facebook_model);

        this.facebook_model.getMyDetails().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },

    getPermissions: function (e) {

        e.preventDefault();

        this.facebook_model.getPermissions().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },

    search: function (e) {

        e.preventDefault();

        this.facebook_model.search().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },

    login: function (e) {

        e.preventDefault();

        this.facebook_model.login().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },

    getFriendEvents: function (e) {

        e.preventDefault();

        this.facebook_model.getFriendEvents().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },

    postFeed: function (e) {

        e.preventDefault();

        this.facebook_model.postFeed();
    },

    sendMail: function (e) {

        e.preventDefault();

        this.facebook_model.sendMail();
    },

    compare: function (e) {

        e.preventDefault();

        this.facebook_model.compareFriendandPublic();
    },

    upload: function (e) {

        e.preventDefault();

        debug("file upload start");

        this.facebook_model.postEventImage(0);
        return;

        var formData = new FormData($('#upload')[0]);

        $.ajax({
            url: "http://www.this.facebook_model.com/events/1390493437871336/picture",
            type: 'POST',
            xhr: function () {  // custom xhr
                myXhr = $.ajaxSettings.xhr();

                return myXhr;
            },
            //Ajax events
            success: function (data) {

                //$("#progress-bar").hide();

                debug("file uploaded successfully");
            },
            error: function (xhr, ajaxOptions, thrownError) {

                debug("error uploading file: " + thrownError);
            },
            // Form data
            data: formData,
            //Options to tell JQuery not to process data or worry about content-type
            cache: false,
            contentType: false,
            processData: false
        }, 'json');

    },

    postEvent: function (e) {

        e.preventDefault();

        this.facebook_model.postEvent();
    },

//--------------------------------------------------------------------------------------
// FQL

    getFriendEventsFQL1: function (e) {

        e.preventDefault();

        this.facebook_model.getFriendEventsFQL2().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },

    getFriendEventsFQL2: function (e) {

        e.preventDefault();

        this.facebook_model.getFriendEventsFQL().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },


    getMyEventsFQL: function (e) {

        e.preventDefault();

        this.facebook_model.getMyEventsFQL().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },

    getMyFriendsFQL: function (e) {

        e.preventDefault();

        this.facebook_model.getMyFriendsFQL().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },

    getPublicEventsFQL: function (e) {

        e.preventDefault();

        this.facebook_model.getPublicEventsFQL().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },

    getFriendEventMembersAndEventsFQL: function (e) {

        e.preventDefault();

        this.facebook_model.getFriendsEventMembersAndEventsFQL().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },

    getEventMembersFQL: function (e) {

        e.preventDefault();

        this.facebook_model.getEventMembersFQL().then(function (res) {

            this.$("#output").html(JSON.stringify(res, null, '\t'));
        });
    },

})

