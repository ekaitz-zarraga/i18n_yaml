i18n = require('./lib/i18n')

locale = new i18n({
  localedir: './testdata',
  locales: ['es','en','eu']
})
console.log(locale.getAvailableLocales())

var __ = locale.prepare()
locale.setCurrentLocale('es')
console.log(__('hi'))
console.log(__('hello'))
console.log(__('This is a very \nLong message\n Word up!'))
console.log(__('what\'s up!'))

locale.updateCatalogs()
