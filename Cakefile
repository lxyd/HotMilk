fs           = require 'fs'
path         = require 'path'

dirSrc   = './src'
dirBuild = './build'

buildBare = (opts, fnBare, callback = null) ->
  CoffeeScript = require 'coffee-script'

  dirIn = path.join(__dirname, dirSrc)
  dirOut = opts.output or dirBuild
  dirOut = path.join(__dirname, dirOut) unless dirOut[0] = '/'

  fs.readFile path.join(dirIn, 'hot.js'), 'utf8', (err, sHot) ->
    throw err if err
    fs.readFile path.join(dirIn, 'milk.coffee'), 'utf8', (err, sMilk) ->
      throw err if err
      sBare = sHot.replace('$milk.js$', CoffeeScript.compile(sMilk, bare:true).replace(/\n/g, '\n    '))
      if fnBare
        fs.writeFile path.join(dirOut, fnBare), sBare, (err) ->
          throw err if err
      if callback
          callback sBare

buildWrapped = (opts, fnWrapper, fnFinal, callback = null) ->
  dirIn = path.join(__dirname, dirSrc)
  dirOut = opts.output or dirBuild
  dirOut = path.join(__dirname, dirOut) unless dirOut[0] = '/'

  buildBare opts, null, (sBare) ->
    fs.readFile path.join(dirIn, fnWrapper), 'utf8', (err, sWrap) ->
      throw err if err
      sFinal = sWrap.replace('$hotmilk.bare.js$', sBare.replace(/\n/g, '\n    '))
      if fnFinal
        fs.writeFile path.join(dirOut, fnFinal), sFinal, (err) ->
          throw err if err
      if callback
        callback sFinal
    

option '-o', '--output [DIR]', 'directory for compiled code'

task 'build', 'Rebuilds HotMilk', ->
  invoke('build:js')
  # TODO: build docs, build tests etc

task 'build:js', "Builds all the hotmilk.js versions into #{dirBuild} (or --output)", (opts) ->
  invoke('build:js/bare')
  invoke('build:js/basic')
  invoke('build:js/b_nofw')

task 'build:js/bare', 'Build only bare version (DO NOT USE IT IN YOUR PROJECTS)', (opts) ->
  buildBare opts, 'hotlink.bare.js'
 
task 'build:js/basic', 'Build only basic functionality: template management', (opts) ->
  buildWrapped opts, 'basic.js', 'hotmilk.basic.js'
 
task 'build:js/b_nofw', 'Build for browser with no-framework (DomReady lib required)', (opts) ->
  buildWrapped opts, 'b.nofw.js', 'hotmilk.browser.nofw.js'

