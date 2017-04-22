import {
  Directive,
  Input,
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentFactory,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Output
} from '@angular/core';
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/distinctUntilChanged';

import { EmojiPickerComponent } from './../components';
import { DIRECTIONS } from '../lib/picker-directions';
import { Subscription } from "rxjs/Subscription";
import { EmojiEvent } from "../";

@Directive({
  selector: '[emojiPickerIf]',
  host: {
    '(mousedown)': '$event.emojiPickerExempt = true' // marking off event listening on anchor
  }
 })
export class EmojiPickerApiDirective {
  private _directionCode: DIRECTIONS = DIRECTIONS.bottom;

  @Input('emojiPickerDirection') set emojiPickerDirection(direction: string) {
    if (DIRECTIONS[direction] === undefined) {
      console.error(`Emoji-Picker: direction '${direction}' passed as input does not exist in DIRECTIONS table, defaulting to 'bottom'`);
      this._directionCode = DIRECTIONS.bottom;
    } else {
      this._directionCode = DIRECTIONS[direction];
    }
  }

  @Input('emojiPickerIf') set emojiPickerIf(condition: boolean) {
    this._emojiPickerOpenState.next(condition);
  }
  @Output('emojiPickerIfChange') emojiPickerIfEmitter = new EventEmitter<boolean>();
  
  @Output('emojiPickerSelect') selectEmitter = new EventEmitter();

  private _emojiPickerOpenState = new Subject<boolean>();
  private _destroyed = new Subject<boolean>();

  private _emojiPickerFactory: ComponentFactory<EmojiPickerComponent>;
  private _emojiPickerRef: ComponentRef<EmojiPickerComponent>;
  private _emojiSubs: Subscription[] = [];

  constructor(
    private _cfr: ComponentFactoryResolver,
    private _vcr: ViewContainerRef,
    private _el: ElementRef
  ) {
    this._emojiPickerOpenState
      .takeUntil(this._destroyed)
      .distinctUntilChanged()
      .subscribe(value => {
        if (value) {
          this.openPicker();
        } else {
          this.closePicker();
        }
      });
  }

  openPicker() {
    this._emojiPickerFactory = this._emojiPickerFactory || this._cfr.resolveComponentFactory(EmojiPickerComponent);
    this._emojiPickerRef = this._emojiPickerRef || this._vcr.createComponent(this._emojiPickerFactory);

    this._emojiPickerRef.instance.setPosition(this._el, this._directionCode);
    this._emojiSubs.push(
      this._emojiPickerRef.instance.pickerCloseEmitter.subscribe(event => this.emojiPickerIfEmitter.emit(false)),
      this._emojiPickerRef.instance.selectionEmitter.subscribe(event => this.selectEmitter.emit(EmojiEvent.fromArray(event)))
    );
  }

  closePicker() {
    if (!this._emojiPickerRef || !this._emojiPickerRef.destroy) {
      return;
    }

    this._emojiSubs.forEach((subscription: Subscription) => subscription.unsubscribe());
    this._emojiPickerRef.destroy();
    
    this._emojiSubs = [];
    delete this._emojiPickerRef;
  }

  ngOnDestroy() {
    this._destroyed.next(true);
  }
}
