/**
 * @namespace Basic and support functions. <strong>Note: Every method of 
 * Jelo.Core is also available beneath Jelo itself.</strong> For example,
 * the "each" function can be used as Jelo.Core.each(...) or Jelo.each(...)
 * @name Jelo.Core
 */
Jelo.mold('Core', function() {
    
    /** @private shortcut */
    var undef;
    
    /** @private */
    function extend(c, fn) {
        // stores an untouched version of the passed constructor, fn() can then safely modify the native object.
        var ns = document.createElement('iframe');
        ns.width = 0;
        ns.height = 0;
        document.body.appendChild(ns);
        frames[frames.length - 1].document.write('<script>parent._' + c + ' = ' + c + ';<\/script>');
        frames[frames.length - 1].document.close();
        document.body.removeChild(ns);
        if (typeof fn == 'function') {
            fn();
        }
    }
    
    /** @private */
    function toHex(n) {
        var chr = "0123456789ABCDEF";
        if (n === null) {
            return "00";
        }
        n = parseInt(n, 10);
        if (isNaN(n) || !n) {
            return "00";
        }
        n = Math.max(0, n);
        n = Math.min(n, 255);
        n = Math.round(n);
        return chr.charAt((n - n % 16) / 16) + chr.charAt(n % 16);
    }
    
    /** @private */
    function rep(s, r, str) {
        var tmp_arr = [];
        tmp_arr = str.split(s);
        return tmp_arr.join(r);
    }

(function(f) {
        /**
         * @function
         * @memberOf _global_
         * @name setTimeout
         * @param {Function} fn Method to invoke.
         * @param {Number} ms Milliseconds to delay before invoking fn.
         * @param {Mixed} [...] Additional arguments to be passed to fn when it is called.
         * @returns {Number} Resource id, can be cancelled using clearTimeout(id)
         */
        window.setTimeout = f(window.setTimeout);
        /**
         * @function
         * @memberOf _global_
         * @name setInterval
         * @param {Function} fn Method to invoke.
         * @param {Number} ms Milliseconds to delay between intervals
         * @param {Mixed} [...] Additional arguments to be passed to fn when it is called.
         * @returns {Number} Resource id, can be cancelled using clearInterval(id)
         */
        window.setInterval = f(window.setInterval);
    })(function(f) {
        return function(c, t) {
            var a = [].slice.call(arguments, 2);
            if (typeof c == 'string') {
                c = f.name || 'setTimeout or setInterval';
                throw new Error('The first argument to ' + c + ' should be a Function, not a String.');
            }
            return f(function() {
                c.apply(this, a);
            }, t);
        };
    });
    
    // Array methods (uses native when available)
    extend('Array', function() {
        if (Array.prototype.indexOf == undef) {
            /**
             * @memberOf Array
             * @param {Mixed} x The item to attempt to find.
             * @returns {Number} The item's index if found, -1 otherwise.
             */
            Array.prototype.indexOf = function(k) {
                var len = this.length;
                for (var i = 0; i < len; i++) {
                    if (this[i] == k) {
                        return i;
                    }
                }
                return -1;
            };
            Array.indexOf = Array.prototype.indexOf;
        }
        if (Array.prototype.lastIndexOf == undef) {
            /**
             * @memberOf Array
             * @param {Mixed} x The item to attempt to find.
             * @returns {Number} The index of the item's last occurrence if found, -1 otherwise.
             */
            Array.prototype.lastIndexOf = function(k) {
                var len = this.length;
                for (var i = len - 1; i > -1; i--) {
                    if (this[i] == k) {
                        return i;
                    }
                }
                return -1;
            };
            Array.lastIndexOf = Array.prototype.lastIndexOf;
        }
        if (Array.prototype.find == undef) {
            /**
             * @memberOf Array
             * @param {Mixed} x The item to attempt to find, or a RegExp to match.
             * @returns {Array|Boolean} An array of indeces at which the item was found, or at which the RegExp tested
             *          positive. Boolean false if no element matched.
             */
            Array.prototype.find = function(k) {
                var res = [];
                var len = this.length;
                for (var i = 0; i < len; i++) {
                    if ((k.test && k.test(this[i])) || k === this[i]) {
                        res.push(i);
                    }
                }
                return !!res.length && res;
            };
            Array.find = Array.prototype.find;
        }
        if (Array.prototype.shuffle == undef) {
            /**
             * @memberOf Array
             * @returns {Array} The array, randomized.
             */
            Array.prototype.shuffle = function() {
                for (var j, x, i = this.length; i; j = parseInt(Math.random() * i, 10), x = this[--i], this[i] = this[j], this[j] = x) {}
                return this;
            };
            Array.shuffle = Array.prototype.shuffle;
        }
    });
    
    /** @scope Jelo.Core */
    return {
        /**
         * @function
         * @param {Array|Object} enum An enumerable object, typically an Array.
         * @param {Function} fn Code to execute for each item in the enumerable object. 
         * The method is passed the current item, the current index, and the complete 
         * enumerable as arguments. If <code>fn()</code> returns Boolean false, no further 
         * items will be processed, and that index will be returned. The return value can 
         * be safely ignored, but it may be useful in some circumstances.
         * @param {Object} scope An optional execution context in which to run your function.
<pre>
    Jelo.each(['A', 'B', 'C'], function(item, index, arr) {
        alert('Item ' + item + ' is at index ' + index); // "Item A is at index 0", etc.
        alert('Arr has ' + arr.length + ' total items.'); // "Arr has 3 total items"
    });
    var letterB = Jelo.each(['A', 'B', 'C'], function(item, index, arr) {
    	return item != 'B'; // returns the Number 1 ('C' will not be processed)
    });
</pre>
		 * @returns {Mixed} The index of the first loop that returned false, otherwise true. 
		 * <strong>NOTE:</strong> The "true" return value is deprecated, soon the number 
		 * <strong>-1</strong> will be returned for consistency with other Array methods.
         */
        each         : function(a, f, s) {
            var n, i,
                l = a.length;
            if (l != undef) {
                for (i = 0; i < l; i++) {
                    if (f.call(s || a[i], a[i], i, a) === false) {
                        // NOTE: if a[i] is a string, "this" will be an equivalent String object.
                        return i;
                    }
                }
            } else {
                for (n in a) {
                    if (!a.hasOwnProperty || a.hasOwnProperty(n)) {
                        if (f.call(s || a[n], a[n], n, a) === false) {
                            return n;
                        }
                    }
                }
            }
            return true; // TODO: return -1
        },
        /**
         * @function
         * @param {Mixed} a An object to test.
         * @return {Boolean} True if the object is likely enumerable, meaning it seems to be
         * an Array or Array-like object.
         */
        isEnumerable : function(a) {
            return !!a && (typeof a.length == 'number') && (typeof a != 'string');
        },
        /**
         * Can be used to create unique IDs or global counters. Every time this function is called, a number will be
         * returned which is 1 greater than the number previously returned, no matter where this function was called.
         * Note that some internal functions may also use uID(), so you should not expect these numbers to always
         * be consecutive.
         * @function
         * @return {Number} An autoincrementing positive integer. The first number returned is 1.
         */
        uID          : function() {
            var id = 1; // initial value
            return function() {
                return id++;
            };
        }(),
        /**
         * Converts a string from hyphenated to camelCase. For example, Jelo.Core.toCamel("margin-left") becomes
         * "marginLeft".
         * @function
         * @param {String} str A value such as 'margin-left';
         * @returns {String} A value such as 'marginLeft';
         */
        toCamel      : function(str) {
            return str.replace(/-(.)/g, function(m, l) {
                return l.toUpperCase();
            });
        },
        
        /**
         * Mainly used by internal Jelo functions. If a hash mark (#) appears at the beginning of the string, it will be
         * stripped.
         * @function
         * @param {String} hex A value such as "#0080FF"
         * @returns {String} A value such as "0080FF"
         */
        cutHexHash   : function(h) {
            return (h.charAt(0) == "#") ? h.substring(1) : h;
        },
        /**
         * Returns the "red" value from a CSS-style hex string.
         * @function
         * @param {String} hex A value such as "#9966CC"
         * @returns {String} For the above example, "99"
         */
        hexToR       : function(h) {
            return parseInt(this.cutHexHash(h).substring(0, 2), 16);
        },
        /**
         * Returns the "green" value from a CSS-style hex string.
         * @function
         * @param {String} hex A value such as "#9966CC"
         * @returns {String} For the above example, "66"
         */
        hexToG       : function(h) {
            return parseInt(this.cutHexHash(h).substring(2, 4), 16);
        },
        /**
         * Returns the "blue" value from a CSS-style hex string.
         * @function
         * @param {String} hex A value such as "#9966CC"
         * @returns {String} For the above example, "CC"
         */
        hexToB       : function(h) {
            return parseInt(this.cutHexHash(h).substring(4, 6), 16);
        },
        /**
         * Splits a CSS-style hex value into a array of Red, Green, and Blue values.
         * @function
         * @param {String} hex A value such as "#9966CC"
         * @returns {Array} For the above example, ["99", "66", "CC"]
         */
        hexToRGB     : function(h) {
            return [this.hexToR(h), this.hexToG(h), this.hexToB(h)];
        },
        
        /**
         * Converts a CSS RGB string to an array of RGB values. Mainly useful to internal Jelo functions.
         * @function
         * @param {String} hex A value such as "rgb(0, 128, 255)"
         * @returns {Array} For the above example, [0, 128, 255]
         */
        rgbToArray   : function(s) {
            if (typeof s == 'string') {
                try {
                    var sub = s.split(/\D/g),
                        sub2 = [];
                    for (var i = 0; i < sub.length; i++) {
                        if (sub[i]) {
                            sub2[sub2.length] = parseInt(sub[i], 10);
                        }
                    }
                    return sub2;
                } catch (e) {
                    throw new Error("Jelo.Core.rgbStringToArray: Invalid input " + s);
                }
            } else {
                return [];
            }
        },
        
        /**
         * Converts a CSS RGB string to a CSS hex string. Mainly useful to internal Jelo functions.
         * @function
         * @param {String} hex A value such as "rgb(0, 128, 255)"
         * @returns {Array} For the above example, "#0080FF"
         */
        rgbToHex     : function(s) {
            if (typeof s == 'string') {
                try {
                    var a = Jelo.Core.rgbToArray(s);
                    return "#" + toHex(a[0]) + toHex(a[1]) + toHex(a[2]);
                } catch (e) {
                    throw new Error("Jelo.Core.rgbStringToHex: Invalid input " + s);
                }
            }
        },
        
        /**
         * Port of http://php.net/urldecode by http://kevin.vanzonneveld.net
         * @function
         * @see <a href="http://php.net/urldecode">PHP documentation</a>
         * @see <a href="http://kevin.vanzonneveld.net">Original port</a>
         * @param {String} str
         * @returns {String}
         */
        urldecode    : function(str) {
            var h = {}, // histogram
            	ret = str.toString();
            h["'"] = '%27';
            h['('] = '%28';
            h[')'] = '%29';
            h['*'] = '%2A';
            h['~'] = '%7E';
            h['!'] = '%21';
            h['%20'] = '+';
            for (var r in h) {
                if (h.hasOwnProperty(s)) {
                    s = h[r];
                    ret = rep(s, r, ret);
                }
            }
            return decodeURIComponent(ret);
        },
        
        /**
         * Port of http://php.net/urlencode by http://kevin.vanzonneveld.net
         * @function
         * @see <a href="http://php.net/urldecode">PHP documentation</a>
         * @see <a href="http://kevin.vanzonneveld.net">Original port</a>
         * @param {String} str
         * @returns {String}
         */
        urlencode    : function(str) {
            var h = {}, // histogram
                tmp_arr = [],
                ret = str.toString();
            h["'"] = '%27';
            h['('] = '%28';
            h[')'] = '%29';
            h['*'] = '%2A';
            h['~'] = '%7E';
            h['!'] = '%21';
            h['%20'] = '+';
            ret = encodeURIComponent(ret);
            for (var s in h) {
                if (h.hasOwnProperty(s)) {
                    r = h[s];
                    ret = rep(s, r, ret);
                }
            }
            return ret.replace(/(\%([a-z0-9]{2}))/g, function(full, m1, m2) {
                return "%" + m2.toUpperCase();
            });
        },
        
        /**
         * Alias for {@link Jelo.Core.urldecode}
         * @function
         */
        urlDecode    : function(str) {
            return this.urldecode(str);
        },
        
        /**
         * Alias for {@link Jelo.Core.urlencode}
         * @function
         */
        urlEncode    : function(str) {
            return this.urlencode(str);
        }
        
    };
    
}());
/** @ignore */
(function() {
    Jelo.Core.each(Jelo.Core, function(item, index) {
        Jelo[index] = Jelo.Core[index];
    });
})();
