// Environment
// -----------

/* global cacheTime, config */

// Global Tools
var hamlet = {}
hamlet.isCookie = function (key) {
  return typeof document.cookie === 'string' && document.cookie.indexOf(key + '=') !== -1
}
hamlet.isUndefined = function (key) {
  return undefined === this[key]
}.bind(this)

// Initial Setup
if (hamlet.isUndefined('boot')) {
  var boot = {}
}

// Backward Compatibility
if (!hamlet.isUndefined('cacheTime')) {
  boot.cacheTime = cacheTime
}

// Environment
boot.dev = hamlet.isCookie('env')
boot.local = hamlet.isCookie('local') || true // we are disabling the CDN until it is ready.
boot.cacheTime = boot.cacheTime || '2'

// Locations
boot.host = boot.host || ''
boot.cdn = boot.cdn || '/'
boot.relative = boot.relative || ''
boot.bundle = boot.bundle || ''

// Require.js
boot.configuration = boot.configuration || {}

// Min Settings
boot.suffix = (boot.dev) ? '' : '.min'
boot.dashSuffix = (boot.dev) ? '' : '-min'
boot.directory = (boot.dev) ? '' : 'min/'

// Merge Tool
boot.merge = function (destination, source) {
  if (destination === null || source === null) {
    return destination
  }
  for (var key in source) {
    if (source.hasOwnProperty(key)) {
      destination[key] = (typeof destination[key] === 'object') ? boot.merge(
        destination[key], source[key]) : source[key]
    }
  }
  return destination
}

// Config Tool
boot.config = function (configuration, options) {
  if (typeof configuration !== 'object') {
    return false
  }
  /* *
  if (typeof options !== 'object') options = {}
  var args = [
    boot.configuration,
    !configuration.paths ? { paths: configuration } : configuration
  ]
  if (typeof boot.merge === 'function') {
    boot.merge.apply(this, options.inverse ? args.reverse() : args)
  }
  return requirejs.config ? requirejs.config(boot.configuration) : boot.configuration
  /* */
  return boot.merge(boot.configuration, !configuration.paths ? {paths: configuration} : configuration)
}

// Initialization
if (typeof config !== 'undefined') {
  var localConfig = typeof config === 'function' ? config(boot) : config
  if (typeof localConfig === 'object' && localConfig) {
    boot.config(localConfig)
  }
}

// Configuration
// -------------

/* global boot */

