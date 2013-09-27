
- Add sanity checking, for developers using this library: warn if
  - 2 variables have the same key (or label)
  - 2 groupings have the same label
  - enum choices have duplicates
  - any label is empty
  - any :params are unused
  - you try to use groupings/variables with reserved names (branch, and, or, not)

- In Safari, it focuses popups, but not buttons.  Is that normal?  Can I make it consistent?

- If you have no criteria in a grouping, also add a button (in 'emptymessage') to just remove the grouping?

- "Undo"?  It's easy to muck up something quickly (e.g., make a big "AND" expression, and then delete it).  Or should it be the library-user's responsibility to save it / keep a history?

- Let user customize "Find all items where:" text?  Or the entire div.header?

- Drag-n-drop to re-order, or move in/out of a boolean op.  What does HTML5 provide?  Does jquery-ui's "sortable" help?

- Add an "Other..." (Finder does this) that lets me select from dozens/hundreds of obscure things?  Would need another field to the spec: "common things you want all the time" vs "rare junk you'll never actually use".

- Validation?  Is it even possible to create an invalid search?  Should it be?  I kind of do this for integers: the border turns red (done by browser, automatically).

- Mobile support: how bad does it look/work on mobile Safari?

- Localization.

- Better keyboard support: fix the focus order (should be left-to-right).

- Figure out what browsers it supports, and put it in the docs.

- Write some real documentation.  Fix the spec, options, and output format, so they can be relied on.

- Autocomplete, both from a fixed list, and from an AJAX call.
  - jquery-ui has one: <http://api.jqueryui.com/autocomplete/>
  - Ideally, I could provide a hook for users to run anything they want (like $(field).autocomplete(...)) on a text field.

- More types/operations:
  - number operator: in range (inclusive/exclusive?)
  - number with units (popup after text field)
  - floating-point
  - number in range (slider?)
  - date/time
  - multi-enum: pick several (fixed list, or string with autocomplete)
  - completely custom -- make it extensible

- If you change variable to something else with the same type, it should keep the editor (and your value).

- Better HTML/CSS/JS: make sure it all validates?

- Hidden/grouped criteria?

- Can I make the font for <label> the same as for the controls?

- A way for the server to give feedback about your query
  - e.g., if a criterion (on its own) matches nothing, or everything -- or even what percentage it matches?
  - I feel like there's a clever visualization to be found here

- A way for users to selectively disable just part of the query
  - like a checkbox next to each row, for "disable" (and then dim or cross out that row), but something nicer
  - should be passed with the result still, but marked as disabled (rather than ignored completely)

- A way to create a searchbuilder with an initial query, like for loading a saved query

- Should searchbuilder_tree() be in searchbuilder(), when called with no args?  That seems almost like a jquery convention.

- In createIntegerEditor, use type="number" on platforms that natively support it?
  - Firefox (as of 23) doesn't support type="number" (or step="1") (bug#344616)

- A way to search for null/not-null, in addition to strings/numbers?
  - Maybe just an "is blank" operator, for strings/integers

- Awkward: {key:"and"} isn't exactly a key, is it?

- Let me use different keys/labels for enums.
