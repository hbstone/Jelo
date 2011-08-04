(function(w, undef, dbg, dfn, rdy) {
    var d = w.document,
        old = !!d.attachEvent,
        onReady = function() {
            w.Jelo.isReady = true;
            if (old) {
                d.detachEvent('onreadystatechange', onReady);
            } else {
                d.removeEventListener('DOMContentLoaded', onReady, false);
                w.removeEventListener('load', onReady, false);
            }
            while(fn.length) {
                try {
                    fn.pop().call(w, w.Jelo);
                } catch(err) {
                    w.Jelo.debug(err);
                }
            }
            fn = {
                push: function(fn) {
                    fn.call(w, w.Jelo);
                }
            };
        },
        fn = [];
    if (w.Jelo) {
        dbg = w.Jelo.debugMode;
        dfn = w.Jelo.debug;
        rdy = w.Jelo.isReady;
    }
    w.Jelo = new function Jelo() {
        this.constructor = Jelo;
        this['undefined'] = undef;
        this.emptyFn = function() {};
        this.Version = {
            atLeast: function(a, b, c) {
                a = a || 0;
                b = b || 0;
                c = c || 0;
                if (this.major > a) {
                    return true;
                }
                if (this.major == a) {
                    if (this.minor > b) {
                        return true;
                    }
                    return ((this.minor == b) && (this.revision >= c));
                }
                return false;
            },
            toString: function() {
                return [this.major, this.minor, this.revision].join('.');
            },
            major: 3,
            minor: 0,
            revision: 5
        };
        this.isReady = !!rdy;
        this.debugMode = !!dbg;
        this.debug = dfn || function() { // default when console is not available
            if ('console' in w) {
                if ('log' in console) {
                    return function() {
                        if (w.Jelo.debugMode) {
                            if ('apply' in console.log) {
                                console.log.apply(console, arguments);
                            } else {
                                // typeof IE's console.log is object, not function (no apply method)
                                console.log(arguments);
                            }
                        }
                    };
                }
            }
            return function() {
                if (w.Jelo.debugMode) {
                    for (var i = 0, l = arguments.length; i < l; i++) {
                        alert(arguments[i]); // TODO: write to a div so this doesn't block
                    }
                }
            };
        }();
        this.load = function() {
            var s,
                a = [].slice.call(arguments),
                f = a.pop(),
                l = a.length,
                xhr = new XMLHttpRequest(); // should have sent a poet
            if (a.length) {
                a = encodeURIComponent(encodeURIComponent(a.join('`'))); // gets decoded twice by the time it hits the page
                s = d.createElement('script');
                s.src = 'http://fatfreejelo.com/load/' + a + '/';
                if (s.readyState) {
                    s.onreadystatechange = function() {
                        if ((/loaded|complete/).test(i.readyState)) {
                            s.onreadystatechange = null;
                            fn.push(f);
                        }
                    }
                } else {
                    s.onload = function() {
                        s.onload = null;
                        fn.push(f);
                    }
                }
                d.getElementsByTagName('script')[0].parentNode.appendChild(s);
            } else {
                fn.push(f);
            }
        };
        this.mold = function(name, obj) {
            try {
                var ns = w.Jelo,
                    n = name.replace(/[^0-9a-z\.]/gi, '').split('.');
                for (var i = 0, l = n.length - 1; i < l; i++) {
                    if (!ns[n[i]]) {
                        ns[n[i]] = {};
                    }
                    ns = ns[n[i]];
                }
                ns[n[i]] = obj;
            } catch(err) {
                throw new Error('Jelo.mold: Invalid name "' + name + '"');
            }
        };
    };
    if (w.Jelo.isReady) {
        onReady();
    } else {
        if (old) {
            d.attachEvent('onreadystatechange', onReady);
        } else {
            d.addEventListener('DOMContentLoaded', onReady, false);
            w.addEventListener('load', onReady, false);
        }
    }
}(this));

