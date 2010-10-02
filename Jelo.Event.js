/**
 * Event registration and handling. Also provides for custom events.
 * 
 * Adapted from code written by Stephen Stchur
 * Original License: (Ms-PL) http://www.opensource.org/licenses/ms-pl.html
 * 
 * @namespace Jelo.Event
 */
Jelo.mold('Event', function() {
    var add = function() {
        if ('addEventListener' in document) {
            return function(el, ev, fn, useCapture, direct) {
                var pev = pseudo[ev];
                if (pev && (direct !== false)) {
                    pev.call(el, fn, useCapture, true);
                } else {
                    el.addEventListener(ev, fn, useCapture);
                }
            };
        } else if ('attachEvent' in document) {
            var body = (document.compatMode && document.compatMode != "BackCompat") ? document.documentElement : document.body;
            return function(el, ev, fn, useCapture, direct) {
                var pev = pseudo[ev];
                if (pev && (direct !== false)) {
                    pev.call(el, fn, useCapture, true);
                } else {
                    var key = generateKey(el, ev, fn);
                    if (key in hash) {
                        return;
                    }
                    var f = function(evt) {
                        var e = evt || window.event;
                        e.target = e.srcElement;
                        e.pageX = e.clientX + body.scrollLeft;
                        e.pageY = e.clientY + body.scrollTop;
                        if (ev == 'mouseover') {
                            e.relatedTarget = e.fromElement;
                        } else if (ev == 'mouseout') {
                            e.relatedTarget = e.toElement;
                        }
                        e.preventDefault = function() {
                            e.returnValue = false;
                        };
                        e.stopPropagation = e.stopImmediatePropagation = function() {
                            e.cancelBubble = true;
                        };
                        fn.call(el, e);
                        e.target = null;
                        e.relatedTarget = null;
                        e.preventDefault = null;
                        e.stopPropagation = null;
                        e = null;
                    };
                    hash[key] = f;
                    el.attachEvent('on' + ev, f);
                    key = null;
                    f = null;
                }
            };
        } else {
            return function() {};
        }
    }();
    var remove = function() {
        if ('removeEventListener' in document) {
            return function(el, ev, fn, useCapture, direct) {
                var pev = pseudo[ev];
                if (pev && (direct !== false)) {
                    pev.call(el, fn, useCapture, false);
                } else {
                    el.removeEventListener(ev, fn, useCapture);
                }
            };
        } else if ('detachEvent' in document) {
            return function(el, ev, fn, useCapture, direct) {
                var pev = pseudo[ev];
                if (pev && (direct !== false)) {
                    pev.call(el, fn, useCapture, false);
                } else {
                    var key = generateKey(el, ev, fn);
                    if (key in hash) {
                        var f = hash[key];
                        el.detachEvent('on' + ev, f);
                        delete hash[key];
                        key = null;
                        f = null;
                    }
                }
            };
        } else {
            return function() {};
        }
    }();
    function defineEvent(ev, fn) {
        pseudo[ev] = fn;
    }
    /** @private */
    function generateKey(el, ev, fn) {
        return '{' + getGUID(el) + '|' + ev + '|' + getGUID(fn) + '}';
    }
    /** @private */
    function isAncestor(ancestor, descendant, checkSelf) {
        if (descendant === ancestor) {
            return !!checkSelf;
        }
        while(descendant && descendant !== ancestor) {
            descendant = descendant.parentNode;
        }
        return (descendant === ancestor);
        
    }
    /** @private */
    function mouseWheel(fn) {
        var key = getGUID(fn),
            f = hash[key];
        if (!f) {
            f = hash[key] = function(ev) {
                ev.wheelDelta = -(ev.detail);
                fn.call(this, ev);
                ev.wheelDelta = null;
            };
        }
        return f;
    }
    /** @private */
    function mouseEnter(fn) {
        var key = getGUID(fn),
            f = hash[key];
        if (!f) {
            f = hash[key] = function(ev) {
                var relatedTarget = ev.relatedTarget;
                if (isAncestor(this, relatedTarget, true)) {
                    return;
                }
                fn.call(this, ev);
            };
        }
        return f;
    }
    /** @private */
    function getGUID(x) {
        if (x === window) {
            return 'theWindow';
        }
        if (x === document) {
            return 'theDocument';
        }
        if (typeof x.uID !== 'undefined') {
            return x.uID;
        }
        var str = '__$$GUID$$__';
        if (!(str in x)) {
            x[str] = counter++;
        }
        return x[str];
    }
    /** @private */
    var counter = 0,
        hash = {}, 
        pseudo = {
            'mouseenter' : function(fn, useCapture, isListening) {
                var f = mouseEnter(fn);
                isListening ? Jelo.Event.add(this, 'mouseover', f, useCapture, false) : Jelo.Event.remove(this, 'mouseover', f, useCapture, false);
                f = null;
            },
            'mouseleave' : function(fn, useCapture, isListening) {
                var f = mouseEnter(fn);
                isListening ? Jelo.Event.add(this, 'mouseout', f, useCapture, false) : Jelo.Event.remove(this, 'mouseout', f, useCapture, false);
                f = null;
            },
            'mousewheel' : function(fn, useCapture, isListening) {
                var ev = 'mousewheel',
                    f = fn,
                    ua = navigator.userAgent;
                if ((/gecko/i).test(ua) && !(/khtml/i).test(ua)) {
                    ev = 'DOMMouseScroll';
                    f = mouseWheel(fn);
                }
                isListening ? Jelo.Event.add(this, 'mousewheel', f, useCapture, false) : Jelo.Event.remove(this, 'mousewheel', f, useCapture, false);
            }
        };
    /** @scope Jelo.Event */
    return {
        add : function(el, ev, fn) {
            if (Jelo.isIterable(el)) {
                for (var i = 0, l = el.length; i < l; i++) {
                    add(el[i], ev, fn);
                }
            } else {
                add(el, ev, fn);
            }
        },
        remove : function(el, ev, fn) {
            if (Jelo.isIterable(el)) {
                for (var i = 0, l = el.length; i < l; i++) {
                    remove(el[i], ev, fn);
                }
            } else {
                remove(el, ev, fn);
            }
        },
        delegate : function(el, ev, fn, sel) {
            var f = function(e) {
                var i, t = e.target,
                    els = Jelo.Dom.selectAll(sel || '*', el);
                for (i = els.length; i >= 0; --i) {
                    if (els[i] == t) {
                        fn.call(els[i], e);
                    }
                }
            };
            Jelo.Event.add(el, ev, f);
            return f;
        },
        undelegate : function(el, ev, fn) {
            Jelo.Event.remove(el, ev, fn);
        },
        create : defineEvent
    };
}());
Jelo.on = Jelo.Event.add;
Jelo.un = Jelo.Event.remove;
