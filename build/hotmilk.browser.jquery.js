(function($) {
    if(!$) {
        throw new Error('HotMilk browser-jquery-version requires jQuery (http://jquery.com/) to run');
    }

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
                    _results.push(d.replace(escape, "\\$milk.js$"));
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
    
    

    // do export like underscore.js do:
    $.fn.HotMilk = HotMilk;

    // grab templates
    $(function() {
        var ss = document.getElementsByTagName('script');
        for(var i = 0; i < ss.length; i++) {
            var s = ss[i], path;
            if(s.type === 'text/x-mustache-template' && (path = s.getAttribute('data-hotmilk-path'))) {
                addTemplate(path, s.text);
            }
        };
    });
})(jQuery);