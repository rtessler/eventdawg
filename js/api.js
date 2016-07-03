var Api = function()
{
    var BASEURL =  "/"; //document.location.host + "/" ;
    
    var SEARCH_URL = BASEURL + "api/v1/search/format/json";
    var WHAT_AUTOCOMPLETE_URL = BASEURL + "api/v1/whatAutocomplete/format/json";
    var GET_CATEGORIES_URL = BASEURL + "api/v1/categories/format/json";
    var GET_EVENT_DETAILS_URL = BASEURL + "api/v1/getEventDetails/format/json";
    var GET_EVENT_IMAGE_URL = BASEURL + "api/v1/getEventImage/format_json";  
    var LOGIN_URL = BASEURL + "api/v1/login/format_json";
    var FACEBOOK_LOGIN_URL = BASEURL + "api/v1/facebookLogin/format_json";  
    var LOGOUT_URL = BASEURL + "api/v1/logout/format_json";  
    
    var COOKIE_TIMEOUT = 2;     // hours
    var self = this;
        
    function login(email, password, keep_me_logged_in, callback) {       

        //console.log("api.login: url = " + LOGIN_URL + " domain = " + document.domain + " host = " + document.location.host + " location.hostname = " + location.hostname);

        $.ajax({ url: LOGIN_URL,
            data: { email: email, password: password, keep_me_logged_in: keep_me_logged_in },
            dataType: "json",
            type: "POST",
            success: function(d) {             
                                                                    
                if (parseInt(d[0].status) == 1)
                {
                    var x = d[0];

                    createLoginCookies(x.username, x.first_name, x.last_name, x.image, x.access_key, keep_me_logged_in);
                }

                if (callback)
                    callback(d);                
            },
            error: function(jqXHR,  textStatus,  errorThrown) {
                console.log("login: error: " + textStatus + " - " + errorThrown);
                console.log(jqXHR);
                return false;
            }                
        });  
    }   

    function createLoginCookies(username, first_name, last_name, image, access_key, keep_me_logged_in)
    {
        if (keep_me_logged_in)
        {
            createCookie("username", username);
            createCookie("first_name", first_name);
            createCookie("last_name", last_name);    
            createCookie("image", image);
            createCookie("access_key", access_key);  
        }
        else
        {
            createCookie("username", username, COOKIE_TIMEOUT);
            createCookie("first_name", first_name, COOKIE_TIMEOUT);
            createCookie("last_name", last_name, COOKIE_TIMEOUT);    
            createCookie("image", image, COOKIE_TIMEOUT);
            createCookie("access_key", access_key, COOKIE_TIMEOUT);       
        }
    }
    
    var logout = function(callback) {            
        
        $.ajax({ url: LOGOUT_URL,
            data: { },
            dataType: "json",
            type: "POST",
            success: function(d) {   

                deleteCookie("username");
                deleteCookie("first_name");
                deleteCookie("last_name");
                deleteCookie("image");     
                deleteCookie("access_key");  
        
                if (callback)
                    callback(d);
            }
        });
    }

    var facebookLogin = function(uid, email, first_name, last_name, country_code, keep_me_logged_in, callback) {

        $.ajax({ url: FACEBOOK_LOGIN_URL,
            data: { uid: uid, email: email, 
                first_name: first_name, 
                last_name: last_name, 
                country_code: country_code, 
                keep_me_logged_in: keep_me_logged_in },
            dataType: "json",
            type: "POST",
            success: function(d) {     

                if (parseInt(d[0].status) == 1)
                {
                    var x = d[0];

                    createLoginCookies(x.username, x.first_name, x.last_name, x.image, x.access_key, keep_me_logged_in);
                }
                                                                
                if (callback)
                    callback(d);
            },
            error: function(jqXHR,  textStatus,  errorThrown) {
                console.log("facebookLogin: error: " + textStatus + " - " + errorThrown);
                console.log(jqXHR);
                return false;
            }                
        });
    }
    
    var search = function(search_data, callback) {
        
        $.ajax({ url: SEARCH_URL,
            data: search_data,
            //dataType: "json",
            //headers: { "Accept-Encoding" : "gzip,deflate" },
            type: "GET",
            success: function(d) {
                
                if (callback)
                    callback(d);
            },
            error: function(  jqXHR,  textStatus,  errorThrown ) {
                console.log("doSearch: error: " + textStatus + " - " + errorThrown);
                console.log(jqXHR);
                
                //onSearchFinish();
                return;
            }
        });                     
    }
    
    var autoComplete = function() {}
    
    var getCategories = function(callback) {
    
        $.ajax({ url: GET_CATEGORIES_URL,
                success: function(d) {   

                    if (callback)
                        callback(d);               
                }
       });
    }
    
    var getEventDetails = function(event_id, callback) {
        
        $.ajax({ url: GET_EVENT_DETAILS_URL,
                data: { event_id: event_id },
                dataType: "json",
                type: "GET",
                success: function(d) {
                    
                    if (callback)
                        callback(d);
                }
         });
    }
    
    var getEventImage = function(event_id, callback) {
        
        $.ajax({ url: GET_EVENT_IMAGE_URL,
            data: { event_id: event_id },
            dataType: "json",
            type: "GET",
            success: function(d) { 
                
                if (callback)
                    callback(d);                
            }        
        });
    }    

    var createCookie = function(name, value, hours) 
    {
        if (hours) 
        {
            var date = new Date();
            date.setTime(date.getTime()+(hours*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }
        else 
        {
            var expires = "";
        }
                    
        document.cookie = name+"="+value+expires+"; path=/";
    }

    var getCookie = function(name) 
    {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');

        for (var i = 0; i < ca.length; i++) 
        {
            var c = ca[i];

            while (c.charAt(0) == ' ') 
                c = c.substring(1,c.length);

            if (c.indexOf(nameEQ) == 0) 
                return c.substring(nameEQ.length,c.length);
        }

        return null;
    }

    var deleteCookie = function(name) 
    {
        //createCookie(name,"",-1);

        console.log("deleteCookie");

        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }    

    function empty(str)
    {
        if (typeof str == 'undefined' || str == null || str == "")
            return true;

        return false;
    }    
    
    var methods = {
        login: login,
        logout: logout,
        facebookLogin: facebookLogin,
        search: search,
        autoComplete: autoComplete,
        getCategories: getCategories,
        getEventDetails: getEventDetails,
        getEventImage: getEventImage,
        createCookie: createCookie,
        getCookie: getCookie,
        deleteCookie: deleteCookie
    };
    
    return methods;
}