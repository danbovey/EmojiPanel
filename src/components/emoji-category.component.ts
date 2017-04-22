import { Component, Input, EventEmitter, Output, ElementRef } from '@angular/core';

@Component({
  selector: 'emoji-category',
  styleUrls: ['../styles/emoji-category.scss'],
  template: `
  <p class="emoji-category">{{category.name}}</p>
  `
})

export class EmojiCategoryComponent {
  @Input('category') category;

  constructor(private _element: ElementRef) { }

  public scrollIntoView() {
    this._element.nativeElement.scrollIntoView();
  }
}
