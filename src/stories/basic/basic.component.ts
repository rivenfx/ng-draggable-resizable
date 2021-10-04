import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'basic',
  template: `
    <div ngDraggableResizable>
      <p>你可以拖着我，按照自己的意愿调整大小。</p>
    </div>
  `,
  styleUrls:[
    '../../../projects/ng-draggable-resizable/src/styles/index.less'
  ]
})
export class BasicComponent {

}
