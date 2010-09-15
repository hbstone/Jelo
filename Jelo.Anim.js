/**
 * @namespace Provides animation behaviors. Parts have been adapted from the innovative library Emile, available at
 *            http://github.com/madrobby/emile
 * @name Jelo.Anim
 */
Jelo.mold('Anim', function() {
    
    /** @private */
    var ie = !!window.attachEvent && !window.opera,
        _ = {
            f          : 60, // desired frames per second
            i          : 0, // interval (automatically derived from _.f)
            d          : 0.48, // default duration
            a          : [], // queued for animation
            r          : [], // queued for removal
            t          : null, // master timer
            div        : document.createElement('div'), // for normalizing style data
            props      : ('backgroundColor backgroundPosition borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color filter fontSize fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft paddingRight paddingTop right textIndent top width wordSpacing zIndex mozBorderRadiusTopLeft mozBorderRadiusTopRight mozBorderRadiusBottomRight mozBorderRadiusBottomLeft webkitBorderTopLeftRadius webkitBorderTopRightRadius webkitBorderBottomRightRadius webkitBorderBottomLeftRadius').split(' '),
            rDualValue : /(\-?[0-9]+)([^0-9\s]+)\s+(\-?[0-9]+)/i,
            rBackPos   : /background\-?position/i,
            rOpacity   : /opacity\s*[\:\=]\s*([\d\.]+)/i,
            now        : function() {
                return (new Date()).getTime();
            },
            cache      : {}
        };
    _.i = Math.round(1000 / _.f); // initialize
    
    /** @private */
    function parse(val, prop) {
        if (_.rBackPos.test(prop)) {
            return {
                value : val,
                unit  : ''
            };
        }
        if (ie && _.rOpacity.test(val)) {
            return {
                value : (_.rOpacity.exec(val)[1] / 100).toFixed(2),
                unit  : ''
            };
        }
        var v = parseFloat(val),
            u = ('' + val).replace(/^[\d\.]+/, '');
        return {
            value : isNaN(v)
                ? u
                : v,
            unit  : isNaN(v)
                ? 'color'
                : u
        };
    }
    
    /** @private */
    function norm(str) {
        var p, v, css,
            rules = {},
            i = _.props.length;
        if (ie && _.rOpacity.test(str)) {
            str = str.replace(_.rOpacity, 'filter:alpha(opacity=' + (100 * _.rOpacity.exec(str)[1]) + ')');
        }
        _.div.innerHTML = '<div style="' + str + '"></div>';
        css = _.div.childNodes[0].style;
        while (i--) {
            p = _.props[i];
            if ((v = css[p])) {
                rules[p] = parse(v, p);
            }
            if (rules.filter) {
                rules.opacity = rules.filter;
                delete rules.filter;
            }
        }
        return rules;
    }
    
    /** @private */
    function s(str, p, c) {
        return str.substr(p, c || 1);
    }
    
    /** @private */
    function color(source, target, pos) {
        var i = 2, j, c, tmp,
            v = [],
            r = [];
        while (j = 3, c = arguments[i - 1], i--) {
            if (s(c, 0) == 'r') {
                c = c.match(/\d+/g);
                while (j--) {
                    v.push(~~c[j]);
                }
            } else {
                if (c.length == 4) c = '#' + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
                while (j--)
                    v.push(parseInt(s(c, 1 + j * 2, 2), 16));
            }
        }
        while (j--) {
            tmp = ~~(v[j + 3] + (v[j] - v[j + 3]) * pos);
            r.push(tmp < 0
                ? 0
                : tmp > 255
                    ? 255
                    : tmp);
        }
        return 'rgb(' + r.join(',') + ')';
    }
    
    /** @private Available as {@link Jelo.Anim#ate} */
    function animate(c) {
        if (!c) {
            return;
        }
        if (Jelo.isEnumerable(c.me)) {
            Jelo.each(c.me, function(item) {
                // this scope is required, bugs ensue if this "each" is unrolled
                var config = {};
                for (var i in c) {
                    config[i] = c[i];
                }
                config.me = item;
                animate(config);
            });
            return;
        }
        if (!c.me || !c.me.tagName) {
            // no element supplied, animate no property (before/during/after functions are still called)
            c.me = document.body;
            c.css = '';
        }
        if (!('duration' in c)) {
            c.duration = _.d;
        }
        c.duration *= 1000;
        c.easing = c.easing && c.easing.toUpperCase && Easing[c.easing.toUpperCase()] || Easing.SINE;
        Jelo.each(['before', 'during', 'after'], function(fn) {
            if (typeof c[fn] != 'function') {
                c[fn] = Jelo.emptyFn;
            }
        });
        var o, l,
            target = norm(c.css),
            start = _.now(),
            current = {},
            end = start + c.duration, prop;
        for (prop in target) {
            current[prop] = parse(Jelo.css(c.me, prop), prop);
        }
        if ('opacity' in target) {
            if (!current.opacity) {
                var r = _.rOpacity.exec(c.me.currentStyle['filter']);
                current.opacity = {
                    value : parseInt((r && r[1] || 100), 10) / 100,
                    unit  : ''
                };
            }
        }
        o = {
            // from config object
            me       : c.me,
            css      : c.css,
            duration : c.duration,
            easing   : c.easing,
            before   : c.before,
            during   : c.during,
            after    : c.after,
            
            // created internally
            start    : start,
            end      : end,
            percent  : 0,
            current  : current,
            target   : target
        };
        
        // cancel duplicate animations (avoids certain conflicts)
        for (l = _.a.length, i = l; --i >= 0;) {
            if (_.a[i].me == o.me) {
                _.a.splice(i, 1);
            }
        }
        
        _.a.push(o);
        c.before.call(o, o);
        run();
    }
    
    /** @private Handles each frame of animation. */
    function run() {
        if (!_.t) {
            _.t = setInterval(function() {
                var i, r, o, prop,
                    t = _.now(),
                    c = [], x;
                if (_.r.length) {
                    for (i = _.r.length; --i >= 0;) {
                        r = _.r[i];
                        o = _.a[r];
                        c.push({
                            o  : o,
                            fn : o.after
                        });
                        _.a.splice(r, 1);
                    }
                    for (i = -1; ++i < c.length;) {
                        r = c[i];
                        r.fn.call(r.o, r.o);
                    }
                    _.r = [];
                }
                if (_.a.length) {
                    for (i = -1; ++i < _.a.length;) {
                        o = _.a[i];
                        x = (t >= o.end)
                            ? 1
                            : ((t - o.start) / o.duration);
                        for (prop in o.target) {
                            if (o.target[prop].unit == 'color') {
                                Jelo.css(o.me, prop, color(o.current[prop].value, o.target[prop].value, o.easing(x)));
                            } else if (_.rBackPos.test(prop)) {
                                var cur = _.rDualValue.exec(o.current[prop].value),
                                    tar = _.rDualValue.exec(o.target[prop].value),
                                    xPos = parseInt((1 * cur[1] + (tar[1] - cur[1]) * o.easing(x)), 10),
                                    yPos = parseInt((1 * cur[3] + (tar[3] - cur[3]) * o.easing(x)), 10);
                                Jelo.css(o.me, prop, [xPos, yPos].join(tar[2] + ' '));
                            } else {
                                Jelo.css(o.me, prop, (o.current[prop].value + (o.target[prop].value - o.current[prop].value) *
                                    o.easing(x)).toFixed(3) +
                                    o.target[prop].unit);
                            }
                        }
                        o.percent = Math.max(0, Math.min(1, x)).toFixed(2);
                        o.during.call(o, o);
                        if (x >= 1) {
                            _.r.push(i);
                        }
                    }
                } else {
                    clearInterval(_.t);
                    _.t = null;
                }
            }, _.i);
        }
    }
    
    /** @private */
    var Easing = function() {
        // thanks to robert penner, thomas fuchs, et al
        var s = 1.70158;
        return {
            LINEAR     : function(x) {
                return x;
            },
            IN         : function(x) {
                return Math.pow(x, 2);
            },
            OUT        : function(x) {
                return -(Math.pow((x - 1), 2) - 1);
            },
            SINE       : function(x) {
                return (-Math.cos(x * Math.PI) / 2) + 0.5;
            },
            BOTH       : function(x) {
                return ((x /= 0.5) < 1)
                    ? 0.5 * Math.pow(x, 2)
                    : -0.5 * ((x -= 2) * x - 2);
            },
            STRONGIN   : function(x) {
                return Math.pow(x, 4);
            },
            STRONGOUT  : function(x) {
                return -(Math.pow((x - 1), 4) - 1);
            },
            STRONGBOTH : function(x) {
                return ((x /= 0.5) < 1)
                    ? 0.5 * Math.pow(x, 4)
                    : -0.5 * ((x -= 2) * Math.pow(x, 3) - 2);
            },
            BOUNCE     : function(x) {
                return ((x < (1 / 2.75))
                    ? 7.5625 * x * x
                    : (x < (2 / 2.75))
                        ? 7.5625 * (x -= (1.5 / 2.75)) * x + 0.75
                        : (x < (2.5 / 2.75))
                            ? 7.5625 * (x -= (2.25 / 2.75)) * x + 0.9375
                            : 7.5625 * (x -= (2.625 / 2.75)) * x + 0.984375);
            },
            BOUNCEPAST : function(x) {
                return ((x < (1 / 2.75))
                    ? 7.5625 * x * x
                    : (x < (2 / 2.75))
                        ? 2 - (7.5625 * (x -= (1.5 / 2.75)) * x + 0.75)
                        : (x < (2.5 / 2.75))
                            ? 2 - (7.5625 * (x -= (2.25 / 2.75)) * x + 0.9375)
                            : 2 - (7.5625 * (x -= (2.625 / 2.75)) * x + 0.984375));
            },
            SWINGIN    : function(x) {
                return x * x * (((s + 1) * x) - s);
            },
            SWINGOUT   : function(x) {
                return (x -= 1) * x * (((s + 1) * x) + s) + 1;
            },
            SWINGBOTH  : function(x) {
                var sb = s * 1.525;
                    x *= 2; // doesn't work if you combine this math with the ternary "if" expression
                return ((x < 1)
                    ? 0.5 * (x * x * (((sb *= (1.525)) + 1) * x - sb)) 
                    : 0.5 * ((x -= 2) * x * ((sb + 1) * x + sb) + 2));
            },
            ELASTIC    : function(x) {
                return -1 * Math.pow(4, -8 * x) * Math.sin((x * 6 - 1) * (2 * Math.PI) / 2) + 1;
            },
            SPRING     : function(x) {
                return 1 - (Math.cos(x * 4.5 * Math.PI) * Math.exp(-x * 6));
            },
            WOBBLE     : function(x) {
                return (-Math.cos(x * x * 9 * Math.PI) / 2) + 0.5;
            },
            
            // easter egg: the following functions accept an optional number of times to repeat (default = 2)
            BLINK      : function(x, n) {
                return Math.round(x * (n || 2)) % 2;
            },
            PULSE      : function(x, n) {
                return (-Math.cos((x * ((n || 2) - 0.5) * 2) * Math.PI) / 2) + 0.5;
            }
        };
    }();
    
    /** @scope Jelo.Anim */
    return {
        /**
         * @function
         * @param {Object} c A configuration object.
         * @param {HTMLElement|Array} [c.me=document.body] One or more elements to animate.
         * @param {String} [c.css=''] Any valid CSS-style string. For example: 'width: 200px; height: 100px;'
         * @param {Number} [c.duration=0.48] How many seconds the animation should last.
         * @param {Function} [c.before] Code to execute before the animation begins.
         * @param {Function} [c.during] This function will be called during EVERY frame of the animation. You may do
         *        other processing here if you wish. Your configuration object is the execution context ("this"), with
         *        some modifications. <code>this.duration</code> is in milliseconds instead of seconds,
         *        <code>this.easing</code> is the actual easing function instead of the string you supply, and
         *        <code>this.percent</code> is a decimal between 0 and 1, indicating how far along this animation is.
         * @param {Function} [c.after] Code to execute after the animation is complete.
         */
        ate                : animate,
        /**
         * @function
         * @param {HTMLElement} element An element to check for animations.
         * @returns {Boolean} True if the supplied element is currently being animated. False otherwise.
         */
        ating              : function(el) {
            return (el
                ? (function() {
                    for (var i = -1, l = _.a.length; ++i < l;) {
                        if (el == _.a[i].me) {
                            return true;
                        }
                    }
                    return false;
                })()
                : !!_.a.length);
        },
        /**
         * Animation easing functions.
         * 
         * <pre>
         *         LINEAR: constant speed throughout the animation
         *         IN: accelerates
         *         OUT: decelerates
         *         BOTH: IN then OUT (different curve from SINE)
         *         SINE: accelerates then decelerates (default if no easing is specified)
         *         STRONGIN: accelerates from very slow
         *         STRONGOUT: decelerates to very slow
         *         STRONGBOTH: STRONGIN then STRONGOUT
         *         BOUNCE: hits the endpoint several times, decelerating with each bounce
         *         BOUNCEPAST: quickly passes the endpoint, then hits the opposite side several times
         *         SWINGIN: reverses behind the starting point, then accelerates to the endpoint
         *         SWINGOUT: passes the endpoint, then decelerates to the endpoint
         *         SWINGBOTH: SWINGIN then SWINGOUT
         *         ELASTIC: snaps past the endpoint several times
         *         SPRING: snaps past the endpoint (gentler than ELASTIC)
         *         WOBBLE: forward, backward, and forward in a single duration
         * </pre>
         * 
         * @field
         * @see http://fatfreejelo.com/shot/easing-functions/
         */
        Easing             : Easing,
        /**
         * @function
         * @param {HTMLElement} element An element to stop animating.
         * @param {Boolean} setFinal True to set the ending value(s) before stopping, false to stop in place.
         */
        stop               : function(el, setFinal) {
            var ai,
                l = _.a.length,
                i = l;
            for (; --i >= 0;) {
                if (_.a[i].me == el) {
                    _.a.splice(i, 1);
                }
            }
        },
        /**
         * Immediately halt all animation. This ignores any pending "during" or "after" functions.
         * 
         * @function
         */
        stopAll            : function() {
            _.a = _.r = [];
        },
        /**
         * @function
         * @param {Number} n Target frames per second for all animations. Actual frames per second may be more or less
         *        depending on the environment.
         */
        setFramesPerSecond : function(n) {
            if (typeof n == 'number') {
                _.f = n;
                _.i = Math.round(1000 / f);
            }
        },
        /**
         * @function
         * @param {Number} n Default duration in seconds) for all future animations where no duration is specified.
         *        Animations with explicit durations will ignore this value. Initial default duration is 0.48 seconds.
         */
        setDefaultDuration : function(n) {
            if (typeof n == 'number') {
                _.d = n;
            }
        }
    };
    
}());
