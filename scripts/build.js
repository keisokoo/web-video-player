const config = require('../webpack.config')
const fs = require('fs-extra')
const webpack = require('webpack')
const compiler = webpack(config)
function copyPublicFolder() {
  fs.copySync('public', 'build', {
    dereference: true,
    filter: (file) => file !== 'public/index.html',
  })
}
function build() {
  console.log('config', config)
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        if (!err.message) {
          return reject(err)
        }
      }

      return resolve()
    })
  })
}
fs.emptyDirSync('build')
copyPublicFolder()
build()
