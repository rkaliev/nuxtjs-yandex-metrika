export default ({ app }, inject) => {
  const moduleOptions = JSON.parse('<%= JSON.stringify(options) %>');
  const { router } = app;
  let navigationReady = false;

  /**
   *  Подписываемся на событие инициализации навигации(router)
   */
  router.onReady(() => {
    navigationReady = true;
  });

  const ymUrl =
    (moduleOptions.useCDN ? 'https://cdn.jsdelivr.net/npm/yandex-metrica-watch' : 'https://mc.yandex.ru/metrika') +
    '/tag.js';

  /* eslint-disable */
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", ymUrl, "ym");
  /* eslint-enable */

  ym(moduleOptions.id, 'init', moduleOptions);

  const YandexMetrika = {
    reachGoal: (targetName = '', params = {}) => ym(moduleOptions.id, 'reachGoal', targetName, params),
    hit: (url = '', options = {}) => ym(moduleOptions.id, 'hit', url, options),
    addFileExtension: (extensions) => ym(moduleOptions.id, 'addFileExtension', extensions),
    extLink: (url = '', options = {}) => ym(moduleOptions.id, 'extLink', url, options),
    file: (url = '', options = {}) => ym(moduleOptions.id, 'file', url, options),
    getClientID: (callback = (clientID) => clientID) => ym(moduleOptions.id, 'getClientID', callback),
    notBounce: (options = {}) => ym(moduleOptions.id, 'notBounce', options = {}),
    params: (params = {}) => ym(moduleOptions.id, 'params', params),
    replacePhones: () => ym(moduleOptions.id, 'replacePhones'),
    setUserID: (userID) => ym(moduleOptions.id, 'setUserID', userID),
    userParams: (params = {}) => ym(moduleOptions.id, 'userParams', params),
  };

  router.afterEach((to, from) => {
    if (!navigationReady) {
      /**
       *  Не дублируем hit c урлом
       */
      return;
    }
    
    YandexMetrika.hit(to.fullPath, {
      referer: from.fullPath,
    });
  });

  inject('yandexMetrika', YandexMetrika);
};
