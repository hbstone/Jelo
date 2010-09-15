/**
 * @namespace Event processing and normalization.
 * @name Jelo.Event
 */
Jelo.mold('Event', function() {
    /** @private */
    var live = {};
    
    /** @private */
    function find(el, ev, fn) {
        var h = el._handlers;
        if (h) {
            var d = el.document || el,
                w = d.parentWindow, i, a;
            for (i = h.length - 1; i >= 0; i--) {
                a = w._ieHandlers[h[i]];
                if (a.eventType == ev && a.handler == fn) {
                    return i;
                }
            }
        }
        return -1;
    }
    
    /** @private */
    function removeAllHandlers() {
        var w = this,
            ie = w._ieHandlers;
        for (var i in ie) {
            if (ie.hasOwnProperty(i)) {
                var h = ie[i];
                h.element.detachEvent('on' + h.eventType, h.wrappedHandler);
                delete h[i];
            }
        }
    }
    
    /** @scope Jelo.Event */
    return {
        /**
         * Listens for an event on all elements which match a given CSS selector, throughout the life of the page. New elements that match will automatically be caught.
         * @function
         * @param {String} selector The valid CSS selector to match against.
         * @param {String} event An interactive event, such as 'click', 'keydown', 'mousemove', etc. Non-interactive events (such as 'change' or 'load') may not be caught.
         * @param {Function} fn Your event handler. In the handler, <code>this</code> refers to the event target, and <code>arguments[0]</code> is the event itself.
         * @return {Function} The delegate function wrapped around the supplied event handler. {@link Jelo.Event.removeLive}
         */
        addLive    : function(str, ev, fn) {
            var func = function(e) {
                var t = e.target,
                    el = $$(str),
                    l = el.length,
                    i = l;
                for (; i >= 0; --i) {
                    if (el[i] == t) {
                        fn.call(el[i], e);
                    }
                }
            };
            Jelo.Event.add(document, ev, func);
            return func; // for removal
        },
        /**
         * Removes a delegate event listener. See {@link Jelo.Event.addLive}.
         * @function
         * @param {String} event Which event to stop handling.
         * @param {Function} fn Which listener to stop executing when the supplied event occurs. NOTE: This is the function returned by {@link Jelo.Event.addLive}, not the function supplied to it.
         */
        removeLive : function(ev, func) {
            Jelo.Event.remove(document, ev, func);
        },
        /**
         * Starts listening for an event. Shortcut: <code>Jelo.un(el, ev, fn)</code>
         * @function
         * @param {HTMLElement|Array} el One or more elements to listen on.
         * @param {String} ev Which event to listen for.
         * @param {Function} fn Code to execute when the event occurs. The execution context ("this") is 
         * the element on which the event occurred, and the only argument to this handler is the event object.
         */
        add        : function() {
            return document.addEventListener ? function(el, ev, fn) {
                    if (Jelo.Core.isEnumerable(el)) {
                        var i,
                            l = el.length;
                        for (i = 0; i < l; i++) {
                            Jelo.Event.add(el[i], ev, fn);
                        }
                    } else {
                        el.addEventListener(ev, fn, false);
                    }
                } : function(el, ev, fn) {
                    if (Jelo.Core.isEnumerable(el)) {
                        var i,
                            l = el.length;
                        for (i = 0; i < l; i++) {
                            Jelo.Event.add(el[i], ev, fn);
                        }
                    } else {
                        if (find(el, ev, fn) != -1) {
                            return;
                        }
                        var wh = function(e) {
                            e = e || window.event;
                            var event = {
                                _event          : e,
                                type            : e.type,
                                target          : e.srcElement,
                                currentTarget   : el,
                                relatedTarget   : e.fromElement || e.toElement,
                                eventPhase      : (e.srcElement == el) ? 2 : 3,
                                clientX         : e.clientX,
                                clientY         : e.clientY,
                                screenX         : e.screenX,
                                screenY         : e.screenY,
                                altKey          : e.altKey,
                                ctrlKey         : e.ctrlKey,
                                shiftKey        : e.shiftKey,
                                charCode        : e.charCode || e.keyCode,
                                keyCode         : e.keyCode || e.charCode,
                                button          : e.button ? {
                                        1 : 0,
                                        4 : 1,
                                        2 : 2
                                    }[e.button] : -1,
                                which           : e.button ? e.button + 1 : e.keyCode,
                                stopPropagation : function() {
                                    this._event.cancelBubble = true;
                                },
                                preventDefault  : function() {
                                    var str = '';
                                    Jelo.each(this._event, function(item, index) {
                                        str += index + ': ' + item + "\r\n";
                                    });
                                    this._event.returnValue = false;
                                }
                            };
                            fn.call(el, event);
                        };
                        el.attachEvent('on' + ev, wh);
                        var h = {
                            element        : el,
                            eventType      : ev,
                            handler        : fn,
                            wrappedHandler : wh
                        };
                        var d = el.document || el;
                        var w = d.parentWindow;
                        var id = 'h' + Jelo.uID();
                        if (!w._ieHandlers) {
                            w._ieHandlers = {};
                        }
                        w._ieHandlers[id] = h;
                        if (!el._handlers) {
                            el._handlers = [];
                        }
                        el._handlers.push(id);
                        if (!w._onunloadRegistered) {
                            w.attachEvent('onunload', removeAllHandlers);
                            w._onunloadRegistered = true;
                        }
                    }
                };
        }(),
        /**
         * Stops listening for an event. Shortcut: <code>Jelo.un(el, ev, fn)</code>
         * @function
         * @param {HTMLElement|Array} el One or more elements to stop listening on.
         * @param {String} ev Which event to stop listening for.
         * @param {Function} fn The handler previously attached to the supplied element.
         */
        remove     : function() {
            return (document.removeEventListener) ? function(el, ev, fn) {
                    if (Jelo.Core.isEnumerable(el)) {
                        var i,
                            l = el.length;
                        for (i = 0; i < l; i++) {
                            Jelo.Event.remove(el[i], ev, fn);
                        }
                    } else {
                        el.removeEventListener(ev, fn, false);
                    }
                } : function(el, ev, fn) {
                    var i;
                    if (Jelo.Core.isEnumerable(el)) {
                        var l = el.length;
                        for (i = 0; i < l; i++) {
                            Jelo.Event.remove(el[i], ev, fn);
                        }
                    } else {
                        i = find(el, ev, fn);
                        if (i != -1) {
                            var d = el.document || el;
                            var w = d.parentWindow;
                            var hid = el._handlers[i];
                            var h = w._ieHandlers[hid];
                            el.detachEvent('on' + ev, h.wrappedHandler);
                            el._handlers.splice(i, 1);
                            delete w._ieHandlers[hid];
                        }
                    }
                };
        }()
    };
    
}());
/**
 * Shorthand for {@link Jelo.Event.add}
 * @memberOf Jelo
 * @name on
 * @function
 */
Jelo.on = Jelo.Event.add;
/**
 * Shorthand for {@link Jelo.Event.remove}
 * @memberOf Jelo
 * @name un
 * @function
 */
Jelo.un = Jelo.Event.remove;
/**
 * Shorthand for {@link Jelo.Event.addLive}
 * @memberOf Jelo
 * @name onLive
 * @function
 */
Jelo.onLive = Jelo.Event.addLive;
/**
 * Shorthand for {@link Jelo.Event.removeLive}
 * @memberOf Jelo
 * @name unLive
 * @function
 */
Jelo.unLive = Jelo.Event.removeLive;
