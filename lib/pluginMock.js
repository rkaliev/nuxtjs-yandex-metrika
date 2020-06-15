function MockYandexMetrika({ debug = false, ...options }) {
  this.debug = debug;
  if (this.debug) console.log('[nuxt-yandex-metrika] MockYandexMetrika recived options:', options);
}

MockYandexMetrika.prototype.addFileExtension = function() {
  if (this.debug) console.log('[nuxt-yandex-metrika] addFileExtension:', arguments);
};

MockYandexMetrika.prototype.extLink = function() {
  if (this.debug) console.log('[nuxt-yandex-metrika] extLink:', arguments);
};

MockYandexMetrika.prototype.file = function() {
  if (this.debug) console.log('[nuxt-yandex-metrika] file:', arguments);
};

MockYandexMetrika.prototype.getClientID = function() {
  if (this.debug) console.log('[nuxt-yandex-metrika] getClientID:', arguments);
};

MockYandexMetrika.prototype.hit = function() {
  if (this.debug) console.log('[nuxt-yandex-metrika] hit:', arguments);
};

MockYandexMetrika.prototype.notBounce = function() {
  if (this.debug) console.log('[nuxt-yandex-metrika] notBounce:', arguments);
};

MockYandexMetrika.prototype.params = function() {
  if (this.debug) console.log('[nuxt-yandex-metrika] params:', arguments);
};

MockYandexMetrika.prototype.reachGoal = function() {
  if (this.debug) console.log('[nuxt-yandex-metrika] reachGoal:', arguments);
};

MockYandexMetrika.prototype.replacePhones = function() {
  if (this.debug) console.log('[nuxt-yandex-metrika] replacePhones:', arguments);
};

MockYandexMetrika.prototype.setUserID = function() {
  if (this.debug) console.log('[nuxt-yandex-metrika] setUserID:', arguments);
};

MockYandexMetrika.prototype.userParams = function() {
  if (this.debug) console.log('[nuxt-yandex-metrika] userParams:', arguments);
};

export default ({ app }, inject) => {
  /**
   *  Шаблонные строки см: https://ru.nuxtjs.org/api/internals-module-container#template-plugins
   */
  const options = JSON.parse('<%= JSON.stringify(options) %>');
  const { router } = app;
  let navigationReady = false;

  /**
   *  Подписываемся на событие инициализации навигации(router)
   */
  router.onReady(() => {
    navigationReady = true;
  });

  function createYandexMetrika() {
    /**
     *  В dev режиме мокаем сервис Yandex.Metrika
     */
    const ymCounter = (window[`yaCounter${options.id}`] = new MockYandexMetrika(options));

    router.afterEach((to, from) => {
      if (!navigationReady) {
        /**
         *  Не дублируем hit c урлом
         */
        return;
      }
      ymCounter.hit(to.fullPath, {
        referer: from.fullPath,
      });
    });
    /**
     *  Инжектим yandexMetrica в nuxt для доступа через this.$yandexMetrica
     */
    inject('yandexMetrika', ymCounter);
  }
  /**
   *  Инициализация Yandex.Metrika
   */
  createYandexMetrika();
};
