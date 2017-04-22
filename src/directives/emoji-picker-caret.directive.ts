import { Directive, Output, EventEmitter, ElementRef, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/distinctUntilChanged';

import { CaretEvent } from "../../src";

@Directive({
  selector: '[emojiPickerCaretEmitter]',
  host: {
    '(keyup)': 'updateCaretPosition()',
    '(mouseup)': 'updateCaretPosition()',
    '(selectstart)': 'updateCaretPosition()',
    '(focus)': 'updateCaretPosition()',
    '(DOMSubtreeModified)': 'updateCaretDueMutation($event)'
  }
})
export class EmojiPickerCaretDirective {
  @Output('emojiPickerCaretEmitter') caretEmitter = new EventEmitter<CaretEvent>();

  private _caretEvent$ = new Subject<CaretEvent>();
  private _destroyed$ = new Subject<boolean>();

  private _lastCaretEvent: CaretEvent = CaretEvent.generateNullEvent();

  private _win;
  private _doc;

  get doc() {
    if (!this._doc) {
      this._doc = this._el.nativeElement.ownerDocument || this._el.nativeElement.document || document;
    }

    return this._doc;
  }

  get win() {
    if (!this._win) {
      this._win = this.doc.defaultView || this.doc.parentWindow || window
    }

    return this._win
  }

  constructor(
    private _el: ElementRef
  ) {
    this._caretEvent$
      .takeUntil(this._destroyed$)
      .distinctUntilChanged((event1, event2) => {
        return CaretEvent.compare(event1, event2);
      })
      .subscribe((event: CaretEvent) => {
        this.caretEmitter.emit(event);
        this._lastCaretEvent = event.clone()
      })
    ;
  }

  ngOnInit() {
    if (!this._el.nativeElement.getAttribute('contenteditable') && this._el.nativeElement.tagName.toLowerCase() !== 'input') {
      throw new Error('(emojiPickerPositionEmitter) should only work on contenteditable enabled or input elements');
    }
  }

  ngOnDestroy() {
    this._destroyed$.next(true);
  }

  updateCaretPosition() {
    const cEvent = CaretEvent.generateCaretEvent(this.win, this.doc, this._el.nativeElement);
    this._caretEvent$.next(cEvent);
  }

  updateCaretDueMutation() {
    const cEvent = CaretEvent.generateCaretEvent(this.win, this.doc, this._el.nativeElement);
    let textMovement = cEvent.textContent.length - this._lastCaretEvent.textContent.length;
    cEvent.caretOffset = this._lastCaretEvent.caretOffset + textMovement;

    /** change detection after DOMSubtreeModified event is weird
     * ChangeDetectorRef.detectChanges(), ChangeDetectorRef.markForCheck(), ApplicationRef.tick(), NgZone.run()
     * all of those methods did not work as expected.
     * As a temporary hack I am emitting an event after a short timeout, which is fine due to the _caretEvent$ smart stream
     */

     setTimeout(() => {
       this._caretEvent$.next(cEvent);
     });
  }
}
