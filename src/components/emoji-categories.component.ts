import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'emoji-categories',
  styleUrls: ['../styles/emoji-categories.scss'],
  template: `
  <ng-container *ngFor="let category of emojisCategories">
    <emoji-button 
      (selection)="handleCategorySelection($event)"
      [dataToEmit]="category"
      [emoji]="category.icon"></emoji-button>
  </ng-container>
  `
})

export class EmojiCategoriesComponent {
  @Input('emojisCategories') emojisCategories;
  @Output('categorySelection') categorySelection = new EventEmitter<any>();
  
  constructor() {}

  handleCategorySelection(event) {
    this.categorySelection.emit(event);
  }
}
