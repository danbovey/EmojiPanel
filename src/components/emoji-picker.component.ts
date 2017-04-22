import { Component, ViewChild, Input, EventEmitter, Output, ElementRef, Renderer } from '@angular/core';
import { EmojiContentComponent } from './';
import { DIRECTIONS } from "../lib/picker-directions";
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/takeUntil';

@Component({
  selector: 'emoji-picker',
  styles: [':host { position: absolute; z-index: 9999; }'],
  template: `
  <emoji-content (emoji-selection)="selectionEmitter.emit($event)"></emoji-content>
  `,
  host: {
    '(document:mousedown)': 'onBackground($event)',
    '(mousedown)': '_lastHostMousedownEvent = $event',
    '(window:resize)': '_windowResize.next($event)'
  }
})

export class EmojiPickerComponent {
  @Output('emoji-select') selectionEmitter = new EventEmitter();
  @Output('picker-close') pickerCloseEmitter = new EventEmitter(); 

  private _lastHostMousedownEvent;
  private _currentTarget: ElementRef;
  private _currentDirection: DIRECTIONS;

  private _windowResize = new Subject<any>();
  private _destroyed = new Subject<boolean>();

  constructor(private _renderer: Renderer, private _el: ElementRef) {
    this._windowResize
      .takeUntil(this._destroyed)
      .debounceTime(100)
      .subscribe(event => {
        this.setPosition(this._currentTarget, this._currentDirection);
      })
  }

  setPosition(target: ElementRef, directionCode: DIRECTIONS = DIRECTIONS.bottom) {
    if (!target) {
      return console.error('Emoji-Picker: positioning failed due to missing target element or direction code');
    }

    this._renderer.setElementStyle(this._el.nativeElement, 'transform', '');

    /** Store anchor and direction */
    this._currentTarget = target;
    this._currentDirection = directionCode;

    const targetBorders = target.nativeElement.getBoundingClientRect(),
      thisBorders = this._el.nativeElement.getBoundingClientRect();

    let heightCorrection = 0, widthCorrection = 0;

    /** Setting up centering of picker for all cases */
    switch (this._currentDirection) {
      case DIRECTIONS.top:
      case DIRECTIONS.bottom:
        widthCorrection = targetBorders.left - thisBorders.left + (targetBorders.width - thisBorders.width) / 2;
        break;
      case DIRECTIONS.left:
      case DIRECTIONS.right:
        heightCorrection = targetBorders.top - thisBorders.top + (targetBorders.height - thisBorders.height) / 2;
        break;
    }

    /** Setting up relative positioning for all cases */
    switch (this._currentDirection) {
      case DIRECTIONS.top:
        heightCorrection = targetBorders.top - thisBorders.bottom;
        break;
      case DIRECTIONS.left:
        widthCorrection = targetBorders.left - thisBorders.right;
        break;
      case DIRECTIONS.right:
        widthCorrection = targetBorders.right - thisBorders.left;
        break;
      case DIRECTIONS.bottom:
        heightCorrection = targetBorders.bottom - thisBorders.top;
        break;
    }

    /** Correcting positioning due to overflow problems */
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
    
    /** set the position adjustments to the emoji picker element */
    this._renderer.setElementStyle(this._el.nativeElement, 'transform', `translate(${widthCorrection}px,${heightCorrection}px)`);
  }

  onBackground(event) {
    /** internal mousedowns are ignored */
    if (event === this._lastHostMousedownEvent || event.emojiPickerExempt) {
      return;
    }

    this.pickerCloseEmitter.emit(event);
  }

  ngOnDestroy() {
    this._destroyed.next(true);
  }
}
