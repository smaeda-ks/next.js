import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { constantCase } from 'constant-case'
import { JssConfig, jssConfigFactory } from './config'

/*
  CONFIG GENERATION
  Generates the /src/temp/config.js file which contains runtime configuration
  that the app can import and use.
*/

const defaultConfig: JssConfig = {
  sitecoreApiKey: process.env[`${constantCase('sitecoreApiKey')}`],
  sitecoreApiHost: process.env[`${constantCase('sitecoreApiHost')}`],
  jssAppName: process.env[`${constantCase('jssAppName')}`],
  graphQLEndpointPath: process.env[`${constantCase('graphQLEndpointPath')}`],
  defaultLanguage: process.env[`${constantCase('defaultLanguage')}`],
  graphQLEndpoint: process.env[`${constantCase('graphQLEndpoint')}`],
}

/**
 * Writes the config object to disk with support for environment variables.
 * @param {JssConfig} config JSS configuration to write.
 */
function writeConfig(config: JssConfig): void {
  let configText = `/* eslint-disable */
// Do not edit this file, it is auto-generated at build time!
// See scripts/bootstrap.ts to modify the generation of this file.
const config = {};\n`

  // Set configuration values, allowing override with environment variables
  Object.keys(config).forEach((prop) => {
    configText += `config.${prop} = process.env.${constantCase(prop)} || '${
      config[prop]
    }',\n`
  })
  configText += `module.exports = config;`

  const configPath = path.resolve('src/temp/config.js')
  console.log(`Writing runtime config to ${configPath}`)
  fs.writeFileSync(configPath, configText, { encoding: 'utf8' })
}

/**
 * Generates the JSS config based on config plugins (under ./config/plugins)
 * and then writes the config to disk.
 * @param {JssConfig} defaultConfig Default configuration.
 */
function generateConfig(defaultConfig: JssConfig): void {
  jssConfigFactory
    .create(defaultConfig)
    .then((config) => {
      writeConfig(config)
    })
    .catch((e) => {
      console.error('Error generating config')
      console.error(e)
      process.exit(1)
    })
}

generateConfig(defaultConfig)