import { Component, NgZone } from '@angular/core';
import { IRefLineGroup } from '@rivenfx/ng-draggable-resizable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'app-ng-draggable-resizable';

  refLineDef: IRefLineGroup = { vLine: [], hLine: [] };


  constructor(public zone: NgZone) {
  }

  ngOnInit(): void {
  }

  refLineChange(e: IRefLineGroup) {
    this.zone.run(() => {
      this.refLineDef = e;
    });
  };
}
