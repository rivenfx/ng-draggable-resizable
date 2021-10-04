import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgDraggableResizableComponent } from './ng-draggable-resizable.component';

describe('NgDraggableResizableComponent', () => {
  let component: NgDraggableResizableComponent;
  let fixture: ComponentFixture<NgDraggableResizableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgDraggableResizableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgDraggableResizableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
