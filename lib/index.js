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
 *   noJS?: boolean,
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
 
  if (!options.id) {
    options.id = 'XXXXXXXX';
    console.warn('[nuxt-yandex-metrika] YANDEX.METRIKA counter id not set');
  }

  if (!isProduction) {
    console.warn("[nuxt-yandex-metrika] TRACKING is disabled, because env option is not 'production'");
  }

  if (options.debug) {
    console.warn("[nuxt-yandex-metrika] DEBUG is true: you'll see all API calls in the console");
  }
  
  if (isProduction && options.noJS) {
    this.options.head.__dangerouslyDisableSanitizers = this.options.head.__dangerouslyDisableSanitizers || [];
    this.options.head.__dangerouslyDisableSanitizers.push('noscript');
    this.options.head.noscript = this.options.head.noscript || [];
    this.options.head.noscript.push({
      innerHTML: `<div style="position:absolute;left:-9999px;" alt="ymPixel"><img src="https://mc.yandex.ru/watch/${options.id}"/></div>`,
      body: true,
    });
  }

  this.addPlugin({ src: path.resolve(__dirname, pluginName), mode: 'client', options });
}

module.exports.meta = require( '../package.json' );
