const path = require('path')
const program = require('commander');
const fs = require('fs-extra')
const config = require('../lib/config')
const util = require('../lib/util')

program
  .version(process.env.npm_package_version)
  .option('--gclient_file <file>', 'gclient config file location')
  .option('--run_hooks', 'run gclient hooks')
  .option('--run_sync', 'run gclient sync')
  .option('--submodule_sync', 'run submodule sync')
  .option('--init', 'initialize all dependencies')
  .option('--all', 'update all projects')
config.projectNames.forEach((project) => {
  program.option('--' + project + '_ref <ref>', project + ' ref to checkout')
})

program.parse(process.argv)
config.update(program)

if (program.init || program.submodule_sync) {
  util.submoduleSync()
}

if (program.init) {
  util.buildGClientConfig()
}

if (program.init) {
  util.gclientSync()
}

let updatedVersion = false

config.projectNames.forEach((project) => {
  if (program.init || program.all || program[project + '_ref']) {
    updatedVersion = true
    util.setDepVersion(config.projects[project].dir, config.projects[project].ref)
  }
})

if (updatedVersion || program.init || program.run_sync) {
  util.gclientSync()
}

if (updatedVersion || program.init || program.run_hooks) {
  util.gclientRunhooks()
}
