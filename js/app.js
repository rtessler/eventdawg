var app = {

    // constants    

    APPNAME: "EVENT DAWG",

    API_BASEPATH: "http://eventdawg.local3:8080/server/index.php/",

    // networks

    NETWORK_DAWG: 1,
    NETWORK_FACEBOOK: 2,
    NETWORK_GOOGLE: 3,
    NETWORK_PLANVINE: 4,

    IMAGE_DIR: "img/",
    //BUTTON_IMAGE_DIR: "img/buttons/",
    EVENT_IMAGE_UPLOAD_DIR: "image_upload/events/",

    // date ranges

    DATE_RANGE_DAY: 0,
    DATE_RANGE_WEEK: 1,
    DATE_RANGE_MONTH: 2,
    DATE_RANGE_YEAR: 3,
    DATE_RANGE_CUSTOM: 4,

    TRIANGLE_DOWN: "&#x25BC;",
    TRIANGLE_UP: "&#x25B2;",

    //PLANVINE_API_KEY: "0abbff2288c143fe8d7a935b1496fe42",
    //MAX_EVENT_LIST: 10,        // max number of items to show in event list
    //ANIM_LEN: 500,
    //DATE_FORMAT: "dd M yy",        // see: http://docs.jquery.com/UI/Datepicker/$.datepicker.formatDate

    MOMENT_MYSQL_DATE_FORMAT: "YYYY-MM-DD hh:mm:ss",

    curScreenWidth: window.innerWidth,

    task_count: 0,

    location: {},

    clearTasks: function()
    {
        //this.task_count = 0;
    },

    tasksStart: function () {

        $("#loading").show();

        //this.task_count++;
    },

    tasksStop: function () {

        //this.task_count--;

        //if (this.task_count <= 0) {
            $("#loading").hide();
            //this.task_count = 0;
            //Backbone.trigger("allTasksComplete");
        //}
    },

    handleError: function (errmsg) {

        debug("error: " + errmsg);

        $("#loading").hide();
        this.task_count = 0;
    },

    ajaxAbort: function () {
        $("#loading").hide();
        this.task_count = 0;
    },

    getBookmarks: function (network) {

        var bookmarks = [];

        switch (network) {
            case app.NETWORK_DAWG:
                bookmarks = getCookie("dawg_bookmarks");
                break;

            case app.NETWORK_FACEBOOK:
                bookmarks = getCookie("facebook_bookmarks");
                break;
        }

        if (bookmarks)
            return bookmarks.split(",");   // convert from string to array

        return [];
    },

    isBookmarked: function(network, id)
    {
        var bookmarks = app.getBookmarks(network);

        var found = false;

        for (var i = 0; i < bookmarks.length; i++) {

            if (bookmarks[i] == id) {
                found = true;
                break;
            }
        }

        return found;
    },

    hideIOSKeyboard: function () {
        document.activeElement.blur();
        $("input").blur();
    },

    getMyLocation: function()
    {
        var self = this;
				
        this.location = {
            country: "UK",
            city: "London",
            region: "London",
            ip: null,
            hostname: null
        };
			
        $.get("http://ipinfo.io", function (response) {

            self.location.country = response.country;
            self.location.city = response.city;
            self.location.region = response.region;
            self.location.ip = response.ip;
            self.location.hostname = response.hostname;
					
            var arr = response.loc.split(",");			
					
            self.location.lat = parseFloat(arr[0]);
            self.location.lon = parseFloat(arr[1]);	

            debug("getMyLocation: response ");
            debug(self.location);

            Backbone.trigger("locationChange");
					
        }, "jsonp");
    }

}
