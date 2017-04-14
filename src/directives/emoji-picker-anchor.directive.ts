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

@Directive({ 
  selector: '[emojiPickerAnchor]',
  host: {
    '(mousedown)': '$event.emojiPickerExempt = true' // marking off event listening on anchor
  }
 })
export class EmojiPickerAnchorDirective {
  @Input('emojiPickerIf') ifValue: boolean = false;
  @Output('emojiPickerIfChange') ifValueEmitter = new EventEmitter<boolean>();

  @Output('emojiPickerSelect') selectEmitter = new EventEmitter();

  private _openState = new Subject<boolean>();
  private _destroyed = new Subject<boolean>();

  private _emojiPickerFactory: ComponentFactory<EmojiPickerComponent>;
  private _emojiPickerRef: ComponentRef<EmojiPickerComponent>;

  constructor(
    private _cfr: ComponentFactoryResolver,
    private _vcr: ViewContainerRef,
    private _el: ElementRef
  ) {}

  ngOnInit() {
    this._openState.next(this.ifValue);

    this._openState
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
    this._emojiPickerFactory = this._emojiPickerFactory || this._cfr.resolveComponentFactory(EmojiPickerComponent)
    this._emojiPickerRef = this._emojiPickerRef || this._vcr.createComponent(this._emojiPickerFactory);

    this._emojiPickerRef.instance.setPosition(this._el);
    this._emojiPickerRef.instance.pickerCloseEmitter.subscribe(event => this.ifValueEmitter.emit(false));
    this._emojiPickerRef.instance.selectionEmitter.subscribe(event => this.selectEmitter.emit(event));
  }

  closePicker() {
    this._emojiPickerRef.destroy();
    delete this._emojiPickerRef;
  }

  ngOnChanges() {
    this._openState.next(this.ifValue);
  }

  ngOnDestroy() {
    this._destroyed.next(true);
  }
}
