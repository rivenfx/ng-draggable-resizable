import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DraggableResizableComponent } from './draggable-resizable.component';


@NgModule({
  declarations: [
    DraggableResizableComponent,
  ],
  exports: [
    DraggableResizableComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
})
export class NgDraggableResizableModule {
}