boot.config({

  // Connection Settings
  waitSeconds: 30,

  // Cache Busting
  urlArgs: 'v=' + boot.cacheTime,

  // Version Location (Disabled During Beta Testing)
  baseUrl: ((boot.dev || boot.local) ? boot.host + '/' : boot.cdn) +
    boot.relative,
  bundlePath: (boot.bundle || '') + 'stratus/',

  // Dependencies
  shim: {
    /* Angular */
    angular: {
      exports: 'angular'
    },
    'angular-aria': {
      deps: ['angular']
    },
    'angular-animate': {
      deps: ['angular']
    },
    'angular-messages': {
      deps: ['angular']
    },
    'angular-material': {
      deps: [
        'angular-aria',
        'angular-animate',
        'angular-messages'
      ]
    },
    'angular-sanitize': {
      deps: ['angular']
    },

    /* Angular Modules */
    'angular-file-upload': {
      deps: ['angular']
    },
    'angular-icons': {
      deps: ['angular']
    },
    'angular-scrollSpy': {
      deps: ['angular']
    },
    'angular-ui-tree': {
      deps: ['angular']
    },

    // Charts
    'chart.js': {
      deps: ['angular', 'chart']
    },

    /* Backbone */
    'backbone.relational': {
      deps: ['backbone']
    },

    /* Froala */
    'froala-align': {
      deps: ['froala']
    },
    'froala-char-counter': {
      deps: ['froala']
    },
    'froala-code-beautifier': {
      deps: ['froala']
    },
    'froala-code-view': {
      deps: ['froala']
    },
    'froala-colors': {
      deps: ['froala']
    },
    'froala-draggable': {
      deps: ['froala']
    },
    'froala-emoticons': {
      deps: ['froala']
    },
    'froala-entities': {
      deps: ['froala']
    },
    'froala-file': {
      deps: ['froala']
    },
    'froala-font-family': {
      deps: ['froala']
    },
    'froala-font-size': {
      deps: ['froala']
    },
    'froala-forms': {
      deps: ['froala']
    },
    'froala-fullscreen': {
      deps: ['froala']
    },
    'froala-help': {
      deps: ['froala']
    },
    'froala-image': {
      deps: ['froala']
    },
    'froala-image-manager': {
      deps: ['froala', 'froala-image']
    },
    'froala-inline-style': {
      deps: ['froala']
    },
    'froala-line-breaker': {
      deps: ['froala']
    },
    'froala-link': {
      deps: ['froala']
    },
    'froala-lists': {
      deps: ['froala']
    },
    'froala-paragraph-format': {
      deps: ['froala']
    },
    'froala-paragraph-style': {
      deps: ['froala']
    },
    'froala-quick-insert': {
      deps: ['froala']
    },
    'froala-quote': {
      deps: ['froala']
    },
    'froala-save': {
      deps: ['froala']
    },
    'froala-special-characters': {
      deps: ['froala']
    },
    'froala-table': {
      deps: ['froala']
    },
    'froala-url': {
      deps: ['froala']
    },
    'froala-video': {
      deps: ['froala']
    },
    'froala-word-paste': {
      deps: ['froala']
    },
    'angular-froala': {
      deps: ['angular', 'froala']
    },

    /* Calendar */
    fullcalendar: {
      deps: [
        'zepto',
        'moment'
      ]
    }
  },

  // Package Directories
  packages: [
    /**
     {
         name: 'stratus',
         location: boot.bundle + 'stratus',
         main: 'stratus'
     },
     /**/
    {
      name: 'codemirror',
      location: boot.bundlePath + 'bower_components/codemirror',
      main: 'lib/codemirror'
    }
  ],

  // Relative Paths
  paths: {
    /* Require.js Plugins */
    text: boot.bundlePath + 'bower_components/text/text',

    /* Stratus Core Library */
    stratus: boot.bundlePath + 'dist/stratus' + boot.suffix,

    /* Stratus Core Collections */
    'stratus.collections.generic': boot.bundlePath + 'legacy/collections/generic' + boot.suffix,

    /* Stratus Core Models */
    'stratus.models.generic': boot.bundlePath + 'legacy/models/generic' +
      boot.suffix,

    /* Stratus Core Routers */
    'stratus.routers.generic': boot.bundlePath + 'routers/generic' +
      boot.suffix,
    'stratus.routers.version': boot.bundlePath + 'routers/version' +
      boot.suffix,

    /* Stratus Controllers */
    'stratus.controllers.dialogue': boot.bundlePath + 'controllers/dialogue' + boot.suffix,
    'stratus.controllers.generic': boot.bundlePath + 'controllers/generic' +
      boot.suffix,
    'stratus.controllers.panel': boot.bundlePath + 'controllers/panel' +
      boot.suffix,
    'stratus.controllers.filterContentType': boot.bundlePath + 'controllers/filterContentType' + boot.suffix,
    'stratus.controllers.createNewSite': boot.bundlePath + 'controllers/createNewSite' + boot.suffix,
    'stratus.controllers.selectMainRoute': boot.bundlePath + 'controllers/selectMainRoute' + boot.suffix,
    'stratus.controllers.productFilter': boot.bundlePath + 'controllers/productFilter' + boot.suffix,
    'stratus.controllers.invoiceProductFilter': boot.bundlePath + 'controllers/invoiceProductFilter' + boot.suffix,
    'stratus.controllers.userFilter': boot.bundlePath + 'controllers/userFilter' + boot.suffix,

    /* Stratus Core Components */
    'stratus.components.base': boot.bundlePath + 'components/base' +
      boot.suffix,
    'stratus.components.dateTime': boot.bundlePath + 'components/dateTime' +
      boot.suffix,
    'stratus.components.delete': boot.bundlePath + 'components/delete' +
      boot.suffix,
    'stratus.components.editLegacy': boot.bundlePath + 'components/editLegacy' + boot.suffix,
    'stratus.components.facebook': boot.bundlePath + 'components/facebook' +
      boot.suffix,
    'stratus.components.filter': boot.bundlePath + 'components/filter' +
      boot.suffix,
    'stratus.components.help': boot.bundlePath + 'components/help' +
      boot.suffix,
    'stratus.components.mediaSelector': boot.bundlePath + 'components/mediaSelector' + boot.suffix,
    'stratus.components.mediaLibrary': boot.bundlePath + 'components/mediaLibrary' + boot.suffix,
    'stratus.components.optionValue': boot.bundlePath + 'components/optionValue' + boot.suffix,
    'stratus.components.pagination': boot.bundlePath + 'components/pagination' + boot.suffix,
    'stratus.components.search': boot.bundlePath + 'components/search' +
      boot.suffix,
    'stratus.components.selector': boot.bundlePath + 'components/selector' +
      boot.suffix,
    'stratus.components.sort': boot.bundlePath + 'components/sort' +
      boot.suffix,
    'stratus.components.tweet': boot.bundlePath + 'components/tweet' +
      boot.suffix,
    'stratus.components.upload': boot.bundlePath + 'components/upload' +
      boot.suffix,
    'stratus.components.visualSelector': boot.bundlePath + 'components/visualSelector' + boot.suffix,
    'stratus.components.userAuthentication': boot.bundlePath + 'components/userAuthentication' + boot.suffix,
    'stratus.components.passwordReset': boot.bundlePath + 'components/passwordReset' + boot.suffix,
    'stratus.components.singleSignOn': boot.bundlePath + 'components/singleSignOn' + boot.suffix,
    'stratus.components.socialMedia': boot.bundlePath + 'components/socialMedia' + boot.suffix,
    'stratus.components.stream': boot.bundlePath + 'components/stream' +
      boot.suffix,
    'stratus.components.streamExcerpt': boot.bundlePath + 'components/streamExcerpt' + boot.suffix,
    'stratus.components.proposalAlert': boot.bundlePath + 'components/proposalAlert' + boot.suffix,
    'stratus.components.mediaDragDrop': boot.bundlePath + 'components/mediaDragDrop' + boot.suffix,
    'stratus.components.mediaDetails': boot.bundlePath + 'components/mediaDetails' + boot.suffix,
    'stratus.components.mediaUploader': boot.bundlePath + 'components/mediaUploader' + boot.suffix,
    'stratus.components.tag': boot.bundlePath + 'components/tag' +
      boot.suffix,

    // TODO: Move these to Sitetheory since they are specific to Sitetheory
    'stratus.components.permission': boot.bundlePath + 'components/permission' + boot.suffix,
    'stratus.components.permissions': boot.bundlePath + 'components/permissions' + boot.suffix,
    'stratus.components.publish': boot.bundlePath + 'components/publish' +
      boot.suffix,
    'stratus.components.themeSelector': boot.bundlePath + 'components/themeSelector' + boot.suffix,

    /* Stratus Core Directives */
    'stratus.directives.base': boot.bundlePath + 'directives/base' +
      boot.suffix,
    'stratus.directives.edit': boot.bundlePath + 'directives/edit' +
      boot.suffix,
    'stratus.directives.editInline': boot.bundlePath + 'directives/editInline' + boot.suffix,
    'stratus.directives.drag': boot.bundlePath + 'directives/drag' +
      boot.suffix,
    'stratus.directives.drop': boot.bundlePath + 'directives/drop' +
      boot.suffix,
    'stratus.directives.href': boot.bundlePath + 'directives/href' +
      boot.suffix,
    'stratus.directives.singleClick': boot.bundlePath + 'directives/singleClick' + boot.suffix,
    'stratus.directives.src': boot.bundlePath + 'directives/src' +
      boot.suffix,
    'stratus.directives.trigger': boot.bundlePath + 'directives/trigger' +
      boot.suffix,
    'stratus.directives.validate': boot.bundlePath + 'directives/validate' +
      boot.suffix,
    'stratus.directives.passwordCheck': boot.bundlePath + 'directives/passwordCheck' + boot.suffix,
    'stratus.directives.validateUrl': boot.bundlePath + 'directives/validateUrl' + boot.suffix,
    'stratus.directives.compileTemplate': boot.bundlePath + 'directives/compileTemplate' + boot.suffix,
    'stratus.directives.stringToNumber': boot.bundlePath + 'directives/stringToNumber' + boot.suffix,
    'stratus.directives.timestampToDate': boot.bundlePath + 'directives/timestampToDate' + boot.suffix,

    // TODO: Move these to Sitetheory since they are specific to Sitetheory
    'stratus.directives.froala': boot.bundlePath + 'directives/froala' +
      boot.suffix,
    'stratus.directives.redactor': boot.bundlePath + 'directives/redactor' +
      boot.suffix,

    /* Stratus Core Filters */
    'stratus.filters.age': boot.bundlePath + 'filters/age' + boot.suffix,
    'stratus.filters.gravatar': boot.bundlePath + 'filters/gravatar' +
      boot.suffix,
    'stratus.filters.map': boot.bundlePath + 'filters/map' + boot.suffix,
    'stratus.filters.moment': boot.bundlePath + 'filters/moment' +
      boot.suffix,
    'stratus.filters.reduce': boot.bundlePath + 'filters/reduce' +
      boot.suffix,
    'stratus.filters.truncate': boot.bundlePath + 'filters/truncate' +
      boot.suffix,

    /* Stratus Core Services */
    'stratus.services.model': boot.bundlePath + 'services/model' +
      boot.suffix,
    'stratus.services.collection': boot.bundlePath + 'services/collection' +
      boot.suffix,
    'stratus.services.registry': boot.bundlePath + 'services/registry' + boot.suffix,
    'stratus.services.details': boot.bundlePath + 'services/details' +
      boot.suffix,
    'stratus.services.userAuthentication': boot.bundlePath + 'services/userAuthentication' + boot.suffix,
    'stratus.services.createNewSite': boot.bundlePath + 'services/createNewSite' + boot.suffix,
    'stratus.services.visualSelector': boot.bundlePath + 'services/visualSelector' + boot.suffix,
    'stratus.services.commonMethods': boot.bundlePath + 'services/commonMethods' + boot.suffix,
    'stratus.services.socialLibraries': boot.bundlePath + 'services/socialLibraries' + boot.suffix,
    'stratus.services.singleSignOn': boot.bundlePath + 'services/singleSignOn' + boot.suffix,
    'stratus.services.media': boot.bundlePath + 'services/media' +
      boot.suffix,

    /* Stratus Core Views */
    'stratus.views.base': boot.bundlePath + 'legacy/views/base' +
      boot.suffix,

    /* Stratus Core Widgets */
    'stratus.views.widgets.base': boot.bundlePath + 'legacy/views/widgets/base' + boot.suffix,
    'stratus.views.widgets.autocomplete': boot.bundlePath + 'legacy/views/widgets/autocomplete' + boot.suffix,
    'stratus.views.widgets.calendar': boot.bundlePath + 'legacy/views/widgets/calendar' + boot.suffix,
    'stratus.views.widgets.collection': boot.bundlePath + 'legacy/views/widgets/collection' + boot.suffix,
    'stratus.views.widgets.datetime': boot.bundlePath + 'legacy/views/widgets/datetime' + boot.suffix,
    'stratus.views.widgets.delete': boot.bundlePath + 'legacy/views/widgets/delete' + boot.suffix,
    'stratus.views.widgets.dialogue': boot.bundlePath + 'legacy/views/widgets/dialogue' + boot.suffix,
    'stratus.views.widgets.display': boot.bundlePath + 'legacy/views/widgets/display' + boot.suffix,
    'stratus.views.widgets.editor': boot.bundlePath + 'legacy/views/widgets/editor' + boot.suffix,
    'stratus.views.widgets.filter': boot.bundlePath + 'legacy/views/widgets/filter' + boot.suffix,
    'stratus.views.widgets.generic': boot.bundlePath + 'legacy/views/widgets/generic' + boot.suffix,
    'stratus.views.widgets.link': boot.bundlePath + 'legacy/views/widgets/link' + boot.suffix,
    'stratus.views.widgets.map': boot.bundlePath + 'legacy/views/widgets/map' + boot.suffix,
    'stratus.views.widgets.pagination': boot.bundlePath + 'legacy/views/widgets/pagination' + boot.suffix,
    'stratus.views.widgets.password': boot.bundlePath + 'legacy/views/widgets/password' + boot.suffix,
    'stratus.views.widgets.publish': boot.bundlePath + 'legacy/views/widgets/publish' + boot.suffix,
    'stratus.views.widgets.save': boot.bundlePath + 'legacy/views/widgets/save' + boot.suffix,
    'stratus.views.widgets.select': boot.bundlePath + 'legacy/views/widgets/select' + boot.suffix,
    'stratus.views.widgets.text': boot.bundlePath + 'legacy/views/widgets/text' + boot.suffix,
    'stratus.views.widgets.toggle': boot.bundlePath + 'legacy/views/widgets/toggle' + boot.suffix,
    'stratus.views.widgets.routing': boot.bundlePath + 'legacy/views/widgets/routing' + boot.suffix,
    'stratus.views.widgets.upload': boot.bundlePath + 'legacy/views/widgets/upload' + boot.suffix,

    /* Stratus Core Plugins */
    'stratus.views.plugins.base': boot.bundlePath + 'legacy/views/plugins/base' + boot.suffix,
    'stratus.views.plugins.addclass': boot.bundlePath + 'legacy/views/plugins/addclass' + boot.suffix,
    'stratus.views.plugins.addclose': boot.bundlePath + 'legacy/views/plugins/addclose' + boot.suffix,
    'stratus.views.plugins.carousel': boot.bundlePath + 'legacy/views/plugins/carousel' + boot.suffix,
    'stratus.views.plugins.dim': boot.bundlePath + 'legacy/views/plugins/dim' + boot.suffix,
    'stratus.views.plugins.drawer': boot.bundlePath + 'legacy/views/plugins/drawer' + boot.suffix,
    'stratus.views.plugins.help': boot.bundlePath + 'legacy/views/plugins/help' + boot.suffix,
    'stratus.views.plugins.lazy': boot.bundlePath + 'legacy/views/plugins/lazy' + boot.suffix,
    'stratus.views.plugins.masonry': boot.bundlePath + 'legacy/views/plugins/masonry' + boot.suffix,
    'stratus.views.plugins.morebox': boot.bundlePath + 'legacy/views/plugins/morebox' + boot.suffix,
    'stratus.views.plugins.onscreen': boot.bundlePath + 'legacy/views/plugins/onscreen' + boot.suffix,
    'stratus.views.plugins.popover': boot.bundlePath + 'legacy/views/plugins/popover' + boot.suffix,

    /* Stratus Core Underscore Templates */
    /* TODO: remove these, they aren't even used anymore. Convert to components and remove. */
    'templates-base': boot.bundlePath + 'legacy/views/widgets/base.html',
    'templates-filter-search': boot.bundlePath + 'legacy/views/widgets/filter.search.html',
    'templates-filter-sort': boot.bundlePath + 'legacy/views/widgets/filter.sort.html',
    'templates-filter-type': boot.bundlePath + 'legacy/views/widgets/filter.type.html',
    'templates-pagination': boot.bundlePath + 'legacy/views/widgets/pagination.html',
    'templates-toggle': boot.bundlePath + 'legacy/views/widgets/toggle.html',
    'templates-widgets-select': boot.bundlePath + 'legacy/views/widgets/select.html',
    'templates-widgets-select-options': boot.bundlePath + 'legacy/views/widgets/select.options.html',
    'templates-widgets-selected-options': boot.bundlePath + 'legacy/views/widgets/selected.options.html',
    'templates-upload': boot.bundlePath + 'legacy/views/widgets/upload.html',

    /* Froala Libraries */

    // TODO: Move these to Sitetheory since they are specific to Sitetheory
    froala: boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/froala_editor.min',
    'froala-align': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/align.min',
    'froala-char-counter': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/char_counter.min',
    'froala-code-beautifier': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/code_beautifier.min',
    'froala-code-view': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/code_view.min',
    'froala-colors': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/colors.min',
    'froala-draggable': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/draggable.min',
    'froala-emoticons': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/emoticons.min',
    'froala-entities': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/entities.min',
    'froala-file': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/file.min',
    'froala-font-family': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/font_family.min',
    'froala-font-size': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/font_size.min',
    'froala-forms': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/forms.min',
    'froala-fullscreen': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/fullscreen.min',
    'froala-help': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/help.min',
    'froala-image': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/image.min',
    'froala-image-manager': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/image_manager.min',
    'froala-inline-style': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/inline_style.min',
    'froala-line-breaker': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/line_breaker.min',
    'froala-link': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/link.min',
    'froala-lists': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/lists.min',
    'froala-paragraph-format': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/paragraph_format.min',
    'froala-paragraph-style': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/paragraph_style.min',
    'froala-quick-insert': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/quick_insert.min',
    'froala-quote': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/quote.min',
    'froala-save': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/save.min',
    'froala-special-characters': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/special_characters.min',
    'froala-table': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/table.min',
    'froala-url': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/url.min',
    'froala-video': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/video.min',
    'froala-word-paste': boot.bundlePath + 'bower_components/froala-wysiwyg-editor/js/plugins/word_paste.min',
    'angular-froala': boot.bundlePath + 'bower_components/angular-froala/src/angular-froala',

    /* Common Libraries */
    bowser: boot.bundlePath + 'bower_components/bowser/src/bowser',
    chart: boot.bundlePath + 'bower_components/chart.js/dist/Chart',
    dropzone: boot.bundlePath + 'bower_components/dropzone/dist/' +
      boot.directory + 'dropzone-amd-module' + boot.suffix,
    fullcalendar: boot.bundlePath + 'bower_components/fullcalendar/dist/fullcalendar' + boot.suffix,
    md5: boot.bundlePath + 'bower_components/js-md5/build/md5.min',
    moment: boot.bundlePath + 'bower_components/moment/' + boot.directory +
      'moment' + boot.suffix,
    'moment-timezone': boot.bundlePath + 'bower_components/moment-timezone/builds/moment-timezone-with-data' +
      boot.suffix,
    'moment-range': boot.bundlePath + 'bower_components/moment-range/dist/moment-range' + boot.suffix,
    promise: boot.bundlePath + 'bower_components/promise-polyfill/promise' +
      boot.suffix,
    zepto: boot.bundlePath + 'bower_components/zepto/zepto' + boot.suffix,
    zxcvbn: boot.bundlePath + 'bower_components/zxcvbn/dist/zxcvbn',

    /* Interpreters */
    coffee: boot.bundlePath + 'bower_components/coffeescript/docs/v2/browser-compiler/coffeescript',
    less: boot.bundlePath + 'bower_components/less/dist/less' + boot.suffix,

    /* Angular */
    angular: boot.bundlePath + 'bower_components/angular/angular' +
      boot.suffix,
    'angular-animate': boot.bundlePath + 'bower_components/angular-animate/angular-animate' + boot.suffix,
    'angular-aria': boot.bundlePath + 'bower_components/angular-aria/angular-aria' + boot.suffix,
    'angular-material': boot.bundlePath + 'bower_components/angular-material/angular-material' + boot.suffix,
    'angular-messages': boot.bundlePath + 'bower_components/angular-messages/angular-messages' + boot.suffix,
    'angular-sanitize': boot.bundlePath + 'bower_components/angular-sanitize/angular-sanitize' + boot.suffix,
    'angular-chart': boot.bundlePath + 'bower_components/angular-chart.js/dist/angular-chart' +
      boot.suffix,
    'angular-icons': boot.bundlePath + 'bower_components/angular-material-icons/angular-material-icons' +
      boot.suffix,
    'angular-file-upload': boot.bundlePath + 'bower_components/ng-file-upload/ng-file-upload' + boot.suffix,
    'angular-sortable': boot.bundlePath + 'bower_components/ng-sortable/angular-legacy-sortable' +
      boot.suffix,
    'angular-scrollSpy': boot.bundlePath + 'bower_components/angular-scroll-spy/angular-scroll-spy',
    'angular-ui-tree': boot.bundlePath + 'bower_components/angular-ui-tree/dist/angular-ui-tree' +
      boot.suffix,
    'angular-paging': boot.bundlePath + 'bower_components/angular-paging/dist/paging' + boot.suffix,

    /* Backbone */
    underscore: boot.bundlePath + 'bower_components/underscore/underscore' +
      boot.dashSuffix,
    backbone: boot.bundlePath + 'legacy/external/backbone' + boot.suffix,
    'backbone.relational': boot.bundlePath + 'legacy/normalizers/backbone.relational.injector',
    'backbone.relational.core': boot.bundlePath + 'bower_components/backbone-relational/backbone-relational',

    /* jQuery */
    'jquery-sandbox': boot.bundlePath + 'normalizers/jquery.sandbox' +
      boot.suffix,
    jquery: boot.bundlePath + 'bower_components/jquery/dist/jquery' +
      boot.suffix
  }
})

// Initializer
// -----------

/* global boot, requirejs, require */

// TODO: We need to clone the boot configuration because Require.js will change
// the reference directly

// Configure Require.js
requirejs.config(boot.configuration)

// Begin Warm-Up
require(['stratus'])
