COMPONENT('console', function(self, config) {

	var cls = 'ui-console';
	var cls2 = '.ui-console';
	var etabs, source ,elogs, current;
	var ready = false;

	self.singleton();
	self.readonly();

	self.make = function() {

		self.aclass(cls + ' hidden');
		self.append('<div class="{0}-body"><div class="{0}-tabs"><span class="{0}-close"><i class="fa fa-times"></i></span><div></div></div><div class="{0}-output"></div></div>'.format(cls));

		etabs = self.find(cls2 + '-tabs > div');
		elogs = self.find(cls2 + '-output');

		self.event('click', cls2 + '-tab', function() {
			var el = $(this);
			var id = el.attrd('id');
			self.show(id);
		});

		self.event('click', cls2 + '-close', function() {
			self.set(false);
		});

		$(W).on('resize', self.resize);
		self.resize();
	};

	self.resize = function() {
		elogs.css('width', WW + 30);
	};

	self.render_tabs = function() {

		var keys = Object.keys(source);
		var builder = [];

		for (var i = 0; i < keys.length; i++) {
			var item = source[keys[i]];

			if (!current)
				current = keys[i];

			builder.push(('<span title="{1}" data-id="{2}" class="' + cls + '-tab{3}"><i class="fa fa-{0}"></i></span>').format(item.icon, item.name, keys[i], current === keys[i] ? (' ' + cls + '-selected') : ''));
		}

		etabs.html(builder.join(''));
		current && self.render_logs(source[current]);
	};

	self.render_logs = function(obj) {

		if (!obj) {
			elogs.empty();
			return;
		}

		var builder = [];
		var arr = obj.items || EMPTYARRAY;

		for (var i = 0; i < arr.length; i++) {
			var item = arr[i];
			var type = item.type || 'info';
			var icon = type === 'error' ? 'bug' : type === 'warning' ? type : type === 'success' ? 'check-circle' : 'info-circle';
			builder.push('<div class="{0}-message {0}-{2}"><i class="fa fa-{3}"></i>{1}</div>'.format(cls, Thelpers.encode(item.body), type, icon));
		}

		elogs.html(builder.join(''));
	};

	self.show = function(id) {

		if (current === id || !ready)
			return;

		etabs.find(cls2 + '-selected').rclass(cls + '-selected');
		etabs.find(cls2 + '-tab[data-id="{0}"]'.format(id)).aclass(cls + '-selected');
		current = id;
		self.render_logs(source[id]);
	};

	self.rebind = function(path, value) {

		if (!ready)
			return;

		source = value;
		if (path === config.datasource)
			self.render_tabs();
		else if (path.substring(config.datasource.length + 1).substring(0, current.length) === current)
			self.render_logs(source[current]);
	};

	self.configure = function(key, value) {
		if (key === 'datasource')
			self.datasource(value, self.rebind);
	};

	self.setter = function(value) {

		if (value && !ready) {
			ready = true;
			self.rebind(config.datasource, GET(config.datasource));
		}

		if (value) {
			self.rclass('hidden');
			self.aclass(cls + '-visible', 100);
		} else {
			self.rclass('hidden', 100);
			self.rclass(cls + '-visible');
		}
	};
});