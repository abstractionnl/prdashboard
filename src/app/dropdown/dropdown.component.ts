import { Component, TemplateRef, ContentChild, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {
  @Input() title: string;
  @Input() options: any[];

  _selection: any[] = [];

  @Input('selection') 
  set selection(value: any) {
    if (value == null)
      this._selection = [];
    else if (Array.isArray(value))
      this._selection = value;
    else
      this._selection = [value];
  }

  @Input() trackBy: (option: any) => any;
  @Input() multiselect: boolean;
  @Output() onSelect = new EventEmitter<any>();

  @ContentChild(TemplateRef, { static: false }) itemTemplate: TemplateRef<any>;

  constructor() { }

  id(x: any) { return x; }

  hasSelection() {
    return this._selection.length > 0;
  }

  getSelection(): any[] {
    const trackFn = this.trackBy || this.id;

    if (!this.options)
      return [];

    return this.options.filter(x => this._selection.includes(trackFn(x)));
  }

  isSelected(option) {
    if (option == null)
      return !this.hasSelection();

    const trackFn = this.trackBy || this.id;

    return this._selection.includes(trackFn(option));
  }

  selectOption(option) {
    const trackFn = this.trackBy || this.id;

    if (this.multiselect) {
      this.onSelect.emit(option != null ? [trackFn(option)] : []);
    } else if (!this.isSelected(option))
      this.onSelect.emit(trackFn(option));
  }

  toggleOption(option, enabled) {
    if (!this.multiselect)
      return this.selectOption(enabled ? option : null);

    const isSelected = this.isSelected(option);
    const trackFn = this.trackBy || this.id;

    if (enabled && !isSelected) {
      var newSelection = this._selection.concat([trackFn(option)])
      this.onSelect.emit(newSelection);
    } else if (!enabled && isSelected) {
      var newSelection = this._selection.filter(x => x != trackFn(option))
      this.onSelect.emit(newSelection);
    }    
  }

  ngOnInit() {
  }

}
