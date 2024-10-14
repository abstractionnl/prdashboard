import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule }   from '@angular/forms';

import { AppComponent } from './app.component';

import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import { ConfigurationComponent } from './configuration/configuration.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { StripRefHeadsPipe } from './strip-ref-heads.pipe';
import { VoteStatusPipe } from './vote-status.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
registerLocaleData(localeNl, 'nl');

@NgModule({ declarations: [
        AppComponent,
        ConfigurationComponent,
        DropdownComponent,
        StripRefHeadsPipe,
        VoteStatusPipe
    ],
    bootstrap: [AppComponent], 
    imports: [BrowserModule, FormsModule, NgbModule], 
    providers: [provideHttpClient(withInterceptorsFromDi())] 
})
export class AppModule { }
