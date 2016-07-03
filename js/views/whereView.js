var app = app || {};

app.WhereView = app.BaseView.extend({

    el: '.where-controls',

    template: _.template($('#where-template').html()),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.dawg_model = options.dawg_model;
        this.facebook_model = options.facebook_model;

        Backbone.on('taskStart', this.searchingStart, this);
        Backbone.on('taskStop', this.searchingStop, this);
        Backbone.on('status', this.status, this);
          
        this.render();
    },

    render: function () {
            
        this.$el.html(this.template());
    },

    startSearching: function()
    {
        this.$("#wait-icon").show();
    },

    stopSearching: function()
    {
        this.$("#wait-icon").hide();
    },

    status: function(msg)
    {
        this.$("#status").html(msg);
    }
});
