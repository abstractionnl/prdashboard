import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule }   from '@angular/forms';

import { AppComponent } from './app.component';

import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import { ConfigurationComponent } from './configuration/configuration.component';
import { DropdownComponent } from './dropdown/dropdown.component';
registerLocaleData(localeNl, 'nl');

@NgModule({
  declarations: [
    AppComponent,
    ConfigurationComponent,
    DropdownComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
