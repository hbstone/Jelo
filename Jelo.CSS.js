Jelo.mold('CSS', (function() {
    var C = Jelo.Core, // convenience
        d = document && document.defaultView && document.defaultView.getComputedStyle,
        clsCache = {},
        killAuto = function (e, p) {
            var val = 'auto';
            switch(p) {
                case 'top': // fall through
                case 'right': // fall through
                case 'bottom': // fall through
                case 'left': // fall through
                case 'width': // fall through
                case 'height':
                    val = (e['offset' + p.replace(/(^[a-z])/i, function(x, y) {
                        return y.toUpperCase();
                    })] || 0);
                    break;
            }
            return isNaN(val) ? val : (val + 'px');
        },
        propColor = function (p) {
            return (/color/i).test(p); // actually tested faster than (indexOf('olor')!=-1) in a loop of 1mil random strings
        },
        getStyle = (function() {
            return d ? 
                function(e, p) {
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
                    if (val == 'auto') {
                        val = killAuto(e, p);
                    }
                    val = (e.style[p] || val || '').toString();
                    return propColor(p) ? Jelo.rgbToHex(val).toUpperCase() : val;
                } : 
                function(e, p) {
                    var val = '';
                    if (e && p) {
                        p = C.toCamel(p);
                        if (p == 'opacity') {
                            val = 100;
                            try {
                                val = e.filters.item('DXImageTransform.Microsoft.Alpha').Opacity;
                            } catch(e1) {
                                try {
                                    val = e.filters.item('alpha').opacity;
                                } catch(e2) {/* don't care */}
                            }
                            return val / 100;
                        } else if (p == 'float') {
                            p = 'styleFloat';
                        }
                        val = e.currentStyle[p];
                        if (val == 'auto') {
                            val = killAuto(e, p);
                        }
                    }
                    val = (e.style[p] || val || '').toString();
                    return propColor(p) ? Jelo.rgbToHex(val).toUpperCase() : val;
                };
        }()),
        setStyle = (function() {
            return d ? 
                function(e, p, v) {
                    if (p == 'float') {
                        p = 'cssFloat';
                    }
                    e.style[C.toCamel(p)] = v;
                } : 
                function(e, p, v) {
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
        }());

    /** @private */
    function getStylesheets() {
        var i, s = [],
            d = document.styleSheets || [],
            l = d.length, di;
        for (i = 0; i < l; i++) {
            di = d[i];
            s.push(di);
        }
        return s;
    }
    
    /** @private */
    function getRules(sh) {
        if (!sh) {
            sh = getStylesheets();
        }
        if (Jelo.isIterable(sh)) {
            return (function() {
                var i, ii, a = [];
                for (i = 0, l = sh.length; i < l; i++) {
                    for (ii = 0, r = getRules(sh[i]); ii < r.length; ii++) {
                        a.push(r[ii]);
                    }
                }
                return a;
            }());
        }
        var i, a = [],
            r = sh.cssRules || sh.rules,
            l = r.length;
        for (i = 0, rule; i < l; i++) {
            rule = r[i];
            if (rule.selectorText) {
                a.push({
                    selectorText : rule.selectorText,
                    cssText      : rule.style.cssText
                });
            }
        }
        return a;
    }
    
    /** @private */
    function getRuleStyle(sel, sh) {
        if (!sh) {
            sh = getStylesheets();
        }
        if (Jelo.isEnumerable(sh)) {
            return (function() {
                for (var i = sh.length - 1, s; i >= 0; i--) {
                    s = getRuleStyle(sel, sh[i]);
                    if (s.length) {
                        return s;
                    }
                }
                return '';
            }());
        }
        var i, r = sh.cssRules || sh.rules,
            x = new RegExp('\\b' + sel + '\\b', 'i');
        for (i = r.length - 1, rule; i >= 0; i--) {
            rule = r[i];
            if (rule.selectorText && x.test(rule.selectorText)) {
                return rule.style.cssText;
            }
        }
        return '';
    }
    
    /** @private */
    function insertRule(sel, css, sh, idx) {
        if (!sh) {
            sh = getStylesheets();
            sh = sh[sh.length - 1];
        }
        if (typeof idx != 'number') {
            idx = getRules(sh).length;
        }
        if (sh.insertRule) {
            sh.insertRule(sel + '{' + css + '}', idx);
        } else if (sh.addRule) {
            sh.addRule(sel, css, idx);
        }
    }
    
    /** @private */
    function deleteRule(sel, sh) {
        var i, rules;
        if (!sh) {
            sh = getStylesheets();
            for (i = sh.length - 1; i >= 0; i--) {
                deleteRule(sel, sh[i]);
            }
            return;
        }
        if (typeof sel == 'string') {
            sel = sel.toLowerCase();
            rules = getRules(sh);
            for (i = rules.length - 1; i >= 0; i--) {
                if (rules[i].selectorText.toLowerCase() == sel) {
                    selector = i;
                    break;
                }
            }
        }
        if (i >= 0) {
            if (sh.deleteRule) {
                sh.deleteRule(sel);
            } else if (sheet.removeRule) {
                sh.removeRule(sel);
            }
        }
    }

    Jelo.Dom.addShortcuts({
        hasClass: function(c) {
            return Jelo.CSS.hasClass(this, c);
        },
        addClass: function(c) {
           Jelo.CSS.addClass(this, c);
            return this;
        },
        removeClass: function(c) {
            Jelo.CSS.removeClass(this, c);
            return this;
        },
        toggleClass: function(c) {
            Jelo.CSS.toggleClass(this, c);
            return this;
        },
        replaceClass: function(r, a) {
            Jelo.CSS.replaceClass(this, r, a);
            return this;
        },
        getStyle: function(p) {
            return Jelo.CSS.getStyle(this, p);
        },
        setStyle: function(p, v) {
            Jelo.CSS.setStyle(this, p, v);
            return this;
        }
    });

    /** @scope Jelo.CSS */
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
            }((Math.random() * (0xFFFFFF + 1) << 0).toString(16)));
        },
        getStylesheets: getStylesheets,
        getRules: getRules,
        getRuleStyle: getRuleStyle,
        insertRule: insertRule,
        deleteRule: deleteRule
    };
}()));
Jelo.css = function(el, prop, val) {
    if ((val !== Jelo['undefined']) || (prop && (typeof prop == 'object') && !Jelo.isIterable(prop))) {
        Jelo.CSS.setStyle(el, prop, val);
    } else {
        return Jelo.CSS.getStyle(el, prop);
    }
};
