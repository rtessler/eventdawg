(function () {
    if (!window.console) {
        window.console = {};
    }
    // union of Chrome, FF, IE, and Safari console methods
    var m = [
      "log", "info", "warn", "error", "debug", "trace", "dir", "group",
      "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
      "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
    ];
    // define undefined methods as noops to prevent errors
    for (var i = 0; i < m.length; i++) {
        if (!window.console[m[i]]) {
            window.console[m[i]] = function () { };
        }
    }
})();

function debug(s) {

    // ie is a piece of shit

    //if (getBrowser().browser == "msie")
    //    return;

    if (window.console) {
        try { console.log(s) } catch (e) { alert(s) }
    }
}

function empty(val) {

    // test results
    //---------------
    // []        true 
    // {}        true
    // null      true
    // ""        true
    // ''        true
    // undefined true
    // NaN       true
    // 0         false
    // true      false
    // false     false
    // Date      false

    if (val === undefined || val === NaN)
        return true;

    if (typeof (val) == 'number' || typeof (val) == 'boolean' || Object.prototype.toString.call(val) === '[object Date]')
        return false;

    if (val == null || val.length === 0)        // null or 0 length array
        return true;

    if (typeof (val) == "object") {

        // empty object

        var r = true;

        for (var f in val)
            r = false;

        return r;
    }

    return false;
}

function isInt(val) {
    var intRegex = /^\d+$/;

    return intRegex.test(val);

    //return isNaN(parseInt(val));
}

function isNumber(val) {

    return !isNaN(val);
}

function lpad(number, length) {

    var str = '' + number;

    while (str.length < length) {
        str = '0' + str;
    }

    return str;
}

function getDeviceName() {

    // if its a phone or tablet return the device name, otherwise return unknown

    var s = navigator.userAgent.toLowerCase();

    if (s.indexOf("ipad") > -1)
        return "ipad";

    if (s.indexOf("iphone") > -1)
        return "iphone";

    if (s.indexOf("android") > -1)
        return "android";

    // not detecting windows surface

    if (s.indexOf("windows phone") > -1 || s.indexOf("iemobile") > -1 || s.indexOf("windows mobile") > -1)
        return "windows phone";

    if (s.indexOf("blackberry") > -1)
        return "blackberry";

    return "unknown";
}

function getBrowserName() {

    var s = navigator.userAgent.toLowerCase();

    // ok, its not a tablet or a phone, just return browser name

    if (s.indexOf("firefox") > -1)
        return "firefox";

    if (s.indexOf("chrome") > -1)
        return "chrome";

    if (s.indexOf("msie") > -1)
        return "msie";

    if (s.indexOf("windows") > -1)
        return "msie";

    if (s.indexOf("safari") > -1)
        return "safari";

    if (s.indexOf("opera") > -1)
        return "opera";

    return "unknown";
}

function isPhone() {

    // based on iphone 5 dimensions
    // iphone 5 landscape width = 568

    if (window.innerWidth <= 568)
        return true;

    return false;
}

function isTablet() {

    // based in ipad dimensions

    if (window.innerWidth > 568 && window.innerWidth <= 1024)
        return true;

    return false;
}

function isDesktop() {

    if (window.innerWidth > 1024)
        return true;

    return false;
}

function getOrientation() {

    if (window.innerHeight > window.innerWidth)
        return "portrait";

    return "landscape";
}

function getBrowser() {

    var ua = navigator.userAgent.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                /(android)[ \/]([\w.]+)/.exec(ua) ||
		        /(webkit)[ \/]([\w.]+)/.exec(ua) ||
		        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
		        /(msie) ([\w.]+)/.exec(ua) ||
		        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
		        [];

    // NOTE: 
    // - when we are on a tablet or phone we require the device name not the browser (eg if chrome on ipad return ipad)
    // - version is not always correct but works for ie which the important one!!!!!

    //var browser = match[1] || "";
    var browser = getBrowserName();
    var version = parseInt(match[2] || 0);

    return {
        browser: browser,
        version: version
    };
}

function createCookie(name, value, hours) {

    var dt = new Date();

    if (!empty(hours)) {

        dt.setTime(dt.getTime() + (hours * 60 * 60 * 1000));        // milliseconds
    }
    else {
        //var expires = "";       // no expiry  this is cleared when you close the browser

        dt.setUTCFullYear(2030);
    }

    var str = name + "=" + escape(value) + "; expires=" + dt.toGMTString() + "; path=/";

    document.cookie = str;
}

function getCookie(name) {

    var nameEQ = name + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) == ' ')
            c = c.substring(1, c.length);

        if (c.indexOf(nameEQ) == 0)
            return c.substring(nameEQ.length, c.length);
    }

    return null;
}

function deleteCookie(name) {

    createCookie(name, "", -1);
    //document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function refreshCookie(name, hours) {

    // if cookie still active reset the expiry time

    var val = getCookie(name);

    if (!empty(val))
        createCookie(name, val, hours);
}

function imageScaleHeight(w1, h1, w2) {
    // given original width, height calc new height from new width keeping same aspect ratio
    // return integer

    return Math.round(h1 * (w2 / w1));
}

function imageScaleWidth(w1, h1, h2) {
    // given original width height calculate new width from new height keeping same aspect ratio
    // return integer

    return Math.round(w1 * (h2 / h1));
}

function ellipse(str, maxlen) {
    if (empty(str))
        return null;

    if (str.length >= maxlen)
        str = str.substring(0, (maxlen - 3)) + "...";

    return str;
}

function HMStoSeconds(h, m, s) {
    return h * 60 * 60 + m * 60 + s;
}

function timeStart() {
    var d = new Date();
    return d.getTime();
}

function timeEnd(t) {
    var d = new Date();
    return d.getTime() - t;
}

//function componentToHex(c) {
//    var hex = c.toString(16);
//    return hex.length == 1 ? "0" + hex : hex;
//}

//function rgbToHex(r, g, b) {
//    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
//}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function generateColorSeries(from, to, n) {

    var arr = [];

    if (n <= 0 || from == null || to == null)
        return arr;

    // some range checking

    from.r = Math.max(from.r, 0);
    from.r = Math.max(from.r, 0);
    from.r = Math.max(from.r, 0);

    to.r = Math.min(to.r, 255);
    to.r = Math.min(to.r, 255);
    to.r = Math.min(to.r, 255);

    if (n == 1) {
        arr.push( { r: Math.floor(from.r), g: Math.floor(from.g), b: Math.floor(from.b) } );
        return arr;
    }

    var rinc = (to.r - from.r) / (n - 1);
    var ginc = (to.g - from.g) / (n - 1);
    var binc = (to.b - from.b) / (n - 1);

    var r = from.r;
    var g = from.g;
    var b = from.b;

    for (var i = 0; i < n; i++) {
        arr.push({ r: Math.floor(r), g: Math.floor(g), b: Math.floor(b) });
        r += rinc;
        g += ginc;
        b += binc;
    }

    return arr;
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
