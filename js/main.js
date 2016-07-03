var app = app || {};

$(function () {

    app.search_model = new app.SearchModel();

    // immediately executed

    Backbone.on('tasksStart', app.tasksStart, this);
    Backbone.on('tasksStop', app.tasksStop, this);

    Backbone.on('getEvents:start', app.tasksStart, this);
    Backbone.on('getEvents:stop', app.tasksStop, this);

    Backbone.on('error', app.handleError, this);

    //Backbone.View.prototype.close = function (context) {
    //    //this.$el.empty();
    //    context.stopListening();
    //    context.unbind();
    //    context.remove();
    //};

    //$(window).resize(function () {

    //    if (window.innerWidth != app.curScreenWidth) {

    //        // only trigger a resize if the width changes

    //        debug("resize");

    //        Backbone.trigger("windowResize");
    //        app.curScreenWidth = window.innerWidth;
    //    }
    //});

    //$.ajaxSetup({ timeout: app.AJAX_TIMEOUT });

    app.router = new app.AppRouter();

    app.starturl = window.location.href;

    Backbone.history.start();
});