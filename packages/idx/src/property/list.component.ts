/**
 * @file IdxPropertyList Component @stratusjs/idx/property/list.component
 * @example <stratus-idx-property-list>
 * @see https://github.com/Sitetheory/stratus/wiki/Idx-Property-List-Widget
 */

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'
// import moment from 'moment'

// Angular 1 Modules
import 'angular-material'
import 'angular-sanitize'

// Angular+ Modules
import {MarkerSettings} from '@stratusjs/map/map.component'

// Services
import '@stratusjs/idx/idx'
// tslint:disable-next-line:no-duplicate-imports
import {
    CompileFilterOptions,
    IdxEmitter,
    IdxListScope,
    IdxService,
    MLSService,
    Property,
    WhereOptions,
    UrlWhereOptions,
    UrlsOptionsObject
} from '@stratusjs/idx/idx'

// Stratus Dependencies
import {Collection} from '@stratusjs/angularjs/services/collection' // Needed as Class

import {isJSON} from '@stratusjs/core/misc'
import {cookie} from '@stratusjs/core/environment'

// Stratus Directives
import 'stratus.directives.src'

// Component Preload
import '@stratusjs/idx/disclaimer/disclaimer.component'
import '@stratusjs/idx/property/details.component'
import '@stratusjs/idx/map/map.component'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'property'
const componentName = 'list'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

type OrderOptions = {
    [key: string]: string[]
}
type OrderOption = {
    name: string,
    value: string[]
}

export type IdxPropertyListScope = IdxListScope<Property> & {
    initialized: boolean
    tokenLoaded: boolean
    urlLoad: boolean
    searchOnLoad: boolean
    detailsLinkPopup: boolean
    detailsLinkUrl: string
    detailsLinkTarget: 'popup' | '_self' | '_blank'
    detailsHideVariables?: string[]
    advancedSearchUrl: string,
    advancedSearchLinkName: string,
    preferredStatus: 'Closed' | 'Leased' | 'Rented'
    detailsTemplate?: string
    query: CompileFilterOptions
    orderOptions: OrderOption[]
    displayOrderOptions: boolean
    googleApiKey?: string
    contactName: string
    contactEmail?: string
    contactPhone: string
    instancePath: string
    mapMarkers: MarkerSettings[]
    displayPerRow: number,
    displayPerRowText: string,

    getDetailsURL(property: Property): string
    getGoogleMapsKey(): string | null
    getMLSName(serviceId: number): string
    getMLSVariables(reset?: boolean): MLSService[]
    getOrderName(): string
    getOrderOptions(): { [key: string]: string[] }
    getStreetAddress(property: Property): string
    hasQueryChanged(): boolean
    pageChange(pageNumber: number, ev?: any): Promise<void>
    pageNext(ev?: any): Promise<void>
    pagePrevious(ev?: any): Promise<void>
    orderChange(order: string | string[], ev?: any): Promise<void>
    searchProperties(
        query?: CompileFilterOptions,
        refresh?: boolean,
        updateUrl?: boolean
    ): Promise<Collection<Property>>
}

