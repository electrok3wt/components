COMPONENT('viewbox', 'margin:0;scroll:true;delay:100;scrollbar:false', function(self, config) {

	var eld;
	var scrollbar;

	self.readonly();

	self.init = function() {
		$(window).on('resize', function() {
			SETTER('viewbox', 'resize');
		});
	};

	self.configure = function(key, value, init) {
		switch (key) {
			case 'disabled':
				eld.tclass('hidden', !value);
				break;
			case 'minheight':
				!init && self.resize();
				break;
			case 'selector': // backward compatibility
				config.parent = value;
				self.resize();
				break;
		}
	};

	self.make = function() {
		config.scroll && MAIN.version > 17 && self.element.wrapInner('<div class="ui-viewbox-body"></div>');
		self.element.prepend('<div class="ui-viewbox-disabled hidden"></div>');
		eld = self.find('> .ui-viewbox-disabled').eq(0);
		self.aclass('ui-viewbox ui-viewbox-hidden');
		if (config.scroll) {
			if (config.scrollbar) {
				if (MAIN.version > 17) {
					scrollbar = window.SCROLLBAR(self.find('.ui-viewbox-body'), { visibleY: config.visibleY, visibleX: config.visibleX, parent: self.element });
					self.scrollleft = scrollbar.scrollLeft;
					self.scrolltop = scrollbar.scrollTop;
					self.scrollright = scrollbar.scrollRight;
					self.scrollbottom = scrollbar.scrollBottom;
				} else
					self.aclass('ui-viewbox-scroll');
			} else
				self.aclass('ui-viewbox-scroll ui-viewbox-scrollhidden');
		}
		self.resize();
	};

	var css = {};

	self.resize = function() {

		var el = config.parent ? config.parent === 'window' ? $(window) : self.element.closest(config.parent) : self.parent();
		var h = el.height();
		var w = el.width();

		if (h === 0 || w === 0) {
			self.$waiting && clearTimeout(self.$waiting);
			self.$waiting = setTimeout(self.resize, 234);
			return;
		}

		h = ((h / 100) * config.height) - config.margin;

		if (config.minheight && h < config.minheight)
			h = config.minheight;

		css.height = h;
		css.width = self.element.width();

		eld.css(css);

		if (config.scroll && !config.scrollbar)
			css.width = w + 30;
		else
			css.width = null;

		self.css(css);
		self.element.SETTER('*', 'resize');
		var cls = 'ui-viewbox-hidden';
		self.hclass(cls) && self.rclass(cls, 100);

		if (scrollbar)
			scrollbar.resize();
	};

	self.setter = function() {
		setTimeout(self.resize, config.delay);
	};
});