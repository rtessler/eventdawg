var app = app || {};

app.EventMemberModel = Backbone.Model.extend({

	// we build a unique id by catenating uid and eid

	defaults: {

		eid: null,
		uid: null,
		rsvp_status: null
	},

    initialize: function () {

    }

});