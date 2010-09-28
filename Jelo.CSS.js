Jelo.mold('CSS', function() {
    var C = Jelo.Core, // convenience
        d = document && document.defaultView && document.defaultView.getComputedStyle,
        clsCache = {};
    /** @private */
    function killAuto(e, p) {
        var val = 'auto';
        switch(p) {
            case 'top': // fall through
            case 'right': // fall through
            case 'bottom': // fall through
            case 'left': // fall through
            case 'width': // fall through
            case 'height':
                val = (e['offset' + p.replace(/(^.)/, function(x, y) {
                    return y.toUpperCase();
                })] || 0);
                break;
        }
        return isNaN(val) ? val : (val + 'px');
    }
    /** @private */
    function propColor(p) {
        return (/color/i).test(p); // actually tested faster than (indexOf('olor')!=-1) in a loop of 1mil random strings
    }
    var getStyle = function() {
        return d ? function(e, p) {
            var c, val = '';
            if (e && p) {
                p = C.toCamel(p);
                switch(p) {
                    case 'backgroundPositionX': // fall through
                    case 'backgroundPositionY':
                        try {
                            val = getStyle(e, 'background-position').split(' ')[(/X/).test(p) ? 0 : 1];
                        } catch(err) {
                            val = '0px';
                        }
                        break;
                    default:
                        if (p == 'float') {
                            p = 'cssFloat';
                        }
                        c = d(e, '');
                        if (c && c[p]) {
                            val = c[p];
                        }
                }
            }
            if (val == 'auto') { // TODO: other properties that may return auto
                val = killAuto(e, p);
            }
            val = (e.style[p] || val || '').toString();
            return propColor(p) ? Jelo.rgbToHex(val).toUpperCase() : val;
        } : function(e, p) {
            var val = '';
            if (e && p) {
                p = C.toCamel(p);
                if (p == 'opacity') {
                    val = 100;
                    try {
                        val = e.filters.item('DXImageTransform.Microsoft.Alpha').Opacity;
                    } catch(err) {
                        try {
                            val = e.filters.item('alpha').opacity;
                        } catch(err) {/* don't care */}
                    }
                    return val / 100;
                } else if (p == 'float') {
                    p = 'styleFloat';
                }
                val = e.currentStyle[p];
                if (val == 'auto') { // TODO: other properties that may return auto
                    val = killAuto(e, p);
                }
            }
            val = (e.style[p] || val || '').toString();
            return propColor(p) ? Jelo.rgbToHex(val).toUpperCase() : val;
        };
    }();
    var setStyle = function() {
        return d ? function(e, p, v) {
            if (p == 'float') {
                p = 'cssFloat';
            }
            e.style[C.toCamel(p)] = v;
        } : function(e, p, v) {
            if (p == 'opacity') {
                if (typeof e.style.filter == 'string') {
                    e.style.filter = 'alpha(opacity=' + (v * 100) + ')';
                    if (!e.currentStyle || !e.currentStyle.hasLayout) {
                        e.style.zoom = 1;
                    }
                }
            } else if (p == 'float') {
                p = 'styleFloat';
            }
            e.style[C.toCamel(p)] = v;
        };
    }();
    return {
        hasClass: function(el, cls) {
            return (C.each(el, function() {
                if (!clsCache[cls]) {
                    clsCache[cls] = (new RegExp('(^|\\s)' + cls + '(\\s|$)'));
                }
                return !clsCache[cls].test(this.className);
            }) >= 0);
        },
        addClass: function(el, cls) {
            cls = [].slice.call(arguments, 1);
            C.each(el, function(el) {
                var element = el; // store for inner function
                C.each(cls, function(name) {
                    if (!Jelo.CSS.hasClass(element, name)) {
                        element.className = [element.className, name].join(' ');
                    }
                });
            });
        },
        removeClass: function(el, cls) {
            cls = [].slice.call(arguments, 1);
            C.each(el, function(element) {
                C.each(cls, function(name) {
                    if (Jelo.CSS.hasClass(element, name)) {
                        element.className = element.className.replace(clsCache[name], ' ');
                    }
                });
            });
        },
        toggleClass: function(el, cls) {
            Jelo.CSS[(Jelo.CSS.hasClass(el, cls) ? 'remove' : 'add') + 'Class'](el, cls);
        },
        replaceClass: function(el, rem, add) {
            Jelo.CSS.removeClass(el, rem);
            Jelo.CSS.addClass(el, add);
        },
        /**
         * @param {HTMLElement|Array} el One or more elements to examine.
         * @param {String} prop One or more properties to examine.
         * @returns {String|Array} If <strong>el</strong> is an HTMLElement, this returns the corresponding 
         * style value as a String. If <strong>el</strong> is an Array, this returns an Array of Strings. 
         * The indexes will be the same, meaning the property value for el[x] will be at getStyle(el, prop)[x].
         */
        getStyle: function(el, prop) {
            var vals = [], module = C.CSS;
            if (C.isIterable(el)) { // can't always jump into Jelo.each because the return type changes
                C.each(el, function(item) {
                    vals.push(Jelo.CSS.getStyle(item, prop));
                });
                return vals; // Array
            } 
            if (C.isIterable(prop)) {
                C.each(prop, function(item) {
                    vals.push(Jelo.CSS.getStyle(el, item));
                });
                return vals; // Array
            }
            return getStyle(el, prop); // String
        },
        /**
         * @param {HTMLElement|Array} el One or more elements to modify.
         * @param {String|Object} prop Any CSS property string (i.e. 'background-color') or a hash of properties
         * and values (i.e. {'background-color': '#fff', 'color': '#000'}). If this argument is an Object, the 
         * third argument is ignored.
         * @param {String} val The value to apply to the given property. If the property is an Object, this 
         * argument is ignored.
         */
        setStyle: function(el, prop, val) {
            if (typeof prop == 'string') {
                C.each(el, function() {
                    setStyle(this, prop, val);
                });
            } else if (prop && (typeof prop == 'object')) {
                for (var i in prop) {
                    if (prop.hasOwnProperty(i)) {
                        C.each(el, function() {
                            setStyle(this, i, prop[i]);
                        });
                    }
                }
            }
        },
        randomColor: function() {
            return '#' + (function(h) {
                return new Array(7 - h.length).join('0') + h;
            })((Math.random() * (0xFFFFFF + 1) << 0).toString(16));
        }
    };
}());
Jelo.css = function(el, prop, val) {
    if ((val !== Jelo.undefined) || (prop && (typeof prop == 'object') && !Jelo.isIterable(prop))) {
        Jelo.CSS.setStyle(el, prop, val);
    } else {
        return Jelo.CSS.getStyle(el, prop);
    }
};
