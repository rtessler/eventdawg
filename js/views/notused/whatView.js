var app = app || {};

app.WhatView = app.BaseView.extend({

    WHAT_AUTOCOMPLETE_URL: "/api/v1/whatAutocomplete/format/json",

    el: '.what-controls',

    template: _.template(),

    initialize: function (options) {

        this.search_model = options.search_model;
        this.dawg_model = options.dawg_model;
        this.facebook_model = options.facebook_model;

        this.render();

        this.listenTo(Backbone, "what:clear", this.clear);

        var self = this;

        this.$("input.what").autocomplete({  
                  
            source: function (request, response) {

                self.search_model.set("search_string", self.$("input.what").val());
                  
                //if (options.search_model.searching)
                    //return;                                 

                var bounds = self.search_model.get("bounds");
                var center = self.search_model.get("center");
                              
                var data = { term: self.$("input.what").val(), 
                    start_date: self.search_model.get("start_date").toMySQLDate(),
                    end_date: self.search_model.get("end_date").toMySQLDate(),
                    sw_lat: bounds.sw_lat,
                    sw_lng: bounds.sw_lng,
                    ne_lat: bounds.ne_lat,
                    ne_lng: bounds.ne_lng,
                    lat: center.lat, 
                    lng: center.lng };

                $.ajax({ url: self.WHAT_AUTOCOMPLETE_URL,
                data: data,
                dataType: "json",
                //type: "GET",
                success: function(d){
                                                     
                    if (!d)
                    {
                        response([]);
                        return;
                    }
                      
                    response($.map( d, function( item ) {
                          
                        var k = "", c = "";                    
                          
                        if (item.keyword)
                            k = " (keyword: " + item.keyword + ") ";
                          
                        if (item.category)
                            c = " (category: " + item.category + ") ";             
                          
                        return {
                            label: item.name + k + c,
                            value: item.name 
                        }                    
                    }));    // response
                }           // success    
                });         // ajax
            },
            minLength: 2,
            select: function( event, ui ) { 
                //debug("select what");
                //debug(ui.item);
                  
                Backbone.trigger("search");       // search all networks
            }
    });
    },

    render: function () {
            
        this.$el.html(this.template());
    },

    clear: function () {
        this.$(".what").html("");
    }
 
});
