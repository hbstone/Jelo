/**
 * Creates a new basic Widget. This is typically only used as follows:
<pre>
    Jelo.mold('MyNewWidget', function() {
        this.dom = Jelo.Dom.fromString('&lt;h1&gt;My New Widget&lt;/h1&gt;');
    });
    Jelo.MyNewWidget.prototype = new Jelo.Widget(); // inherit common functionality
</pre>
 * Widgets have a private HTMLElement property, <code>dom</code>, that should be considered a "protected property" - that is, external objects should only be able to manipulate a Widget's dom by using that widget's public methods. Those public methods can then access <code>this.dom</code>. This is not a rule, but it is a strong suggestion.
 * @constructor
 */
Jelo.Widget = function() {};
Jelo.Widget.prototype = {
    /** @private */
    constructor : Jelo.Widget,
    /**
     * @private protected property
     */
    dom         : document.createElement('div'),
    /**
     * Not typically used, but may come in useful if your code needs to make sure it is acting on a Jelo.Widget.
     * @constant
     * @field
     * @type Boolean
     */
    isWidget    : true,
    /**
     * Adds the element to the current page.
     * @param {HTMLElement} [parent=document.body] The node to which this widget will be rendered.
     * @function
     */
    render      : function(parent) {
        if (this && this.dom) {
            if (!parent || !parent.appendChild) {
                parent = document.body;
            }
            parent.appendChild(this.dom);
        }
    },
    /**
     * Enables the widget. By default, it only removes the class "unselectable" so that you can decide what behavior that implies.
     * @function
     */
    enable      : function() {
        if (this.dom) {
            Jelo.CSS.removeClass(this.dom, 'unselectable');
        }
    },
    /**
     * Disables the widget. By default, it only adds the class "unselectable" so that you can decide what behavior that implies.
     * @function
     */
    disable     : function() {
        if (this.dom) {
            Jelo.CSS.addClass(this.dom, 'unselectable');
        }
    },
    /**
     * Attempts to remove this widget from the current page.
     * @function
     * @return {Boolean} True if successful, false if not. This return value can be safely ignored.
     */
    destroy     : function() {
        try {
            this.dom.parentNode.removeChild(this.dom);
            return true;
        } catch(err) {
            return false;
        }
    }
};
