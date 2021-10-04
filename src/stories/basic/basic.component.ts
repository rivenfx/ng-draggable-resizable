import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'basic',
  template: `
    <div ngDraggableResizable [w]="200" [h]="200">
      <p>你可以拖着我，按照自己的意愿调整大小。</p>
    </div>
  `
})
export class BasicComponent {

}
