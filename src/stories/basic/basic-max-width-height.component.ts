import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'basic-max-width-hegiht',
  template: `
    <div ngDraggableResizable [w]="200" [h]="200" [maxWidth]="minWidth" [maxHeight]="minHeight">
      <p>Basic component with programmable <b>minWidth</b> and <b>minHeight</b> props.</p>
    </div>
  `
})
export class BasicMinWidthHeightComponent {

  minWidth: 400;

  minHeight: 400;

}
