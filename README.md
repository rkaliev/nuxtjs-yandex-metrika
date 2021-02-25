# NuxtJS модуль/плагин для подключения Yandex.Metrika(Яндекс.Метрика)

## Установка и настройка модуля/плагина

```code
npm i @rkaliev/nuxtjs-yandex-metrika
```

Необходимо в nuxt.config.js в секции modules добавить:

```code
modules: [
    [
      '@rkaliev/nuxtjs-yandex-metrika',
      {
        id: 'XXXXXX',
        webvisor: boolean,
        clickmap: boolean,
        debug: boolean,
        noJS: boolean,
        disabled: boolean,
      },
    ],
  ],
```

Модуль/Плагин активирует подгрузку скриптов Yandex.Metrika(Яндекс.Метрика) только в режиме production (process.env.NODE_ENV),
в режиме develop вместо подгрузки скриптов Yandex.Metrika(Яндекс.Метрика) используется mock Yandex.Metrika.

Параметр [noJS](https://yandex.ru/support/metrica/code/counter-initialize.html) отвечает за инициализацию счетчика через
```<noscript></noscript>``` и ```<img/>```.

Больше информации по Yandex.Metrika(Яндекс.Метрика):

* [Ссылка на документацию Yandex.Metrika(Яндекс.Метрика)](https://yandex.com/support/metrica/code/counter-initialize.html).

ID Yandex.Metrika(Яндекс.Метрика) можно задать как в настройках модуля в nuxt.config.js:

```code
modules: [
    [
      '@rkaliev/nuxtjs-yandex-metrika',
      {
        ...
        id: 'XXXXXX',
        ...
      },
    ],
  ],
```

либо можно задать переменную в .env файле:

```code
YM_ID=XXXXXXX
```

Модуль/Плагин можно запускать в режиме debug, используется mock Yandex.Metrika(Яндекс.Метрика) и происходит вывод в консоль ивентов и параметров:

```code
modules: [
    [
      '@rkaliev/nuxtjs-yandex-metrika',
      {
        ...
        debug: true,
        ...
      },
    ],
  ],
```

Так же можно использовать qs параметры:

```code
https://test.domain.ru/?_ym_debug=1
```

## Использование

После установки Yandex.Metrika(Яндекс.Метрика) доступна через this.$yandexMetrika.

Пример:

```code
methods: {
    /**
     * @param {string} eventName
     */
    sendYandexMetrikaEvent(eventName) {
      this.$yandexMetrika.reachGoal(eventName);
    },
```

Больше информации по Nuxt.js:

* [Ссылка на документацию Nuxt.js docs](https://nuxtjs.org).
* [Ссылка на документацию Nuxt.js Module docs](https://nuxtjs.org/api/internals-module-container#introduction).
