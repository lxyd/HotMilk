/*
 * HotMilk - simple framework-independent hierarchical template management
 * library based on Milk (the CoffeeScript Mustache implementation,
 * https://github.com/pvande/Milk)
 *
 * Inspired by ICanHaz http://icanhazjs.com/
 *
 * AUTHORS
 *   Alexey Dubinin
 *   Pieter van de Bruggen (original Milk library)
 *
 * LICENSE
 *   milk.coffee is distributed under the GIFT license, v2
 *   Other source files are under the MIT license
 *
 * URL
 *   https://github.com/lxyd/HotMilk
 */
(function($) {
    if(!$) {
        throw new Error('HotMilk browser-jquery-version requires jQuery (http://jquery.com/) to run');
    }

    
    //
    // import Milk
    //
    
    var Milk = {};
    (function(exports) {
        var Expand, Find, Milk, Parse, TemplateCache, key;
        var __slice = Array.prototype.slice;
        TemplateCache = {};
        Find = function(name, stack, value) {
          var ctx, i, part, parts, _i, _len, _ref, _ref2;
          if (value == null) {
            value = null;
          }
          if (name === '.') {
            return stack[stack.length - 1];
          }
          _ref = name.split(/\./), name = _ref[0], parts = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
          for (i = _ref2 = stack.length - 1; _ref2 <= -1 ? i < -1 : i > -1; _ref2 <= -1 ? i++ : i--) {
            if (stack[i] == null) {
              continue;
            }
            if (!(typeof stack[i] === 'object' && name in (ctx = stack[i]))) {
              continue;
            }
            value = ctx[name];
            break;
          }
          for (_i = 0, _len = parts.length; _i < _len; _i++) {
            part = parts[_i];
            value = Find(part, [value]);
          }
          if (value instanceof Function) {
            value = (function(value) {
              return function() {
                var val;
                val = value.apply(ctx, arguments);
                return (val instanceof Function) && val.apply(null, arguments) || val;
              };
            })(value);
          }
          return value;
        };
        Expand = function() {
          var args, f, obj, tmpl;
          obj = arguments[0], tmpl = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
          return ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = tmpl.length; _i < _len; _i++) {
              f = tmpl[_i];
              _results.push(f.call.apply(f, [obj].concat(__slice.call(args))));
            }
            return _results;
          })()).join('');
        };
        Parse = function(template, delimiters, section) {
          var BuildRegex, buffer, buildInterpolationTag, buildInvertedSectionTag, buildPartialTag, buildSectionTag, cache, content, contentEnd, d, error, escape, isStandalone, match, name, parseError, pos, sectionInfo, tag, tagPattern, tmpl, type, whitespace, _name, _ref, _ref2, _ref3;
          if (delimiters == null) {
            delimiters = ['{{', '}}'];
          }
          if (section == null) {
            section = null;
          }
          cache = (TemplateCache[_name = delimiters.join(' ')] || (TemplateCache[_name] = {}));
          if (template in cache) {
            return cache[template];
          }
          buffer = [];
          BuildRegex = function() {
            var tagClose, tagOpen;
            tagOpen = delimiters[0], tagClose = delimiters[1];
            return RegExp("([\\s\\S]*?)([" + ' ' + "\\t]*)(?:" + tagOpen + "\\s*(?:(!)\\s*([\\s\\S]+?)|(=)\\s*([\\s\\S]+?)\\s*=|({)\\s*(\\w[\\S]*?)\\s*}|([^0-9a-zA-Z._!={]?)\\s*([\\w.][\\S]*?))\\s*" + tagClose + ")", "gm");
          };
          tagPattern = BuildRegex();
          tagPattern.lastIndex = pos = (section || {
            start: 0
          }).start;
          parseError = function(pos, msg) {
            var carets, e, endOfLine, error, indent, key, lastLine, lastTag, lineNo, parsedLines, tagStart;
            (endOfLine = /$/gm).lastIndex = pos;
            endOfLine.exec(template);
            parsedLines = template.substr(0, pos).split('\n');
            lineNo = parsedLines.length;
            lastLine = parsedLines[lineNo - 1];
            tagStart = contentEnd + whitespace.length;
            lastTag = template.substr(tagStart + 1, pos - tagStart - 1);
            indent = new Array(lastLine.length - lastTag.length + 1).join(' ');
            carets = new Array(lastTag.length + 1).join('^');
            lastLine = lastLine + template.substr(pos, endOfLine.lastIndex - pos);
            error = new Error();
            for (key in e = {
              "message": "" + msg + "\n\nLine " + lineNo + ":\n" + lastLine + "\n" + indent + carets,
              "error": msg,
              "line": lineNo,
              "char": indent.length,
              "tag": lastTag
            }) {
              error[key] = e[key];
            }
            return error;
          };
          while (match = tagPattern.exec(template)) {
            _ref = match.slice(1, 3), content = _ref[0], whitespace = _ref[1];
            type = match[3] || match[5] || match[7] || match[9];
            tag = match[4] || match[6] || match[8] || match[10];
            contentEnd = (pos + content.length) - 1;
            pos = tagPattern.lastIndex;
            isStandalone = (contentEnd === -1 || template.charAt(contentEnd) === '\n') && ((_ref2 = template.charAt(pos)) === void 0 || _ref2 === '' || _ref2 === '\r' || _ref2 === '\n');
            if (content) {
              buffer.push((function(content) {
                return function() {
                  return content;
                };
              })(content));
            }
            if (isStandalone && (type !== '' && type !== '&' && type !== '{')) {
              if (template.charAt(pos) === '\r') {
                pos += 1;
              }
              if (template.charAt(pos) === '\n') {
                pos += 1;
              }
            } else if (whitespace) {
              buffer.push((function(whitespace) {
                return function() {
                  return whitespace;
                };
              })(whitespace));
              contentEnd += whitespace.length;
              whitespace = '';
            }
            switch (type) {
              case '!':
                break;
              case '':
              case '&':
              case '{':
                buildInterpolationTag = function(name, is_unescaped) {
                  return function(context) {
                    var value, _ref3;
                    if ((value = (_ref3 = Find(name, context)) != null ? _ref3 : '') instanceof Function) {
                      value = Expand.apply(null, [this, Parse("" + (value()))].concat(__slice.call(arguments)));
                    }
                    if (!is_unescaped) {
                      value = this.escape("" + value);
                    }
                    return "" + value;
                  };
                };
                buffer.push(buildInterpolationTag(tag, type));
                break;
              case '>':
                buildPartialTag = function(name, indentation) {
                  return function(context, partials) {
                    var partial;
                    partial = partials(name).toString();
                    if (indentation) {
                      partial = partial.replace(/^(?=.)/gm, indentation);
                    }
                    return Expand.apply(null, [this, Parse(partial)].concat(__slice.call(arguments)));
                  };
                };
                buffer.push(buildPartialTag(tag, whitespace));
                break;
              case '#':
              case '^':
                sectionInfo = {
                  name: tag,
                  start: pos,
                  error: parseError(tagPattern.lastIndex, "Unclosed section '" + tag + "'!")
                };
                _ref3 = Parse(template, delimiters, sectionInfo), tmpl = _ref3[0], pos = _ref3[1];
                sectionInfo['#'] = buildSectionTag = function(name, delims, raw) {
                  return function(context) {
                    var parsed, result, v, value;
                    value = Find(name, context) || [];
                    tmpl = value instanceof Function ? value(raw) : raw;
                    if (!(value instanceof Array)) {
                      value = [value];
                    }
                    parsed = Parse(tmpl || '', delims);
                    context.push(value);
                    result = (function() {
                      var _i, _len, _results;
                      _results = [];
                      for (_i = 0, _len = value.length; _i < _len; _i++) {
                        v = value[_i];
                        context[context.length - 1] = v;
                        _results.push(Expand.apply(null, [this, parsed].concat(__slice.call(arguments))));
                      }
                      return _results;
                    }).apply(this, arguments);
                    context.pop();
                    return result.join('');
                  };
                };
                sectionInfo['^'] = buildInvertedSectionTag = function(name, delims, raw) {
                  return function(context) {
                    var value;
                    value = Find(name, context) || [];
                    if (!(value instanceof Array)) {
                      value = [1];
                    }
                    value = value.length === 0 ? Parse(raw, delims) : [];
                    return Expand.apply(null, [this, value].concat(__slice.call(arguments)));
                  };
                };
                buffer.push(sectionInfo[type](tag, delimiters, tmpl));
                break;
              case '/':
                if (section == null) {
                  error = "End Section tag '" + tag + "' found, but not in section!";
                } else if (tag !== (name = section.name)) {
                  error = "End Section tag closes '" + tag + "'; expected '" + name + "'!";
                }
                if (error) {
                  throw parseError(tagPattern.lastIndex, error);
                }
                template = template.slice(section.start, (contentEnd + 1) || 9e9);
                cache[template] = buffer;
                return [template, pos];
              case '=':
                if ((delimiters = tag.split(/\s+/)).length !== 2) {
                  error = "Set Delimiters tags should have two and only two values!";
                }
                if (error) {
                  throw parseError(tagPattern.lastIndex, error);
                }
                escape = /[-[\]{}()*+?.,\\^$|#]/g;
                delimiters = (function() {
                  var _i, _len, _results;
                  _results = [];
                  for (_i = 0, _len = delimiters.length; _i < _len; _i++) {
                    d = delimiters[_i];
                    _results.push(d.replace(escape, "\\$&"));
                  }
                  return _results;
                })();
                tagPattern = BuildRegex();
                break;
              default:
                throw parseError(tagPattern.lastIndex, "Unknown tag type -- " + type);
            }
            tagPattern.lastIndex = pos != null ? pos : template.length;
          }
          if (section != null) {
            throw section.error;
          }
          if (template.length !== pos) {
            buffer.push(function() {
              return template.slice(pos);
            });
          }
          return cache[template] = buffer;
        };
        Milk = {
          VERSION: '1.2.0',
          helpers: [],
          partials: null,
          escape: function(value) {
            var entities;
            entities = {
              '&': 'amp',
              '"': 'quot',
              '<': 'lt',
              '>': 'gt'
            };
            return value.replace(/[&"<>]/g, function(ch) {
              return "&" + entities[ch] + ";";
            });
          },
          render: function(template, data, partials) {
            var context;
            if (partials == null) {
              partials = null;
            }
            if (!((partials || (partials = this.partials || {})) instanceof Function)) {
              partials = (function(partials) {
                return function(name) {
                  if (!(name in partials)) {
                    throw "Unknown partial '" + name + "'!";
                  }
                  return Find(name, [partials]);
                };
              })(partials);
            }
            context = this.helpers instanceof Array ? this.helpers : [this.helpers];
            return Expand(this, Parse(template), context.concat([data]), partials);
          }
        };
        if (typeof exports !== "undefined" && exports !== null) {
          for (key in Milk) {
            exports[key] = Milk[key];
          }
        } else {
          this.Milk = Milk;
        }
    })(Milk);
    
    
    //
    // Classes
    //
    
    var PartialsCollection,
        GroupNode;
    
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
                if(partialsCollection[partialName] && partialsCollection[partialName].$value != null) {
                    return partialsCollection[partialName].$value;
                } else {
                    throw new Error("Unknown partial: " + partialName);
                }
            });
        };
    };
    
    // TemplateNode: is invokeable may have partials but may not have children
    var createTemplateNode = function(template, partialsCollection) {
        partialsCollection = partialsCollection || new PartialsCollection();
        var templatingFunction = createTemplatingFunction(template, partialsCollection);
        templatingFunction.$ = partialsCollection;
        // to keep Function.prototype clean add properties to the instance
        templatingFunction.$addTemplate = addTemplate;
        templatingFunction.$removeTemplate = removeTemplate;
        return templatingFunction;
    };
    
    // Partial template is also invokeable
    var createPartialTemplate = function(template, partialsCollection) {
        partialsCollection = partialsCollection || new PartialsCollection();
        var templatingFunction = createTemplatingFunction(template, partialsCollection);
        templatingFunction.$value = template;
        return templatingFunction;
    };
    
    
    // for the case user creates template 'hasOwnProperty'
    var hasOwnProperty = function(obj, propName) {
        return Object.prototype.hasOwnProperty.call(obj, propName);
    };
    
    var nodeIsEmpty = function(node) {
        for(var c in node) {
            // if node has ownProperty and this is a template or a TemplateGroup - this node is not empty
            if(c.charAt(0) != '$' && hasOwnProperty(node, c)) {
                return false;
            }
        }
        return true;
    };
    
    var partialsCollectionIsEmpty = function(partialsCollection) {
        for(var c in partialsCollection) {
            if(hasOwnProperty(partialsCollection, c)) {
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
            return;
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
                node[name] = createTemplateNode(template, node[name].$);
            } else {
                throw new Error("Couldn't add template: node " + path.join('/') + " already exists");
            }
        } else {
            // NOTE: new templating node will have partials derived from its parent node's partials
            node[name] = createTemplateNode(template, new PartialsCollection(node.$));
        }
    };
    
    var addPartialTemplate = function(root, path, partialName, template) {
        var node = nodeNavigatePath(root, path) || nodeBuildPath(root, path);
        if(hasOwnProperty(node.$, partialName)) {
            throw new Error("Couldn't add partial: node " + path.join('/') + "#" + partialName + " already exists");
        }
        node.$[partialName] = createPartialTemplate(template, node.$);
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
    

    $.HotMilk = HotMilk;

    // grab templates
    $(function() {
        var ss = document.getElementsByTagName('script');
        for(var i = 0; i < ss.length; i++) {
            var s = ss[i], paths;
            if(s.type === 'text/x-mustache-template' && (paths = s.getAttribute('data-hotmilk-path'))) {
                var pathsArr = paths.split(':');
                for(var j = 0; j < pathsArr.length; j++) {
                    HotMilk.$addTemplate(pathsArr[j], s.text.replace(/^\s*([\S\s]*?)\s*$/, '$1'));
                }
            }
        };
    });
})(jQuery);
