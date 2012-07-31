(function(Backbone, _, $, undefined) {
	'use strict';
	
	Backbone.Abide = function(options) {
		this.cid = _.uniqueId('view');
		this._configure(options || {});
		this._ensureElement();
		this.initialize.apply(this, arguments);
		this.delegateEvents();
	};
	Backbone.Abide.extend = Backbone.View.extend;
	
	_.extend(Backbone.Abide.prototype, Backbone.Session.prototype, Backbone.View.prototype, Backbone.Events, {
		disableWhileSubmitting: true,
		finishedText: 'Submitting...',
		submitText: 'Submitting...',
		unloadEvents: {
			'keydown input': '_keypress',
			'change input': '_keypress',
			'change select': '_keypress',
			'change textarea': '_keypress'
		},
		
		submit: function(e) {
			var self = this;
			
			self.validateForm();
			
			self.trigger('validating', self);
			if(self.isValid() !== true) {
				//Use a _.deferred() here?
				self.trigger('validationFailed', self);
				
				return false;
			} else {
				var $submits = this.$('[type=submit]').not('.abide-ignore');
				if(self.disableWhileSubmitting) self._freezeButtons($submits);
				self._setButtonText($submits, self.submitText);
				
				$.when.apply(null, self.promises()).done(function(val) {
					if(self.disableWhileSubmitting) self._restoreButtons($submits);
					self._setButtonText($submits, self.finishedText);
					self._dirty = false;
					self.trigger('done', e);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					self.trigger('fail', jqXHR, textStatus, errorThrown);
					if(self.disableWhileSubmitting) self._restoreButtons($submits);
					self._setButtonText($submits);
					return false;
				});
			}
			
			return true;
		},
		
		_freezeButtons: function(buttons) {
			_.each(buttons, function(btn) {
				$(btn).attr('disabled', true);
			});
		},
		
		_restoreButtons: function(buttons) {
			var self = this;
			_.each(buttons, function(btn) {
				$(btn).attr('disabled', null);
			});
		},
		
		_setButtonText: function(buttons, text) {
			_.each(buttons, function(btn) {
				var $btn = $(btn);
				if(!$btn.data('original-text')) {
					$btn.data('original-text', $btn.text());
				}

				$btn.text(text || $btn.data('original-text'));
			});
		},
		
		_dirty: false,
		_keypress: function(e) {
			this._dirty = true;
		},
		
		showError: function() {},
		isValid: function() { return true; },
		validateForm: function(){}
	});
})(Backbone, _, $);