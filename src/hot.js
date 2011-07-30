/*
 * HotMilk - simple framework independent in-browser templating
 * library based on Milk - the CoffeeScript Mustache implementation
 * (https://github.com/pvande/Milk)
 *
 * Inspired by ICanHaz http://icanhazjs.com/
 *
 * AUTHORS
 *   Alexey <lxyd> Dubinin
 *   Pieter van de Bruggen (original Milk library)
 *
 * LICENSE
 *   milk.coffee is distributed under the GIFT license, v2
 *   Other souce files are under MIT license
 *
 * URL
 *   TODO:
 */

var HotMilk;

//
// import Milk
//

var Milk = {};
(function(exports) {
    $milk.js$
})(Milk);

//
// Classes
//

// Template - is just a wrapper for string
var Template = function(template) {
    this.value = template;
};

// use javascript inheritance mechanism to build a hierarchy of partial templates collections:
//  var a = new PartialsCollection();  // a: {};
//  a.t1 = "template 1"                // a.t1 === 'template 1'; a.hasOwnProperty('t1') === true;
//  var b = new PartialsCollection(a); // b.t1 === 'template 1'; b.hasOwnProperty('t1') === false;
var PartialsCollection = function _(parentPartials) {
    // create object which is instanceof PartialsCollection in kinda indirect way
    var ctor = function() {};
    ctor.prototype = parentPartials || _.prototype;
    return new ctor();
};

// GroupNode may not be called like a template, it may have children groups, templates and partials
var GroupNode = function(partials) {
    this.$ = partials || new PartialsCollection();
};

// Templating function: may have partials but may not have children
var TemplateNode = function TemplateNode(template, partials) {
    template = new Template(template);
    // create function which is instanceof TemplateNode in kinda indirect way
    var templatingFunction = function _(data) {
        return Milk.render(template.value, data, function(partialName) {
            if(_.$[partialName] && _.$[partialName] instanceof Template) {
                return _.$[partialName].value;
            } else {
                throw new Error('Unknown partial template: ' + partialName);
            }
        });
    };
    templatingFunction.$ = partials || new PartialsCollection();
    return templatingFunction;
};
TemplateNode.prototype = Function.prototype;

// for the case user creates template 'hasOwnProperty'
var hasOwnProperty = function(obj, propName) {
    return Object.prototype.hasOwnProperty.apply(obj, [propName]);
};

var nodeIsEmpty = function(node) {
    for(var c in node) {
        // if node has ownProperty of type TemplateNode or GroupNode - this node is not empty
        if(hasOwnProperty(node, c) && (node[c] instanceof TemplateNode || node[c] instanceof GroupNode)) {
            return false;
        }
    }
    return true;
};

var partialsCollectionIsEmpty = function(partials) {
    for(var c in partials) {
        if(hasOwnProperty(partials, c) && partials[c] instanceof Template) {
            return false;
        }
    }
    return true;
};

var nodeNavigatePath = function(node, path) {
    for(var i = 0; node && i < path.length; i++) {
        // we can navigate further only if current node is a GroupNode and next jump is node's own property
        node = (node instanceof GroupNode && hasOwnProperty(node, path[i])) ? node[path[i]] : null;
    }
    return node || null /* null, undefined -> null */;
};

var nodeBuildPath = function(node, path) {
    for(var i = 0; i < path.length; i++) {
        if(!hasOwnProperty(node, path[i])) {
            node = node[path[i]] = new GroupNode(new PartialsCollection(node.$));
        } else if(node[path[i]] instanceof GroupNode) {
            node = node[path[i]];
        } else {
            throw new Error('Cannot build path: node already exists and is not a GroupNode');
        }
    }
    return node;
};

// recoursively clean path removing leafs of type GroupNode
// which contain no TemplateNodes nor partials 
var nodeCleanPath = function _(node, path) {
    if(!path || path.length < 1) {
        throw new Error('Cannot clean empty path');
    }
    if(!node || !node.hasOwnProperty(path[0]) || !(node[path[0]] instanceof GroupNode)) {
        throw new Error('Cannot navigate: node does not esist or is not a GroupNode');
    }
    if(path.length > 1) {
        _(node[path[0]], path.slice(1));
    }
    if(nodeIsEmpty(node[path[0]]) && partialsCollectionIsEmpty(node[path[0]].$)) {
        delete node[path[0]];
    }
};

// HotMilk is the root node
var root = HotMilk = new GroupNode();

var parsePath = (function(){
    var pathRe = /^((?:\w[a-zA-Z0-9$_]*\/)*\w[a-zA-Z0-9$_]*)?(?:#(\w[a-zA-Z0-9$_]*))?$/;
    return function(pathStr) {
        var res = pathRe.exec(pathStr);
        return res && (res[1] || res[2]) ? {
            path: res[1] ? res[1].split('/') : [],
            partialName: res[2] || null /* '', null, undefined -> null */
        } : null;
    };
})();

var addNormalTemplate = function(path, template) {
    if(path.length === 0) {
        throw new Error('Cannot create template: template name must not be empty');
    }
    var node = nodeBuildPath(root, path.slice(0,-1)),
        name = path[path.length - 1];
    if(hasOwnProperty(node, name)) {
        // if node already exists but was created only to attach a partial, we can replace it with our template
        // NOTE: partials from existing node are moved to new TemplateNode
        if(node[name] instanceof GroupNode && nodeIsEmpty(node[name])) {
            node[name] = new TemplateNode(template, node[name].$);
        } else {
            throw new Error('Cannot create template: node already exists');
        }
    } else {
        // NOTE: new templating node will have partials derived from its parent node's partials
        node[name] = new TemplateNode(template, new PartialsCollection(node.$));
    }
};

var addPartialTemplate = function(path, partialName, template) {
    var node = nodeNavigatePath(root, path) || nodeBuildPath(root, path);
    if(hasOwnProperty(node.$, partialName)) {
        throw new Error('Cannot create partial template: already exists');
    }
    node.$[partialName] = new Template(template);
};

var addTemplate = function(strPath, template){
    var path = parsePath(strPath);
    if(!path) {
        throw new Error('Invalid template path: ' + strPath);
    }
    if(!path.partialName) {
        addNormalTemplate(path.path, template);
    } else {
        addPartialTemplate(path.path, path.partialName, template);
    }
};

var removeTemplate = function(strPath) {
    var path = parsePath(strPath);
    if(!path) {
        throw new Error('Invalid template path: ' + strPath);
    }
    if(!path.partialName) {
        removeNormalTemplate(path.path);
    } else {
        removePartialTemplate(path.path, path.partialName);
    }
};

var removeNormalTemplate = function(path) {
    var node = nodeNavigatePath(root, path.slice(0,-1)),
        name = path[path.length - 1];
    if(hasOwnProperty(node, name) && node[name] instanceof TemplateNode) {
        // replace TemplateNode with GroupNode saving partials if any
        node[name] = new GroupNode(node[name].$);
        nodeCleanPath(root, path); 
    } else {
        throw new Error('Template does not exist');
    }
};

var removePartialTemplate = function(path, partialName) {
    var node = nodeNavigatePath(root, path);
    if(node && hasOwnProperty(node.$, partialName)) {
        delete node.$[partialName];
        nodeCleanPath(root, path);
    } else {
        throw new Error('Template does not exist');
    }
};

// expand hotmilk root with some properties
HotMilk.$version = '0.1';
HotMilk.$Milk = Milk;
HotMilk.$addTemplate = addTemplate;
HotMilk.$removeTemplate = removeTemplate;

