// Angular Core
import {
    registerLocaleData
} from '@angular/common'
import {
    HttpClientModule
} from '@angular/common/http'
import {
    ApplicationRef,
    ComponentFactory,
    NgModule
} from '@angular/core'
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms'
import {
    MatNativeDateModule
} from '@angular/material/core'
import {
    BrowserModule
} from '@angular/platform-browser'
import {
    BrowserAnimationsModule
} from '@angular/platform-browser/animations'

// Angular Locales
// import localeFr from '@angular/common/locales/fr'
// import localeEs from '@angular/common/locales/es'

// Register Locales
// registerLocaleData(localeFr, 'fr-FR')
// registerLocaleData(localeEs, 'es-ES')

// Stratus Modules
import {
    MaterialModules
} from '@stratusjs/angular/material'

// Stratus Core Components
import {
    BaseComponent
} from '@stratusjs/angular/base/base.component'

// Stratus Custom Components
import {
    EditorComponent
} from '@stratusjs/angular/editor/editor.component'
import {
    SelectorComponent
} from '@stratusjs/angular/selector/selector.component'
import {
    TreeComponent
} from '@stratusjs/angular/tree/tree.component'
import {
    TreeDialogComponent
} from '@stratusjs/angular/tree/tree-dialog.component'
import {
    TreeNodeComponent
} from '@stratusjs/angular/tree/tree-node.component'

// Angular Components
import {
    QuillModule
} from 'ngx-quill'

// External Dependencies
import _ from 'lodash'
import {
    Stratus
} from '@stratusjs/runtime/stratus'

// Dynamic Loader Prototype
// import {
//     AngularModules
// } from '@stratusjs/angular/angular.modules'

// let roster: {};
// roster = {
//     // 'sa-base': BaseComponent,
//     'sa-selector': SelectorComponent,
//     'sa-tree': TreeComponent
// };
//
// const bootstrap = _.keys(roster)
//     .map(component => {
//         const elements = document.getElementsByTagName(component);
//         if (!elements || !elements.length) {
//             return null;
//         }
//         return component;
//     })
//     .filter((item) => !!item)
//     .map((element) => _.get(roster, element) || null)
//     .filter((item) => !!item);

@NgModule({
    imports: [
        // AngularModules,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        MaterialModules,
        MatNativeDateModule,
        ReactiveFormsModule,
        QuillModule.forRoot({
            modules: {
                // syntax: true,
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                    ['blockquote', 'code-block'],

                    [{ header: 1 }, { header: 2 }],               // custom button values
                    [{ list: 'ordered'}, { list: 'bullet' }],
                    [{ script: 'sub'}, { script: 'super' }],      // superscript/subscript
                    [{ indent: '-1'}, { indent: '+1' }],          // outdent/indent
                    [{ direction: 'rtl' }],                         // text direction

                    [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],

                    [{ color: [] }, { background: [] }],          // dropdown with defaults from theme
                    [{ font: [] }],
                    [{ align: [] }],

                    ['clean'],                                         // remove formatting button

                    ['link', 'image', 'video']                         // link and image, video
                ]
            }
        })
        // SelectorComponent.forRoot()
    ],
    entryComponents: [
        BaseComponent,
        EditorComponent,
        SelectorComponent,
        TreeComponent,
        TreeDialogComponent,
        TreeNodeComponent,
    ],
    declarations: [
        BaseComponent,
        EditorComponent,
        SelectorComponent,
        TreeComponent,
        TreeDialogComponent,
        TreeNodeComponent,
    ],
    // bootstrap,
    providers: []
})
export class AppModule {
    // node: true || false
    initialTimeout = 1000
    instances = {}
    modules = {
        'sa-base': BaseComponent,
        'sa-editor': EditorComponent,
        'sa-selector': SelectorComponent,
        'sa-tree': TreeComponent
    }
    constructor() {
        Stratus.Instances[_.uniqueId('sa_app_module_')] = this
    }
    ngDoBootstrap(appRef: ApplicationRef) {
        this.detectBoot(appRef)
    }
    // Fade out detection cycles
    exponentialTimeout(limit?: number) {
        if (_.isNumber(limit) && limit < this.initialTimeout) {
            return limit
        }
        // store current
        const currentTimeout = this.initialTimeout
        // increase amount
        this.initialTimeout = this.initialTimeout * 1.01
        // return
        return currentTimeout
    }
    detectBoot(appRef: ApplicationRef) {
        _.forEach(this.modules, (module, selector) => {
            // if (!(module instanceof ComponentFactory)) {
            //     return;
            // }
            const elements = document.getElementsByTagName(selector)
            if (!elements || !elements.length) {
                return
            }
            _.forEach(elements, (node) => {
                if (node.hasAttribute('ng-version')) {
                    return
                }
                // console.log('ngDoBootstrap detected:', node);
                // FIXME: The Modules aren't explicitly the correct type
                // @ts-ignore
                appRef.bootstrap(module, node)
            })
        })
        setTimeout(() => {
            this.detectBoot(appRef)
        }, this.exponentialTimeout(4000))
    }
}
