export default ({ app }, inject) => {
  const moduleOptions = JSON.parse('<%= JSON.stringify(options) %>');
  /**
   *  Если явно не передали id метрики, то смотрим в env
   */
  moduleOptions.id = moduleOptions.id || process.env.YM_ID;

  /**
   *  Если id метрики нет, заменяем на XXXXXXXX и выводим в консоль предупреждение
   */
  if (!moduleOptions.id) {
    moduleOptions.id = 'XXXXXXXX';
    console.warn('[nuxt-yandex-metrika] Yandex.Metrika counter id not set');
  }
  const { router } = app;

  if (process.env.NODE_ENV !== 'production') return;

  const ymUrl =
    (moduleOptions.useCDN ? 'https://cdn.jsdelivr.net/npm/yandex-metrica-watch' : 'https://mc.yandex.ru/metrika') +
    '/tag.js';

  /* eslint-disable */
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", ymUrl, "ym");
  /* eslint-enable */

  // eslint-disable-next-line no-undef
  ym(moduleOptions.id, 'init', moduleOptions);

  const YandexMetrika = {
    // eslint-disable-next-line no-undef
    reachGoal: (targetName = '', params = {}) => ym(moduleOptions.id, 'reachGoal', targetName, params),
    // eslint-disable-next-line no-undef
    hit: (url = '', options = {}) => ym(moduleOptions.id, 'hit', url, options),
  };

  router.afterEach((to, from) => {
    YandexMetrika.hit(to.fullPath, {
      referer: from.fullPath,
    });
  });

  inject('yandexMetrika', YandexMetrika);
};
