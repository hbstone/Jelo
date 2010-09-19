/**
 * @namespace Provides asynchronous (and synchronous) communication to the server.
 * @name Jelo.Ajax
 */
Jelo.mold('Ajax', function() {
    
    /** @private */
    var D = window.document,
        getXHR = function() {
            return ('XMLHttpRequest' in window) ? new XMLHttpRequest() : (('ActiveXObject' in window) ? new ActiveXObject("Msxml2.XMLHTTP") : null);
        },
        X = getXHR();
    
    /** @scope Jelo.Ajax */
    return {
        /**
         * Abort a request by the shared XMLHttpRequest object. The request must have been made with the
         * "abortable: true" configuration option.
         * @function
         */
        abort      : function() {
            if (X && X.abort) {
                X.abort();
            }
        },
        /**
         * @function
         * @returns True when the shared (abortable) XMLHttpRequest object is open, has been sent, or is receiving. 
         *          False when uninitialized or loaded.
         */
        isBusy     : function() {
            return X && (/0|4/).test(X.readyState);
        },
        /**
         * Performs an asynchronous GET request, appending the returned HTML text into the supplied element.
         * @function
         * @param {HTMLElement} element The target in which to dump the returned contents.
         * @param {String} url The (local) page address to fetch.
         * @param {Object} [post] Parameters to send along with the request.
         */
        load       : function(el, url, post) {
            if (el && url) {
                this.request({
                    url     : url,
                    data    : post || {},
                    success : function() {
                        el.innerHTML = this.responseText;
                    }
                });
            }
        },
        /**
         * Asynchronously loads a script from any source, local or remote to the page's server.
         * @function
         * @param {String} url The script's address.
         * @param {Function} [fn] A callback function to execute once the script is completely finished loading.
         */
        loadScript : function(url, fn) {
            if (typeof url == 'string') {
                var s = D.createElement('script'),
                    h = D.documentElement;
                if (typeof fn == 'function') {
                    if (s.readyState) {
                        s.onreadystatechange = function() {
                            if ((/loaded|complete/).test(s.readyState)) {
                                s.onreadystatechange = null;
                                fn();
                            }
                        };
                    } else {
                        s.onload = function() {
                            s.onload = null;
                            fn();
                        };
                    }
                }
                s.type = 'text/javascript';
                s.src = url;
                h.insertBefore(s, h.firstChild);
            }
        },
        /**
         * @function
         * @param {Object} config A configuration object
         * @param {String} config.url The URL to send a request to. Must be on the same 
         * server as the calling page.
         * @param {String} [config.method="GET"] GET, POST, PUT or DELETE. Case insensitive.
         * @param {Object} [config.data] Parameters or data to pass to the URL.
         * @param {Boolean} [config.abortable=false] If true, this call will interrupt any
         * pending AJAX requests which are also abortable. By default, multiple requests
         * will execute simultaneously without interaction.
         * @param {Function} [config.success] Method to invoke when the request
         * successfully completed (2xx or 3xx HTTP status code). The function
         * gets passed the XMLHttpRequest object and your original config object.
         * In the callback function, "this" refers to the XMLHttpRequest object.
         * If the response Content-Type is text/xml, <strong>this.responseXML</strong>
         * should be available. Otherwise, use <strong>this.responseText</strong>.
         * @param {Function} [config.failure] Method to invoke when the request
         * was NOT successfully completed. The function gets passed the
         * XMLHttpRequest object and your original config object. In the callback
         * function, "this" refers to the XMLHttpRequest object. The status code
         * is always available as <strong>this.status</strong> if you need to
         * handle specific errors.
         * @param {Function} [config.callback]Method to invoke when the request
         * returns, <em>whether or not the call was successful</em>. Can be
         * useful for cleanup or notification purposes. The function gets passed
         * the XMLHttpRequest object and your original config object. In the
         * callback function, "this" refers to the XMLHttpRequest object. This 
         * will be invoked AFTER the success and failure functions (if available).
         */
        request    : function(o) {
            if (!o || !('url' in o)) {
                return;
            }
            var u = o.url,
                m = (o.method || 'GET').toUpperCase(),
                d = o.data || o.params || {},
                fs = o.success || Jelo.emptyFn,
                ff = o.failure || Jelo.emptyFn,
                fc = o.callback || Jelo.emptyFn,
                x = o.abortable ? X : getXHR(),
                q = (typeof d == 'string') ? d : function(q) {
                        for (var i in d) {
                            if (d.hasOwnProperty(i)) {
                                q += ((/\?/).test(q) ? '&' : '?') + encodeURIComponent(i) + '=' + encodeURIComponent(d[i]);
                            }
                        }
                        return q;
                    }(q || '');
            if (!(/0|4/).test(x.readyState)) {
                x.abort();
            }
            var orsc = function() {
                if (x.readyState == 4) {
                    if ((/^2/).test(x.status)) {
                        fs.call(x, x, o);
                    } else {
                        ff.call(x, x, o);
                    }
                    fc.call(x, x, o);
                }
            };
            switch (m) {
                case "DELETE":
                case "GET" :
                    u += q;
                    //u += ((/\?/).test(u) ? '&' : '?') + '_now=' + (new Date()).getTime();
                    x.open(m, u, true);
                    x.onreadystatechange = orsc;
                    x.setRequestHeader("User-Agent", window.navigator.userAgent + ' Jelo/' + Jelo.Version.toString());
                    x.setRequestHeader("X-Requested-With", 'XMLHttpRequest');
                    x.send(null);
                    break;
                case "POST" :
                case "PUT":
                    q = q.split("?", 2)[1];
                    x.open(m, u, true);
                    x.onreadystatechange = orsc;
                    x.setRequestHeader("User-Agent", window.navigator.userAgent + ' Jelo/' + Jelo.Version.toString());
                    x.setRequestHeader("X-Requested-With", 'XMLHttpRequest');
                    x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    //x.setRequestHeader("Content-Length", q.length);
                    //x.setRequestHeader("Connection", "close");
                    x.send(q);
                    break;
                default :
                    throw new Error("Jelo.Ajax.request: Method " + m + " not yet implemented.");
            }
        }
    };
    
}());
