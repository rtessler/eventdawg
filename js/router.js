var app = app || {};

app.AppRouter = Backbone.Router.extend({

    routes: {
        "test": "test",
        "event/:id": "event",
        "home": "home",
        '*path': 'home'        
    },

    home: function () {

        //debug("home route: id = " + id);

        var vars = getUrlVars()
        var id = null;

        if (vars.length == 1) {

            if (vars[0] == "event")
                id = vars["event"];
        }

        if (!empty(id))
            new app.HomeView({ id: id });
        else
            new app.HomeView();
    },

    test: function () {

        //debug("test route: id = " + id);

        var view = new app.FacebookTestView();
        $("#wrapper #content").html(view.render().el);
    },

    event: function (id) {

        debug("event route: id = " + id);

        // accepts urls of the form: http://eventdawg.local:8080/#event/601481443254291

        debug("event route: id = " + id);

        new app.HomeView({ id: id });
    }

});
