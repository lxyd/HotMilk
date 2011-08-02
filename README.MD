HotMilk
=======

About
-----

HotMilk is a template-management library based on the [Milk](https://github.com/pvande/Milk) 
by Pieter van de Bruggen, the [CoffeeScript](https://github.com/jashkenas/coffee-script) 
implementation of the [Mustache](http://mustache.github.com/) templates.

This work was inspired mostly by [ICanHaz](http://icanhazjs.com/) library and, indded, is 
just a generalization of its authors' ideas.


Usage
-----

You can use HotMilk in browser or server environment. Browser versions have additional feature: 
auto-grabbing templates from &lt;script&gt; html-tags.

HotMilk provides handy interface to invoke `Milk.render()` function, for example:
    htmlText = HotMilk.greetings({ ... user ... });
    htmlText = HotMilk.books.list([ ... list of books ... ]);
    htmlText = HotMilk.books.details({ ... book ... });
    htmlText = HotMilk.movies.list([ ... list of movies ... ]);

To add a template, invoke `HotMilk.$addTemplate()` and pass it template path and template text itself:
    HotMilk.$addTemplate('books/list', '... mustache template ...');
    HotMilk.$addTemplate('books/details', '... mustache template ...');
    HotMilk.$addTemplate('greetings', '... mustache template ...');

Partial templates have scopes: you can add partial which will be visible to only one template, or to 
group of templates, or to all templates in your template set:
    HotMilk.$addTemplate('books/list#item', '...'); // for HotMilk.books.list() only
    HotMilk.$addTemplate('books#author', '...');    // for list and details templates
    HotMilk.$addTemplate('#price', '...');          // global partial template
    // partial "overloading"
    HotMilk.$addTemplate('movies#price', '...');    // movies will have their own price format

You can add new template relatevely to the existing group or template:
    HotMilk.movies.$addTemplate('#price', '...');   // same as above

Templates and partials can be added in any order, so you can load templates asynchronously.

Deleting templates is also possible: just call `HotMilk.$removeTemplate('path/to)`. Again, you can remove
templates in any order: the only one a a time will be removed leaving others untouched (even partials 
will survive killing their parent and creating it again if needed).


### Template path restrictions ###

* You cannot create a template under another one:
        HotMilk.$addTemplate('movies', '...');
        HotMilk.$addTemplate('movies/details, '...'); // forbidden

* Each path element (template name, group name, partial name) must be correct javascript identifier: 
  contain upper- and lowercase letters, digits, underscore and dollar and don't start with digit

* Also, names must not start from dollar sign as it is used for HotMilk methods (partials could, actually)


### Template grabbing in browser ###

As ICanHaz do, HotMilk also performs automatic template grabbing after dom is ready.

_Initially this was thought as the main feature. Even the name was choosen because of this: 
it supposed to mean 'HTML-embedded Milk', HoTMiLk. But later things changed and crooked 'HoTMiLk' became
just 'HotMilk'_

You can write templates directly in your HTML-code as &lt;script&gt; tags:
    <script type="text/x-mustache-template" data-hotmilk-path="books/list#item">
        <a href='/books/{{id}})'><b>{{title}}</b> by {{#author}}{{>author}}{{/author}}</a>
    </script>

Just use "text/x-mustache-template" as your script type and provide template path as 
HTML5-data attribute "data-hotmilk-path".


### Using bare Milk ###

You still can access the Milk through `HotMilk.$Milk` if you want. The most obvious use case 
for this is adding a global helper. Please note: there is almost no sense in adding global 
partials to `HotMilk.$Milk.partials` because they will be ignored when using HotMilk.

HotMilk License
---------------

Copyright (c) 2011 Alexey Dubinin, Pieter van de Bruggen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


_NOTE: original Milk library is distributed under the GIFT license, v2 (see [Milk page](https://github.com/pvande/Milk) for details)._
