/**
 * @namespace Provides animation behaviors. Parts have been adapted from the innovative library Emile, available at
 *            http://github.com/madrobby/emile
 * @name Jelo.Anim
 */
Jelo.mold('Anim', function() {
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
                x *= 2; // doesn't work if you combine this math with the ternary condition
                var sb = s * 1.525;
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
            BLINK      : function(x, n) {
                return Math.round(x * (n || 2)) % 2;
            },
            PULSE      : function(x, n) {
                return (-Math.cos((x * ((n || 2) - 0.5) * 2) * Math.PI) / 2) + 0.5;
            }
        };
    },
    defaults = {
        me: document.createElement('div'),
        css: '',
        duration: 0.48,
        easing: 'sine'
    };
    function configurate(obj) {
        obj.duration = parseInt(obj.duration, 10);
        if (isNaN(obj.duration)) {
            obj.duration = defaults.duration;
        }
        if (!obj.me) {
            obj.me = defaults.me;
        }
        if (typeof obj.css != 'string') {
            obj.css = defaults.css;
        }
        switch(typeof obj.easing) {
            case 'function':
                // custom user-supplied easing function
                break;
            case 'string':
                obj.easing = obj.easing.toUpperCase();
                if (!(obj.easing in Easing)) {
                    obj.easing = defaults.easing;
                }
                break;
            case 'object': // fall through
            case 'undefined': // fall through
            default:
                obj.easing = defaults.easing;
        }
        return obj;
    }

    /** @scope Jelo.Anim */
    return {
        getDefault: function(type) {
            return defaults[type];
        },
        Easing: Easing,
        ate: function(config) {
            config = configurate(config);
            this.emile(config.me, config.css, config);
        },
        ation: function(config) {
            if (!(this instanceof Jelo.Anim.ation)) {
                return new Jelo.Anim.ation(config);
            }
            config = configurate(config);
            for (var i in config) {
                if (config.hasOwnProperty(i)) {
                    this[i] = config[i];
                }
            }
            this.config = config;
            this.run = function() {
                Jelo.Anim.emile(this.config.me, this.config.css, this.config);
            }
        },
        stop: function(el) {
            this.emile.stopAnimation(el);
        },
        stopAll: function() {
            this.emile.stopAll();
        }
    };
}());
