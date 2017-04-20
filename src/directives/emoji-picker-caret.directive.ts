import { Directive, Output, EventEmitter, ElementRef } from '@angular/core';
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/distinctUntilChanged';

@Directive({ 
  selector: '[emojiPickerCaretEmitter]',
  host: {
    '(keyup)': 'updateCaretPosition()',
    '(mouseup)': 'updateCaretPosition()',
    '(focus)': 'updateCaretPosition()',
    '(DOMSubtreeModified)': 'updateCaretPosition($event)'
  }
})
export class EmojiPickerCaretDirective {
  @Output('emojiPickerCaretEmitter') caretEmitter = new EventEmitter();

  private _position = new Subject<{ caretOffset, caretRange }>();
  private _destroyed = new Subject<boolean>();

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

  constructor(private _el: ElementRef) { }

  ngOnInit() {
    if (!this._el.nativeElement.getAttribute('contenteditable') && this._el.nativeElement.tagName !== 'INPUT') {
      throw new Error('(emojiPickerPositionEmitter) should only work on contenteditable enabled or input elements');
    }

    this._position
      .takeUntil(this._destroyed)
      .distinctUntilChanged((event1, event2) => {
        if (
          /** if range suddenly exists or disappears */
          !event1.caretRange && event2.caretRange || 
          event1.caretRange && !event2.caretRange ||
          /** if caret offset has changed */
          event1.caretOffset !== event2.caretOffset ||
          /** if caret range has changed in these properties */
          !this.compareRangeObject(event1.caretRange, event2.caretRange)
        ) {
          return false;
        }

        return true;
      })
      .subscribe(event => this.caretEmitter.emit(event))
    ;
  }

  compareRangeObject(r1, r2) {
    for (let k in r1) {
      if (r1[k] !== r2[k]) {
        return false
      }
    }

    return true;
  }

  ngOnDestroy() {
    this._destroyed.next(true);
  }

  updateCaretPosition() {
    const position = this.getCaretCharacterOffsetWithin(this.win, this.doc, this._el.nativeElement);
    this._position.next(position);
  }

  getCaretCharacterOffsetWithin(win, doc, element) {
    let caretOffset = 0, sel, caretRange;

    if (typeof win.getSelection != "undefined") {
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
        const range = win.getSelection().getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;

        /** Keeping a reference of the range to emit */
        caretRange = range.cloneRange();
      }
    } else if ((sel = doc.selection) && sel.type != "Control") {
      const textRange = sel.createRange();
      const preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;

      /** Keeping a reference of the range to emit and making it compatible */
      caretRange = textRange.duplicate();
      caretRange.insertNode = (e) => {
        const container = document.createElement("div");
        container.appendChild(e);
        caretRange.pasteHTML(container.innerHTML);
      };
    }

    return {
      caretOffset,
      caretRange
    };
  }
}
