<a name="1.2.0"></a>
# [1.2.0](https://github.com/angular/angular/compare/v1.1.0...v1.2.0) (2017-04-20)

### Bug Fixes

* **EmojiPickerCaret directive:** added support for input elements

### Performance Improvements
* **EmojiPickerApi directive:** properly unsubscribing to event emitters
* **EmojiPickerCaret directive:** improved event management, smart caret preserving event emitting when content of an editable div changes through DOM mutation.

## What's New

* **(emojiPickerCaretEmitter):** emits the element textContent upon changes
* **CaretEvent:** New caret event class available for use
* **EmojiEvent:** New caret event class available for use

### BREAKING CHANGES

* **(emojiPickerSelect) emitter:** the picker now emits an EmojiEvent object containing a char and label properties. Change usage accordingly (previous => now: event[0] => event.char, event[1] => event.label)

<a name="1.1.0"></a>
# [1.1.0](https://github.com/angular/angular/compare/v1.0.5...v1.1.0) (2017-04-19)

### Design

* **picker:** various design changes implemented, smaller emoji picker, more efficient use of area.

### Features

* **[emojiPickerDirection]:** choose from 'top', 'bottom', 'left' and 'right' as possible pop up directions
* **picker:** emoji picker is now flexible to window resizing, position will be recalculated with a short debounce for light resources

### BREAKING CHANGES

* **EmojiPickerAnchor directive:** removed unnecessary directive, implemented through attribute emojiPickerIf (just drop [emojiPickerAnchor] and make sure [(emojiPickerIf)] is used in your emoji picker button element)
* **EmojiPickerPosition directive:** (emojiPickerPositionEmitter) renamed to (emojiPickerCaretEmitter) if you relied on this event emitter directive for any reason, make sure to rename your usage accordingly.
