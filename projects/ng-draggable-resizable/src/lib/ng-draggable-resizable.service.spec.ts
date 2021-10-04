import { TestBed } from '@angular/core/testing';

import { NgDraggableResizableService } from './ng-draggable-resizable.service';

describe('NgDraggableResizableService', () => {
  let service: NgDraggableResizableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgDraggableResizableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
