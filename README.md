# i18n YAML

This is an experimental i18n library with YAML catalogs.

It does **not** support Pluralization yet.


## Use

``` javascript

// Require it, come on.
i18n = require('i18n')

// Set the options
locale = new i18n({
  localedir: './testdata',    // Read/write the locales from this folder;
                              // naming format: localedir/locale.yaml

  locales: ['es','en', 'eu']  // Available locales in the application
  clean: true                 // Removes not found translations from the catalog
})

// Get the translation function
var __ = locale.prepare()

// Select the language to translate to
locale.setCurrentLocale('es')

// Use the translation function
console.log(__('hi'))
console.log(__('hello'))
console.log(__('This is a very \nLong message\n Word up!'))
console.log(__('what\'s up!'))

// Updates catalog files appending found messages which are not translated;
// if `clean` was set in the creation, unused parts of the YAML file are
// deleted
locale.updateCatalogs()

```

This is the catalog for the program above:

``` yaml

8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4:
  original: hi
  translation: Ey
2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824:
  original: hello
  translation: Hola
6e4a4a4351af4b964c60492c0f1d2e354ec269f87e65d0574dd602694b37a521:
  original: |-
    This is a very 
    Long message
     Word up!
  translation: |-
    Este es un 
    Mensaje muy largo
     Eso es!
096474b283b0ef7c4e95bdc4720b20b2f7270ae5c8eec6d4e122d2d14294e269:
  original: what's up!
  translation: qué hay?

```

## Catalog structure:

Catalog files are YAML objects where Keys are the SHA256 digest of the original
message.

Values are also an object with two Keys: original, which holds the orignal text
and translation, where the translated message have to be written.

