/**
 * @namespace Provides methods to collect and filter DOM elements.
 * @name Jelo.Dom
 */
Jelo.mold('Dom', function () {
    var sizzle = Jelo.Sizzle || window.Sizzle,
        returnFalse = function() { return false; };
    if (!sizzle) {
        throw new Error('Jelo.Dom: Sizzle not found');
    }
	function doGetStyle(prop) {
	    return Jelo.CSS.getStyle(this, prop);
	}
	function doSetStyle(prop, val) {
	    Jelo.CSS.setStyle(this, prop, val);
	    return this;
	}
	function doAddClass(cls) {
	    Jelo.CSS.addClass(this, cls);
	    return this;
	}
	function doRemoveClass(cls) {
	    Jelo.CSS.removeClass(this, cls);
	    return this;
	}
	function doToggleClass(clsAdd, clsRemove) {
	    Jelo.CSS.toggleClass(this, clsAdd, clsRemove);
	    return this;
	}
	function doHasClass(cls) {
	    return Jelo.CSS.hasClass(this, cls);
	}
	function doOn(ev, fn) {
	    Jelo.Event.add(this, ev, fn);
	    return this;
	}
	function doUn(ev, fn) {
	    Jelo.Event.remove(this, ev, fn);
	    return this;
	}
	function dom(el) {
	    if (el) {
	        if (el instanceof Array && !('_jelodom' in el)) {
				var arr = [];
	            for (var i = 0, l = el.length; i < l; i++) {
	                arr.push(dom(el[i]));
	            }
				arr._jelodom = true;
				return dom(arr);
	        } else {
				if ('_jelodom' in el) {
					delete el._jelodom;
				}
	            el.getStyle = doGetStyle;
	            el.setStyle = doSetStyle;
	            el.addClass = doAddClass;
	            el.removeClass = doRemoveClass;
	            el.toggleClass = doToggleClass;
	            el.hasClass = doHasClass;
	            el.on = doOn;
	            el.un = doUn;
	            return el;
	        }
	    }
	}
    
    /** @scope Jelo.Dom */
    return {
        /**
         * Converts HTML code to actual DOM elements.
         * @function
         * @param {String} html The HTML to convert to DOM nodes.
         * @returns {Node} A DocumentFragment object containing the specified nodes.
         */
        fromString: function (str) {
            var frag = document.createDocumentFragment(),
                div = document.createElement('div');
            if (typeof str != 'string') {
                return frag;
            }
            div.innerHTML = str;
            while (div.firstChild) {
                frag.appendChild(div.firstChild);
            }
            return frag;
        },
        /**
         * Reduces a set of DOM nodes to those that also match the given CSS selector. The selector can be a full
         * selector (for example, "div > span.foo"), or a fragment or simple selector (for example, "div").
         * @function
         * @param {String} selector The CSS selector or xpath query.
         * @param {Array} [superset] The set of elements to filter.
         */
        filter: function (selector, superset) {
            return sizzle.matches(selector, superset);
        },
        /**
         * Selects a group of elements that match a given CSS selector.
         * @function
         * @param {String} selector The CSS selector or xpath query.
         * @param {Node} [context=document] The root node within which to conduct this search.
         * @param {Array} [results] The collection returned from this function.
         * @returns {Array}
         */
        selectAll: function (selector, context, results) {
            return dom((typeof selector == 'string') ? sizzle(selector, context, results) : selector);
        },
        /**
         * Selects the FIRST instance of a matching element.
         * @function
         * @param {String} selector The CSS selector or xpath query.
         * @param {Node} [context=document] The root node within which to conduct this search.
         * @param {Array} [results] The collection returned from this function.
         * @returns {Node}
         */
        select: function (selector, context, results) {
            return dom((typeof selector == 'string') ? sizzle(selector, context, results)[0] : selector);
        },
        /**
         * Selects the nearest parent element which matches a given selector.
         * @function
         * @param {String} selector The CSS selector or xpath query.
         * @param {HTMLElement} element The "child" or starting element. This element is not tested.
         * @returns {HTMLElement} The first ancestor which matches the supplied selector, or null if not found.
         */
        ancestor: function (s, el) {
            return (s && el && el.parentNode) ? (sizzle.filter(s, [el]).length ? el : Jelo.Dom.ancestor(s, el.parentNode)) : null;
        },
        /** @ignore TODO: test and document this function */
        create: function (o) {
            // NOTE: fromString() can be much faster than create() for many elements
            if (typeof o == 'string') {
                return document.createTextNode(o); // special case shortcut
            }
            if (o.tag) {
                var node = document.createElement(o.tag);
                node.id = o.id || '';
                node.className = o.cls || '';
                node.innerHTML = o.html || '';
                if (Jelo.isIterable(o.children)) {
                    var l = o.children.length;
                    for (var i = 0; i < l; i++) {
                        node.appendChild(Jelo.Dom.create(o.children[i]));
                    }
                }
                return node;
            }
        },
        /**
         * Attempts to remove one or more elements from the page.
         * @function
         * @param {HTMLElement|Array} node One or more elements to attempt to remove.
         */
        destroy: function (el) {
            if (Jelo.isIterable(el)) {
                for (var i = 0; i < l; i++) {
                    Jelo.Dom.destroy(el[i]);
                }
            } else if (el && el.parentNode && el.parentNode.removeChild) {
                el.parentNode.removeChild(el);
            }
        },
        /** 
         * @function
         * @param {HTMLElement|Array} el One or more elements to examine.
         * @param {String} attr What attribute to examine.
         * @return {String|Array} If <code>el</code> is an HTMLElement, this returns 
         * the value of the supplied attribute. If <code>el</code> is an Array, this
         * returns an array of attribute values.
         */
        getAttribute: function (el, attr) {
            if (attr == 'class') {
                attr = 'className';
            }
            if (Jelo.isIterable(el)) {
                var attrs = [],
                    l = el.length;
                for (var i = 0; i < l; i++) {
                    attrs.push(el[i][attr] || '');
                }
                return attrs;
            }
            return el[attr] || '';
        },
        /** 
         * @function
         * @param {HTMLElement|Array} el One or more elements to modify.
         * @param {String} attr What attribute to modify.
         * @param {Mixed} val What value to assign.
         */
        setAttribute: function(el, attr, val) {
            if (attr == 'class') {
                attr = 'className';
            }
            if (Jelo.isIterable(el)) {
                for (var i = 0, l = el.length; i < l; i++) {
                    el[i][attr] = val || '';
                }
            } else {
                el[attr] = val || '';
            }
        },
        /**
         * @function
         * @param {HTMLElement|Array} el One or more elements to examine.
         * @param {String} selector Any valid CSS selector to match against.
         * @return {Boolean} True if the supplied element matches the supplied selector.
         */
        is: function (el, s) {
            var arr = Jelo.isIterable(el),
                result = sizzle.filter(s, arr ? el : [el]);
            return arr ? (result.length == el.length) : (result.length > 0);
        },
        /**
         * @function
         * @param {HTMLElement|Array} el One or more elements to modify.
         * @param {Boolean} bool True to make the element(s) selectable, false
         * to make them unselectable.
         */
        selectable: function(el, b) {
            Jelo.each(el, function(me) {
	            Jelo.CSS.setStyle(me, 'user-select', b ? '' : 'none');
	            Jelo.CSS.setStyle(me, '-moz-user-select', b ? '' : 'none');
	            Jelo.CSS.setStyle(me, '-khtml-user-select', b ? '' : 'none');
	            me.onselectstart = b ? null : returnFalse; // TODO: store old selectstart if exists
	            me.setAttribute('unselectable', b ? '' : 'on', 0);
            });
        },
        /**
         * @function
         * @param {HTMLElement} el One element to examine.
         * @return {Array} An Array of the form: [xPosition, yPosition], where the coordinates are relative to the entire document.
         */
        findPosition: function(el) {
            var x = 0,
                y = 0;
            if (el && el.offsetParent) {
                do {
                    x += el.offsetLeft;
                    y += el.offsetTop;
                } while ((el = el.offsetParent));
            }
            return [x, y];
        }
    };
}());

// NOTE: If either $ or $$ is already defined, Jelo will err on the side of safety and not make either global shortcut. Define them yourself if you're sure they're safe.
if (!('$' in this) && !('$$' in this)) {
    /**
     * Shortcut for {@link Jelo.Dom.select}
     * @memberOf _global_
     * @function
     */
    this.$ = this.$ || Jelo.Dom.select;
    /**
     * Shortcut for {@link Jelo.Dom.selectAll}
     * @memberOf _global_
     * @function
     */
    this.$$ = this.$$ || Jelo.Dom.selectAll;    
}
