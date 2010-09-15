/**
 * @namespace Information about the current browsing environment (browser type
 * and capabilities, screen size, browser viewport size, etc.)
 * @name Jelo.Env
 */
Jelo.mold('Environment', function() {
    /** @private convenience */
    var D = window.document, DB = D.body;
    
    /** @private */
    var ua = navigator.userAgent.toLowerCase();
    var isStrict = D.compatMode == "CSS1Compat";
    var isWindows = (/windows|win32/).test(ua);
    var isMac = (/mac[i ]/).test(ua);
    var isLinux = (/linux/).test(ua);
    var isAir = (/adobeair/).test(ua);
    var isWebkit = (/webkit|khtml/).test(ua);
    var isGecko = !isWebkit && (/gecko/).test(ua);
    var isFirefox = isGecko && (/firefox\/\d/).test(ua);
    var isFirefoxOld = isGecko && (/firefox\/[0-2]/).test(ua);
    var isOpera = (/opera/).test(ua);
    var isIE = (!!window.attachEvent && !isOpera);
    var isIE7 = isIE && (/msie 7/).test(ua);
    var isIE8 = isIE && (/msie 8/).test(ua);
    var isIEOld = isIE && (/msie [0-6]/).test(ua);
    var isChrome = (/chrome\/[0-1]/).test(ua);
    var isGoogle = (/google/).test(ua);
    var isYahoo = (/yahoo/).test(ua);
    var isBot = (/bot|crawler|http/).test(ua);
    var isSecure = window.location.href.toLowerCase().indexOf("https") === 0;
    var isModern = (typeof XMLHttpRequest != "undefined");
    
    // fix css image flicker
    if (isIEOld) {
        try {
            D.execCommand("BackgroundImageCache", false, true);
        } catch (e) {}
    }
    
	/** @scope Jelo.Env */
    return {
        /**
         * When "full" is true, returns the width of the physical display screen.
         * When "full" is false, returns the screen width minus the taskbar (if applicable).
         * @param {Boolean} [full]
         * @returns {Number}
         */
        getScreenWidth    : function(full) {
            return full ? screen.width : screen.availWidth;
        },
        /**
         * When "full" is true, returns the height of the physical display screen.
         * When "full" is false, returns the screen height minus the taskbar (if applicable).
         * @param {Boolean} [full]
         * @returns {Number}
         */
        getScreenHeight   : function(full) {
            return full ? screen.height : screen.availHeight;
        },
        /**
         * When "full" is true, shorthand for getDocumentWidth.
         * When "full" is false, shorthand for getViewportWidth.
         * @param {Boolean} [full]
         * @returns {Number}
         */
        getViewWidth      : function(full) {
            return full ? this.getDocumentWidth() : this.getViewportWidth();
        },
        /**
         * When "full" is true, shorthand for getDocumentHeight.
         * When "full" is false, shorthand for getViewportHeight.
         * @param {Boolean} [full]
         * @returns {Number} The Viewport or Document height.
         */
        getViewHeight     : function(full) {
            return full ? this.getDocumentHeight() : this.getViewportHeight();
        },
        /**
         * @returns {Number} The complete horizontal size of the document, including scrollable content.
         */
        getDocumentWidth  : function() {
            var scrollWidth = (D.compatMode != "CSS1Compat") ? DB.scrollWidth : D.documentElement.scrollWidth;
            return Math.max(scrollWidth, this.getViewportWidth());
        },
        /**
         * @returns {Number} The complete vertical size of the document, including scrollable content.
         */
        getDocumentHeight : function() {
            var scrollHeight = (D.compatMode != "CSS1Compat") ? DB.scrollHeight : D.documentElement.scrollHeight;
            return Math.max(scrollHeight, this.getViewportHeight());
        },
        /**
         * @returns {Number} The current width of the browser's visible area.
         */
        getViewportWidth  : function() {
            if (this.isIE) {
                return this.isStrict ? D.documentElement.clientWidth : DB.clientWidth;
            } else {
                return window.innerWidth;
            }
        },
        /**
         * @returns {Number} The current height of the browser's visible area.
         */
        getViewportHeight : function() {
            if (this.isIE) {
                return this.isStrict ? D.documentElement.clientHeight : DB.clientHeight;
            } else {
                return window.innerHeight;
            }
        },
        /**
         * @returns {String} The browser's User Agent.
         */
        getUA             : function() {
            return ua;
        },
        /**
         * True if the browser is in strict mode.
         *
         * @type Boolean
         */
        isStrict          : isStrict,
        /**
         * True in a Windows environment.
         *
         * @type Boolean
         */
        isWindows         : isWindows,
        /**
         * True in an Apple Macintosh environment.
         *
         * @type Boolean
         */
        isMac             : isMac,
        /**
         * True in a Linux environment.
         *
         * @type Boolean
         */
        isLinux           : isLinux,
        /**
         * True in an Adobe AIR environment.
         *
         * @type Boolean
         */
        isAir             : isAir,
        /**
         * True if the browser identifies itself as using the Webkit rendering
         * engine (includes Safari and Google Chrome).
         *
         * @type Boolean
         */
        isWebkit          : isWebkit,
        /**
         * True if the browser identifies itself as using the Gecko rendering
         * engine (includes Firefox and several "microbrew" browsers).
         *
         * @type Boolean
         */
        isGecko           : isGecko,
        /**
         * True if the browser identifies itself as Mozilla Firefox.
         *
         * @type Boolean
         */
        isFirefox         : isFirefox,
        /**
         * True if the browser identifies itself as Mozilla Firefox 2 or less.
         *
         * @type Boolean
         */
        isFirefoxOld      : isFirefoxOld,
        /**
         * True if the browser identifies itself as Opera.
         *
         * @type Boolean
         */
        isOpera           : isOpera,
        /**
         * True if the browser identifies itself as Microsoft Internet Explorer.
         *
         * @type Boolean
         */
        isIE              : isIE,
        /**
         * True if the browser identifies itself as Microsoft Internet Explorer
         * 7.
         *
         * @type Boolean
         */
        isIE7             : isIE7,
        /**
         * True if the browser identifies itself as Microsoft Internet Explorer
         * 8.
         *
         * @type Boolean
         */
        isIE8             : isIE8,
        /**
         * True if the browser identifies itself as Microsoft Internet Explorer
         * 6 or less.
         *
         * @type Boolean
         */
        isIEOld           : isIEOld,
        /**
         * True if the browser identifies itself as Google Chrome.
         *
         * @type Boolean
         */
        isChrome          : isChrome,
        /**
         * True if the visitor identifies itself as a Google service, including the
         * Googlebot search engine and various other Google robots (which may or
         * may not support JavaScript anyway...). Chrome is NOT necessarily included.
         *
         * @type Boolean
         */
        isGoogle          : isGoogle,
        /**
         * True if the visitor identifies itself as a Yahoo service, including the
         * Yahoo Slurp search engine (which may or may not support JavaScript
         * anyway...)
         *
         * @type Boolean
         */
        isYahoo           : isYahoo,
        /**
         * True if the visitor appears to be a robot. Not necessarily a good or
         * bad thing, nor does this imply support (or lack thereof) for any
         * particular JS or CSS feature.
         *
         * @type Boolean
         */
        isBot             : isBot,
        /**
         * True if the browser is in secure mode (HTTPS).
         *
         * @type Boolean
         */
        isSecure          : isSecure,
        /**
         * True in all modern browsers, indicates native AJAX support via
         * XMLHttpRequest. IE 6 and older are known to return false,
         * nearly every other browser supports XMLHttpRequest natively.
         * 
         * @type Boolean
         */
        isModern          : isModern
    };
}());
/** @ignore shortcut */
Jelo.Env = Jelo.Environment;
