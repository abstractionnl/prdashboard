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
  @Output() onSelect = new EventEmitter<any>();

  @ContentChild(TemplateRef, { static: false }) itemTemplate: TemplateRef<any>;

  constructor() { }

  isSelected(option) {
    if (option == null)
      return this.selection == null;
    if (this.selection == null)
      return false;

    if (this.trackBy) {
      return this.trackBy(option) == this.trackBy(this.selection);
    }      

    return option == this.selection;
  }

  selectOption(option) {
    if (!this.isSelected(option))
      this.onSelect.emit(option);
  }

  ngOnInit() {
  }

}
