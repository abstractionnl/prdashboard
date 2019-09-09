import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { ConfigurationModel } from './../models';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  @Input() model: ConfigurationModel;

  @Output() save = new EventEmitter<ConfigurationModel>();

  constructor() { 
    //this.model = { pat: "", organization: "" };
  }

  ngOnInit() {
  }

  isValid() {
    return this.model.pat != "" && this.model.organization != "";
  }

  submitForm() {
    this.save.emit(this.model);
  }
}