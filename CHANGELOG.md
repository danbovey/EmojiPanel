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
