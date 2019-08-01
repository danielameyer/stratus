// Angular Core
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

// Stratus Modules
import {MaterialModules} from '@stratus/angular/material';

// Stratus Core Components
import {BaseComponent} from '@stratus/angular/base/base.component';

// Stratus Custom Components
import {SelectorComponent} from '@stratus/angular/selector/selector.component';
import {TreeComponent, TreeDialogComponent} from '@stratus/angular/tree/tree.component';

// Angular Components
import {QuillModule} from 'ngx-quill';

// External Dependencies
import * as _ from 'lodash';
import * as Stratus from 'stratus';

let roster: {};
roster = {
    // 's2-base': BaseComponent,
    's2-selector': SelectorComponent,
    's2-tree': TreeComponent
};

const bootstrap = _.keys(roster)
    .map(component => {
        const elements = document.getElementsByTagName(component);
        if (!elements || !elements.length) {
            return null;
        }
        return component;
    })
    .filter((item) => !!item)
    .map((element) => _.get(roster, element) || null)
    .filter((item) => !!item);

@NgModule({
    imports: [
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
    ],
    entryComponents: [
        BaseComponent,
        SelectorComponent,
        TreeComponent,
        TreeDialogComponent,
    ],
    declarations: [
        BaseComponent,
        SelectorComponent,
        TreeComponent,
        TreeDialogComponent,
    ],
    bootstrap,
    providers: []
})
export class AppModule {
    constructor() {
        Stratus.Instances[_.uniqueId('s2_app_module_')] = this;
    }
}
