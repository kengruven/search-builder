DOM structure
----

The DOM structure at the toplevel looks like:

    div.searchbuilder
        div.header
        div.criteria
            div.criterion leaf
                div.row
                    select.variable
                    button.addremove
                    button.addremove
                    span.editor {for this type}
            (...more toplevel div.criterion here...)

Nesting a criterion in a "logic grouping" block looks like this:

    div.criterion branch
        div.row
            select.variable
            button.addremove
            button.addremove
            span.editor branch {for groupings, this is empty}
        div.criterion leaf
            div.row
                ....
        div.criterion leaf
            div.row
                ....
