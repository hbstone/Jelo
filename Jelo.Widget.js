/** @class Widget */
Jelo.mold('Widget', function(opt) {
	var self = this,
		id = 'jelo-widget-' + Jelo.uID(),
		append = function(where, what) {
			if (where && what) {
				if (typeof what == 'string') {
					where.innerHTML = what;
				} else {
					Jelo.each(what, function(item) {
						if (item.render) {
							item.render(where); // widget may have special actions to do on render
						} else {
							where.appendChild(item);
						}
					});
				}
			}
		},
		config = opt || {};
	
	self.config = config; // so user functions can inspect creation object
	self.dom = Jelo.Dom.fromString('<div class="-module"><div class="-inner"><div class="-hd"></div><div class="-bd"></div><div class="-ft"></div></div></div>').firstChild;
	self.dom.Widget = self; // so user functions can elevate from the DOM node
	self.dom.id = id; // unique id for this widget
	
	// convenience references
	self.dom.head = $('.-inner .-hd', self.dom);
	self.dom.body = $('.-inner .-bd', self.dom);
	self.dom.foot = $('.-inner .-ft', self.dom);
	
	// handle user-supplied elements
	append(self.dom.head, config.head);
	append(self.dom.body, config.body);
	append(self.dom.foot, config.foot);
});
Jelo.Widget.prototype = {
	destroy: function(completely) {
		if (this.dom && this.dom.parentNode && this.dom.parentNode.removeChild) {
			this.dom.parentNode.removeChild(this);
			if (completely) {
				this.dom = null;
			}
		}
	},
	render: function(target, clone) {
		if (this.dom) {
			if (!target || !target.appendChild) {
				target = document.body;
			}
			target.appendChild(clone ? this.dom.cloneNode(true) : this.dom);
		}
	}
};
Jelo.Widget.extend = function(name, fn, proto) {
	if (typeof name == 'string' && fn && name && name.length) {
		Jelo.mold('Widget.' + name, function() {
			Jelo.Widget.apply(this, arguments); // generic init
			fn.apply(this, arguments);          // custom init
		});
		Jelo.Widget[name].prototype = new Jelo.Widget();
		Jelo.Widget[name].prototype.constructor = Jelo.Widget[name]; // instanceof works for both Widget and Widget[name]
		if (proto) {
			for (var i in proto) {
				if (proto.hasOwnProperty(i)) {
					Jelo.Widget[name].prototype[i] = proto[i];
				}
			}
		}
	}
}
