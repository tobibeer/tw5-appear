/*\
title: $:/plugins/tobibeer/appear/widget.js
type: application/javascript
module-type: widget

Use the appear widget for popups, sliders, accordion menus

@preserve
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget,
	Popup =  require("$:/core/modules/utils/dom/popup.js").Popup,
	AppearWidget = function(parseTreeNode,options) {
		this.initialise(parseTreeNode,options);
	};

/*
Inherit from the base widget class
*/
AppearWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
AppearWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	var cls, button,buttonClose,hidden,reveal,shown,
		// Will hold the child widgets
		nodes = [];
	// Handler instance?
	if(this.handle) {
		// Get the handler state
		this.handlerState = this.checkHandler();
		// Loop registered instances
		$tw.utils.each(
			this.handlerState,
			function(reveal) {
				// Push parseTree stored at state
				nodes.push(reveal);
			}
		);
	// Regular instance
	} else {
		// Create button
		button = {type:"button"};
		// Init button attributes
		button.attributes = this.setAttributes(button,"button");
		// Store current classes
		cls = button.attributes["class"].value.trim();
		// Add unselected class
		button.attributes["class"].value = cls + " appear-show" + (this.handler ? " tc-popup-absolute" : "");
		// Parse label and add to children
		button.children = this.wiki.parseText(
			"text/vnd.tiddlywiki",
			this.show,
			{parseAsInline: true}
		).tree;
		// Create reveal
		reveal = {type:"reveal",children:this.parseTreeNode.children};
		// Init reveal attributes
		reveal.attributes = this.setAttributes(reveal,"reveal");
		// Set custom mode, if configured
		reveal.isBlock = !(this.mode && this.mode === "inline");
		// Type popup?
		if(reveal.attributes.type && reveal.attributes.type.value === "popup") {
			// Set button attribute for popup state
			button.attributes.popup = reveal.attributes.state;
			// Add childnodes
			nodes.push(button);
			// Unless we have a deferred handler defined
			if(!this.handler) {
				// Push reveal to node tree
				nodes.push(reveal);
			} else {
				button.attributes.handler = this.handler;
			}
		// Not a popup
		} else {
			// Set reveal attribute for "slider mode"
			reveal.attributes.type = {type: "string", value: "match"};
			// Must match current tiddler title
			reveal.attributes.text = {type: "string", value: this.currentTiddler};
			// Button writes to state tiddler
			button.attributes.set =  reveal.attributes.state;
			// Sets to current tiddler
			button.attributes.setTo =  {type: "string", value: this.currentTiddler};
			// A wrapper reveal that will be hidden once the content is shown containing the button
			hidden = {type:"reveal",isBlock: this.block, children:[button], attributes: {
				type: {type: "string", value: "nomatch"},
				state: reveal.attributes.state,
				text: {type: "string", value: this.currentTiddler}
			}};
			// Endless toggling?
			if(!this.once) {
				// Create hide-button as a copy of the button
				buttonClose = $tw.utils.deepCopy(button);
				// Add selected class
				buttonClose.attributes["class"].value = cls + " appear-hide " +
					(this.attr.button.selectedClass ? this.attr.button.selectedClass : "");
				// However, resetting the state
				buttonClose.attributes.setTo = {type: "string", value: ""};
				// Setting the hide-button label
				buttonClose.children = this.wiki.parseText(
					"text/vnd.tiddlywiki",
					this.hide,
					{parseAsInline: true}
				).tree;
			}
			// Create a copy of the first reveal containing the button
			shown = $tw.utils.deepCopy(hidden);
			// Reset its children
			shown.children = [];
			// Endless toggling?
			if(!this.once) {
				// Add close button
				shown.children.push(buttonClose);
			}
			// No remote handler?
			if(!this.handler) {
				// Add slider contents
				shown.children.push(reveal);
			}
			// Switch reveal type for content reveal wrapper
			shown.attributes.type.value = "match";
			// Add wrapping reveals to output
			nodes.push(hidden,shown);
		}
	}
	// Construct the child widgets
	this.makeChildWidgets(nodes);
	// Render into the dom
	this.renderChildren(this.parentDomNode,nextSibling);
	// Now, do we have a remote handler?
	if(this.handler) {
		// Update its state
		this.checkHandler(reveal);
	}
};

