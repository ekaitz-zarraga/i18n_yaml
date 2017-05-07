const crypto = require('crypto')
const _    = require('underscore')
const fs   = require('fs')
const path = require('path')
const yaml = require('js-yaml')

/*
 * TODO: Control Pluralization and that kind of shit
 */

function I18n(opts){
  if(opts){
    // Folder where locales are read from
    this.localedir     = opts.localedir || './locale'
    // Language of the original text
    this.defaultLocale = opts.defaultLocale
    // Valid languages
    this.locales       = opts.locales || false
    // Current locale, defaults to defaultLocale
    this.locale        = opts.locale || opts.defaultLocale

    // Clean not used
    this.cleanUnused   = opts.clean  || false

  } else {
    this.localedir = './locale'
    this.defaultLocale = 'en'
  }

  /*
   * Stores application messages it finds. Structure:
   * hashofthemessage:
   *  text
   */
  this.messages = {}


  /*
   * Initialize: load the translations and stuff
   */
  this.translation = this.loadTranslations(this.localedir, this.locales)
}

I18n.prototype.hash = function( string ){
  const hash = crypto.createHash('sha256')
  hash.update( string )
  return hash.digest('hex')
}

I18n.prototype.loadTranslations = function(localedir, enabled_locales){
  /*
   * Returns loaded locales from input path directory
   * Expects:
   * localedir/
   *     en.yaml
   *     es.yaml
   *     ...
   * (extension is not considered, can be .yml, .yaml or whatever you want)
   *
   * Only parses enabled_locales. If unset all are parsed.
   * Expects:
   * ['en', 'es'...] or undefined
   *
   *
   * Returns translation
   * Translation structure:
   * locale:
   *   hashofthemessage:
   *     original:
   *       this is the text
   *     translation:
   *       este es el texto
   *   ...
   * locale:
   *   ...
   */
  if(!fs.existsSync(localedir))
    throw 'Path does not exist!'
  if(!fs.statSync(localedir).isDirectory())
    throw 'Locale path is not a directory'

  var files = _.chain( fs.readdirSync(localedir) )
    .map(    (file) => path.join(localedir, file) )
    .filter( (file) => fs.statSync(file).isFile() )
    .value()

  var locales  = _.map(files, (f)=> path.basename( f, path.extname(f) ))

  // If not set, enable all
  if( enabled_locales )
    var not_enabled = _.difference(locales, enabled_locales)
  else
    not_enabled = []

  return _.extend(
    _.chain( enabled_locales )
      .map( (l) => [l, {}] )
      .object()
      .value(),

    _.chain( locales )
      .zip( files )
      .object()
      .omit( not_enabled )
      .map( (f,l) => [l, yaml.safeLoad( fs.readFileSync(f, 'utf8') )] )
      .object()
      .value()
  )
}

I18n.prototype.translate = function(text, locale){
  /*
   * Translates text to the locales
   */
  hash = this.hash(text)
  this.register(hash, text)

  var found = this.translation[locale][hash]
  if(! found || found.translation == ''){
    return text
  } else {
    return found.translation
  }
}

I18n.prototype.setCurrentLocale = function(locale){
  this.locale = locale
  if( _.find(this.locales, locale) )
    throw "Can't set unconfigured locale"
  if( _.find(this.translation, locale) )
    this.translation[locale] = {}
}

I18n.prototype.register = function(hash, text){
  this.messages[hash] = text
}

I18n.prototype.dumpCatalog = function(locale){
  // TODO CONTROL THE ORDER??

  var messages = this.messages                  // Found by the app
  var translation = this.translation[locale]    // Read from the file

  var foundMissing = _.difference( _.keys(messages), _.keys(translation) )

  // Clean if cleanUnused set
  var unused     = _.difference( _.keys(translation), _.keys(messages) )
  if(this.cleanUnused){
    translation = _.omit(
      translation,
      unused
    )
  }

  var missingTranslation = _.chain( foundMissing )
    .map(
      (hash)=> {
      var piece = {}
      var original = messages[hash]
      var translation = ''

      piece['original']    = original
      piece['translation'] = translation
      return [hash, piece]
    })
    .object()
    .value()

  return _.extend(translation, missingTranslation)
}

I18n.prototype.updateCatalogs = function(){
  var self = this

  // Find the file names of the locales
  var found_files = _.chain(fs.readdirSync(self.localedir))
    .filter( (f) => fs.statSync(f).isfile() )
    .map(    (f) => [path.basename(f, path.extname(f)), f]
    .object()
    .value()


  // Overwrite files
  _.each(this.locales, (l)=>{
    fs.writeFile(
      // Save locales as .yaml or the extension they had in the found files
      path.join(self.localedir, found_files[l] || l+'.yaml'),
      yaml.safeDump(self.dumpCatalog(l)),
      (e)=>{
        if(e)
          throw 'Impossible to write the file during dump: ' + l
      })
  })
}

I18n.prototype.prepare = function(){
  return (function(text){
    return this.translate(text, this.locale)
  }).bind(this)
}

module.exports = I18n
