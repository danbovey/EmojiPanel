import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'notEmptyEmojiCategory'
})

export class EmojiEmptyCategoryPipe implements PipeTransform {
  transform(categories: any[]): any[] {
    return categories.filter(category => category.emojis.length !== 0);
  }
}
