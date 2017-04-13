import { Component, ViewChild, Input, EventEmitter, Output } from '@angular/core';
import { EmojiContentComponent } from './';

@Component({
  selector: 'emoji-picker',
  template: `
  <emoji-content *ngIf="toggled" (emoji-selection)="handleEmojiSelection($event)"></emoji-content>
  <button (click)="toggled = !toggled">toggled : {{toggled}}</button>
  `
})

export class EmojiPickerComponent {
  toggled: boolean = false;

  @Output('emoji-select') selectionEmitter = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  handleEmojiSelection(emoji) {
    console.log(emoji);
  }
}
