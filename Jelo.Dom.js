/**
 * @namespace Provides methods to collect and filter DOM elements.
 * @name Jelo.Dom
 */
Jelo.mold('Dom', function() {
    
    /** @scope Jelo.Dom */
    return {
        /**
         * Converts HTML code to actual DOM elements.
         * @function
         * @param {String} html The HTML to convert to DOM nodes.
         * @returns {Node} A DocumentFragment object containing the specified nodes.
         */
        fromString   : function(str) {
            var frag = document.createDocumentFragment();
            if (typeof str != 'string') {
                return frag;
            }
            var div = document.createElement('div');
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
        filter       : function(selector, superset) {
            return Sizzle.matches(selector, superset);
        },
        /**
         * Selects a group of elements that match a given CSS selector.
         * @function
         * @param {String} selector The CSS selector or xpath query.
         * @param {Node} [context=document] The root node within which to conduct this search.
         * @param {Array} [results] The collection returned from this function.
         * @returns {Array}
         */
        selectAll    : function(selector, context, results) {
            return (typeof selector == 'string') ? Sizzle(selector, context, results) : selector;
        },
        /**
         * Selects the FIRST instance of a matching element.
         * @function
         * @param {String} selector The CSS selector or xpath query.
         * @param {Node} [context=document] The root node within which to conduct this search.
         * @param {Array} [results] The collection returned from this function.
         * @returns {Node}
         */
        select       : function(selector, context, results) {
            return (typeof selector == 'string') ? Sizzle(selector, context, results)[0] : selector;
        },
        /**
         * Selects the nearest parent element which matches a given selector.
         * @function
         * @param {String} selector The CSS selector or xpath query.
         * @param {HTMLElement} element The "child" or starting element. This element is not tested.
         * @returns {HTMLElement} The first ancestor which matches the supplied selector, or null if not found.
         */
        ancestor     : function(s, el) {
            return (s && el && el.parentNode) ? (Sizzle.filter(s, [el]).length ? el : Jelo.Dom.ancestor(s, el.parentNode)) : null;
        },
        /** @ignore for now */
        create       : function(o) {
            // NOTE: fromString() can be much faster than create() for many elements
            if (typeof o == 'string') {
                return document.createTextNode(o); // special case shortcut
            }
            if (o.tag) {
                var node = document.createElement(o.tag);
                node.id = o.id || '';
                node.className = o.cls || '';
                node.innerHTML = o.html || '';
                if (Jelo.isEnumerable(o.children)) {
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
        destroy      : function(el) {
            if (Jelo.isEnumerable(el)) {
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
        getAttribute : function(el, attr) {
            if (attr == 'class') {
                attr = 'className';
            }
            if (Jelo.isEnumerable(el)) {
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
         * @param {HTMLElement|Array} el One or more elements to examine.
         * @param {String} selector Any valid CSS selector to match against.
         * @return {Boolean} True if the supplied element matches the supplied selector.
         */
        is           : function(el, s) {
            var arr = Jelo.isEnumerable(el),
                result = Sizzle.filter(s, arr ? el : [el]);
            return arr ? (result.length == el.length) : (result.length > 0);
        }
    };
}());
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
