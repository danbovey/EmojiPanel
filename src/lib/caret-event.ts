export class CaretEvent {
  caretOffset: number;
  caretRange: Range;
  textContent: string;

  constructor(data) {
    Object.assign(this, data);
  }

  clone(): CaretEvent {
    return new CaretEvent(Object.assign({}, this, {
      caretRange: this.caretRange && this.caretRange.cloneRange ? this.caretRange.cloneRange() : this.caretRange
    }));
  }

  static get null() {
    return new CaretEvent({
      caretOffset: 0,
      textContent: ''
    });
  }

  static comparePropsOfObject(r1, r2) {
    for (let k in r1) {
      if (r1[k] !== r2[k]) {
        return false
      }
    }
    return true;
  }

  static compare(e1: CaretEvent, e2: CaretEvent): boolean {
    const changed =
      /** different when either caretRange is omitted while other exists */
      (!e1.caretRange && e2.caretRange) ||
      (e1.caretRange && !e2.caretRange) ||
      /** different when offset has changed */
      (e1.caretOffset !== e2.caretOffset) ||
      /** different when textContent has changed */
      (e1.textContent !== e2.textContent) ||
      /** different when range object properties changed */
      !this.comparePropsOfObject(e1.caretRange, e2.caretRange)
      ;

    return !changed;
  }

  static generateCaretEvent(win, doc, element: HTMLElement & HTMLInputElement): CaretEvent {
    let caretOffset = 0, sel, caretRange, textContent = element.textContent;

    if (element.tagName.toLowerCase() === 'input') {
      return new CaretEvent({
        caretOffset: element.selectionEnd,
        textContent: element.value
      })
    }

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

    return new CaretEvent({
      caretOffset,
      caretRange,
      textContent
    });
  }
}
