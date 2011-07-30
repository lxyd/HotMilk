fs           = require 'fs'
path         = require 'path'

option '-o', '--output [DIR]', 'directory for compiled code'

task 'build', 'Rebuilds HoTMiLk', ->
  invoke('build:js')

task 'build:js', 'Builds hotmilk.js into ./build (or --output)', (opts) ->
  CoffeeScript = require 'coffee-script'

  indir = path.join(__dirname, 'src')
  out = opts.output or 'build'
  out = path.join(__dirname, out) unless out[0] = '/'
  out = path.join(out, 'hotmilk.bare.js')

  fs.readFile path.join(indir, 'hot.js'), 'utf8', (err, data_hot) ->
    throw err if err
    fs.readFile path.join(indir, 'milk.coffee'), 'utf8', (err, data_milk) ->
      throw err if err
      fs.writeFile out, data_hot.replace('$milk.js$', CoffeeScript.compile(data_milk, bare:true).replace(/\n/g, '\n    ')), (err) ->
        throw err if err
 
