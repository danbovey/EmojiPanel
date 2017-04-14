import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { COMPONENTS } from "./components";
import { DIRECTIVES } from './directives';
import { PIPES } from './pipes';

import { EmojiPickerComponent } from './components';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    ...DIRECTIVES,
    ...COMPONENTS
  ],
  declarations: [
    ...PIPES,
    ...DIRECTIVES,
    ...COMPONENTS
  ],
  providers: [],
  entryComponents: [EmojiPickerComponent]
})
export class EmojiPickerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: EmojiPickerModule,
      providers: []
    }
  }
}
