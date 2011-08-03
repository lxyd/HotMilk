
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

var PartialsCollection,
    GroupNode,
    TemplateNode,
    PartialTemplate;

// use javascript inheritance mechanism to build a hierarchy of partial templates collections:
//  var a = new PartialsCollection();  // a: {};
//  a.t1 = "template 1"                // a.t1 === 'template 1'; a.hasOwnProperty('t1') === true;
//  var b = new PartialsCollection(a); // b.t1 === 'template 1'; b.hasOwnProperty('t1') === false;
PartialsCollection = function(parentPartialsCollection) {
    // create object which is instanceof PartialsCollection in kinda indirect way
    var ctor = function() {};
    ctor.prototype = parentPartialsCollection || PartialsCollection.prototype;
    return new ctor();
};

// GroupNode may not be called like a template, it may have children groups, templates and partials
GroupNode = function(partials) {
    this.$ = partials || new PartialsCollection();
};

// creates new templating function for given template and partialsCollection
var createTemplatingFunction = function(template, partialsCollection) {
    return function(data) {
        return Milk.render(template, data, function(partialName) {
            if(partialsCollection[partialName] && partialsCollection[partialName] instanceof PartialTemplate) {
                return partialsCollection[partialName].$value;
            } else {
                throw new Error("Unknown partial: " + partialName);
            }
        });
    };
};

// TemplateNode: is invokeable may have partials but may not have children
TemplateNode = function(template, partialsCollection) {
    partialsCollection = partialsCollection || new PartialsCollection();
    // create function which is instanceof TemplateNode in kinda indirect way
    var templatingFunction = createTemplatingFunction(template, partialsCollection);
    templatingFunction.$ = partialsCollection;
    return templatingFunction;
};
TemplateNode.prototype = Function.prototype;

// Partial template is also invokeable
PartialTemplate = function(template, partialsCollection) {
    partialsCollection = partialsCollection || new PartialsCollection();
    // create function which is instanceof PartialTemplate in kinda indirect way
    var templatingFunction = createTemplatingFunction(template, partialsCollection);
    templatingFunction.$value = template;
    return templatingFunction;
};
PartialTemplate.prototype = Function.prototype;


// for the case user creates template 'hasOwnProperty'
var hasOwnProperty = function(obj, propName) {
    return Object.prototype.hasOwnProperty.call(obj, propName);
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

var partialsCollectionIsEmpty = function(partialsCollection) {
    for(var c in partialsCollection) {
        if(hasOwnProperty(partialsCollection, c) && partialsCollection[c] instanceof PartialTemplate) {
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
            throw new Error("Couldn't build path " + path.join('/') + ": node already exists");
        }
    }
    return node;
};

// recoursively clean path removing leafs of type GroupNode
// which contain no TemplateNodes nor partials 
var nodeCleanPath = function(node, path) {
    if(!path || path.length < 1) {
        throw new Error("Couldn't clean: path is empty");
    }
    if(!node || !hasOwnProperty(node, path[0]) || !(node[path[0]] instanceof GroupNode)) {
        throw new Error("Couldn't clean: node does not esist or is not cleanable");
    }
    if(path.length > 1) {
        nodeCleanPath(node[path[0]], path.slice(1));
    }
    if(nodeIsEmpty(node[path[0]]) && partialsCollectionIsEmpty(node[path[0]].$)) {
        delete node[path[0]];
    }
};

// HotMilk is the root node
var HotMilk = new GroupNode();

var pathRe = /^((?:[a-zA-Z_][a-zA-Z0-9$_]*\/)*[a-zA-Z_][a-zA-Z0-9$_]*)?(?:#([a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
var parsePath = function(pathStr) {
	var res = pathRe.exec(pathStr);
	return res && (res[1] || res[2]) ? {
		path: res[1] ? res[1].split('/') : [],
		partialName: res[2] || null /* '', null, undefined -> null */
	} : null;
};

var addNormalTemplate = function(root, path, template) {
    if(path.length === 0) {
        throw new Error("Couldn't create template: name must not be empty");
    }
    var node = nodeBuildPath(root, path.slice(0,-1)),
        name = path[path.length - 1];
    if(hasOwnProperty(node, name)) {
        // if node already exists but was created only to attach a partial, we can replace it with our template
        // NOTE: partials from existing node are moved to new TemplateNode
        if(node[name] instanceof GroupNode && nodeIsEmpty(node[name])) {
            node[name] = new TemplateNode(template, node[name].$);
        } else {
            throw new Error("Couldn't add template: node " + path.join('/') + " already exists");
        }
    } else {
        // NOTE: new templating node will have partials derived from its parent node's partials
        node[name] = new TemplateNode(template, new PartialsCollection(node.$));
    }
};

var addPartialTemplate = function(root, path, partialName, template) {
    var node = nodeNavigatePath(root, path) || nodeBuildPath(root, path);
    if(hasOwnProperty(node.$, partialName)) {
        throw new Error("Couldn't add partial: node " + path.join('/') + "#" + partialName + " already exists");
    }
    node.$[partialName] = new PartialTemplate(template, node.$);
};

var addTemplate = function(strPath, template){
    var path = parsePath(strPath);
    if(!path) {
        throw new Error("Couldn't add template: path " + strPath + " is invalid");
    }
    if(!path.partialName) {
        addNormalTemplate(this, path.path, template);
    } else {
        addPartialTemplate(this, path.path, path.partialName, template);
    }
};

var removeTemplate = function(strPath) {
    var path = parsePath(strPath);
    if(!path) {
        throw new Error("Couldn't remove template: path " + strPath + " is invalid");
    }
    if(!path.partialName) {
        removeNormalTemplate(this, path.path);
    } else {
        removePartialTemplate(this, path.path, path.partialName);
    }
};

var removeNormalTemplate = function(root, path) {
    var node = nodeNavigatePath(root, path.slice(0,-1)),
        name = path[path.length - 1];
    if(hasOwnProperty(node, name) && node[name] instanceof TemplateNode) {
        // replace TemplateNode with GroupNode saving partials if any
        node[name] = new GroupNode(node[name].$);
        nodeCleanPath(root, path); 
    } else {
        throw new Error("Couldn't remove template: path " + path.join('/') + " does not exist");
    }
};

var removePartialTemplate = function(root, path, partialName) {
    var node = nodeNavigatePath(root, path);
    if(node && hasOwnProperty(node.$, partialName)) {
        delete node.$[partialName];
        nodeCleanPath(root, path);
    } else {
        throw new Error("Couldn't remove template: path " + path.join('/') + "#" + partialName + " does not exist");
    }
};

// expand hotmilk root with some properties
HotMilk.$version = '1.1';
HotMilk.$Milk = Milk;

GroupNode.prototype.$addTemplate = addTemplate;
GroupNode.prototype.$removeTemplate = removeTemplate;
TemplateNode.prototype.$addTemplate = addTemplate;
TemplateNode.prototype.$removeTemplate = removeTemplate;
