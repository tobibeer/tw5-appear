/*\
title: $:/plugins/tobibeer/appear/widget.js
type: application/javascript
module-type: widget

The appear widget for popups, sliders, accordion menus

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var AppearWidget = function(parseTreeNode,options) {
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

	try {
	var appearNodes,button,classes,list={},reveal,
		self = this,
		current = this.getVariable("currentTiddler"),
		def = $tw.wiki.getTiddlerData("$:/plugins/tobibeer/appear/defaults",{}),
		getVal = function(param,fallback){
			var result = param,
			fallbacks = {
				"label": "»",
				"btn-tag": "button",
				"mode": "block",
				"mode-block-element": "div",
				"mode-inline-element": "span"
			};
			if(!result) {
				result = def[fallback];
			}
			if(!result) {
				result = fallbacks[fallback];
			}
			return result;
		},
		init = function(node,element) {
			$tw.utils.each(self.attr[element],function(attr) {
				var val, name = self.attr.rename[attr];
				if(!name) {
					name = attr;
				}
				val = getVal(
					self[element][attr],
					element + "-" + attr
				);
				node[attr] = val;
			});
		},
		mode = self.parseTreeNode.isBlock ? "block" : "inline",
		state = self.attr.button.state,
		children = this.parseTreeNode.children;

	if(!state) {
		state = "$:/temp/appear/" + Math.random().toString(36).substr(2);
	}
	button = {type:"button",set:state,to:current};
	init(button,"button");
	if(self.attr.list.filter) {
		list = {type:"list",children:children};
		init(list, "list");
	}
	reveal = {type:"reveal",mode:mode,state:state,children:list};
	init(reveal,"reveal");

	appearNodes = [button,reveal];

	// Construct the child widgets
	this.makeChildWidgets(appearNodes);

	} catch(e) {
		console.log(e);
	}
};

/*
Compute the internal state of the widget
*/
AppearWidget.prototype.execute = function() {
	var self = this;
	// Attribute mapping
	self.attr = {
		map: {
			reveal: ["state",
					 "animate","class","default","position","retain","style","tag","text","type"],
			button: ["btn-tag","btn-class",
					 "aria-label","class","tooltip","popup","style"],
			list : ["filter","template","editTemplate","variable","emptyMessage"],
			rename : {
				"btn-class":"class",
				"btn-tag":"tag"
			}
		}
	};
	// Loop attributes
	$tw.utils.each(self.attributes,function(val,key) {
		var next=true;
		// Loop mappings
		$tw.utils.each(self.attr.map,function(attr,el) {
			// Loop attributes for element
			$tw.utils.each(attr,function(attr) {
				// Attribute for element?
				if(attr == key) {
					// Initialize attr object for element
					if(!self[el]) {
						self[el] = {};
					}
					// Store attr value
					self[el][key] = val;
					// Next attribute
					next = false;
					return false;
				}
			});
			return next;
		});
	});
};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
AppearWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(Object.keys(changedAttributes).length) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

exports.appear = AppearWidget;

})();
