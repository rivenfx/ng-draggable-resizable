import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgDraggableResizableModule } from '@rivenfx/ng-draggable-resizable';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgDraggableResizableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
