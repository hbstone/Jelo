/** @ignore under construction */
Jelo.mold('Panel', function(o) {
    var panel = this,
        div = document.createElement('div'),
        dl = document.createElement('dl'),
        dt = document.createElement('dt'),
        dd = document.createElement('dd');
    
    // construct
    this.constructor = Jelo.Panel;
    this.id = o.id || 'jelo-panel-' + Jelo.uID();
    this.moving = false;
    
    // create dom
    dt.innerHTML = o.title || '';
    dd.innerHTML = o.html || '';
    dl.appendChild(dt);
    dl.appendChild(dd);
    div.appendChild(dl);
    div.id = this.id;
    Jelo.CSS.addClass(div, o.cls || 'jelo-panel');
    this.dom = div;
    this.dom.Panel = panel;
    
    // dimensions
    if (typeof o.width == 'number') {
        this.initWidth = o.width;
        Jelo.css(div, 'width', o.width + 'px');
    }
    if (typeof o.height == 'number') {
        this.initHeight = o.height;
        Jelo.css(div, 'height', o.height + 'px');
    }
    
    // behavior: drag
    this.drag = !!o.drag;
    if (this.drag) {
        Jelo.css(dt, 'cursor', 'move');
        Jelo.DragDrop.setDraggable(dt, true, {
            start : Jelo.DragDrop.Behavior.FADE_OUT,
            drag  : [Jelo.DragDrop.Behavior.MOVE, function() {
                panel.moving = true;
            }],
            drop  : Jelo.DragDrop.Behavior.FADE_IN
        }, div);
    }
    
    // behavior: collapse
    this.isCollapsed = false;
    this.collapse = !!o.collapse;
    this.collapseDuration = o.collapseDuration || 0.33;
    this.collapseEasing = o.collapseDuration || 'out';
    if (this.collapse) {
        Jelo.on(dt, 'mouseup', function(e) {
            if (Jelo.DragDrop.getTarget() == Jelo.Dom.ancestor('.jelo-panel', this)) {
                if (panel.moving) {
                    panel.moving = false;
                    return;
                }
            }
            Jelo.css(dd, 'overflow', 'auto');
            var t = parseInt(dt.scrollHeight, 10),
                h = (typeof panel.initHeight == 'number')
                    ? panel.initHeight
                    : parseInt(dd.scrollHeight, 10) + t;
            Jelo.css(dd, 'height', (h - t) + 'px');
            Jelo.Anim.ate({
                me       : div,
                css      : 'height: ' + (panel.isCollapsed
                    ? h
                    : t) + 'px',
                duration : panel.collapseDuration,
                easing   : panel.collapseEasing
            });
            panel.isCollapsed = !panel.isCollapsed;
        });
    }
    
    // behavior: resize
    this.resize = !!o.resize;
    if (this.resize) {
        var sizeHandle = document.createElement('div');
        Jelo.CSS.addClass(sizeHandle, 'jelo-panel-sizeHandle');
        this.dom.appendChild(sizeHandle);
        this.sizeHandle = sizeHandle;
        Jelo.on(sizeHandle, 'mousedown', function() {
            var p = Jelo.CSS.findPosition(dt);
            panel.hasUnselectable = Jelo.CSS.hasClass(panel.dom, 'jelo-unselectable');
            if (!panel.hasUnselectable) {
                Jelo.CSS.addClass(panel.dom, 'jelo-unselectable');
            }
            function move(e) {
                if (panel.isCollapsed) {
                    return;
                }
                var w = parseInt(Jelo.css(dt, 'width'), 10),
                    h = parseInt(dt.scrollHeight, 10),
                    x = e.clientX - p[0],
                    y = e.clientY - p[1];
                if (x > 0) {
                    Jelo.css(panel.dom, 'width', x + 'px');
                }
                if ((y - h) > 0) {
                    Jelo.css(panel.dom, 'height', y + 'px');
                    Jelo.css(dd, 'height', (y - h) + 'px');
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            Jelo.on(document, 'mousemove', move);
            Jelo.on(document, 'mouseup', function() {
                if (!panel.hasUnselectable) {
                    Jelo.CSS.removeClass(panel.dom, 'jelo-unselectable');
                }
                Jelo.un(document, 'mousemove', move);
                Jelo.un(document, 'mouseup', arguments.callee);
            });
        });
    }
});
Jelo.Panel.prototype = new Jelo.Widget();
