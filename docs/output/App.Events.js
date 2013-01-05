Ext.data.JsonP.App_Events({"tagname":"class","name":"App.Events","extends":null,"mixins":[],"alternateClassNames":["Events"],"aliases":{},"singleton":false,"requires":[],"uses":[],"enum":null,"override":null,"inheritable":null,"inheritdoc":null,"meta":{"static":true},"private":null,"id":"static-class-App.Events","members":{"cfg":[],"property":[{"name":"_listeners","tagname":"property","owner":"App.Events","meta":{"private":true},"id":"property-_listeners"}],"method":[],"event":[],"css_var":[],"css_mixin":[]},"linenr":441,"files":[{"filename":"utilities.js","href":"utilities.html#App-Events"}],"html_meta":{"static":null},"statics":{"cfg":[],"property":[{"name":"Behaviors","tagname":"property","owner":"App.Events","meta":{"static":true},"id":"static-property-Behaviors"}],"method":[{"name":"listen","tagname":"method","owner":"App.Events","meta":{"static":true},"id":"static-method-listen"},{"name":"once","tagname":"method","owner":"App.Events","meta":{"static":true},"id":"static-method-once"},{"name":"trigger","tagname":"method","owner":"App.Events","meta":{"static":true},"id":"static-method-trigger"},{"name":"unlisten","tagname":"method","owner":"App.Events","meta":{"static":true},"id":"static-method-unlisten"}],"event":[],"css_var":[],"css_mixin":[]},"component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"parentMixins":[],"html":"<div><pre class=\"hierarchy\"><h4>Alternate names</h4><div class='alternate-class-name'>Events</div><h4>Files</h4><div class='dependency'><a href='source/utilities.html#App-Events' target='_blank'>utilities.js</a></div></pre><div class='doc-contents'><p>An event system for canvas objects.</p>\n\n<p>The browser has no way to distinguish between different objects being\ndisplayed on the canvas; as far as it is concerned, the canvas is just a\nsingle image. <a href=\"#!/api/App.Events\" rel=\"App.Events\" class=\"docClass\">App.Events</a> provides a way to listen for and trigger events on\nnon-DOM objects.</p>\n</div><div class='members'><div class='members-section'><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Instance Properties</h3><div id='property-_listeners' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.Events'>App.Events</span><br/><a href='source/utilities.html#App-Events-property-_listeners' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.Events-property-_listeners' class='name expandable'>_listeners</a><span> : Object</span><strong class='private signature' >private</strong></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>{}</code></p></div></div></div></div><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Static Properties</h3><div id='static-property-Behaviors' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.Events'>App.Events</span><br/><a href='source/utilities.html#App-Events-static-property-Behaviors' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.Events-static-property-Behaviors' class='name expandable'>Behaviors</a><span> : Object</span><strong class='static signature' >static</strong></div><div class='description'><div class='short'>Determine whether an object should be triggered for a specific event. ...</div><div class='long'><p>Determine whether an object should be triggered for a specific event.</p>\n\n<p>The Behaviors object has event names as keys and functions as values. The\nfunctions evaluate whether the relevant event has been triggered on a\ngiven listening object. The listening object is the functions' <code>this</code>\nobject, and the functions receive all the same parameters passed to the\n<a href=\"#!/api/App.Events-static-method-trigger\" rel=\"App.Events-static-method-trigger\" class=\"docClass\">App.Events.trigger</a>() method (usually starting with an Event object). Add\nelements to <a href=\"#!/api/App.Events-static-property-Behaviors\" rel=\"App.Events-static-property-Behaviors\" class=\"docClass\">App.Events.Behaviors</a> if you want to support new event types\nwith conditional filters.</p>\n</div></div></div></div></div><div class='members-section'><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Static Methods</h3><div id='static-method-listen' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.Events'>App.Events</span><br/><a href='source/utilities.html#App-Events-static-method-listen' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.Events-static-method-listen' class='name expandable'>listen</a>( <span class='pre'>obj, eventName, callback, [weight]</span> )<strong class='static signature' >static</strong></div><div class='description'><div class='short'>Listen for a specific event. ...</div><div class='long'><p>Listen for a specific event.</p>\n\n<p><a href=\"#!/api/Box\" rel=\"Box\" class=\"docClass\">Box</a> objects can listen for events by calling <a href=\"#!/api/Box-method-listen\" rel=\"Box-method-listen\" class=\"docClass\">Box.listen</a>() rather\nthan calling this method directly.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>obj</span> : Object<div class='sub-desc'><p>The object which should listen for the event being called on it.</p>\n</div></li><li><span class='pre'>eventName</span> : String<div class='sub-desc'><p>The name of the event for which to listen, e.g. \"click.\" The event can\n  have a namespace using a dot, e.g. \"click.custom\" will bind to the\n  \"click\" event with the \"custom\" namespace. Namespaces are useful for\n  unlisten()ing to specific callbacks assigned to that namespace or for\n  unlisten()ing to callbacks bound to a namespace across multiple events.</p>\n</div></li><li><span class='pre'>callback</span> : Function<div class='sub-desc'><p>A function to execute when the relevant event is triggered on the\n  listening object. The function's <code>this</code> object is the listening object\n  and it receives any other parameters passed by the trigger call. Usually\n  an event object is the first parameter, and propagation can be stopped\n  by calling the event's stopPropagation() method.</p>\n</div></li><li><span class='pre'>weight</span> : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a> (optional)<div class='sub-desc'><p>An integer indicating the order in which callbacks for the relevant\n  event should be triggered. Lower numbers cause the callback to get\n  triggered earlier than higher numbers. This can be useful for getting\n  around the fact that the canvas doesn't track display order so event\n  callbacks can't distinguish which object should be triggered first if\n  multiple listening objects are overlapping.</p>\n<p>Defaults to: <code>0</code></p></div></li></ul></div></div></div><div id='static-method-once' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.Events'>App.Events</span><br/><a href='source/utilities.html#App-Events-static-method-once' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.Events-static-method-once' class='name expandable'>once</a>( <span class='pre'>obj, eventName, callback, [weight]</span> )<strong class='static signature' >static</strong></div><div class='description'><div class='short'>Listen for a specific event and only react the first time it is triggered. ...</div><div class='long'><p>Listen for a specific event and only react the first time it is triggered.</p>\n\n<p><a href=\"#!/api/Box\" rel=\"Box\" class=\"docClass\">Box</a> objects have a corresponding <a href=\"#!/api/Box-method-once\" rel=\"Box-method-once\" class=\"docClass\">Box.once</a>() method.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>obj</span> : Object<div class='sub-desc'><p>The object which should listen for the event being called on it.</p>\n</div></li><li><span class='pre'>eventName</span> : String<div class='sub-desc'><p>The name of the event for which to listen, e.g. \"click.\" The event can\n  have a namespace using a dot, e.g. \"click.custom\" will bind to the\n  \"click\" event with the \"custom\" namespace. Namespaces are useful for\n  unlisten()ing to specific callbacks assigned to that namespace or for\n  unlisten()ing to callbacks bound to a namespace across multiple events.</p>\n</div></li><li><span class='pre'>callback</span> : Function<div class='sub-desc'><p>A function to execute when the relevant event is triggered on the\n  listening object. The function's <code>this</code> object is the listening object\n  and it receives any other parameters passed by the trigger call. Usually\n  an event object is the first parameter, and propagation can be stopped\n  by calling the event's stopPropagation() method.</p>\n</div></li><li><span class='pre'>weight</span> : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a> (optional)<div class='sub-desc'><p>An integer indicating the order in which callbacks for the relevant\n  event should be triggered. Lower numbers cause the callback to get\n  triggered earlier than higher numbers. This can be useful for getting\n  around the fact that the canvas doesn't track display order so event\n  callbacks can't distinguish which object should be triggered first if\n  multiple listening objects are overlapping.</p>\n<p>Defaults to: <code>0</code></p></div></li></ul></div></div></div><div id='static-method-trigger' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.Events'>App.Events</span><br/><a href='source/utilities.html#App-Events-static-method-trigger' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.Events-static-method-trigger' class='name expandable'>trigger</a>( <span class='pre'>eventName, </span> )<strong class='static signature' >static</strong></div><div class='description'><div class='short'>Trigger an event. ...</div><div class='long'><p>Trigger an event.</p>\n\n<p><a href=\"#!/api/Box\" rel=\"Box\" class=\"docClass\">Box</a> objects have a corresponding Box#trigger() method.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>eventName</span> : String<div class='sub-desc'><p>The name of the event to trigger, e.g. \"click.\"</p>\n</div></li><li><span class='pre'></span> : Arguments<div class='sub-desc'><p>...\n  Additional arguments to pass to the relevant callbacks.</p>\n</div></li></ul></div></div></div><div id='static-method-unlisten' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='App.Events'>App.Events</span><br/><a href='source/utilities.html#App-Events-static-method-unlisten' target='_blank' class='view-source'>view source</a></div><a href='#!/api/App.Events-static-method-unlisten' class='name expandable'>unlisten</a>( <span class='pre'>obj, eventName</span> )<strong class='static signature' >static</strong></div><div class='description'><div class='short'>Stop listening for a specific event. ...</div><div class='long'><p>Stop listening for a specific event.</p>\n\n<p><a href=\"#!/api/Box\" rel=\"Box\" class=\"docClass\">Box</a> objects have a corresponding <a href=\"#!/api/Box-method-unlisten\" rel=\"Box-method-unlisten\" class=\"docClass\">Box.unlisten</a>() method.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>obj</span> : Object<div class='sub-desc'><p>The object which should unlisten for the specified event.</p>\n</div></li><li><span class='pre'>eventName</span> : String<div class='sub-desc'><p>The name of the event for which to listen, e.g. \"click.\" The event can\n  have a namespace using a dot, e.g. \"click.custom\" will unbind obj's\n  listeners for the \"click\" that are using the \"custom\" namespace. You can\n  also unlisten to multiple events using the same namespace, e.g.\n  \".custom\" could unlisten to \"mousemove.custom\" and \"touchmove.custom.\"\n  If the event specified does not have a namespace, all callbacks will be\n  unbound regardless of their namespace.</p>\n</div></li></ul></div></div></div></div></div></div></div>"});