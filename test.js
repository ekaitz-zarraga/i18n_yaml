i18n = require('./lib/i18n').I18n

locale = new i18n({
  localedir: './testdata',
  defaultLocale: 'en',
  locales: ['es','en', 'eu']
})

var __ = locale.prepare()
locale.setCurrentLocale('es')
console.log(__('hi'))
console.log(__('hello'))
console.log(__('This is a very \nLong message\n Word up!'))
console.log(__('what\'s up!'))

locale.updateCatalogs()
