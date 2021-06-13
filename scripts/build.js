process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

require('./env')

const config = require('../webpack.config')
const fs = require('fs-extra')
const bfj = require('bfj')
const path = require('path')
const webpack = require('webpack')
const formatWebpackMessages = require('./formatMessage')
const chalk = require('react-dev-utils/chalk')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')

const printBuildError = require('react-dev-utils/printBuildError')
const compiler = webpack(config)
const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

function copyPublicFolder() {
  fs.copySync('public', 'build', {
    dereference: true,
    filter: (file) => file !== 'public/index.html',
  })
  return measureFileSizesBeforeBuild(process.env.BUILD_PATH || 'build')
}
function build(previousFileSizes) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages
      if (err) {
        if (!err.message) {
          return reject(err)
        }

        let errMessage = err.message

        // Add additional information for postcss errors
        if (Object.prototype.hasOwnProperty.call(err, 'postcssNode')) {
          errMessage +=
            '\nCompileError: Begins at CSS selector ' +
            err['postcssNode'].selector
        }

        messages = formatWebpackMessages({
          errors: [errMessage],
          warnings: [],
        })
      } else {
        messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: true })
        )
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1
        }
        return reject(new Error(messages.errors.join('\n\n')))
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n'
          )
        )
        return reject(new Error(messages.warnings.join('\n\n')))
      }
      const resolveArgs = {
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      }

      const argv = process.argv.slice(2)
      const writeStatsJson = argv.indexOf('--stats') !== -1
      if (writeStatsJson) {
        return bfj
          .write('build/bundle-stats.json', stats.toJson())
          .then(() => resolve(resolveArgs))
          .catch((error) => reject(new Error(error)))
      }
      return resolve(resolveArgs)
    })
  })
}
fs.emptyDirSync('build')
copyPublicFolder()
  .then((previousFileSizes) => {
    return build(previousFileSizes)
  })
  .then(
    ({ stats, previousFileSizes, warnings }) => {
      if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'))
        console.log(warnings.join('\n\n'))
        console.log(
          '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        )
        console.log(
          'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        )
      } else {
        console.log(chalk.green('Compiled successfully.\n'))
      }

      console.log('File sizes after gzip:\n')
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        'build',
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      )
      const publicPath = 'public'
      const buildFolder = path.relative(process.cwd(), 'build')
      console.log()
      console.log(
        chalk.blue(`${publicPath}`),
        '폴더에 있는 파일은 잘 복사되었습니다.'
      )
      console.log(chalk.green(`${buildFolder}`), '폴더에 빌드 되었습니다. ')
    },
    (err) => {
      const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true'
      if (tscCompileOnError) {
        console.log(
          chalk.yellow(
            'Compiled with the following type errors (you may want to check these before deploying your app):\n'
          )
        )
        printBuildError(err)
      } else {
        console.log(chalk.red('Failed to compile.\n'))
        printBuildError(err)
        process.exit(1)
      }
    }
  )
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message)
    }
    process.exit(1)
  })
