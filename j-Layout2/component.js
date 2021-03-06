COMPONENT('layout2', 'scrollbar:1;parent:window;autoresize:1;margin:0', function(self, config, cls) {

	var top;
	var bottom;
	var left;
	var right;
	var main;
	var cachesize;
	var init = false;

	self.init = function() {
		var obj;
		if (W.OP)
			obj = W.OP;
		else
			obj = $(W);
		obj.on('resize', function() {
			for (var i = 0; i < M.components.length; i++) {
				var com = M.components[i];
				if (com.name === 'layout2' && com.dom.offsetParent && com.$ready && !com.$removed && com.config.autoresize)
					com.resize();
			}
		});
	};

	self.parse_number = function(value, total) {
		var tmp = value.parseInt();
		return value.indexOf('%') === -1 ? tmp : ((total / 100) * tmp);
	};

	self.parse_size = function(el) {
		var size = (el.attrd('size') || '').split(',').trim();
		var obj = { lg: size[0] || '0' };
		obj.md = size[1] == null ? obj.lg : size[1];
		obj.sm = size[2] == null ? obj.md : size[2];
		obj.xs = size[3] == null ? obj.sm : size[3];

		var keys = Object.keys(obj);
		var reg = /px|%/;
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var val = obj[key];
			if (!reg.test(val))
				obj[key] += 'px';
		}

		return obj;
	};

	self.parse_item = function(el) {
		var scrollbar = el.attrd('scrollbar');
		var type = el.attrd('type');
		var item = {};
		item.el = el;
		item.size = type ? self.parse_size(el) : null;
		item.type = type || 'main';
		item.css = {};
		item.scrollbar = scrollbar ? scrollbar.parseConfig() : null;

		if (item.scrollbar) {

			var screl;

			if (item.scrollbar.selector)
				screl = el.find(item.scrollbar.selector);
			else {
				var dom = el[0];
				var div = document.createElement('DIV');
				while (dom.children.length)
					div.appendChild(dom.children[0]);
				dom.appendChild(div);
				$(div).aclass(cls + '-scrollbar');
				screl = $(div);
			}

			var opt = { visibleY: item.scrollbar.visible || item.scrollbar.visibleY, orientation: 'y', parent: el };
			item.scrollbarcontainer = screl;
			item.scrollbar.instance = SCROLLBAR(screl, opt);
			item.scrollbar.resize = function(h) {
				var t = this;
				item.scrollbarcontainer.css('height', h - t.margin);
				item.scrollbar.instance.resize();
			};
		}

		el.aclass(cls + '-section ' + cls + '-' + type.replace('2', ''));
		return item;
	};

	self.parse_cache = function(tmp) {
		return (tmp.left || 0) + 'x' + (tmp.top || 0) + 'x' + (tmp.width || 0) + 'x' + (tmp.height || 0) + 'x';
	};

	self.make = function() {
		self.find('> *').each(function() {
			var el = $(this);
			var type = el.attrd('type');
			switch (type) {
				case 'top':
				case 'top2':
					top = self.parse_item(el);
					break;
				case 'bottom':
				case 'bottom2':
					bottom = self.parse_item(el);
					break;
				case 'right':
					right = self.parse_item(el);
					break;
				case 'left':
					left = self.parse_item(el);
					break;
				default:
					main = self.parse_item(el);
					break;
			}
		});

		self.resize();
	};

	self.resize = function() {
		setTimeout2(self.ID, self.resize2, 200);
	};

	self.show = function(type) {
		if (isMOBILE) {
			switch (type) {
				case 'left':
					left && left.el.css('width', WW).rclass('hidden');
					right && right.el.aclass('hidden');
					break;
				case 'right':
					left && left.el.aclass('hidden');
					right && right.el.css({ left: 0, width: WW }).rclass('hidden');
					break;
				case 'main':
					right && right.el.aclass('hidden');
					left && left.el.aclass('hidden');
					break;
			}
		} else
			self.resize2();
	};

	self.resize2 = function() {

		var parent = self.parent(config.parent);
		var d = WIDTH();
		var w = parent.width();
		var h = parent.height();
		var tmp = d + '_' + w + 'x' + h;

		if (cachesize === tmp)
			return;

		var m = config['margin' + d] || config.margin || 0;

		h -= m;

		cachesize = tmp;
		main.w = w;
		main.h = h;

		var sizetop = top ? self.parse_number(top.size[d], h) : 0;
		var sizebottom = bottom ? self.parse_number(bottom.size[d], h) : 0;
		var sizeleft = left ? self.parse_number(left.size[d], w) : 0;
		var sizeright = right ? self.parse_number(right.size[d], w) : 0;

		if (top) {

			if (top.type === 'top2') {
				top.css.left = sizeleft;
				top.css.width = w - sizeright - sizeleft;
			} else {
				top.css.left = 0;
				top.css.width = w;
			}

			top.css.top = 0;
			top.css.height = sizetop;
			tmp = self.parse_cache(top.css);
			if (tmp !== top.sizecache) {
				top.sizecache = tmp;
				top.el.tclass('hidden', !sizetop);
				if (!sizetop)
					delete top.css.height;
				top.el.css(top.css);
				top.scrollbar && top.scrollbar.resize(sizetop);
			}
		}

		if (bottom) {

			if (bottom.type === 'bottom2') {
				bottom.css.left = sizeleft;
				bottom.css.width = w - sizeright - sizeleft;
			} else {
				bottom.css.left = 0;
				bottom.css.width = w;
			}

			bottom.css.top = h - sizebottom;
			bottom.css.height = sizebottom;
			tmp = self.parse_cache(bottom.css);
			if (tmp !== bottom.sizecache) {
				bottom.el.tclass('hidden', !sizebottom);
				if (!sizebottom)
					delete bottom.css.height;
				bottom.sizecache = tmp;
				bottom.el.css(bottom.css);
				bottom.scrollbar && bottom.scrollbar.resize(sizebottom);
			}
		}

		if (left) {

			if (top && top.type === 'top')
				left.css.top = sizetop;
			else
				left.css.top = 0;

			if (bottom && bottom.type === 'bottom')
				left.css.height = h - sizebottom;
			else
				left.css.height = h;

			if (top && top.type === 'top')
				left.css.height -= sizetop;

			left.css.left = 0;
			left.css.width = sizeleft;
			tmp = self.parse_cache(left.css);
			if (tmp !== left.sizecache) {
				left.el.tclass('hidden', !sizeleft);
				if (!sizeleft)
					delete left.css.width;
				left.sizecache = tmp;
				left.el.css(left.css);
				left.scrollbar && left.scrollbar.resize(sizeleft);
			}
		}

		if (right) {

			if (top && top.type === 'top')
				right.css.top = sizetop;
			else
				right.css.top = 0;

			if (bottom && bottom.type === 'bottom')
				right.css.height = h - sizebottom;
			else
				right.css.height = h;

			if (top && top.type === 'top')
				right.css.height -= sizetop;

			right.css.left = w - sizeright;
			right.css.width = sizeright;
			tmp = self.parse_cache(right.css);
			if (tmp !== right.sizecache) {
				right.el.tclass('hidden', !sizeright);
				if (!sizeright)
					delete right.css.width;
				right.sizecache = tmp;
				right.el.css(right.css);
				right.scrollbar && right.scrollbar.resize(sizeright);
			}
		}

		if (main) {
			main.css.top = sizetop;
			main.css.left = sizeleft;
			main.css.width = w - sizeleft - sizeright;
			main.css.height = h - sizetop - sizebottom;
			tmp = self.parse_cache(main.css);
			if (tmp !== main.sizecache) {
				main.sizecache = tmp;
				main.el.css(main.css);
				main.scrollbar && main.scrollbar.resize(main.css.height);
			}
		}

		if (!init) {
			self.rclass('invisible hidden');
			init = true;
		}
	};

	self.resizescrollbars = function() {
		top && top.scrollbar && top.scrollbar.instance.resize();
		bottom && bottom.scrollbar && bottom.scrollbar.instance.resize();
		left && left.scrollbar && left.scrollbar.instance.resize();
		right && right.scrollbar && right.scrollbar.instance.resize();
		main && main.scrollbar && main.scrollbar.instance.resize();
	};

	self.resizescrollbar = function(type) {
		if (type === 'top')
			top && top.scrollbar && top.scrollbar.instance.resize();
		else if (type === 'bottom')
			bottom && bottom.scrollbar && bottom.scrollbar.instance.resize();
		else if (type === 'left')
			left && left.scrollbar && left.scrollbar.instance.resize();
		else if (type === 'right')
			right && right.scrollbar && right.scrollbar.instance.resize();
		else if (type === 'main')
			main && main.scrollbar && main.scrollbar.instance.resize();
	};

	self.scrolltop = function(type) {
		if (type === 'top')
			top && top.scrollbar && top.scrollbar.instance.scrollTop(0);
		else if (type === 'bottom')
			bottom && bottom.scrollbar && bottom.scrollbar.instance.scrollTop(0);
		else if (type === 'left')
			left && left.scrollbar && left.scrollbar.instance.scrollTop(0);
		else if (type === 'right')
			right && right.scrollbar && right.scrollbar.instance.scrollTop(0);
		else if (type === 'main')
			main && main.scrollbar && main.scrollbar.instance.scrollTop(0);
	};

});