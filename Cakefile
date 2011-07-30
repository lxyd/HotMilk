fs           = require 'fs'
path         = require 'path'

dirSrc   = 'src'
dirBuild = 'build'
fnBare   = 'hotmilk.bare.js'
fnBasic  = 'hotmilk.basic.js'
fnBNofw  = 'hotmilk.b.nofw.js'


option '-o', '--output [DIR]', 'directory for compiled code'

task 'build', 'Rebuilds HoTMiLk', ->
  invoke('build:js')

task 'build:js', 'Builds all the hotmilk.js versions into #{dirBuild} (or --output)', (opts) ->
  invoke('build:js/basic')
  invoke('build:js/b_nofw')

task 'build:js/bare', 'Build only bare version (DO NOT USER BARE VERSION IN YOUR PROJECTS)', (opts) ->
  CoffeeScript = require 'coffee-script'

  dirIn = path.join(__dirname, dirSrc)
  dirOut = opts.output or dirBuild
  dirOut = path.join(__dirname, dirOut) unless dirOut[0] = '/'

  fs.readFile path.join(dirIn, 'hot.js'), 'utf8', (err, sHot) ->
    throw err if err
    fs.readFile path.join(dirIn, 'milk.coffee'), 'utf8', (err, sMilk) ->
      throw err if err
      fs.writeFile path.join(dirOut, fnBare), sHot.replace('$milk.js$', CoffeeScript.compile(sMilk, bare:true).replace(/\n/g, '\n    ')), (err) ->
        throw err if err
 
task 'build:js/basic', 'Build only basic functionality: template management', (opts) ->
  invoke('build:js/bare')

  dirIn = path.join(__dirname, dirSrc)
  dirOut = opts.output or dirBuild
  dirOut = path.join(__dirname, dirOut) unless dirOut[0] = '/'

  fs.readFile path.join(dirIn, 'basic.js'), 'utf8', (err, sWrap) ->
    throw err if err
    fs.readFile path.join(dirOut, fnBare), 'utf8', (err, sBare) ->
      throw err if err
      fs.writeFile path.join(dirOut, fnBasic), sWrap.replace('$hotmilk.bare.js$', sBare.replace(/\n/g, '\n    ')), (err) ->
        throw err if err
 
task 'build:js/b_nofw', 'Build for browser with no-framework (XMLHttpRequest and DomReady libs required)', (opts) ->
  invoke('build:js/bare')

  dirIn = path.join(__dirname, dirSrc)
  dirOut = opts.output or dirBuild
  dirOut = path.join(__dirname, dirOut) unless dirOut[0] = '/'

  fs.readFile path.join(dirIn, 'b.nofw.js'), 'utf8', (err, sWrap) ->
    throw err if err
    fs.readFile path.join(dirOut, fnBare), 'utf8', (err, sBare) ->
      throw err if err
      fs.writeFile path.join(dirOut, fnBNofw), sWrap.replace('$hotmilk.bare.js$', sBare.replace(/\n/g, '\n    ')), (err) ->
        throw err if err
 