/*
Compute the internal state of the widget
*/
AppearWidget.prototype.execute = function() {
	var self = this;
	// Attribute mapping
	this.attr = {
		// Which attributes map to which element
		map: {
			reveal: {
				"class":1,
				position:1,
				retain:1,
				state:1,
				style:1,
				tag:1,
				type:1
			},
			button: {
				"button-class":1,
				"button-style":1,
				"button-tag":1,
				tooltip:1,
				selectedClass:1
			}
		},
		// Rename duplicate attributes later
		rename: {
			"button-class":"class",
			"button-style":"style",
			"button-tag":"tag"
		},
		// Initialize empty containers
		button: {},
		reveal: {}
	};
	// Loop widget attributes
	$tw.utils.each(this.attributes,function(val,key) {
		var next;
		// Loop mappings
		$tw.utils.each(
			self.attr.map,function(attr,el) {
			// Loop attributes for element
			$tw.utils.each(Object.keys(attr),function(attr) {
				// Attribute for element?
				if(attr == key) {
					// Store attr value
					self.attr[el][key] = val;
					// Next attribute
					next = false;
					return false;
				}
			});
			return next;
		});
	});
	// Handle all other attributes...
	// Store current tiddler
	this.currentTiddler = this.getVariable("currentTiddler");
	// Default button label
	this.show = this.getValue(this.attributes.show,"show");
	// Label for hide-button
	this.hide = this.getValue(this.attributes.hide,"hide");
	// None defined?
	if(!this.hide) {
		// Use default label
		this.hide = this.show;
	}
	// Whether to only reveal the content once
	this.once = this.attributes.once && this.attributes.once !== "false";
	// State shorthand
	this.$state = this.attributes.$state;
	// Reveal mode
	this.mode = this.getValue(this.attributes.mode,"mode");
	// Is this a handler instance?
	this.handle = this.attributes.handle;
	// Remotely handle this instance?
	this.handler = this.attributes.handler;
	// For that case we take these variables along
	this.handlerVariables = (this.attributes.variables || "") + " currentTiddler";
	// No explicit state?
	if(!this.attr.reveal.state) {
		// Calculate fallback state
		this.attr.reveal.state =
				this.getValue(undefined,"default-state") +
				this.currentTiddler +
				this.getStateQualifier() + "/" +
				(this.attr.reveal.type ? this.attr.reveal.type + "/" : "") +
				(this.mode ? this.mode + "/" : "") +
				(this.once ? "once/" : "") +
				// Append state suffix, if given
				(this.$state ? "/" + this.$state : "");
	}
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
AppearWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	// Any changed attributes?
	if(Object.keys(changedAttributes).length) {
		// Refresh
		this.refreshSelf();
		return true;
	// Is this a handler instance?
	} else if(this.handle) {
		// Has the handler-state changed?
		if(this.handlerState != this.checkHandler()) {
			// Refresh
			this.refreshSelf();
			return true;
		}
	}
	// Check if we're refreshing children
	return this.refreshChildren(changedTiddlers);
};

/*
Retrieves a widget parameter as either attribute, config-tiddler default or hard-coded fallback.
*/
AppearWidget.prototype.getValue = function(value,attr){
	var def,undef,
		// Global fallbacks
		fallbacks = {
			show: "»",
			"default-state": "$:/temp/appear/"
		};
	// If there is no value...
	if(value === undefined) {
		// Get default for it
		def = this.wiki.getTiddler("$:/plugins/tobibeer/appear/defaults/" + attr);
		// Got one?
		if(def) {
			// Check if set to undefined
			undef = def.getFieldString("undefined");
			// Not undefined?
			if(!undef || undef === "false") {
				// Read default
				value = def.getFieldString("text");
			}
		}
	}
	// If we still have no value
	if(value === undefined) {
		// Try to read from fallbacks
		value = fallbacks[attr];
	}
	return value;
};

