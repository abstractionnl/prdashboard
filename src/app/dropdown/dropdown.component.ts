import { Component, TemplateRef, ContentChild, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})
export class DropdownComponent implements OnInit {
  @Input() title: string;
  @Input() options: any[];
  @Input() selection: any;
  @Input() trackBy: (option: any) => any;
  @Input() multiselect: boolean;
  @Output() onSelect = new EventEmitter<any>();

  @ContentChild(TemplateRef, { static: false }) itemTemplate: TemplateRef<any>;

  constructor() { }

  id(x: any) { return x; }

  hasSelection() {
    return this.getSelection().length > 0;
  }

  getSelection(): any[] {
    if (this.selection == null)
      return [];

    if (!this.multiselect)
      return [this.selection]

    return this.selection;
  }

  isSelected(option) {
    if (option == null)
      return !this.hasSelection();

    const trackFn = this.trackBy || this.id;

    return this.getSelection().map(trackFn).includes(trackFn(option));
  }

  selectOption(option) {
    if (this.multiselect) {
      this.onSelect.emit(option != null ? [option] : []);
    } else if (!this.isSelected(option))
      this.onSelect.emit(option);
  }

  toggleOption(option, enabled) {
    if (!this.multiselect)
      return this.selectOption(enabled ? option : null);

    const isSelected = this.isSelected(option);

    if (enabled && !isSelected) {
      var newSelection = this.getSelection().concat([option])
      this.onSelect.emit(newSelection);
    } else if (!enabled && isSelected) {
      const trackFn = this.trackBy || this.id;
      var newSelection = this.getSelection().filter(x => trackFn(x) != trackFn(option))
      this.onSelect.emit(newSelection);
    }    
  }

  ngOnInit() {
  }

}
