import { Component, ViewChild, Input, EventEmitter, Output, ElementRef, Renderer } from '@angular/core';
import { EmojiContentComponent } from './';

@Component({
  selector: 'emoji-picker',
  styles: [':host { position: absolute; z-index: 9999; }'],
  template: `
  <emoji-content (emoji-selection)="selectionEmitter.emit($event)"></emoji-content>
  `,
  host: {
    '(document:mousedown)': 'onBackground($event)',
    '(mousedown)': '_lastHostMousedownEvent = $event'
  }
})

export class EmojiPickerComponent {
  @Output('emoji-select') selectionEmitter = new EventEmitter();
  @Output('picker-close') pickerCloseEmitter = new EventEmitter(); 

  private _lastHostMousedownEvent;

  constructor(private _renderer: Renderer, private _el: ElementRef) { }

  setPosition(target: ElementRef) {
    this._renderer.setElementStyle(this._el.nativeElement, 'transform', '');

    const targetBorders = target.nativeElement.getBoundingClientRect(),
      thisBorders = this._el.nativeElement.getBoundingClientRect();

    let heightCorrection = targetBorders.bottom - thisBorders.top,
      widthCorrection = targetBorders.left + targetBorders.width / 2 - thisBorders.left - thisBorders.width / 2;

    if (thisBorders.bottom + heightCorrection > window.innerHeight) {
      heightCorrection += window.innerHeight - (thisBorders.bottom + heightCorrection);
    }

    if (thisBorders.top + heightCorrection < 0) {
      heightCorrection -= (thisBorders.top + heightCorrection);
    }

    if (thisBorders.right + widthCorrection > window.innerWidth) {
      widthCorrection += window.innerWidth - (thisBorders.right + widthCorrection);
    }

    if (thisBorders.left + widthCorrection < 0) {
      widthCorrection -= (thisBorders.left + widthCorrection);
    }
    
    this._renderer.setElementStyle(this._el.nativeElement, 'transform', `translate(${widthCorrection}px,${heightCorrection}px)`);
  }

  onBackground(event) {
    /** internal mousedowns are ignored */
    if (event === this._lastHostMousedownEvent || event.emojiPickerExempt) {
      return;
    }

    this.pickerCloseEmitter.emit(event);
  }
}
