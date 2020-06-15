# NuxtJS модуль для подключения Yandex.Metrika

## Установка и настройка модуля

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
      },
    ],
  ],
```

Модуль активирует подгрузку скриптов Yandex.Metrika только в режиме production (process.env.NODE_ENV),
в режиме develop вместо подгрузки скриптов Yandex.Metrika используется mock Yandex.Metrika.

[Ссылка на документацию Yandex.Metrika](https://yandex.com/support/metrica/code/counter-initialize.html).

ID Yandex.Metrika можно задать как в настройках модуля в nuxt.config.js:

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

Модуль можно запускать в режиме debug, используется mock Yandex.Metrika и происходит вывод в консоль ивентов и параметров:

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

После установки Яндекс.Метрика доступна через this.$yandexMetrika.

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

[Ссылка на документацию Nuxt.js docs](https://nuxtjs.org).
[Ссылка на документацию Nuxt.js Module docs](https://nuxtjs.org/api/internals-module-container#introduction).
