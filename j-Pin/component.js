COMPONENT('pin', 'blank:●;count:6;hide:false;mask:true', function(self, config, cls) {

	var reg_validation = /[0-9]/;
	var inputs = null;
	var skip = false;
	var count = 0;

	self.nocompile && self.nocompile();

	self.validate = function(value, init) {
		return init ? true : config.required || config.disabled ? !!(value && value.indexOf(' ') === -1) : true;
	};

	self.configure = function(key, value, init) {
		switch (key) {
			case 'count':
				!init && self.redraw();
				break;
			case 'disabled':
				self.find('input').prop('disabled', value);
				self.tclass('ui-disabled', value);
				!init && !value && self.state(1, 1);
				break;
		}
	};

	self.redraw = function() {
		var builder = [];
		count = config.count;
		for (var i = 0; i < count; i++)
			builder.push('<div data-index="{0}" class="ui-pin-input"><input type="{1}" maxlength="1" autocomplete="pin{2}" name="pin{2}" pattern="[0-9]" /></div>'.format(i, isMOBILE ? 'tel' : 'text', Date.now() + i));
		self.html(builder.join(''));
	};

	self.make = function() {

		self.aclass(cls);
		self.redraw();

		self.event('keypress', 'input', function(e) {
			var c = e.which;
			var t = this;
			if (c >= 48 && c <= 57) {
				var c = String.fromCharCode(e.charCode);
				if (t.value !== c)
					t.value = c;

				if (config.mask) {
					if (config.hide) {
						self.maskforce(t);
					} else
						self.mask();
				}
				else {
					t.setAttribute('data-value', t.value);
					self.getter();
				}

				setTimeout(function(el) {
					var next = el.parent().next().find('input');
					next.length && next.focus();
				}, 50, $(t));
			} else if (c > 30)
				e.preventDefault();
		});

		self.event('keydown', 'input', function(e) {
			if (e.which === 8) {

				var el = $(this);
				if (!el.val()) {
					var prev = el.parent().prev().find('input');
					prev.val('').focus();
					prev.attrd('value', '');
					config.mask && self.mask();
				}

				el.attrd('value', '');
				self.getter();
			}
		});

		inputs = self.find('input');
	};

	self.maskforce2 = function() {
		self.maskforce(this);
	};

	self.maskforce = function(input) {
		if (input.value && reg_validation.test(input.value)) {
			input.setAttribute('data-value', input.value);
			input.value = config.blank;
			self.getter();
		}
	};

	self.mask = function() {
		setTimeout2(self.id + '.mask', function() {
			inputs.each(self.maskforce2);
		}, 300);
	};

	self.focus = function() {
		var el = self.find('input').eq(0);
		if (el.length)
			el.focus();
		else
			setTimeout(self.focus, 500);
	};

	self.getter = function() {
		setTimeout2(self.id + '.getter', function() {
			var value = '';

			inputs.each(function() {
				value += this.getAttribute('data-value') || ' ';
			});

			if (self.get() !== value) {
				self.change(true);
				skip = true;
				self.set(value.trim());
			}

		}, 100);
	};

	self.setter = function(value) {

		if (skip) {
			skip = false;
			return;
		}

		if (value == null)
			value = '';

		inputs.each(function(index) {
			var number = value.substring(index, index + 1);
			this.setAttribute('data-value', number);
			this.value = value ? config.mask ? config.blank  : number : '';
		});
	};

	self.state = function(type) {
		if (!type)
			return;
		var invalid = config.required ? self.isInvalid() : false;
		if (invalid === self.$oldstate)
			return;
		self.$oldstate = invalid;
		self.tclass(cls + '-invalid', invalid);
	};
});