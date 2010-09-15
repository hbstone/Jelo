/**
 * @namespace <strong>Note: If you load Jelo.Core, every method of Jelo.Core is also available beneath Jelo itself.</strong>
 *            For example, the "each" function can be used as Jelo.Core.each(...) or Jelo.each(...)
 * @name Jelo
 */
(function(J) {
    
    /** @private */
    var D = window.document,
        isReady = false,
        onReady = [],
        fireReady = function() {
            isReady = true;
            for (var i = 0; i < onReady.length; i++) {
                try {
                    onReady[i].call(window, J);
                } catch (e) {
                    if ('console' in window && 'log' in console) {
                        console.log(e);
                    }
                }
            }
            onReady = [];
        },
        init = function() {
            if (D.addEventListener) {
                if ((/webkit/i).test(window.navigator.userAgent)) {
                    var timer = setInterval(function() {
                        if (/complete|loaded/i.test(D.readyState)) {
                            clearInterval(timer);
                            fireReady();
                        }
                    }, 20);
                } else {
                    D.addEventListener("DOMContentLoaded", fireReady, false);
                }
            } else {
                var old = (typeof window.onload == "function")
                    ? window.onload
                    : J.emptyFn;
                window.onload = function() {
                    old();
                    fireReady();
                };
            }
        };
    
    /**
     * Reusable empty function. Performs no operation.
     * 
     * @function
     * @memberOf Jelo
     * @name emptyFn
     */
    J.emptyFn = function() {};
    
    /**
     * Extends Jelo with the supplied module. Currently, multilevel namespaces are not an option (for example,
     * Jelo.MyClass.MySubClass)
     * 
     * @param {String} name A namespace identifier for the new module.
     * @param {Object} object The module itself, or an inline function which immediately returns an object.
     * @param {Boolean} [overwrite=false] If a module exists with the same name, set this parameter to true to overwrite
     *        the existing module.
     * @function
     * @memberOf Jelo
     * @name mold
     */
    J.mold = function(n, o, v) {
        if (!J[n] || v) {
            J[n] = o;
        }
    };
    
    /**
     * Loads remote Jelo modules or submodules, then performs code after the load is complete. Also usable as a generic
     * "on DOM ready" function if no modules are supplied. Dependencies are handled automatically, and are not
     * explicitly required. For example:
     * 
     * <pre>
     *     Jelo.load('ui', function() { ... code requiring the ui module ... });
     * </pre>
     * 
     * Since "ui" requires "core", core will automatically be included with this request. The result is exactly
     * identical to the following example:
     * 
     * <pre>
     *     Jelo.load('core', 'ui', function() { ... code requiring the ui module ... });
     * </pre>
     * 
     * Available modules and submodules:
     * 
     * <pre>
     * sizzle : the
     * Sizzle selector library
     *     core: Core, CSS, Dom, Event (requires: sizzle)
     *     io: Ajax, JSON, Session
     *     toolbox: Environment, Form
     *     ui: Anim, Dragdrop (requires: core)
     *     debug: Console (requires: core)
     *     widget: the Widget base class
     *     widgets: Panel (requires: io, ui, widget)
     *     
     *     all: Loads ALL modules in the correct order. This is the easiest way to use Jelo.
     * </pre>
     * 
     * @param {String} [module] A module group or specific submodule to load, or "all" to load the whole library.
     * @param {String} [...] Additional module groups to load.
     * @param {Function} [fn] Code to execute after the given modules have completely loaded.
     * @function
     * @memberOf Jelo
     * @name load
     */
    J.load = function() {
        if (!isReady) {
            var args = arguments;
            setTimeout(function() {
                J.load.apply(window, args);
            }, 20);
            return;
        }
        var a = [].slice.call(arguments, 0),
            c = (typeof a[a.length - 1] == 'function')
                ? a.pop()
                : J.emptyFn,
            m = a.join(',').toLowerCase(),
            s = D.createElement('script');
        if (m.length) {
            s.src = 'http://fatfreejelo.com/load/' + m + '/';
            if (s.readyState) {
                s.onreadystatechange = function() {
                    if ((/complete|loaded/).test(s.readyState)) {
                        s.onreadystatechange = J.emptyFn;
                        if (isReady) {
                            c.call(window, J);
                        } else {
                            onReady.push(c);
                        }
                    }
                };
            } else {
                s.onload = function() {
                    if (isReady) {
                        c.call(window, J);
                    } else {
                        onReady.push(c);
                    }
                };
            }
            D.documentElement.firstChild.appendChild(s);
        } else {
            c.call(window, J);
        }
    };
    
    window.Jelo = J;
    init();
    
})(window.Jelo || {});
