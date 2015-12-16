/*\
title: $:/plugins/tobibeer/appear/widget.js
type: application/javascript
module-type: widget

Use the appear widget for popups, sliders, accordion menus

@preserve
\*/
(function(){"use strict";var t=require("$:/core/modules/widgets/widget.js").widget,e=function(t,e){this.initialise(t,e)};e.prototype=new t;e.prototype.render=function(t,e){this.parentDomNode=t;this.computeAttributes();this.execute();var i,s,r,a,h,n,u,l,d=[];if(this.handle){this.handlerState=this.checkHandler();$tw.utils.each(this.handlerState,function(t){d.push(t)})}else{i={type:"button"};i.attributes=this.setAttributes(i,"button");i.children=this.wiki.parseText("text/vnd.tiddlywiki",this.show,{parseAsInline:true}).tree;u={type:"reveal",children:this.parseTreeNode.children};u.attributes=this.setAttributes(u,"reveal");u.isBlock=!(this.mode&&this.mode==="inline");if(!u.attributes.state){r=this.getValue(undefined,"default-state")+this.currentTiddler+this.getStateQualifier()+"/"+(u.attributes.type?u.attributes.type.value+"/":"")+(this.mode?this.mode+"/":"")+(this.once?"once/":"")+(this.$state?"/"+this.$state:"");u.attributes.state={type:"string",value:r}}if(u.attributes.type&&u.attributes.type.value==="popup"){i.attributes.popup=u.attributes.state;if(this.once){h={type:"reveal",isBlock:this.block,children:[i],attributes:{type:{type:"string",value:"match"},state:u.attributes.state,text:{type:"string",value:this.currentTiddler}}}}d.push(this.once?h:i);if(!this.handler){d.push(u)}}else{u.attributes.type={type:"string",value:"match"};u.attributes.text={type:"string",value:this.currentTiddler};i.attributes.set=u.attributes.state;i.attributes.setTo={type:"string",value:this.currentTiddler};a={type:"reveal",isBlock:this.block,children:[i],attributes:{type:{type:"string",value:"nomatch"},state:u.attributes.state,text:{type:"string",value:this.currentTiddler}}};if(!this.once){s=$tw.utils.deepCopy(i);s.attributes.setTo={type:"string",value:""};s.children=this.wiki.parseText("text/vnd.tiddlywiki",this.hide,{parseAsInline:true}).tree}l=$tw.utils.deepCopy(a);l.children=[];if(!this.once){l.children.push(s)}if(!this.handler){l.children.push(u)}l.attributes.type.value="match";d.push(a,l)}}this.makeChildWidgets(d);this.renderChildren(this.parentDomNode,e);if(this.handler){this.checkHandler(u);if(i.attributes.popup){n=(this.once?this.children[0][0]:this.children[0]).domNodes[0];n.addEventListener("click",this.triggerAbsolutePopup,false);n.setAttribute("popup",i.attributes.popup.value)}}};e.prototype.execute=function(){var t=this;t.attr={map:{reveal:["class","position","retain","state","style","tag","type"],button:["button-tag","button-class","tooltip","style"],rename:{"button-class":"class","button-tag":"tag"}},button:{},reveal:{}};$tw.utils.each(this.attributes,function(e,i){var s;$tw.utils.each(t.attr.map,function(r,a){$tw.utils.each(r,function(r){if(r==i){t.attr[a][i]=e;s=false;return false}});return s})});this.currentTiddler=this.getVariable("currentTiddler");this.show=this.getValue(this.attributes.show,"show");this.hide=this.getValue(this.attributes.hide,"hide");if(!this.hide){this.hide=this.show}this.once=this.attributes.once&&this.attributes.once!=="false";this.$state=this.attributes.$state;this.mode=this.getValue(this.attributes.mode,"mode");this.handle=this.attributes.handle;this.handler=this.attributes.handler;this.handlerVariables=(this.attributes.variables||"")+" currentTiddler"};e.prototype.refresh=function(t){var e=this.computeAttributes();if(Object.keys(e).length){this.refreshSelf();return true}else if(this.handle){if(this.handlerState!=this.checkHandler()){this.refreshSelf();return true}}if(!this.handle&&this.refreshChildren(t)){this.refreshSelf();return true}else{return true}};e.prototype.getValue=function(t,e){var i,s,r={show:"»","default-state":"$:/temp/appear/"};if(t===undefined){i=this.wiki.getTiddler("$:/plugins/tobibeer/appear/defaults/"+e);if(i){s=i.getFieldString("undefined");if(!s||s==="false"){t=i.getFieldString("text")}}}if(t===undefined){t=r[e]}return t};e.prototype.setAttributes=function(t,e){var i=this,s={};$tw.utils.each(this.attr.map[e],function(r){var a,h=i.attr.map.rename[r];if(!h){h=r}a=i.getValue(i.attr[e][h],r);if(h==="class"&&(e==="button"||a===undefined)){a=(a||"")+" appear"+(i.mode?" appear-"+i.mode:"")+(i.once?" appear-once":"")}if(a!==undefined){if(h==="tag"){t.tag=a}else{s[h]={type:"string",value:a}}}});return s};e.prototype.checkHandler=function(t){var e,i={},s=this,r="$:/temp/appear-handlers/"+(this.handler||this.handle),a=this.wiki.getTiddler(r);if(a){i=JSON.parse(a.getFieldString("text")||"{}")}if(this.handler){e={type:"vars",children:[t],attributes:{}};$tw.utils.each((this.handlerVariables||"").split(" "),function(t){t=t.trim();if(t){e.attributes[t]={type:"string",value:(s.getVariable(t)||"").toString()}}});if(i[t.attributes.state.value]!==e){i[t.attributes.state.value]=e;s.wiki.setText(r,"text",undefined,JSON.stringify(i))}}return i};e.prototype.triggerAbsolutePopup=function(){var t=function(t){var e=0,i=0;do{i+=t.offsetTop||0;e+=t.offsetLeft||0;t=t.offsetParent}while(t);return{left:e,top:i}}(this);$tw.wiki.setTextReference(this.getAttribute("popup"),"("+t.left+","+t.top+","+this.offsetWidth+","+this.offsetHeight+")")};exports.appear=e})();