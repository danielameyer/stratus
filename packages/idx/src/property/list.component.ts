// IdxPropertyList Component
// @stratusjs/idx/property/list.component
// <stratus-idx-property-list>
// --------------

// Runtime
import _ from 'lodash'
import {Stratus} from '@stratusjs/runtime/stratus'
import * as angular from 'angular'
import moment from 'moment'

// Angular 1 Modules
import 'angular-material'
import 'angular-sanitize'

// Services
import '@stratusjs/idx/idx'
import {
    CompileFilterOptions,
    IdxService,
    MLSService,
    ObjectWithFunctions,
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
import '@stratusjs/idx/property/details.component'

// Environment
const min = !cookie('env') ? '.min' : ''
const packageName = 'idx'
const moduleName = 'property'
const componentName = 'list'
const localDir = `${Stratus.BaseUrl}${Stratus.DeploymentPath}@stratusjs/${packageName}/src/${moduleName}/`

export type IdxPropertyListScope = angular.IScope & ObjectWithFunctions & {
    elementId: string
    localDir: string
    model: any
    Idx: any
    collection: Collection
    urlLoad: boolean
    searchOnLoad: boolean
    detailsLinkPopup: boolean
    detailsLinkUrl: string
    detailsLinkTarget: '_self' | '_blank'
    detailsTemplate?: string
    query: CompileFilterOptions
    orderOptions: object | any // TODO need to specify
    googleApiKey?: string
    contactName: string
    contactEmail?: string
    contactPhone: string
    disclaimerString: string
    disclaimerHTML: any

    searchProperties(
        query?: CompileFilterOptions,
        refresh?: boolean,
        updateUrl?: boolean
    ): Promise<Collection>
}

Stratus.Components.IdxPropertyList = {
    bindings: {
        elementId: '@',
        tokenUrl: '@',
        detailsLinkPopup: '@',
        detailsLinkUrl: '@',
        detailsLinkTarget: '@',
        detailsTemplate: '@',
        contactEmail: '@',
        contactName: '@',
        contactPhone: '@',
        googleApiKey: '@',
        orderOptions: '@',
        query: '@',
        searchOnLoad: '@',
        template: '@',
        urlLoad: '@'
    },
    controller(
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
        $ctrl.uid = _.uniqueId(_.camelCase(packageName) + '_' + _.camelCase(moduleName) + '_' + _.camelCase(componentName) + '_')
        Stratus.Instances[$ctrl.uid] = $scope
        $scope.elementId = $attrs.elementId || $ctrl.uid
        $scope.localDir = localDir
        if ($attrs.tokenUrl) {
            Idx.setTokenURL($attrs.tokenUrl)
        }
        Stratus.Internals.CssLoader(`${localDir}${$attrs.template || componentName}.component${min}.css`)

        /**
         * All actions that happen first when the component loads
         * Needs to be placed in a function, as the functions below need to the initialized first
         */
        $ctrl.$onInit = async () => {
            $scope.Idx = Idx
            $scope.collection = new Collection({})
            /**
             * Allow query to be loaded initially from the URL
             * type {boolean}
             */
            $scope.urlLoad = $attrs.urlLoad && isJSON($attrs.urlLoad) ? JSON.parse($attrs.urlLoad) : true
            $scope.searchOnLoad = $attrs.searchOnLoad && isJSON($attrs.searchOnLoad) ? JSON.parse($attrs.searchOnLoad) : true
            /** type {boolean} */
            $scope.detailsLinkPopup = $attrs.detailsLinkPopup && isJSON($attrs.detailsLinkPopup) ?
                JSON.parse($attrs.detailsLinkPopup) : true
            /** type {string} */
            $scope.detailsLinkUrl = $attrs.detailsLinkUrl || '/property/details'
            /** type {string} */
            $scope.detailsLinkTarget = $attrs.detailsLinkTarget || '_self'
            /** type {string|null} */
            $scope.detailsTemplate = $attrs.detailsTemplate || null

            // TODO added backwards compatible options <--> query parameter until the next version
            $scope.query = $attrs.query && isJSON($attrs.query) ? JSON.parse($attrs.query) :
                $attrs.options && isJSON($attrs.options) ? JSON.parse($attrs.options) : {}
            // $scope.query = $attrs.query && isJSON($attrs.query) ? JSON.parse($attrs.query) : {}

            $scope.query.service = $scope.query.service || []
            $scope.query.order = $scope.query.order || null // will be set by Service
            $scope.query.page = $scope.query.page || null // will be set by Service
            $scope.query.perPage = $scope.query.perPage || 25
            $scope.query.images = $scope.query.images || {limit: 1}

            // Remove invalid variable types to prevent breaking formating
            if (_.isArray($scope.query.order)) {
                delete $scope.query.order
            }
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

            $scope.orderOptions = $scope.orderOptions || {
                'Price (high to low)': '-ListPrice',
                'Price (low to high)': 'ListPrice'
            }

            $scope.googleApiKey = $attrs.googleApiKey || null
            $scope.contactName = $attrs.contactName || null
            $scope.contactEmail = $attrs.contactEmail || null
            $scope.contactPhone = $attrs.contactPhone || null

            $scope.disclaimerString = 'Loading...'
            $scope.disclaimerHTML = $sce.trustAsHtml(`<span>${$scope.disclaimerString}</span>`)

            // Register this List with the Property service
            Idx.registerListInstance($scope.elementId, $scope)

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
                if (
                    // urlQuery.hasOwnProperty('Listing') &&
                    urlQuery.Listing.service &&
                    urlQuery.Listing.ListingKey
                ) {
                    $scope.displayPropertyDetails(urlQuery.Listing)
                }
            }

            if ($scope.searchOnLoad) {
                const searchQuery: CompileFilterOptions = {
                    where: _.clone(urlQuery.Search) as WhereOptions
                }
                delete searchQuery.where.Page
                delete searchQuery.where.Order
                await $scope.searchProperties(searchQuery, true, false)
            }
        }

        $scope.$watch('collection.models', () => { // models?: []
            if ($scope.collection.completed) {
                $ctrl.processMLSDisclaimer() // TODO force reset with true?
            }
        })

        /**
         * Inject the current URL settings into any attached Search widget
         * Due to race conditions, sometimes the List made load before the Search, so the Search will also check if it's missing any values
         */
        $scope.refreshSearchWidgetOptions = async (): Promise<void> => {
            const searchScopes: any[] = Idx.getListInstanceLinks($scope.elementId)
            searchScopes.forEach((searchScope) => {
                if (Object.prototype.hasOwnProperty.call(searchScope, 'setQuery')) {
                    // FIXME search widgets may only hold certain values. Later this needs to be adjusted
                    //  to only update the values in which a user can see/control
                    // console.log('refreshSearchWidgetOptions Idx.getUrlOptions', _.clone(Idx.getUrlOptions('Search')))
                    // searchScope.setWhere(Idx.getUrlOptions('Search')) // FIXME this needs to just set query.where
                    searchScope.setQuery($scope.query)
                    searchScope.listInitialized = true
                }
            })
        }

        /**
         * Functionality called when a search widget runs a query after the page has loaded
         * may update the URL query, so it may not be ideal to use on page load
         * TODO Idx needs to export search query interface
         * Returns Collection
         */
        $scope.searchProperties = async (
            query?: CompileFilterOptions,
            refresh?: boolean,
            updateUrl?: boolean
        ): Promise<Collection> =>
            $q((resolve: any) => {
                query = query || _.clone($scope.query) || {}
                query.where = query.where || {}

                let where: UrlWhereOptions = _.clone(query.where) || {}
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
                    where = _.clone($scope.query.where) || {}
                }

                // Page checks
                // If a different page, set it in the URL
                if (query.page) {
                    $scope.query.page = query.page
                }
                // If refreshing, reset to page 1
                if (refresh) {
                    $scope.query.page = 1
                }
                if ($scope.query.page) {
                    where.Page = $scope.query.page
                }
                // Don't add Page/1 to the URL
                if (where.Page <= 1) {
                    delete (where.Page)
                }

                if (query.order) {
                    $scope.query.order = query.order
                    // delete ($scope.query.where.Order)
                }
                if ($scope.query.order && $scope.query.order.length > 0) {
                    where.Order = $scope.query.order
                }

                if (query.service) {
                    // service does not affect URLs as it's a page specific thing
                    $scope.query.service = query.service
                }

                // FIXME handle service

                // console.log('setting this URL', _.clone(where))
                // console.log('$scope.query.where ending with', _.clone($scope.query.where))
                // Set the URL query
                Idx.setUrlOptions('Search', where)
                // TODO need to avoid adding default variables to URL (Status/order/etc)

                if (updateUrl) {
                    // console.log('$ctrl.defaultQuery being set', $ctrl.defaultQuery)
                    // Display the URL query in the address bar
                    Idx.refreshUrlOptions($ctrl.defaultQuery)
                }

                // Keep the Search widgets up to date
                $scope.refreshSearchWidgetOptions()

                // Grab the new property listings
                resolve(Idx.fetchProperties($scope, 'collection', $scope.query, refresh))
            })

        /**
         * Move the displayed listings to a different page, keeping the current query
         * @param pageNumber - The page number
         * @param ev - Click event
         */
        $scope.pageChange = async (pageNumber: number, ev?: any): Promise<void> => {
            if (ev) {
                ev.preventDefault()
            }
            $scope.query.page = pageNumber
            await $scope.searchProperties()
        }

        /**
         * Move the displayed listings to the next page, keeping the current query
         * @param ev - Click event
         */
        $scope.pageNext = async (ev?: any): Promise<void> => {
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
            if (ev) {
                ev.preventDefault()
            }
            $scope.query.order = order
            await $scope.searchProperties(null, true, true)
        }

        /**
         * Return a string path to a particular property listing
         * TODO Idx needs a Property interface
         */
        $scope.getDetailsURL = (property: object | any): string =>
            $scope.detailsLinkUrl + '#!/Listing/' + property._ServiceId + '/' + property.ListingKey + '/'

        /**
         * Returns the processed street address
         * (StreetNumberNumeric / StreetNumber) + StreetDirPrefix + StreetName + StreetSuffix +  StreetSuffixModifier
         * +  StreetDirSuffix + 'Unit' + UnitNumber
         */
        $scope.getStreetAddress = (property: object | any): string => {
            if (
                Object.prototype.hasOwnProperty.call(property, 'UnparsedAddress') &&
                property.UnparsedAddress !== ''
            ) {
                return property.UnparsedAddress
                // address = property.UnparsedAddress
                // console.log('using unparsed ')
            } else {
                const addressParts: string[] = []
                if (
                    Object.prototype.hasOwnProperty.call(property, 'StreetNumberNumeric') &&
                    _.isNumber(property.StreetNumberNumeric) &&
                    property.StreetNumberNumeric > 0
                ) {
                    addressParts.push(property.StreetNumberNumeric)
                } else if (
                    Object.prototype.hasOwnProperty.call(property, 'StreetNumber') &&
                    property.StreetNumber !== ''
                ) {
                    addressParts.push(property.StreetNumber)
                }
                [
                    'StreetDirPrefix',
                    'StreetName',
                    'StreetSuffix',
                    'StreetSuffixModifier',
                    'StreetDirSuffix',
                    'UnitNumber'
                ]
                    .forEach((addressPart) => {
                        if (Object.prototype.hasOwnProperty.call(property, addressPart)) {
                            if (addressPart === 'UnitNumber') {
                                addressParts.push('Unit')
                            }
                            addressParts.push(property[addressPart])
                        }
                    })
                return addressParts.join(' ')
            }
        }

        /**
         * @param reset - set true to force reset
         */
        $scope.getMLSVariables = (reset?: boolean): MLSService[] => {
            // TODO this might need to be reset at some point
            if (!$ctrl.mlsVariables || reset) {
                $ctrl.mlsVariables = Idx.getMLSVariables()
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

        /**
         * Process an MLS' required legal disclaimer to later display
         * @param reset - set true to force reset
         * TODO Idx needs to supply MLSVariables interface
         */
        $ctrl.processMLSDisclaimer = (reset?: boolean): void => {
            const services: MLSService[] = $scope.getMLSVariables(reset)
            let disclaimer = ''
            services.forEach(service => {
                if (disclaimer) {
                    disclaimer += '<br>'
                }
                if (service.fetchTime.Property) {
                    disclaimer += `Last checked ${moment(service.fetchTime.Property).format('M/D/YY h:mm a')}. `
                } else if ($scope.collection.meta.data.fetchDate) {
                    disclaimer += `Last checked ${moment($scope.collection.meta.data.fetchDate).format('M/D/YY')}. `
                }
                disclaimer += service.disclaimer
            })

            $scope.disclaimerString = disclaimer
            $scope.disclaimerHTML = $sce.trustAsHtml(disclaimer)
        }

        /**
         * Display an MLS' required legal disclaimer
         * @param html - if output should be HTML safe
         */
        $scope.getMLSDisclaimer = (html?: boolean): string => html ? $ctrl.disclaimerHTML : $ctrl.disclaimerString

        /**
         * Either popup or load a new page with the
         * @param property property object
         * @param ev - Click event
         */
        $scope.displayPropertyDetails = (property: object | any, ev?: any): void => {
            if (ev) {
                ev.preventDefault()
                // ev.stopPropagation()
            }
            if ($scope.detailsLinkPopup === true) {
                // Opening a popup will load the propertyDetails and adjust the hashbang URL
                const templateOptions: {
                    'element-id': string,
                    service: number,
                    'listing-key': string,
                    'default-list-options': string,
                    'page-title': boolean,
                    'google-api-key'?: string,
                    'contact-name'?: string,
                    'contact-email'?: string,
                    'contact-phone'?: string,
                    template?: string,
                    'url-load'?: boolean,
                } = {
                    'element-id': 'property_detail_popup_' + property.ListingKey,
                    service: property._ServiceId,
                    'listing-key': property.ListingKey,
                    'default-list-options': JSON.stringify($ctrl.defaultQuery),
                    'page-title': true, // update the page title
                    'url-load': $scope.urlLoad
                }
                if ($scope.googleApiKey) {
                    templateOptions['google-api-key'] = $scope.googleApiKey
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
                if ($scope.detailsTemplate) {
                    templateOptions.template = $scope.detailsTemplate
                }

                let template =
                    `<md-dialog aria-label="${property.ListingKey}" class="stratus-idx-property-list-dialog">` +
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
                                $timeout(() => Idx.unregisterDetailsInstance('property_detail_popup'), 10)
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
                        $timeout(() => Idx.unregisterDetailsInstance('property_detail_popup'), 10)
                    })
            } else {
                $window.open($scope.getDetailsURL(property), $scope.detailsLinkTarget)
            }
        }

        /**
         * Destroy this widget
         */
        $scope.remove = (): void => {
        }
    },
    templateUrl: ($attrs: angular.IAttributes): string => `${localDir}${$attrs.template || componentName}.component${min}.html`
}
