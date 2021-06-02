// @ts-check

const config = {
  /**
   * id - id Yandex.Metrika
   *
   * @type {string | null}
   */
  id: null,
  /**
   * webvisor - https://yandex.com/support/metrica/code/counter-initialize.html
   *
   * @type {boolean}
   */
  webvisor: false,
  /**
   * clickmap - https://yandex.com/support/metrica/code/counter-initialize.html
   *
   * @type {boolean}
   */
  clickmap: false,
  /**
   * useCDN - https://yandex.com/support/metrica/code/counter-initialize.html
   *
   * @type {boolean}
   */
  useCDN: false,
  /**
   * trackLinks - https://yandex.com/support/metrica/code/counter-initialize.html
   *
   * @type {boolean}
   */
  trackLinks: false,
  /**
   * accurateTrackBounce - https://yandex.com/support/metrica/code/counter-initialize.html
   *
   * @type {boolean}
   */
  accurateTrackBounce: false,
  /**
   * debug - задает режим дебага
   *
   * @type {boolean}
   */
  debug: false,
  /**
   * noJS - https://yandex.ru/support/metrica/code/counter-initialize.html
   * инициализация счетчика через <noscript></noscript> и <img/>
   *
   * @type {boolean}
   */
  noJS: false,
  /**
   * disabled - отключает Yandex.Metrika
   *
   * @type {boolean}
   */
  disabled: false,
  ut: "noindex",
};

module.exports = config;
