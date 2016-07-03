var app = app || {};

app.FriendModel = Backbone.Model.extend({

    idAttribute: "uid",

    defaults: {
    	uid: null,
        name: null,
        email: null,
        pic_square: null
    },

    initialize: function () {
    }

});
