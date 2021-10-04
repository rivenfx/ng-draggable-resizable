import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'basic-max-width-hegiht',
  template: `
    <div style="width: 100%;height: 1080px;">
      <div ngDraggableResizable [w]="200" [h]="200" [maxWidth]="maxWidth" [maxHeight]="maxHeight">
        <p>Basic component with programmable <b>maxWidth</b> and <b>maxHeight</b> props.</p>
      </div>
    </div>
  `
})
export class BasicMaxWidthHeightComponent {

  maxWidth = 400;

  maxHeight = 400;

}
