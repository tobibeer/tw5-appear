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
(function(){"use strict";var e=require("$:/core/modules/utils/dom/popup.js").Popup,t=require("$:/core/modules/widgets/reveal.js").reveal,p=t.prototype.refresh;e.prototype.show=function(e){var t=e.domNode,p=$tw.utils.hasClass(t,"tc-popup-absolute"),s=this.popupInfo(t),o=function(e){var t=e,p=0,s=0;do{p+=t.offsetLeft||0;s+=t.offsetTop||0;t=t.offsetParent}while(t);return{left:p,top:s}},i={left:t.offsetLeft,top:t.offsetTop};this.cancel(s.popupLevel);this.popups.push({title:e.title,wiki:e.wiki,domNode:t});i=p?o(t):i;e.wiki.setTextReference(e.title,"("+i.left+","+i.top+","+t.offsetWidth+","+t.offsetHeight+")");if(this.popups.length>0){this.rootElement.addEventListener("click",this,true)}};e.prototype.popupInfo=function(e){var t,p=false,s=e;while(s&&t===undefined){if($tw.utils.hasClass(s,"tc-popup-handle")||$tw.utils.hasClass(s,"tc-popup-keep")){p=true}if($tw.utils.hasClass(s,"tc-popup")){t=parseInt(s.style.zIndex)-1e3}s=s.parentNode}var o={popupLevel:t||0,isHandle:p};return o};t.prototype.refresh=function(){var e,t=this.isOpen;p.apply(this,arguments);e=this.domNodes[0];if(this.isOpen&&t!==this.isOpen&&e){e.style.zIndex=1e3+$tw.popup.popups.length}}})();