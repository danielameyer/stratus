// Angular Core
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit
} from '@angular/core'
import {
    FormBuilder,
    FormGroup
} from '@angular/forms'
import {
    HttpResponse
} from '@angular/common/http'

// Angular Material
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog'
import {
    PageEvent
} from '@angular/material/paginator'

// RXJS
import {
    Observable
} from 'rxjs'
import {
    debounceTime,
    finalize,
    switchMap,
    tap
} from 'rxjs/operators'

// External
import _ from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'

// Services
import {
    BackendService
} from '@stratusjs/angular/backend.service'
import {
    LooseObject
} from '@stratusjs/core/misc'
import {Model} from '@stratusjs/angularjs/services/model'
import {TriggerInterface} from '@stratusjs/angular/core/trigger.interface'

// Local Setup
const installDir = '/assets/1/0/bundles'
const systemDir = '@stratusjs/angular'
const moduleName = 'media-dialog'
const parentModuleName = 'editor'

// Directory Template
const localDir = `${installDir}/${boot.configuration.paths[`${systemDir}/*`].replace(/[^/]*$/, '')}`

/**
 * @title Dialog for Nested Tree
 */
@Component({
    selector: `sa-${moduleName}`,
    templateUrl: `${localDir}/${parentModuleName}/${moduleName}.component.html`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaDialogComponent implements OnInit {

    // Basic Component Settings
    title = moduleName + '_component'
    uid: string

    // Dependencies
    _: any

    // TODO: Move this to its own AutoComplete Component
    // AutoComplete Data
    apiBase = '/Api/Media'
    mediaEntities: any[] = []
    dialogMediaForm: FormGroup
    isMediaLoading = true
    lastMediaQuery: string

    // Pagination Data
    meta: LooseObject
    pageEvent: PageEvent
    limit = 20

    // Model Settings
    model: Model
    property: string

    // Event Settings
    editor: TriggerInterface
    eventManager: TriggerInterface
    eventInsert = true

    // UI Settings
    selected: Array<number> = []

    constructor(
        public dialogRef: MatDialogRef<MediaDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MediaDialogData,
        private fb: FormBuilder,
        private backend: BackendService,
        private ref: ChangeDetectorRef
    ) {
        // Manually render upon data change
        // ref.detach()
    }

    ngOnInit() {
        // Initialization
        this.uid = _.uniqueId(`sa_${moduleName}_component_`)
        Stratus.Instances[this.uid] = this

        // Dependencies
        this._ = _

        // TODO: Assess & Possibly Remove when the System.js ecosystem is complete
        // Load Component CSS until System.js can import CSS properly.
        Stratus.Internals.CssLoader(`${localDir}/${parentModuleName}/${moduleName}.component.css`)

        // Hoist Data
        this.model = this.data.model
        this.property = this.data.property
        this.editor = this.data.editor
        this.eventManager = this.data.eventManager
        if (_.isBoolean(this.data.eventInsert)) {
            this.eventInsert = this.data.eventInsert
        }

        // TODO: Move this to its own AutoComplete Component
        // AutoComplete Logic
        this.dialogMediaForm = this.fb.group({
            mediaQueryInput: ''
        })
        this.dialogMediaForm
            .get('mediaQueryInput')
            .valueChanges
            .pipe(
                debounceTime(300),
                tap(() => {
                    // this.isMediaLoading = true
                }),
                switchMap((value: any) => {
                        return this.getQuery(value)
                    }
                )
            )
            .subscribe((response: HttpResponse<any>) => this.processMedia(response))

        // Initialize Media Query with starter data
        this.getQuery().subscribe(
            (response: HttpResponse<any>) => this.processMedia(response)
        )

        // FIXME: We have to go in this roundabout way to force changes to be detected since the
        // Dialog Sub-Components don't seem to have the right timing for ngOnInit
        this.refresh()
    }

    public refresh() {
        if (!this.ref) {
            console.error('ref not available:', this)
            return
        }
        this.ref.detach()
        this.ref.detectChanges()
        this.ref.reattach()
    }

    onCancelClick(): void {
        this.dialogRef.close()
        this.refresh()
    }

    onPage(event: PageEvent): void {
        this.pageEvent = event
        this.getQuery(this.lastMediaQuery).subscribe(
            (response: HttpResponse<any>) => this.processMedia(response)
        )
    }

    getQueryUrl(query?: string): string {
        let limit = this.limit
        let paging = 1
        if (this.pageEvent) {
            limit = this.pageEvent.pageSize
            paging = this.pageEvent.pageIndex + 1
        }
        query = (_.isString(query) && !_.isEmpty(query)) ? `"${query}"` : ''
        return `${this.apiBase}?limit=${limit}&p=${paging}&q=${query}`
    }

    getQuery(query?: string): Observable<HttpResponse<any>> {
        this.lastMediaQuery = query
        this.isMediaLoading = true
        return this.backend.get(this.getQueryUrl(query))
            .pipe(
                finalize(() => this.isMediaLoading = false),
            )
    }

    processMedia(response: HttpResponse<any>): any[] {
        if (!response.ok || response.status !== 200 || _.isEmpty(response.body)) {
            this.meta = {}
            this.mediaEntities = []
            this.refresh()
            return this.mediaEntities
        }
        this.meta = _.get(response.body, 'meta') || {}
        const payload = _.get(response.body, 'payload') || response.body
        if (_.isEmpty(payload) || !Array.isArray(payload)) {
            this.mediaEntities = []
            this.isMediaLoading = false
            this.refresh()
            return this.mediaEntities
        }
        this.mediaEntities = payload
        this.isMediaLoading = false
        this.refresh()
        return this.mediaEntities
    }

    select(media: Media) {
        if (_.isUndefined(media)) {
            return
        }
        const mediaElement = this.createEmbed(media)
        if (!mediaElement) {
            console.warn(`media-dialog: unable to build html for media id: ${media.id}`)
            return
        }
        this.selected.push(media.id)
        // Add element to the end of the model property
        if (!this.eventInsert) {
            if (!(this.model instanceof Model)) {
                console.warn('media-dialog: event manager not available.')
                return
            }
            if (! _.isString(this.property)) {
                console.warn('media-dialog: event manager not available.')
                return
            }
            console.warn('media-dialog: disabling eventInsert is not recommended.')
            this.model.set(
                this.property,
                this.model.get(this.property) + mediaElement
            )
            return
        }
        if (!this.eventManager) {
            console.warn('media-dialog: event manager is not set.')
            return
        }
        this.eventManager.trigger('media-insert', mediaElement, this.editor)
    }

    isSelected(media: Media) : boolean {
        if (_.isUndefined(media)) {
            return
        }
        return _.includes(this.selected, media.id)
    }

    createEmbed (media: Media) {
        if (_.startsWith(media.mime, 'image')) {
            return `<img src="${media.thumbSrc}" alt="${media.name || media.filename} ${media.mime !== 'image/gif' ? 'data-stratus-src' : ''}">`
        }
        if (media.mime === 'video') {
            if (media.embed) {
                return media.embed
            }
            if (!media.serviceMediaId) {
                console.warn(`media-dialog: unable to find serviceMediaId for video with media id: ${media.id}`)
                return null
            }
            if (media.service === 'vimeo') {
                return `<iframe src="https://player.vimeo.com/video/${media.serviceMediaId}" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen="" frameborder="0"></iframe>`
            }
            if (media.service === 'youtube') {
                return `<iframe src="https://www.youtube.com/embed/${media.serviceMediaId}" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen="" frameborder="0"></iframe>`
            }
            console.warn(`media-dialog: unsupported service: ${media.service} for media id: ${media.id}`)
            return null
        }
        if (_.startsWith(media.mime, 'audio')) {
            return `<audio controls><source src=${media.url}" type="${media.mime}">Your browser does not support the audio element.</audio>`
        }
        if (media.mime === 'application/pdf') {
            return `<iframe src="${media.url}" width="100%"></iframe>`
        }
        if (media.mime === 'application/msword') {
            return `<iframe src="${media.url}" width="100%"></iframe>`
        }
        console.warn(`media-dialog: unsupported mime type: ${media.mime} for media id: ${media.id}`)
        return null
    }
}

// Data Types
export interface MediaDialogData {
    editor: TriggerInterface
    eventManager: TriggerInterface
    eventInsert: boolean
    form: FormGroup,
    model: Model,
    property: string
}
export interface Media extends LooseObject {
    tags?: Array<any>
    images?: Array<any>
    media?: Array<any>
    storageService?: any
    priority?: number
    storageServiceId?: number
    duplicateId?: number
    name: string
    description?: string
    abstract?: any
    embed?: string
    hash: string
    prefix: string
    url?: string
    file: string
    filename: string
    extension: string
    mime: string
    bytes: number
    bytesHuman: string
    ratio: string
    ratioPercent: string
    bestRatio: string
    bestRatioWord: string
    dimensions: string
    service?: any
    serviceMediaId?: number
    meta?: Array<any>
    src: string
    thumbSrc: string
    bestImage?: any
    duration?: any
    autoPlay: boolean
    vr: boolean
    timeCustom?: number
    author?: any
    modules?: Array<any>
    id: number
    siteId?: number
    vendorId?: number
    time: number
    timeEdit: number
    timeStatus?: number
    status: number
    importId?: number
    vendor?: any
    syndicated: number
    isPseudoPriority: boolean
}
