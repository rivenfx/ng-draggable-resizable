import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'basic-min-width-min-hegiht',
  template: `
    <div style="width: 100%;height: 1080px;">
      <div ngDraggableResizable [w]="200" [h]="200" [minWidth]="minWidth" [minHeight]="minHeight">
        <p>Basic component with programmable <b>minWidth</b> and <b>minHeight</b> props.</p>
      </div>
    </div>
  `
})
export class BasicMinWidthHeightComponent {

  minWidth = 100;

  minHeight = 100;

}
