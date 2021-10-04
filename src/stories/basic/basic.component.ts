import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'basic',
  template: `
    <div style="width: 100%;height: 1080px;">
      <div ngDraggableResizable [w]="200" [h]="200">
        <p>你可以拖着我，按照自己的意愿调整大小。</p>
      </div>
    </div>
  `
})
export class BasicComponent {

}
