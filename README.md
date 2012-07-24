backbone.abide.js
=================

> Manage multiple AJAX submissions and backbone views

The lowdown
-----------

Abide extends Backbone.View so you get everything you'd expect from a standard view with the added ability to control child views and their AJAX saves. It includes hooks to make checking validation of models and data passes before submitting.

Setup
-----

Since Abide is an extension of a view you need to set up your parent views as Abide views.

```javascript
var parentView,
	firstChild,
	secondChild,
	redhadedStepChild;

//Create up your parent view and extend Abide instead of Backbone.View
parentView = Backbone.Abide.extend({
	promises: function() {
		// Gather child view save promises
	}
}
});

//Create child views as well. These can be regular views or more Abide parents.
firstChild = Backbone.View.extend({ /* ... */ });
secondChild = Backbone.View.extend({ /* ... */ });
redhadedStepChild = Backbone.View.extend({ /* ... */ });

//Then instantiate the parent, passing in which views it should parent
new parentView({ views: [firstChild, secondChild, redhadedStepChild] });
```

promises()
----------

The Abide vew needs to know when its children have finished submitting and this is done by providing a function to gather the promises of each child model's promise, supplied by jQuery's $.Deferred() object. Here's a fairly generic and easy implementation:

```javascript
var sweetAbideView = Backbone.Abide.extend({
	promises: function() {
		var promises = [],
			self = this;

		_.each(self.views, function(view) {
			//saveCollection is a custom method implemented on views which deal with collections, as seen below
			if(view.saveCollection) {
				promises.push(view.saveCollection());
			} else {
				promises.push(view.model.save());
			}
		});

		return promises;
	}
});
```

If your view deals with a collection there's a little more work needed as Backbone doesn't provide for a way to save a collection right out of the box. In my experience it's easier to assign a view to each model in the collection and use those as children in an Abide view. As seen in the script above you could create a method that would save each model in the collection and return those promises. Up to you, really.

Events
------

You can subscribed to the following Abide events:

```javascript
this.on('validating', function(view) { /* ... */ });
this.on('validationFailed', function() { /* ... */ });
this.on('done', function(e) { /* ... */ });
this.on('failed', function(jqXHR, textStatus, errorThrown) { /* ... */ });
```

### validating

This is called before validation is run. Useful for cleaning up error messages from previous validation runs or setting up any model pre-parsing that may be necessary.

### validationFailed

Report errors, cancel animations, revert views, etc.

### done

Triggered when all AJAX request for the parent have finished. Show a flash message, trigger a wrap-up function, or simply navigate to the next page.

### failed

If AJAX fails for any reason this provides the XHR object and all other meaningful data from the server.

Options
-------

### disableWhileSubmitting

> Default: true

A boolean flag that determines whether submission buttons are disabled while the AJAX calls are in progress. If set to true the buttons will be enabled on success or failure.

### submitText

> Default: 'Submitting...'

String that is used to replace the text in buttons or inputs while submission is in progress. Only used if disableWhileSubmitting is set to true.

### finishedText

> Default: 'Finishing...'

String that is used after all submissions are complete. Only used if disableWhileSubmitting is set to true.

### isValid()

> Default: true

Method available for override to stop Abide from submitting anything if false is returned.