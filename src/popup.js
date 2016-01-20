/*\
title: $:/plugins/tobibeer/appear/popup.js
type: application/javascript
module-type: utils

An enhanced version of the core Popup to support:
* absolute popups
* preview popups
* popup z-index

@preserve
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Popup =  require("$:/core/modules/utils/dom/popup.js").Popup,
	Reveal = require("$:/core/modules/widgets/reveal.js").reveal,
	refreshCoreReveal = Reveal.prototype.refresh;

/*
Hijack and overwrite core Popup show() method
	=> required for absolute popup positioning, rather than relative
*/
Popup.prototype.show = function(options) {
	// The button
	var el = options.domNode,
		// Check if button absolutely positioned
		absolute = $tw.utils.hasClass(el,"tc-popup-absolute"),
		// Find out what was clicked on
		info = this.popupInfo(el),
		// Helper to calculate the absolte offset
		calcAbsoluteOffset = function(el) {
			var e = el,
				x = 0,
				y = 0;
			/*
			This is really shite!
			There is neither any offsetParent nor any offsetLeft/-Top
			when the element to trigger the popup is in another absolute popup
			if(e.offsetParent === null) {
				// So, we go up the parent nodes
				while (e) {
					// If it is a popup reveal
					if($tw.utils.hasClass(e,"appear-reveal")) {
						// Read the left and top from the style attribute, bah
						x = parseInt(e.style.left.substr(0,e.style.left.length-2)) + 20;
						y = parseInt(e.style.top.substr(0,e.style.top.length-2)) + 30;
						// Done
						e = null;
					// Otherwise
					} else {
						// Next parent
						e = e.parentNode;
					}
				}
			} else {
			*/
			do {
				x += e.offsetLeft || 0;
				y += e.offsetTop  || 0;
				e = e.offsetParent;
			} while(e);
			return {left:x,top:y};
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

// Hijack popupInfo() of core Popup ($tw.popup)
Popup.prototype.popupInfo = function(domNode) {
	var popupCount,
		isHandle = false,
		node = domNode;
	// First check ancestors to see if we're within a popup handle
	while(node && popupCount === undefined) {
		if($tw.utils.hasClass(node,"tc-popup-handle") || $tw.utils.hasClass(node,"tc-popup-keep")) {
			isHandle = true;
		}
		if($tw.utils.hasClass(node,"tc-popup")) {
			popupCount = parseInt(node.style.zIndex)-1000;
		}
		node = node.parentNode;
	}
	var info = {
		popupLevel: popupCount||0,
		isHandle: isHandle
	};
	return info;
};

// Hijack readPopupState of core reveal widget to set zIndex
Reveal.prototype.refresh = function() {
	var domNode,
		wasOpen = this.isOpen;
	// Run core handler
	refreshCoreReveal.apply(this,arguments);
	domNode = this.domNodes[0];
	if(
		this.isOpen &&
	   	wasOpen !== this.isOpen &&
	   	domNode
	) {
		// Dynamically set z-index
		domNode.style.zIndex = 1000 + $tw.popup.popups.length;
	}
};

})();