// @ts-check

const path = require('path');
const config = require('./config');

/**
 * @typedef {Object} ThisType
 * @property {Object} nuxt - экземпляр Nuxt
 * @property {Object} options - опции(конфиги) Nuxt nuxt.config.js
 * @property {Function} addPlugin - метод для установки плагинов
 */

/**
 * @this ThisType
 * @param {{
 *   id?: string,
 *   webvisor?: boolean,
 *   clickmap?: boolean,
 *   useCDN?: boolean,
 *   trackLinks?: boolean,
 *   accurateTrackBounce?: boolean,
 *   debug?: boolean,
 *}} moduleOptions - Опции которые задаем модулю(плагину) в nuxt.config.js
 * @returns {void}
 */
export default function init(moduleOptions) {
  const isProduction = process.env.NODE_ENV === 'production';
  const pluginName = isProduction ? 'plugin.js' : 'pluginMock.js';
  const options = {
    ...config,
    ...moduleOptions,
  };
  if (!isProduction) {
    console.warn("[nuxt-yandex-metrika] Tracking is disabled, because env option is not 'production'");

    if (options.debug) {
      console.warn("[nuxt-yandex-metrika] DEBUG is true: you'll see all API calls in the console");
    }
  }
  /**
   *  Регистрируем плагин
   */
  this.addPlugin({ src: path.resolve(__dirname, pluginName), mode: 'client', options });
}

module.exports.meta = require( '../package.json' );
