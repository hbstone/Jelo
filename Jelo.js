(function(win, undef) {
    if (!win.Jelo) {
        var doc = win.document,
            error,
            errors = [],
            isReady = false,
            old = !!doc.attachEvent,
            onReady = function() {
                if (old) {
                    doc.detachEvent('onreadystatechange', onReady);
                } else {
                    doc.removeEventListener('DOMContentLoaded', onReady, false);
                    win.removeEventListener('load', onReady, false);
                }
                isReady = true;
                while(fn.length) {
                    try {
                        fn.pop().call(win, win.Jelo);
                    } catch(err) {
                        Jelo.debug(err);
                    }
                }
                fn = {
                    push: function(fn) {
                        fn.call(win, win.Jelo);
                    }
                };
            },
            fn = [];
        win.Jelo = new function () {
            this.constructor = arguments.callee;
            this.undefined = undef;
            this.emptyFn = function() {};
            this._modules = {}; // hash for quick lookup
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
                minor: 0, // prerelease
                revision: 0
            };
            this.debugMode = false;
            this.debug = function() { // default when console is not available
                if ('console' in win) {
                    if ('log' in console) {
                        return function() {
                            if (Jelo.debugMode) {
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
                    if (Jelo.debugMode) {
                        for (var i = 0, l = arguments.length; i < l; i++) {
                            alert(arguments[i]); // TODO: write to a div so this doesn't block
                        }
                    }
                };
            }();
            this.load = function() {
                var i,
                    a = [].slice.call(arguments),
                    f = a.pop(),
                    l = a.length,
                    xhr = new XMLHttpRequest(); // should have sent a poet
                for (i = l; i--;) {
                    if (Jelo._modules[a[i]]) {
                        a.splice(i, 1);
                    } else {
                        Jelo._modules[a[i]] = true;
                    }
                }
                if (a.length) {
                    a = a.join(',');
                    xhr.open('GET', 'http://fatfreejelo.com/load/' + a + '/', true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState == 4 && (/^2|3/).test(xhr.status)) {
                            xhr.onreadystatechange = null;
                            var s = doc.createElement('script');
                            s.text = xhr.responseText;
                            doc.documentElement.childNodes[0].appendChild(s);
                            fn.push(f);
                        }
                    };
                    xhr.send(null);
                } else {
                    fn.push(f);
                }
            };
            this.mold = function(name, obj) {
                try {
                    var space = win.Jelo;
                    name = name.replace(/[^0-9a-z\.]/gi, '').split('.');
                    for (var i = 0, l = name.length - 1; i < l; i++) {
                        if (!space[name[i]]) {
                            space[name[i]] = {};
                        }
                        space = space[name[i]];
                    }
                    space[name[i]] = obj;
                } catch(err) {
                    throw new Error('Jelo.mold: Invalid name "' + name + '"');
                }
            };
        };
        if (old) {
            doc.attachEvent('onreadystatechange', onReady);
        } else {
            doc.addEventListener('DOMContentLoaded', onReady, false);
            win.addEventListener('load', onReady, false);
        }
        // TODO: detect if Jelo itself was loaded dynamically, fire onReady manually
    }
}(this));
