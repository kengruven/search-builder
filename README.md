search-builder
==============

This is a structured search UI for HTML/JS.  (If you've used the Mac
Finder to Find anything since OS X 10.4/10.5, that's pretty much what
this is.)  It's a library for the front-end which lets users build
queries, using pop-up menus and human-readable attribute names.

To use this library,

 - include jQuery, searchbuilder.js, and searchbuilder.css on your HTML page
 - on the page, put an empty:
        <div class="searchbuilder"/>
 - make a JS call to initialize it:
        $(your_div).searchbuilder(spec, options)
 - to get the user's query, call:
        $(your_div).searchbuilder_tree()
 - to watch for when the user edits the query, watch for 'searchchanged' events on your div

You're responsible for sending the query to the server, validating it,
translating it to your query language or ORM, and so on.  This library
is *only* the front-end.

For more details, see the source, searchbuilder.js, and the examples
in the "demo" folder.  Everything is subject to change at any time.


Browsers
----

It was tested with Firefox 23 and Safari 6.  It should work in other
sufficiently modern browsers, but that hasn't been tested.


Limitations
----

I'm a rookie at JS, and jQuery, and CSS, and pretty much everything
else used here.  The code is bad.  This has not (yet) been used in any
production systems.  Suggestions (and pull requests) are welcome.


License
----

MIT.  See LICENSE.
