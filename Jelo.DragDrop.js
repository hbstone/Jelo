/**
 * @namespace Provides element drag and drop detection.
 * @name Jelo.DragDrop
 */
Jelo.mold('DragDrop', function() {
    
    /** @private */
    var doc = window.document,
        threshold = 1, // pixels
        maxZ = function() {
            var z = 1000000;
            return function() {
                return ++z;
            };
        }(),
        origin = [], // mouse coords, not element coords
        dragTarget = null,
        dragPastThreshold = false,
        dragFirstTime,
        enabled = true,
        defaults = {
            before: function(e) {
                var width = dragTarget.offsetWidth,
                    left = parseInt(Jelo.css(dragTarget, 'border-left-width'), 10),
                    right = parseInt(Jelo.css(dragTarget, 'border-right-width'), 10);
                Jelo.css(this, {
                    width: (width - left - right) + 'px',
                    zIndex: maxZ(),
                    margin: '0px',
                    position: 'absolute'
                });
                this._dragOriginalParent = this.parentNode;
                document.body.appendChild(this);
            },
            drag : function(e) {
                var x = parseInt(e.clientX, 10) + 4,
                    y = parseInt(e.clientY, 10) + 8;
                Jelo.css(this, {
                    top: y + 'px',
                    left: x + 'px'
                });
            },
            drop: function(e) {
                setTimeout(function(self) {
                    var target = e.dragTarget;
                    self.appendChild(target);
                    if ((/absolute/).test(Jelo.css(target, 'position'))) {
                        Jelo.css(target, {
                            position: 'relative',
                            top: '0px',
                            left: '0px'
                        });
                    }
                }, 10, this);
            }
        };
    
    /** @private */
    function down(e) {
        if (enabled) {
            e.preventDefault();
            e.stopPropagation(); // may have draggable parents
            dragTarget = this._dragTarget;
            Jelo.on(doc, 'mousemove', move);
            Jelo.on(doc, 'mouseup', up);
            origin = [e.clientX, e.clientY];
            dragPastThreshold = false;
            dragFirstTime = true;
        }
    }
    
    /** @private */
    function move(e) {
        if (!dragTarget) { // TODO: !dragTarget || no mouse button is pressed (possible to determine during mousemove using w3c methods?)
            up.call(doc, e);
            return;
        }
        
        e.preventDefault();
        if (dragPastThreshold) {
            if (dragFirstTime) {
                dragFirstTime = false;
                dragTarget._dragMouseDown.call(dragTarget, e);
            }
            dragTarget._dragMouseMove.call(dragTarget, e);
        } else {
            var hypotenuse = Math.sqrt(Math.pow(e.clientX - origin[0], 2) + Math.pow(e.clientY - origin[1], 2)).toFixed(0);
            if (hypotenuse >= threshold) {
                dragPastThreshold = true;
            }
        }
    }
    
    /** @private */
    function up(e) {
        Jelo.un(doc, 'mousemove', move);
        Jelo.un(doc, 'mouseup', up);
        
        if (dragTarget && dragPastThreshold) {
            dragTarget._dragMouseUp.call(dragTarget, e);
        }
        
        origin = [];
        dragTarget = null;
    }
    
    /** @scope Jelo.DragDrop */
    return {
        /**
         * NOTE: Inside <code>fn.before</code>, <code>fn.drag</code>, and <code>fn.after</code>,
         * you can access the drag target using "<code>this</code>":
<pre>
    Jelo.DragDrop.setDraggable(element, {
        before: function(event) {
            // the element currently being dragged
            var target = this;
            
            // all normal event properties and methods are available
            var x = event.clientX;
            var y = event.clientY;
            
            // this will avoid executing mousedown events on this element or its ancestors
            event.preventDefault();
            event.stopPropagation();
        }
    });
</pre>
         * You can use default drag behaviors while overriding them:
<pre>
    Jelo.DragDrop.setDraggable(element, {
        before: function(event) {
            // default setup behavior
            Jelo.DragDrop.getBehavior('before').call(this, e);
            
            // any additional initialization you require
            $(this).addClass('dragging');
        },
        after: function(event) {
            Jelo.DragDrop.getBehavior('after').call(this, e);
            $(this).removeClass('dragging');
        }
    });
</pre>
         * @param {HTMLElement|Array} element One or more elements.
         * @param {Function|Object} [fn] If this argument is a function, it will be used as
         *        <code>fn.drag</code> (see below). If it is literally <code>false</code>, it will turn
         *        off all drag behavior for <code>element</code>.
         * @param {Function} [fn.before] Code to execute immediately before a drag operation takes place. Note that this
         *        is not called until the drag meets or exceeds the threshold.
         * @param {Function} [fn.drag] Code to execute while an element is being dragged. By default, it positions the
         *        element at the mouse cursor.
         * @param {Function} [fn.after] Code to execute when an element is dropped. This function runs before the drop
         *        target's <code>drop</code> handler.
         * @param {HTMLElement} [handle=element] The "drag handle", meaning the element you actually use to drag 
         *        <code>element</code> By default, the handle is the entire target element, but you may wish to
         *        specify a different element (for example, a panel might be dragged by only its title bar).
         * @function
         */
        setDraggable: function(el, fn, handle) {
            if (Jelo.isIterable(el)) {
                Jelo.each(el, function(item) {
                    Jelo.DragDrop.setDraggable(item, fn, handle);
                });
            } else {
                el._dragHandle = handle || el;
                el._dragHandle._dragTarget = el;
                switch(typeof fn) {
                    case 'function':
                        el._dragMouseMove = fn;
                        break;
                    case 'undefined': // fall through
                    case 'object':
                        fn = fn || {}; // avoid null
                        el._dragMouseDown = fn.before || this.getBehavior('before');
                        el._dragMouseMove = fn.drag || this.getBehavior('drag');
                        el._dragMouseUp = fn.after || this.getBehavior('after');
                        Jelo.on(el._dragHandle, 'mousedown', down);
                        break;
                    default:
                        el._dragMouseDown = null;
                        el._dragMouseMove = null;
                        el._dragMouseUp = null;
                        el._dragHandle = null;
                }
            }
        },
        /**
         * NOTE: Inside <code>fn.enter</code>, <code>fn.over</code>, <code>fn.leave</code>, and <code>fn.drop</code>,
         * you can access the drag target using the supplied event object:
<pre>
    Jelo.DragDrop.setDroppable(element, {
        enter: function(event) {
            // the element currently being dragged
            var target = event.dragTarget;
            
            // all normal event properties and methods are available
            var x = event.clientX;
            var y = event.clientY;
            event.stopPropagation();
        }
    });
</pre>
         * You can use default drop behaviors while overriding them:
<pre>
    Jelo.DragDrop.setDroppable(element, {
        drop: function(event) {
            if ($(event.dragTarget).hasClass('my-element')) {
                
                // only apply default behavior to elements that pass the above check
                Jelo.DragDrop.getBehavior('drop').call(this, e);
                
            }
        }
    });
</pre>
         * @param {HTMLElement|Array} element One or more elements.
         * @param {Function|Object} [fn] If this argument is a function, it will be used as
         *        <code>fn.drop</code> (see below). If it is literally <code>false</code>, it will turn
         *        off all drop behavior for <code>element</code>.
         * @param {Function} [fn.enter] Code to execute once a draggable element begins to hover over <code>element</code>.
         *        Typically used to change <code>element</code>'s styles to indicate valid or invalid drops.
         * @param {Function} [fn.over] Code to execute constantly while an element is dragged over <code>element</code>. 
         * @param {Function} [fn.leave] Code to execute once a draggable element stops hovering over <code>element</code>.
         * @param {Function} [fn.drop] Code to execute after a draggable element is dropped on <code>element</code>.
         *        By default, the drag target becomes a child of <code>element</code>.
         * @param {HTMLElement} [handle=element] The "drop handle", meaning the element you actually want to listen
         *        to drop events. By default, the handle is the entire target element, but you may wish to
         *        specify a different element depending on your intended behavior.
         * @function
         */
        setDroppable: function(el, fn, handle) {
            if (Jelo.isIterable(el)) {
                Jelo.each(el, function(item) {
                    Jelo.DragDrop.setDroppable(item, fn, handle);
                });
            } else {
                el._dropHandle = handle || el;
                switch(typeof fn) {
                    case 'function':
                        el._dropMouseUp = fn;
                        break;
                    case 'undefined': // fall through
                    case 'object':
                        fn = fn || {}; // avoid null
                        el._dropMouseEnter = fn.enter || this.getBehavior('enter');
                        el._dropMouseLeave = fn.leave || this.getBehavior('leave');
                        el._dropMouseMove = fn.over || this.getBehavior('over');
                        el._dropMouseUp = fn.drop || this.getBehavior('drop');
                        Jelo.on(el._dropHandle, 'mouseenter', function(e) {
                            if (dragTarget) {
                                e.dragTarget = dragTarget;
                                el._dropMouseEnter.call(el, e);
                            }
                        });
                        Jelo.on(el._dropHandle, 'mousemove', function(e) {
                            if (dragTarget) {
                                e.dragTarget = dragTarget;
                                el._dropMouseMove.call(el, e);
                            }
                        });
                        Jelo.on(el._dropHandle, 'mouseleave', function(e) {
                            if (dragTarget) {
                                e.dragTarget = dragTarget;
                                el._dropMouseLeave.call(el, e);
                            }
                        });
                        Jelo.on(el._dropHandle, 'mouseup', function(e) {
                            if (dragTarget) {
                                e.dragTarget = dragTarget;
                                el._dropMouseLeave.call(el, e);
                                el._dropMouseUp.call(el, e);
                            }
                        });
                        break;
                    default:
                        el._dropMouseEnter = null;
                        el._dropMouseMove = null;
                        el._dropMouseLeave = null;
                        el._dropMouseUp = null;
                        el._dropHandle = null;
                }
            }
        },
        /**
         * @return {Number} How many pixels an element must be dragged before its drag behavior actually "kicks in".
         * @function
         */
        getThreshold: function() {
            return threshold;
        },
        /**
         * @param {Number} n How many pixels an element must be dragged before its drag behavior actually "kicks in".
         * @function
         */
        setThreshold: function(num) {
            if (typeof num == 'number') {
                threshold = num;
            }
        },
        getBehavior: function(key) {
            return defaults[key] || Jelo.emptyFn;
        },
        /**
         * Start listening for drag and drop events.
         * 
         * @function
         */
        enable: function() {
            enabled = true;
        },
        /**
         * Stop listening for drag and drop events.
         * 
         * @function
         */
        disable: function() {
            enabled = false;
        },
        isEnabled: function() {
            return !!enabled;
        },
        /**
         * @return {HTMLElement} The element currently being dragged, or null if unavailable.
         * @function
         */
        getTarget: function() {
            return dragTarget;
        },
        /**
         * Determines whether a drag event is occurring. If an element is passed as the <code>compare</code> argument,
         * this function determines whether the dragged element is identical to the supplied element.
         * 
         * @param {HTMLElement} [compare] An element to examine.
         * @returns {Boolean} If <code>compare</code> is null, this function returns true if any element is currently
         *          being dragged. If <code>compare</code> is supplied, this function returns true if the supplied
         *          element is currently being dragged.
         * @function
         */
        isDragging: function(compare) {
            return (compare ? dragTarget === compare : !!dragTarget);
        },
        maxZ: maxZ
    };
}());