Stratus.Components.IdxPropertyList = {
    /** @see https://github.com/Sitetheory/stratus/wiki/Idx-Property-List-Widget#Widget_Parameters */
    bindings: {
        /**
         * Type: string
         * To be targeted and controllable with the Search widget, a `element-id` must be defined. This value will be
         * the same as the Search widget's `list-id` (See Property Search). Multiple Search widgets may attach to the
         * same List widget but, a Search widget may only control a single List widget.
         */
        elementId: '@',
        /**
         * Type: boolean
         * Two-way bound option. When needing to provide data/options to this widget in an async environment, this
         * initialization can be delayed by supplying a bound variable to notify when the data is ready.
         * @example `init-now="model.completed"`
         */
        initNow: '=',
        /**
         * Type: string
         * To determine what datasources the Idx widgets are able to pull from and their temporary credentials, a
         * `token-url` directs to the location that manages this widget's subscription and provides what Idx servers it
         * has access to.
         */
        tokenUrl: '@',
        /**
         * Type: string
         * For map support, client will need to provide a Google Maps Api key. With current functionality, just the free
         * api key with iFrame support will do.
         */
        googleApiKey: '@',
        /**
         * Type: boolean
         * Default: true
         * By default, will have a dialog popup of a Listing displayed onto the current page when a listing is clicked.
         * If set to false, will load a new dedicated window with search options to load details for the selected listing.
         * Further controlled and overwritten with `details-link-url` and `details-link-target`
         */
        detailsLinkPopup: '@',
        /**
         * Type: string
         * If ever opening a listing not as a popup, will define the URL path to the Details widget.
         */
        detailsLinkUrl: '@',
        /**
         * Type: string
         * Default: 'popup'
         * If ever opening a listing not as a popup, will define how to open the page as a normal link. Any usable HTML
         * '_target' attribute such as '_self' or '_blank'.
         * Will define how to open a listing. Any usable HTML 'target' attribute such as 'popup', 'self' or
         * 'blank'. Being '_self' or '_blank' will automatically disable `details-link-popup` above.
         */
        detailsLinkTarget: '@',
        /**
         * Type: string[]
         * Hide specific Details of Listings when using the Popup.
         */
        detailsHideVariables: '@',
        /**
         * Type: string
         * Default: 'details'
         * The file name in which is loaded for the view of the Details widget. The name will automatically be appended
         * with '.component.min.html'. The default is `'details.component.html'` / `'details'`. This view only  is used
         * if a popup appears rather than loading the Details widget on a fresh page.
         * TODO: Will need to allow setting a custom path of views outside the library directory.
         */
        detailsTemplate: '@',
        /**
         * Type: string
         * Default: ''
         * A link to another dedicated advanced search page (used when this is a module)
         */
        advancedSearchUrl: '@',
        /**
         * Type: string
         * Default: 'Advanced Search'
         * An alternative name for the advanced search button.
         */
        advancedSearchLinkName: '@',
        /**
         * Type: string
         * Default: 'Closed'
         * The displayed status name of 'Closed' (sold/leased/auctioned) listings by default will be 'Closed'. Update this
         * option to make use of a different term in both the list and popup Details.
         */
        preferredStatus: '@',
        /**
         * Type: string
         * If used, expects a string to identify the name of a point of contact. (such as office or person). Parameter
         * will be passed to any Details popups.
         */
        contactName: '@',
        /**
         * Type: string
         * If used, expects full email address to publicly display and generate a clickable link for. Parameter will
         * be passed to any Details popups.
         */
        contactEmail: '@',
        /**
         * Type: string
         * If used, expects normalize phone number to publicly display and generate a tap-able link for. Parameter will
         * be passed to any Details popups.
         */
        contactPhone: '@',
        /**
         * Type: string
         * Default: 'list'
         * The file name in which is loaded for the view of the widget. The name will automatically be appended with
         * `'.component.min.html'`. The default is `'list.component.html'` / `'list'`.
         * TODO: Will need to allow setting a custom path of views outside the library directory.
         */
        template: '@',
        /**
         * Type: json
         * The possible orders displayed as a user selectable option.
         * Defaults to
         * {
         *  'Price (high to low)': '-ListPrice',
         *  'Price (low to high)': 'ListPrice'
         * }
         */
        orderOptions: '@',
        /**
         * Type: boolean
         * Default: true
         * Allow query to be loaded initially from the URL. Disable this for times you don't want a url to either control
         * the displayed listings (or be able to share a defined search URL).
         */
        urlLoad: '@',
        /**
         * Type: boolean
         * Default: true
         * On widget load, immediately attempt to search for and display the current query results. Disable this for times
         * that you wish to not populate results until a user performs an action such as clicking a button.
         */
        searchOnLoad: '@',
        /**
         * Type: json
         * In place of `query` above, individual query properties may also be added to where`, `service`, `per-page` and `order`
         * @see https://github.com/Sitetheory/stratus/wiki/Idx-Package-Usage#Query_Options
         */
        query: '@',
        /** Type: string */
        queryOrder: '@',
        /** Type: number Default: 25 */
        queryPerPage: '@',
        /** Type: number[] */
        queryService: '@',
        /** Type: json */
        queryWhere: '@',
        /**
         * Type: boolean
         * Default: false
         * When enabled, will attempt to hide the disclaimer within this List, so long as the IDX used's disclaimer is
         * detected else on the page via the stratusIdxDisclaimer widget.
         * @see Docs coming soon
         */
        hideDisclaimer: '@',
        /**
         * Type: boolean
         * Default: true
         * By default, it will display the sort dropdown.
         */
        displayOrderOptions: '@',
        /**
         * Type: number
         * Default: 2
         * Set the number of rows to display in a List (if the template supports this option). This updates the textual option
         */
        displayPerRow: '@',
        /**
         * Type: string
         * Default: 'two'
         * Set the number of rows to display in a List (if the template supports this option). This updates the numeral option
         */
        displayPerRowText: '@',
        /**
         * Type: boolean
         * Default: true
         * @deprecated Pager already gets hidden so long as correct number of results is requested
         */
        displayPager: '@',
    },
    controller(
        $anchorScroll: angular.IAnchorScrollService,
        $attrs: angular.IAttributes,
        $q: angular.IQService,
        $mdDialog: angular.material.IDialogService,
        $scope: IdxPropertyListScope,
        $timeout: angular.ITimeoutService,
        $window: angular.IWindowService,
        $sce: angular.ISCEService,
        Idx: IdxService,
    ) {
        // Initialize
        const $ctrl = this
        /*$ctrl.uid = $attrs.uid && !_.isEmpty($attrs.uid) ? $attrs.uid :
            _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(moduleName) + '_' + _.camelCase(componentName) + '_')
         */
        $scope.localDir = localDir
        $scope.initialized = false
        if ($attrs.tokenUrl) {
            Idx.setTokenURL($attrs.tokenUrl)
            $scope.tokenLoaded = true
        }

        /**
         * All actions that happen first when the component loads
         * Needs to be placed in a function, as the functions below need to the initialized first
         */
        const init = async () => {
            $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(moduleName) + '_' + _.camelCase(componentName) + '_')
            $scope.elementId = $attrs.elementId || $ctrl.uid
            Stratus.Instances[$scope.elementId] = $scope
            $scope.instancePath = `Stratus.Instances.${$scope.elementId}`
            if (!$scope.tokenLoaded && $attrs.tokenUrl) {
                Idx.setTokenURL($attrs.tokenUrl)
            }
            Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`)

            /**
             * Allow query to be loaded initially from the URL
             */
            $scope.urlLoad = $attrs.urlLoad && isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : true
            $scope.searchOnLoad = $attrs.searchOnLoad && isJSON($attrs.searchOnLoad) ? JSON.parse($attrs.searchOnLoad) : true
            $scope.detailsLinkUrl = $attrs.detailsLinkUrl || ''
            $scope.detailsLinkTarget = $attrs.detailsLinkTarget || 'popup' // Popup by default
            $scope.detailsLinkPopup =
                // If detailsLinkPopup manually set, we'll use that.
                $attrs.detailsLinkPopup && isJSON($attrs.detailsLinkPopup) ? JSON.parse($attrs.detailsLinkPopup) :
                    // Otherwise, well check if detailsLinkTarget if using 'popup' or something else
                    $scope.detailsLinkTarget === 'popup'
            $scope.detailsHideVariables = $attrs.detailsHideVariables && isJSON($attrs.detailsHideVariables) ?
                JSON.parse($attrs.detailsHideVariables) : []
            $scope.detailsTemplate = $attrs.detailsTemplate || null
            $scope.advancedSearchUrl = $attrs.advancedSearchUrl || ''
            $scope.advancedSearchLinkName = $attrs.advancedSearchLinkName || 'Advanced Search'
            $scope.preferredStatus = $attrs.preferredStatus || 'Closed' // Closed is most compatible

            $scope.query = $attrs.query && isJSON($attrs.query) ? JSON.parse($attrs.query) : {}
            // $scope.query = $attrs.query && isJSON($attrs.query) ? JSON.parse($attrs.query) : {}

            $scope.query.service = $attrs.queryService && isJSON($attrs.queryService) ?
                JSON.parse($attrs.queryService) : $scope.query.service || []
            // If string, check if a json and parse first. Otherwise be null or what it is
            $scope.query.order =
                $scope.query.order && _.isString($scope.query.order) && isJSON($scope.query.order) ? JSON.parse($scope.query.order) :
                    $attrs.queryOrder && isJSON($attrs.queryOrder) ? JSON.parse($attrs.queryOrder) : $scope.query.order || null
            $scope.query.page = $scope.query.page || null // will be set by Service
            $scope.query.perPage = $scope.query.perPage ||
                ($attrs.queryPerPage && _.isString($attrs.queryPerPage) ? parseInt($attrs.queryPerPage, 10) : null) ||
                ($attrs.queryPerPage && _.isNumber($attrs.queryPerPage) ? $attrs.queryPerPage : null) ||
                25
            $scope.query.where = $attrs.queryWhere && isJSON($attrs.queryWhere) ? JSON.parse($attrs.queryWhere) : $scope.query.where || []
            $scope.query.images = $scope.query.images || {limit: 1}

            // Handle row displays
            $scope.displayPerRow = 2
            $scope.displayPerRowText = 'two'
            if ($attrs.displayPerRowText && _.isString($attrs.displayPerRowText)) {
                $scope.displayPerRowText = $attrs.displayPerRowText
                $scope.displayPerRow = $scope.displayPerRowText === 'one' ? 1 : $scope.displayPerRowText === 'two' ? 2 :
                    $scope.displayPerRowText === 'three' ? 3 : $scope.displayPerRowText === 'four' ? 4 : 2
            } else if ($attrs.displayPerRow && (_.isString($attrs.displayPerRow) || _.isNumber($attrs.displayPerRow))) {
                $scope.displayPerRow = _.isString($attrs.displayPerRow) ? parseInt($attrs.displayPerRow, 10) : $attrs.displayPerRow
                $scope.displayPerRowText = $scope.displayPerRow === 1 ? 'one' : $scope.displayPerRow === 2 ? 'two' :
                    $scope.displayPerRow === 3 ? 'three' : $scope.displayPerRow === 4 ? 'four' : 'two'
            }

            $scope.displayOrderOptions = $attrs.displayOrderOptions && isJSON($attrs.displayOrderOptions) ?
                JSON.parse($attrs.displayOrderOptions) : true
            $scope.displayPager =
                $attrs.displayPager ? (isJSON($attrs.displayPager) ? JSON.parse($attrs.displayPager) :
                    $attrs.displayPager) : true
            $scope.hideDisclaimer = $attrs.hideDisclaimer && isJSON($attrs.hideDisclaimer) ?
                JSON.parse($attrs.hideDisclaimer) : false

            if (_.isArray($scope.query.where)) {
                delete $scope.query.where
            }
            /* List of default or blank values */
            const startingQuery: WhereOptions = $scope.query.where || {}
            // If these are blank, set some defaults
            startingQuery.Status = startingQuery.Status || ['Active', 'Contract']
            startingQuery.ListingType = startingQuery.ListingType || ['House', 'Condo']
            $scope.query.where = _.extend(Idx.getDefaultWhereOptions(), startingQuery || {})

            $ctrl.defaultQuery = JSON.parse(JSON.stringify($scope.query.where)) // Extend/clone doesn't work for arrays
            $ctrl.lastQuery = {}
            // Need to include Order
            if ($scope.query.order) {
                $ctrl.defaultQuery.Order = $scope.query.order
            }

            $scope.orderOptions = $scope.orderOptions || [
                {name: 'Highest Price', value: ['-BestPrice']},
                {name: 'Lowest Price', value: ['BestPrice']},
                {name: 'Recently Updated', value: ['-ModificationTimestamp']},
                {name: 'Recently Sold', value: ['-CloseDate']},
                {name: 'Status', value: ['Status', '-BestPrice']}
            ]

            $scope.googleApiKey = $attrs.googleApiKey || null
            $scope.contactName = $attrs.contactName || null
            $scope.contactEmail = $attrs.contactEmail || null
            $scope.contactPhone = $attrs.contactPhone || null

            $scope.mapMarkers = []

            // Register this List with the Property service
            Idx.registerListInstance($scope.elementId, moduleName, $scope)

            let urlQuery: UrlsOptionsObject = {
                Listing: {},
                Search: {}
            }

            if ($scope.urlLoad) {
                // first set the UrlQuery via defaults (cloning so it can't be altered)
                Idx.setUrlOptions('Search', JSON.parse(JSON.stringify($ctrl.defaultQuery)))
                // Load Query from the provided URL settings
                urlQuery = Idx.getOptionsFromUrl()
                // If a specific listing is provided, be sure to pop it up as well
                // console.log('urlQuery', _.clone(urlQuery))
                if (
                    urlQuery.hasOwnProperty('Listing') &&
                    // urlQuery.Listing.service &&
                    urlQuery.Listing.hasOwnProperty('service') &&
                    urlQuery.Listing.ListingKey
                ) {
                    $scope.displayModelDetails((urlQuery.Listing as Property)) // FIXME a quick fix as this contains ListingKey
                }
            }

            if ($scope.searchOnLoad) {
                // console.log('at $scope.searchOnLoad', _.clone(urlQuery.Search))
                const searchQuery: CompileFilterOptions = {
                    where: _.clone(urlQuery.Search) as WhereOptions
                }
                // delete searchQuery.where.Page
                // delete searchQuery.where.Order
                // console.log('about to searchProperties for', _.clone(searchQuery))
                await $scope.searchProperties(searchQuery, false, false)
            }

            $scope.$applyAsync(() => {
                $scope.initialized = true
                Idx.emit('init', $scope)
            })
        }

        // Initialization by Event
        $ctrl.$onInit = () => {
            $scope.Idx = Idx
            $scope.collection = new Collection<Property>({})

            let initNow = true
            if (Object.prototype.hasOwnProperty.call($attrs.$attr, 'initNow')) {
                // TODO: This needs better logic to determine what is acceptably initialized
                initNow = isJSON($attrs.initNow) ? JSON.parse($attrs.initNow) : false
            }

            if (initNow) {
                init()
                return
            }

            $ctrl.stopWatchingInitNow = $scope.$watch('$ctrl.initNow', (initNowCtrl: boolean) => {
                if (initNowCtrl !== true) {
                    return
                }
                if (!$scope.initialized) {
                    init()
                }
                $ctrl.stopWatchingInitNow()
            })
        }

        $scope.$watch('collection.models', () => { // models?: []
            if ($scope.collection.completed) {
                Idx.emit('collectionUpdated', $scope, $scope.collection)
            }
        })

        $scope.getPageModels = (): Property[] => {
            // console.log('checking $scope.collection.models', $scope.collection.models)
            const listings: Property[] = []
            // only get the page's models, not every single model in collection
            const models = $scope.collection.models as Property[]
            models.slice(
                ($scope.query.perPage * ($scope.query.page - 1)), // 20 * (1 - 1) = 0. 20 * (2 - 1) = 20
                ($scope.query.perPage * $scope.query.page) // e.g. 20 * 1 = 20. 20 * 2 = 40
            ).forEach((listing) => {
                listings.push(listing)
            })
            return listings
        }

        $scope.scrollToModel = (model: Property): void => {
            $anchorScroll(`${$scope.elementId}_${model._id}`)
        }

        $scope.hasQueryChanged = (): boolean => !_.isEqual(_.clone($ctrl.lastQuery), _.clone($scope.query))

        /**
         * Functionality called when a search widget runs a query after the page has loaded
         * may update the URL query, so it may not be ideal to use on page load
         * TODO Idx needs to export search query interface
         * Returns Collection<Property>
         */
        $scope.searchProperties = async (
            query?: CompileFilterOptions,
            refresh?: boolean,
            updateUrl?: boolean
        ): Promise<Collection<Property>> =>
            $q(async (resolve: any) => {
                if ($scope.collection.pending) {
                    // Do do anything if the collection isn't ready yet
                    // revert to last query as this never fired
                    $scope.query = $ctrl.lastQuery
                    resolve([])
                    return
                }
                query = query || _.clone($scope.query) || {}
                query.where = query.where || {}
                // console.log('searchProperties has query', _.clone(query))

                let urlWhere: UrlWhereOptions = _.clone(query.where) || {}
                // updateUrl = updateUrl === false ? updateUrl : true
                updateUrl = updateUrl === false ? updateUrl : $scope.urlLoad === false ? $scope.urlLoad : true

                // If search query sent, update the Widget. Otherwise use the widgets current where settings
                if (Object.keys(query.where).length > 0) {
                    delete ($scope.query.where) // Remove the current settings
                    // console.log('searchProperties had a query.where with keys')
                    // console.log('searchProperties $scope.query', _.clone($scope.query))
                    // console.log('searchProperties query.where', _.clone(query.where))
                    $scope.query.where = query.where // Add the new settings
                    // FIXME ensure Page doesn't get added here anymore
                    /* if ($scope.query.where.Page) { // removing
                        $scope.query.page = $scope.query.where.Page
                        delete ($scope.query.where.Page)
                    } */

                    // FIXME ensure Order doesn't get added here anymore
                    /* if ($scope.query.where.Order) {
                        $scope.query.order = $scope.query.where.Order
                        delete ($scope.query.where.Order)
                    } */
                } else {
                    // console.log('query.where is blank, so loading', _.clone($scope.query.where))
                    urlWhere = _.clone($scope.query.where) || {}
                }

                // Check and remove incompatible where combinations. Basically if Location or neighborhood are used, remove the others
                if (!_.isEmpty(query.where.Location)) {
                    query.where.City = ''
                    query.where.UnparsedAddress = ''
                    query.where.Neighborhood = []
                    query.where.CityRegion = []
                    query.where.PostalCode = []
                    query.where.MLSAreaMajor = []
                }
                if (!_.isEmpty(query.where.Neighborhood)) {
                    query.where.City = ''
                    query.where.UnparsedAddress = ''
                    query.where.CityRegion = []
                    query.where.PostalCode = []
                    query.where.MLSAreaMajor = []
                }

                // Page checks
                // If a different page, set it in the URL
                // If Page was placed in the where query, let's move it
                if (query.where.page) {
                    query.page = query.where.page
                    delete query.where.page
                }
                if (query.where.Page) {
                    query.page = query.where.Page
                    delete query.where.Page
                }
                if (query.page) {
                    $scope.query.page = query.page
                }
                // If refreshing, reset to page 1
                if (refresh) {
                    $scope.query.page = 1
                }
                if ($scope.query.page) {
                    urlWhere.Page = $scope.query.page
                }
                // Don't add Page/1 to the URL
                if (urlWhere.Page <= 1) {
                    delete (urlWhere.Page)
                }

                // If Order was placed in the where query, let's move it
                if (query.where.order) {
                    query.order = query.where.order
                    delete query.where.order
                }
                if (query.where.Order) {
                    query.order = query.where.Order
                    delete query.where.Order
                }
                if (query.order) {
                    $scope.query.order = query.order
                    // delete ($scope.query.where.Order)
                }
                if ($scope.query.order && $scope.query.order.length > 0) {
                    // console.log('setting where to', _.clone($scope.query.order), 'from', _.clone(where.Order))
                    urlWhere.Order = $scope.query.order
                }

                if (
                    query.hasOwnProperty('service') &&
                    !_.isNil(query.service)
                ) {
                    // service does not affect URLs as it's a page specific thing
                    $scope.query.service = query.service
                }
                if ($scope.hasQueryChanged()) {
                    // console.log('setting this URL', _.clone(urlWhere))
                    // console.log('$scope.query.where ending with', _.clone($scope.query.where))
                    // Set the URL query
                    Idx.setUrlOptions('Search', urlWhere)
                    // TODO need to avoid adding default variables to URL (Status/order/etc)

                    if (updateUrl) {
                        // console.log('$ctrl.defaultQuery being set', $ctrl.defaultQuery)
                        // Display the URL query in the address bar
                        Idx.refreshUrlOptions($ctrl.defaultQuery)
                    }

                    Idx.emit('searching', $scope, _.clone($scope.query))

                    try {
                        // resolve(Idx.fetchProperties($scope, 'collection', $scope.query, refresh))
                        // Grab the new property listings
                        const results = await Idx.fetchProperties($scope, 'collection', $scope.query, refresh)
                        $ctrl.lastQuery = _.clone($scope.query)
                        // $applyAsync will automatically be applied
                        Idx.emit('searched', $scope, _.clone($scope.query))
                        resolve(results)
                    } catch (e) {
                        console.error('Unable to fetchProperties:', e)
                    }
                }
            })

        /**
         * Move the displayed listings to a different page, keeping the current query
         * @param pageNumber - The page number
         * @param ev - Click event
         */
        $scope.pageChange = async (pageNumber: number, ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                return
            }
            Idx.emit('pageChanging', $scope, _.clone($scope.query.page))
            if (ev) {
                ev.preventDefault()
            }
            $scope.query.page = pageNumber
            $anchorScroll($scope.elementId) // Scroll to the top again
            await $scope.searchProperties()
            Idx.emit('pageChanged', $scope, _.clone($scope.query.page))
        }

        /**
         * Move the displayed listings to the next page, keeping the current query
         * @param ev - Click event
         */
        $scope.pageNext = async (ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                return
            }
            if (!$scope.query.page) {
                $scope.query.page = 1
            }
            if ($scope.collection.completed && $scope.query.page < $scope.collection.meta.data.totalPages) {
                if (_.isString($scope.query.page)) {
                    $scope.query.page = parseInt($scope.query.page, 10)
                }
                await $scope.pageChange($scope.query.page + 1, ev)
            }
        }

        /**
         * Move the displayed listings to the previous page, keeping the current query
         * @param ev - Click event
         */
        $scope.pagePrevious = async (ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                return
            }
            if (!$scope.query.page) {
                $scope.query.page = 1
            }
            if ($scope.collection.completed && $scope.query.page > 1) {
                if (_.isString($scope.query.page)) {
                    $scope.query.page = parseInt($scope.query.page, 10)
                }
                const prev = $scope.query.page - 1 || 1
                await $scope.pageChange(prev, ev)
            }
        }

        /**
         * Change the Order/Sorting method and refresh new results
         * @param order -
         * @param ev - Click event
         */
        $scope.orderChange = async (order: string | string[], ev?: any): Promise<void> => {
            if ($scope.collection.pending) {
                // Do do anything if the collection isn't ready yet
                // TODO set old Order back?
                return
            }
            Idx.emit('orderChanging', $scope, _.clone(order))
            if (ev) {
                ev.preventDefault()
            }
            $scope.query.order = order
            await $scope.searchProperties(null, true, true)
            Idx.emit('orderChanged', $scope, _.clone(order))
        }

        $scope.getOrderOptions = (): OrderOptions => {
            const options: OrderOptions = {}
            $scope.orderOptions.forEach((orderOption) => {
                // FIXME these are hard coded checks if Sold
                switch (orderOption.name) {
                    case 'Recently Sold': {
                        if (
                            $scope.query.where.Status &&
                            $scope.query.where.Status.includes('Closed')
                        ) {
                            options[orderOption.name] = orderOption.value
                        }
                        break
                    }
                    case 'Status': {
                        if (
                            $scope.query.where.Status &&
                            $scope.query.where.Status.length > 1
                        ) {
                            options[orderOption.name] = orderOption.value
                        }
                        break
                    }
                    default: {
                        options[orderOption.name] = orderOption.value
                    }
                }
            })

            return options
        }

        $scope.getOrderName = (): string => {
            let name
            if (
                $scope.query.order !== '' &&
                !_.isEmpty($scope.query.order)
            ) {
                for (const index in $scope.orderOptions) {
                    if (
                        $scope.orderOptions.hasOwnProperty(index) &&
                        _.isEqual($scope.orderOptions[index].value, $scope.query.order)
                    ) {
                        name = $scope.orderOptions[index].name
                        break
                    }
                }
            }
            return name
        }

        /**
         * Return a string path to a particular property listing
         * TODO Idx needs a Property interface
         */
        $scope.getDetailsURL = (property: Property): string =>
            $scope.detailsLinkUrl + '#!/Listing/' + property._ServiceId + '/' + property.ListingKey + '/'


        $scope.getStreetAddress = (property: Property): string => $scope.Idx.getStreetAddress(property)

        $scope.getGoogleMapsKey = (): string | null => {
            return $scope.googleApiKey || Idx.getGoogleMapsKey()
        }

        /**
         * @param reset - set true to force reset
         */
        $scope.getMLSVariables = (reset?: boolean): MLSService[] => {
            if (!$ctrl.mlsVariables || reset) {
                $ctrl.mlsVariables = []
                let mlsServicesRequested = null
                // Ensure we are only requesting the services we are using
                if (
                    $scope.query &&
                    (
                        _.isNumber($scope.query.service) ||
                        !_.isEmpty($scope.query.service)
                    )
                ) {
                    if (!_.isArray($scope.query.service)) {
                        $scope.query.service = [$scope.query.service]
                    }
                    mlsServicesRequested = $scope.query.service
                }
                Idx.getMLSVariables(mlsServicesRequested).forEach((service: MLSService) => {
                    $ctrl.mlsVariables[service.id] = service
                })
            }
            return $ctrl.mlsVariables
        }

        /**
         * Display an MLS' Name
         */
        $scope.getMLSName = (serviceId: number): string => {
            const services = $scope.getMLSVariables()
            let name = 'MLS'
            if (services[serviceId]) {
                name = services[serviceId].name
            }
            return name
        }

        $scope.highlightModel = (model: Property, timeout?: number): void => {
            timeout = timeout || 0
            model._unmapped = model._unmapped || {}
            $scope.$applyAsync(() => {
                model._unmapped._highlight = true
            })
            if (timeout > 0) {
                $timeout(() => {
                    $scope.unhighlightModel(model)
                }, timeout)
            }
        }

        $scope.unhighlightModel = (model: Property): void => {
            if (model) {
                model._unmapped = model._unmapped || {}
                $scope.$applyAsync(() => {
                    model._unmapped._highlight = false
                })
            }
        }

        /**
         * Either popup or load a new page with the
         * @param model property object
         * @param ev - Click event
         */
        $scope.displayModelDetails = (model: Property, ev?: any): void => {
            if (ev) {
                ev.preventDefault()
                // ev.stopPropagation()
            }
            if ($scope.detailsLinkPopup === true) {
                // Opening a popup will load the propertyDetails and adjust the hashbang URL
                const templateOptions: {
                    'element-id': string,
                    service: string | number,
                    'listing-key': string,
                    'default-list-options': string,
                    'page-title': boolean,
                    'google-api-key'?: string,
                    'contact-name'?: string,
                    'contact-email'?: string,
                    'contact-phone'?: string,
                    'hide-variables'?: string, // a string array
                    'preferred-status'?: string,
                    template?: string,
                    'url-load'?: boolean,
                } = {
                    'element-id': 'property_detail_popup_' + model.ListingKey,
                    service: model._ServiceId,
                    'listing-key': model.ListingKey,
                    'default-list-options': JSON.stringify($ctrl.defaultQuery),
                    'page-title': true, // update the page title
                    'url-load': $scope.urlLoad
                }
                if ($scope.getGoogleMapsKey()) {
                    templateOptions['google-api-key'] = $scope.getGoogleMapsKey()
                }
                if ($scope.contactName) {
                    templateOptions['contact-name'] = $scope.contactName
                }
                if ($scope.contactEmail) {
                    templateOptions['contact-email'] = $scope.contactEmail
                }
                if ($scope.contactPhone) {
                    templateOptions['contact-phone'] = $scope.contactPhone
                }
                if ($scope.detailsHideVariables.length > 0) {
                    templateOptions['hide-variables'] = JSON.stringify($scope.detailsHideVariables)
                }
                if ($scope.preferredStatus) {
                    templateOptions['preferred-status'] = $scope.preferredStatus
                }
                if ($scope.detailsTemplate) {
                    templateOptions.template = $scope.detailsTemplate
                }

                let template =
                    `<md-dialog aria-label="${model.ListingKey}" class="stratus-idx-property-list-dialog">` +
                    `<div class="popup-close-button-container">` +
                    `<div aria-label="Close Popup" class="close-button" data-ng-click="closePopup()" aria-label="Close Details Popup"></div>` +
                    `</div>` +
                    '<stratus-idx-property-details '
                _.forEach(templateOptions, (optionValue, optionKey) => {
                    template += `data-${optionKey}='${optionValue}'`
                })
                template +=
                    '></stratus-idx-property-details>' +
                    '</md-dialog>'

                $mdDialog.show({
                    template, // equates to `template: template`
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: true, // Only for -xs, -sm breakpoints.
                    scope: $scope,
                    preserveScope: true,
                    // tslint:disable-next-line:no-shadowed-variable
                    controller: ($scope: object | any, $mdDialog: angular.material.IDialogService) => {
                        $scope.closePopup = () => {
                            if ($mdDialog) {
                                $mdDialog.hide()
                                Idx.setUrlOptions('Listing', {})
                                if ($scope.urlLoad) {
                                    Idx.refreshUrlOptions($ctrl.defaultQuery)
                                }
                                // Revert page title back to what it was
                                Idx.setPageTitle()
                                // Let's destroy it to save memory
                                $timeout(() => Idx.unregisterDetailsInstance('property_detail_popup', 'property'), 10)
                            }
                        }
                    }
                })
                    .then(() => {
                    }, () => {
                        Idx.setUrlOptions('Listing', {})
                        if ($scope.urlLoad) {
                            Idx.refreshUrlOptions($ctrl.defaultQuery)
                        }
                        // Revert page title back to what it was
                        Idx.setPageTitle()
                        // Let's destroy it to save memory
                        $timeout(() => Idx.unregisterDetailsInstance('property_detail_popup', 'property'), 10)
                    })
            } else {
                $window.open($scope.getDetailsURL(model), $scope.detailsLinkTarget)
            }
        }

        $scope.on = (emitterName: string, callback: IdxEmitter) => Idx.on($scope.elementId, emitterName, callback)

        $scope.remove = (): void => {
            // TODO need to destroy any attached widgets
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
