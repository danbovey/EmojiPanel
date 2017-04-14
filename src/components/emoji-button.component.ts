import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'emoji-button',
  styleUrls: ['../styles/emoji-button.scss'],
  template: `
<button
  class="emoji-button" 
  (click)="selectionEmitter.emit(dataToEmit || emoji)">
  {{emoji[0]}}
</button>
  `
})

export class EmojiButtonComponent {
  @Input('emoji') emoji;
  @Input('dataToEmit') dataToEmit;
  @Input('options') options;
  @Input('fitzpatrick') fitzpatrick;

  @Output('selection') selectionEmitter : EventEmitter<any> = new EventEmitter();

  constructor() {}

  ngOnChanges() {

  }
}
