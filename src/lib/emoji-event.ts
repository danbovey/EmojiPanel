export class EmojiEvent {
  char: string;
  label: string;

  constructor(data) {
    Object.assign(this, data);
  }

  static fromArray(emojiArray) {
    return new EmojiEvent({ char : emojiArray[0], label : emojiArray[1]})
  }
}
