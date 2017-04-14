# Emoji picker for Angular

This project was forked from the [EmojiPanel](https://github.com/danbovey/EmojiPanel) project created by [DanBovey](https://github.com/danbovey)

It's pretty basic right now, not very customizable but propagates necessary emoji selection events and comes with basic search and category selection functionalities.


Usage:

```
import { EmojiPickerModule } from 'angular-emoji-picker';

@NgModule({
  ...
  imports: [
    EmojiPickerModule.forRoot()
  ],
  ...
})
export class AppModule {}

```

Directive API:

```
<i
    (click)="toggled = !toggled"
    emojiPickerAnchor
    [(emojiPickerIf)]="toggled"
    (emojiPickerSelect)="handleSelection($event)">😄</i>
```

`(emojiPickerSelect)="handleSelection($event)"`

```
$event = ["😌", "relieved"]
```

Emoji Picker will get placed below the anchor, centered and within window borders
