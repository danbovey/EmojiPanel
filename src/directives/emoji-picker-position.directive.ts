import { Directive, Output, EventEmitter, ElementRef } from '@angular/core';

@Directive({ 
  selector: '[emojiPickerPositionEmitter]',
  host: {
    '(keyup)': 'updateCaretPosition()',
    '(mouseup)': 'updateCaretPosition()',
    '(focus)': 'updateCaretPosition()'
  }
})
export class EmojiPickerPositionDirective {
  @Output('emojiPickerPositionEmitter') positionEmitter = new EventEmitter();

  private _win;
  private _doc;

  constructor(private _el: ElementRef) { }

  ngOnInit() {
    if (!this._el.nativeElement.getAttribute('contenteditable') && this._el.nativeElement.tagName !== 'INPUT') {
      throw new Error('(emojiPickerPositionEmitter) should only work on contenteditable enabled or input elements');
    }

    this._doc = this._el.nativeElement.ownerDocument || this._el.nativeElement.document;
    this._win = this._doc.defaultView || this._doc.parentWindow;
  }

  updateCaretPosition() {
    const position = this.getCaretCharacterOffsetWithin(this._win, this._doc, this._el.nativeElement);
    this.positionEmitter.emit(position);
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
