/**
 * @namespace Provides access to style and stylesheet functionality.
 * @name Jelo.CSS
 */
Jelo.mold('CSS', function() {
    
    /** @private */
    var view = document.defaultView,
        ie = ('attachEvent' in window) && !('opera' in window),
        webkit = (/webkit/i).test(navigator.userAgent),
        pFloat = ie ? 'styleFloat' : 'cssFloat',
        rOpacity = /alpha\(opacity=(.*)\)/i,
        trim = function(str) {
            return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        };
        
    /** @private */
    var getStyle = function() {
        return (view && view.getComputedStyle ? function(el, p) {
                var v, val, styles = [], i;
                if (Jelo.isEnumerable(el)) {
                    for (i = 0; i < el.length; i++) {
                        styles.push(getStyle(el[i], p));
                    }
                    return styles;
                }
                if (Jelo.isEnumerable(p)) {
                    for (i = 0; i < p.length; i++) {
                        styles.push(getStyle(el, p[i]));
                    }
                    return styles;
                }
                if (el == document) {
                    return null;
                }
                if (p == 'float') {
                    p = pFloat;
                }
                cp = Jelo.toCamel(p);
                switch (cp) {
                    case 'backgroundPositionX' :
                        try {
                            val = getStyle(el, 'background-position').split(' ')[0];
                        } catch (ex) {
                            return null;
                        }
                        break;
                    case 'backgroundPositionY' :
                        try {
                            val = getStyle(el, 'background-position').split(' ')[1];
                        } catch (ey) {
                            return null;
                        }
                        break;
                    default :
                        if ((v = el.style[p] || view.getComputedStyle(el, null)[cp])) {
                            val = (/color/i).test(p) ? Jelo.rgbToHex(v).toLowerCase() : ('' + v).toLowerCase();
                        }
                }
                if (webkit && val == 'rgba(0, 0, 0, 0)') {
                    val = 'transparent';
                }
                return val;
            } : function(el, p) {
                var v, m, val,
                    styles = [], i;
                if (Jelo.isEnumerable(el)) {
                    for (i = 0; i < el.length; i++) {
                        styles.push(getStyle(el[i], p));
                    }
                    return styles;
                }
                if (Jelo.isEnumerable(p)) {
                    for (i = 0; i < p.length; i++) {
                        styles.push(getStyle(el, p[i]));
                    }
                    return styles;
                }
                if (el == document) {
                    return '';
                }
                if (p == 'float') {
                    p = pFloat;
                }
                if (p == 'opacity') {
                    if (el.style && el.style.filter && el.style.filter.match) {
                        if ((m = el.style.filter.match(rOpacity))) {
                            var fv = parseFloat(m[1]);
                            if (!isNaN(fv)) {
                                return (fv ? fv / 100 : 0);
                            }
                        }
                    }
                    return 1;
                }
                p = Jelo.toCamel(p);
                
                // oh god refactor
                if (p == 'backgroundPosition') {
                    v = el.currentStyle.backgroundPositionX + ' ' + el.currentStyle.backgroundPositionY;
                } else if ((v = el.style[p])) {
                    val = ('' + v).toLowerCase();
                } else if (el.currentStyle && (v = el.currentStyle[p])) {
                    if (v == 'auto') {
                        if ((v = el['offset' + p.replace(/^(.)/, function(m, l) {
                            return l.toUpperCase(); // initial cap
                        })])) {
                            v = v + 'px'; // will be inaccurate for elements with borders
                        }
                    }
                    if (!v || (v == 'auto')) {
                        v = 0; // convert undefined to zero
                    }
                    v = ('' + v).toLowerCase();
                }
                val = (/color/i).test(p) ? Jelo.rgbToHex(v).toLowerCase() : ('' + v).toLowerCase();
                return val;
            });
    }();
    
    /** @private */
    function setStyle(el, p, v) {
        var i, u;
        if (Jelo.Core.isEnumerable(el)) {
            for (i = 0; i < el.length; i++) {
                setStyle(el[i], p, v);
            }
            return;
        }
        if (Jelo.Core.isEnumerable(p) || Jelo.Core.isEnumerable(v)) {
            if (Jelo.Core.isEnumerable(p) && Jelo.Core.isEnumerable(v) && (p.length == v.length)) {
                for (i = 0; i < p.length; i++) {
                    Jelo.CSS.setStyle(el, p[i], v[i]);
                }
            } else {
                throw new Error('Jelo.CSS.setStyle: Properties and values must both be Arrays with the same length, or both be Strings.');
            }
            return;
        }
        p = Jelo.toCamel(p);
        if ((/width|height|top|right|bottom|left|size/).test(p)) {
            u = v.replace(/[^(%|px|em)]/g, '');
            if (!u.length) {
                u = 'px';
            }
            v = parseInt(v, 10);
            if (isNaN(v)) {
                v = 0;
            }
            v += u;
        }
        var s = el.style;
        if (p == 'opacity') {
            if (ie) {
                s.zoom = 1;
                s.filter = (s.filter || '').replace(/alpha\([^\)]*\)/gi, '') + (v == 1 ? '' : ' alpha(opacity=' + v * 100 + ')');
            } else {
                s.opacity = parseFloat(v);
            }
        } else {
            s[p] = v;
        }
    }
    
    /** @private */
    function addClass(el, cls) {
        if (Jelo.isEnumerable(el)) {
            for (var i = 0; i < el.length; i++) {
                addClass(el[i], cls);
            }
        } else {
            if (!hasClass(el, cls)) {
                el.className += (el.className.length) ? ' ' + cls : cls;
            }
        }
    }
    
    /** @private */
    function hasClass(el, cls) {
        if (Jelo.isEnumerable(el)) {
            for (var i = 0; i < el.length; i++) {
                if (!hasClass(el[i], cls)) {
                    return false;
                }
            }
            return (el.length > 0);
        }
        return el && cls && (new RegExp('\\b' + cls + '\\b')).test(el.className);
    }
    
    /** @private */
    function removeClass(el, cls) {
        if (Jelo.isEnumerable(el)) {
            for (var i = 0; i < el.length; i++) {
                removeClass(el[i], cls);
            }
        } else {
            el.className = trim(el.className.replace((new RegExp('\\b' + cls + '\\b')), ''));
        }
    }
    
    /** @private */
    function getStylesheets() {
        var s = [],
            d = document.styleSheets || [],
            l = d.length, di;
        for (var i = 0; i < l; i++) {
            di = d[i];
            s.push(di);
        }
        return s;
    }
    
    /** @private */
    function getRules(sheet) {
        if (!sheet) {
            sheet = getStylesheets();
        }
        if (Jelo.isEnumerable(sheet)) {
            return function() {
                var a = [];
                for (var i = 0, l = sheet.length; i < l; i++) {
                    for (var ii = 0, r = getRules(sheet[i]); ii < r.length; ii++) {
                        a.push(r[ii]);
                    }
                }
                return a;
            }();
        }
        var r = sheet.cssRules || sheet.rules,
            l = r.length,
            a = [];
        for (var i = 0, rule; i < l; i++) {
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
    function getRuleStyle(selector, sheet) {
        if (!sheet) {
            sheet = getStylesheets();
        }
        if (Jelo.isEnumerable(sheet)) {
            return function() {
                for (var i = sheet.length - 1, s; i >= 0; i--) {
                    s = getRuleStyle(selector, sheet[i]);
                    if (s.length) {
                        return s;
                    }
                }
                return '';
            }();
        }
        var r = sheet.cssRules || sheet.rules,
            x = new RegExp('\\b' + selector + '\\b', 'i');
        for (var i = r.length - 1, rule; i >= 0; i--) {
            rule = r[i];
            if (rule.selectorText && x.test(rule.selectorText)) {
                return rule.style.cssText;
            }
        }
        return '';
    }
    
    /** @private */
    function insertRule(selector, css, sheet, index) {
        if (!sheet) {
            sheet = getStylesheets();
            sheet = sheet[sheet.length - 1];
        }
        if (typeof index != 'number') {
            index = getRules(sheet).length;
        }
        if (sheet.insertRule) {
            sheet.insertRule(selector + '{' + css + '}', index);
        } else if (sheet.addRule) {
            sheet.addRule(selector, css, index);
        }
    }
    
    /** @private */
    function deleteRule(selector, sheet) {
        var i, rules;
        if (!sheet) {
            sheet = getStylesheets();
            for (i = sheet.length - 1; i >= 0; i--) {
                deleteRule(selector, sheet[i]);
            }
            return;
        }
        if (typeof selector == 'string') {
            selector = selector.toLowerCase();
            rules = getRules(sheet);
            for (i = rules.length - 1; i >= 0; i--) {
                if (rules[i].selectorText.toLowerCase() == selector) {
                    selector = i;
                    break;
                }
            }
        }
        if (i >= 0) {
            if (sheet.deleteRule) {
                sheet.deleteRule(selector);
            } else if (sheet.removeRule) {
                sheet.removeRule(selector);
            }
        }
    }
    
    /**
     * Shortcut for {@link Jelo.CSS.getStyle} and {@link Jelo.CSS.setStyle}. Note
     * that the shortcut uses lowercase "css", and the resulting behavior depends
     * on how many arguments you pass. Pass an element and property for getStyle,
     * or an element, property, and value for setStyle. If this is confusing,
     * it's best to explicitly call Jelo.CSS.getStyle and Jelo.CSS.setStyle.
     * 
     * @function
     * @memberOf Jelo
     */
    Jelo.css = function(el, p, val) {
        var undef;
        if (el && p && (val === undef)) {
            return getStyle(el, p);
        } else if (el && p) {
            return setStyle(el, p, val);
        } else {
            throw new Error('Syntax: Jelo.css(element, property) for getStyle, and Jelo.css(element, property, value) for setStyle.');
        }
    };
    
    /** @scope Jelo.CSS */
    return {
        /**
         * @function
         * @returns {Array} The list of stylesheets on the current page.
         */
        getStylesheets : getStylesheets,
        /**
         * @function
         * @param {StyleSheet|Array} [sheet] A CSS StyleSheet object, or an array of StyleSheet objects. If none is
         *        supplied, sheet defaults to the complete list of stylesheets on the current page.
         * @returns {Array} The list of CSS rules contained in the supplied stylesheet.
         */
        getRules       : getRules,
        /**
         * @function
         * @param {String} selector Any valid CSS selector, such as "div" or "#navigation li a:hover"
         * @param {StyleSheet} [sheet] Which sheet to examine. Defaults to searching every stylesheet on the page.
         */
        getRuleStyle   : getRuleStyle,
        /**
         * @function
         * @param {String} selector Any valid CSS selector, for example "#navigation li a:hover"
         * @param {String} cssText Any valid CSS text, for example "background: #dfd; color: #000;"
         * @param {Stylesheet} [sheet] Which stylesheet to insert the rule into. Defaults to the last sheet on the page.
         * @param {Number} [index] Which rule index to insert the rule after. Defaults to inserting after the last rule.
         */
        insertRule     : insertRule,
        /**
         * @function
         * @param {String} str Which selector identifies the rule to remove. For example, "#navigation li a:hover"
         * @param {Stylesheet} [sheet] Which sheet to remove the rule from. Defaults to searching every stylesheet on the page.
         */
        deleteRule     : deleteRule,
        /**
         * @function
         * @param {HTMLElement|Array} el One or more elements to examine.
         * @param {String|Array} prop Any CSS property to examine.
         * @return {String|Array} If either supplied argument is an Array, this will return an Array of retrieved
         * values. Otherwise, it will return a single style value as a String.
         */
        getStyle       : getStyle,
        /**
         * @function
         * @param {HTMLElement|Array} el One or more elements to modify.
         * @param {String|Array} prop One or more properties to set.  If either <code>prop</code> or <code>val</code> is an Array, BOTH must be an array.
         * @param {String|Array} val One or more values to set. If either <code>prop</code> or <code>val</code> is an Array, BOTH must be an array.
         */
        setStyle       : setStyle,
        /**
         * @function
         * @param {HTMLElement|Array} el One or more elements to which to add a class.
         * @param {String} cls The class name to add.
         */
        addClass       : addClass,
        /**
         * @function
         * @param {HTMLElement|Array} el One or more elements to check.
         * @param {String} cls A classname to check.
         * @return {Boolean} True if the supplied element has the supplied class. If <code>el</code> is an Array,
         * <code>hasClass</code> returns true only if every element in the supplied Array has the supplied class.
         */
        hasClass       : hasClass,
        /**
         * @function
         * @param {HTMLElement|Array} el One or more elements from which to remove a class.
         * @param {String} cls The class name to remove.
         */
        removeClass    : removeClass,
        /**
         * @function
         * @param {HTMLElement|Array} el One or more elements to toggle.
         * @param {String} cls The class name to add or remove.
         */
        toggleClass    : function(el, cls) {
			if (Jelo.isEnumerable(el)) {
				for (var i = 0, l = el.length; i < l; i++) {
					if (hasClass(el[i], cls)) {
						removeClass(el[i], cls);
					} else {
						addClass(el[i], cls);
					}
				}
			} else {
				if (hasClass(el, cls)) {
					removeClass(el, cls);
				} else {
					addClass(el, cls);
				}
			}
        },
        /**
         * Generates a random hexidecimal color, including the hash symbol (e.g. #5181ff)
         * @function
         * @returns {String} A "CSS-formatted" color.
         */
        randomColor    : function() {
            return '#' + (function(h) {
                return new Array(7 - h.length).join('0') + h;
            })((Math.random() * (0xFFFFFF + 1) << 0).toString(16));
        },
        /**
         * Finds the top and left positions of an element on the page.
         * @function
         * @param {HTMLElement} The element to inspect
         * @returns {Array} [left, top] calculated in pixels, output as Numbers.
         */
        findPosition   : function(el) {
            var l = 0,
                t = 0;
            if (el.offsetParent) {
                do {
                    l += el.offsetLeft - parseInt(getStyle(el, 'margin-left'), 10);
                    t += el.offsetTop - parseInt(getStyle(el, 'margin-top'), 10);
                } while ((el = el.offsetParent));
            }
            return [l, t];
        }
        
    };
    
}());