/*
Set child-widget attributes for a given element, depending on the parsed widget attributes
*/
AppearWidget.prototype.setAttributes = function(node,element) {
	var self = this,
		// Initialize attributes object
		result = {};
	// Loop attributes defined for this element
	$tw.utils.each(Object.keys(this.attr.map[element]),function(attr) {
		var val,
			// Check if we needed to rename this attribute
			name = self.attr.rename[attr];
		// Not renamed?
		if(!name) {
			// Take attribute name as is
			name = attr;
		}
		// Read as widget value, default, or fallback
		val = self.getValue(self.attr[element][attr],attr);
		// Class attribute? (always for the button, for the reveal only if undefined)
		if(name === "class") {
			// Construct classes
			val = [
				"appear",
				"appear-" + element,
				(self.mode ? "appear-" + self.mode : ""),
				(self.once ? "appear-once" : ""),
				(val || "")
			].join(" ");
		}
		// Do we have a value?
		if(val !== undefined) {
			// Set an element tag?
			if(name === "tag") {
				// Then set it for the parseTreeNode directly
				node.tag = val;
			// Set an attribute?
			} else {
				// Add to attribute object
				result[name] = {type: "string", value: val};
			}
		}
	});
	// Return all attributes as an object
	return result;
};

/*
Checks and updates the state for a reveal widget handling remote content
*/
AppearWidget.prototype.checkHandler = function(reveal) {
	var vars,
		state = {},
		self = this,
		// Construct default handler state (not persisted)
		handler = "$:/temp/appear-handlers/" + (this.handler || this.handle),
		// Fetch state tiddler
		stateTiddler = this.wiki.getTiddler(handler);
	// Got a state?
	if(stateTiddler) {
		// Parse it as an object
		state = JSON.parse(stateTiddler.getFieldString("text") || "{}");
	}
	// Is this a call for updating the state by a widget defining a handler?
	if(this.handler) {
		// Create vars widget wrapper containing the reveal
		vars = {type:"vars", children:[reveal], attributes:{}};
		// Loop
		$tw.utils.each(
			// Handler variables
			(this.handlerVariables || "").split(" "),
			function(v) {
				// No empty strings
				v = v.trim();
				if(v){
					// store variable as vars widget attribute by...
					vars.attributes[v] = {
						type: "string",
						// Fetching the current variable value
						value: (self.getVariable(v) || "").toString()};
				}
			}
		);
		// If the state for this reveal has changed
		if(state[reveal.attributes.state.value] !== vars) {
			// Write this reveal to the state
			state[reveal.attributes.state.value] = vars;
			// Write the handler state
			self.wiki.setText(handler,"text",undefined,JSON.stringify(state));
		}
	}
	// Return object containing parseTreeNodes indexed by state
	return state;
};

/*
Hijack and overwrite core Popup show() method
	=> required for absolute popup positioning, rather than relative
*/
Popup.prototype.show = function(options) {
	// The button
	var el = options.domNode,
		// Check if button absolutely positioned
		absolute = (el.getAttribute("class") || "").indexOf("tc-popup-absolute") >= 0,
		// Find out what was clicked on
		info = this.popupInfo(el),
		// Helper to calculate the absolte offset
		calcAbsoluteOffset = function(el) {
			var left = 0,top = 0;
			do {
				top += el.offsetTop  || 0;
				left += el.offsetLeft || 0;
				el = el.offsetParent;
			} while(el);
			return {left:left,top:top};
		},
		offset = {
			left: el.offsetLeft,
			top: el.offsetTop
		};
	// Cancel any higher level popups
	this.cancel(info.popupLevel);
	// Store the popup details
	this.popups.push({
		title: options.title,
		wiki: options.wiki,
		domNode: el
	});
	// Calculate absolute offset?
	offset = absolute ? calcAbsoluteOffset(el) : offset;
	// Set the state tiddler
	options.wiki.setTextReference(
		options.title,
		"(" + offset.left +
  		"," + offset.top +
	  	"," + el.offsetWidth +
	  	"," + el.offsetHeight + ")"
	);
	// Add the click handler if we have any popups
	if(this.popups.length > 0) {
		this.rootElement.addEventListener("click",this,true);
	}
};

// Now we got a widget ready for use
exports.appear = AppearWidget;

})();