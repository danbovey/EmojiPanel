import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { COMPONENTS } from "./components";
import { PIPES } from './pipes';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    ...COMPONENTS
  ],
  declarations: [
    ...PIPES,
    ...COMPONENTS
  ],
  providers: [],
})
export class EmojiPickerModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: EmojiPickerModule,
      providers: []
    }
  }
}
