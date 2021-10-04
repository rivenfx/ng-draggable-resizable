import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  ElementRef, EventEmitter,
  Input, NgZone, OnChanges,
  OnDestroy,
  OnInit, Output, Provider,
  SimpleChange,
  SimpleChanges
} from '@angular/core';
import { matchesSelectorToParentElements, getComputedSize, addEvent, removeEvent } from '../utils';
import { computeWidth, computeHeight, restrictToBounds, snapToGrid } from '../utils';
import {
  events,
  IDrag,
  IHandleInfo,
  IMouseClickPosition,
  IRefLineGroup,
  IResize,
  userSelectAuto,
  userSelectNone
} from "./interfaces";

let eventsFor = events.mouse

@Component({
  selector: '[ngDraggableResizable],[ng-draggable-resizable]',
  templateUrl: './draggable-resizable.component.html',
  host: {
    '[style]': 'style',
    '[class]': 'selfClass',
    '(mousedown)': 'elementMouseDown($event)',
    '(touchstart)': "elementTouchDown($event)",
    '(contextmenu)': 'onContextMenu($event)',
  }
})
export class DraggableResizableComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  /** 用于设置可拖动可调整大小的组件的自定义class */
  @Input() className = 'vdr';
  /** 用于在启用draggable时设置可拖动可调整大小的组件的自定义class */
  @Input() classNameDraggable = 'draggable';
  /** 当启用resizable时，用于设置可拖动可调整大小的组件的自定义class */
  @Input() classNameResizable = 'resizable';
  /** 用于在拖动时设置可拖动可调整大小的组件的自定义class */
  @Input() classNameDragging = 'dragging';
  /** 用于在调整大小时设置可拖动可调整大小的组件的自定义class */
  @Input() classNameResizing = 'resizing';
  /** 用于在活动时设置可拖动可调整大小的组件的自定义class */
  @Input() classNameActive = 'active';
  /** 用于设置每个句柄元素的自定义公共class。 这样你就可以使用选择器<your class> - <handle code>来单独设置每个句柄的样式，其中handle code标识handle prop提供的句柄之一 */
  @Input() classNameHandle = 'handle';
  /** 当CSS 3 (scale transformation) 应用于父元素之一时，缩放道具控制缩放属性。如果没有提供，默认值是1 */
  @Input() scale = 1;
  /** 默认情况下，组件将样式声明user-select：none添加到自身以防止在拖动期间选择文本。 您可以通过将此prop设置为false来禁用此行为 */
  @Input() disableUserSelect = true;
  /** 默认情况下，浏览器的本机拖放功能（通常用于图像和其他一些元素）被禁用，因为它可能与组件提供的功能冲突。 如果您因任何原因需要恢复此功能，则可以将此道具设置为true */
  @Input() enableNativeDrag = false;
  /** 确定组件是否应处于活动状态。 道具对变化作出反应，也可以与sync modifier一起使用，以保持状态与父级同步。 您可以与preventDeactivation prop一起使用，以便完全控制组件外部的活动行为 */
  @Input() active = false;
  /*** 确定当用户在其外部单击/点击时是否应停用该组件 */
  @Input() preventDeactivation = false;
  /** 定义组件应该是否可拖动 */
  @Input() draggable = true;
  /** 定义组件应该可以调整大小 */
  @Input() resizable = true;
  /** 定义元素的初始宽度。它还支持auto，但是当您开始调整大小时，该值将退回到一个数字 */
  @Input() w: number | 'auto';
  /** 定义元素的初始高度。它还支持auto，但是当您开始调整大小时，该值将退回到一个数字 */
  @Input() h: number | 'auto';
  /** 定义元素的最小宽度 */
  @Input() minWidth = 0;
  /** 定义元素的最小高度 */
  @Input() minHeight = 0;
  /** 定义元素的最大宽度 */
  @Input() maxWidth: number;
  /** 定义元素的最大高度 */
  @Input() maxHeight: number;
  /** 定义元素的初始x位置 */
  @Input() x = 0;
  /** 定义元素的初始y位置 */
  @Input() y = 0;
  /** 定义元素的zIndex */
  @Input() z: string | number;
  /** 定义句柄数组以限制元素大小调整：
   tl - 左上角
   tm - 上方中间
   tr - 右上角
   mr - 右中角
   br - 右下角
   bm - 底部中间
   bl - 左下角
   ml - 左中角
   */
  @Input() handles: string[] = ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'];
  /** 定义元素可拖动的轴。 可用值为x，y或both */
  @Input() axis: 'x' | 'y' | 'both' = 'both';
  /** 定义捕捉元素的网格 */
  @Input() grid: number[] = [1, 1];
  /** 将组件的移动和尺寸限制为父组件（如果提供了就设置true），或者限制为由有效CSS选择器标识的元素 */
  @Input() parent: boolean | string = false;
  /** 定义应该用于拖动组件的选择器 */
  @Input() dragHandle: string;
  /** 定义应该用于防止拖动初始化的选择器 */
  @Input() dragCancel: string;
  /** lockAspectRatio属性用于锁定宽高比。 此属性与grid不兼容，因此请确保一次只使用一个 */
  @Input() lockAspectRatio = false;
  /** 调整大小时启动（单击或触摸手柄）。 如果任何处理程序返回false，则操作将取消 */
  @Input() onDragStart: (handle?: DraggableResizableComponent, e?: TouchEvent | MouseEvent) => boolean = () => true;
  /** 在调整元素大小之前调用。该函数接收句柄和下一个值“ x”，“ y”，“ width”和“ height”。如果任何处理程序返回了“ false”，则该操作将取消 */
  @Input() onDrag: (handle?: DraggableResizableComponent, left?: number, top?: number, width?: number, height?: number) => boolean = () => true;
  /** 调整大小时启动（单击或触摸手柄）。 如果任何处理程序返回false，则操作将取消 */
  @Input() onResizeStart: (handle?: DraggableResizableComponent, e?: MouseEvent | TouchEvent) => boolean = () => true;
  /** 在调整元素大小之前调用。该函数接收句柄和下一个值“ x”，“ y”，“ width”和“ height”。如果任何处理程序返回了“ false”，则该操作将取消 */
  @Input() onResize: (handle?: DraggableResizableComponent, left?: number, top?: number, width?: number, height?: number) => boolean = () => true;
  // ==================== 新增属性 开始 ====================
  /** 当使用transform:scale()进行缩放操作时，其中switch为是否让handle始终保持视觉效果不变,size为handle的大小(宽高相同), offset为handle的位置偏移，通常在自定义handle样式时需要设置 */
  @Input() handleInfo: IHandleInfo = { size: 8, offset: -5, switch: true };
  /** 当使用transform:scale()进行缩放操作时，用来修复操作组件时鼠标指针与移动缩放位置有所偏移的情况 */
  @Input() scaleRatio = 1;
  /** 定义组件是否开启冲突检测 */
  @Input() isConflictCheck = false;
  /** 定义组件是否开启元素对齐 */
  @Input() snap = false;
  /** 当调用snap时，定义组件与元素之间的对齐距离，以像素(px)为单位 */
  @Input() snapTolerance = 5;

  // ==================== 新增属性 结束 ====================

  /** 组件被激活 */
  @Output() activated: EventEmitter<true> = new EventEmitter<true>();
  /** 组件取消激活 */
  @Output() deactivated: EventEmitter<false> = new EventEmitter<false>();
  /** 右键菜单事件 */
  @Output() contextmenu: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  /** 激活状态发生改变 */
  @Output() activeChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  /** 拖拽 */
  @Output() onDragging: EventEmitter<IDrag> = new EventEmitter<IDrag>();
  /** 拖拽结束 */
  @Output() onDragStop: EventEmitter<IDrag> = new EventEmitter<IDrag>();
  /** 改变大小 */
  @Output() onResizing: EventEmitter<IResize> = new EventEmitter<IResize>();
  /** 改变大小结束 */
  @Output() onResizeStop: EventEmitter<IResize> = new EventEmitter<IResize>();
  /** 参考线发生改变 */
  @Output() refLineChange: EventEmitter<IRefLineGroup> = new EventEmitter<IRefLineGroup>();


  left = this.x;
  top = this.y;

  right: number;
  bottom: number;

  _width: number;
  get width() {
    return this._width;
  }

  set width(val: number) {
    this._width = val;
    this.$el.style.width = this.computedWidth;
  }

  _height: number;
  get height() {
    return this._height;
  }

  set height(val: number) {
    this._height = val;
    this.$el.style.height = this.computedHeight;
  }

  /** 宽度touche */
  widthTouched = false;
  /** 高度touche */
  heightTouched = false;
  aspectFactor: number;

  /** 当前dom元素的父级宽度 */
  parentWidth: number;
  /** 当前dom元素的父级宽度 */
  parentHeight: number;

  /** 当前dom元素最小宽度 */
  minW = this.minWidth;
  /** 当前dom元素最小高度 */
  minH = this.minHeight;

  /** 当前dom元素最大宽度 */
  maxW: number;
  /** 当前dom元素最大高度 */
  maxH: number;

  /** 当前选中的handle */
  handle = null;



  /** 当前dom元素是否正在拖拽 */
  dragging = false;
  /** 当前dom元素元素的zIndex */
  zIndex: number;


  /** 当前dom元素是否正在改变大小 */
  resizing = false;
  /** 当前dom元素改变大小为x轴 */
  resizingOnX: boolean;
  /** 当前dom元素改变大小为y轴 */
  resizingOnY: boolean;

  /** 鼠标点击位置 */
  mouseClickPosition: IMouseClickPosition = { mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0 };

  /** 当前dom元素界限 */
  bounds = {
    minLeft: null,
    maxLeft: null,
    minRight: null,
    maxRight: null,
    minTop: null,
    maxTop: null,
    minBottom: null,
    maxBottom: null
  }

  /** 当前dom元素是否启用 */
  get enabled() {
    return this.active;
  }
  /** 当前dom元素是否启用 */
  set enabled(val: boolean) {
    this.active = val;
    if (val) {
      this.activated.emit(true);
    } else {
      this.deactivated.emit(false);
    }
    this.activeChange.emit(val);
  }

  /** 当前dom元素重置大小的handle */
  get actualHandles() {
    if (!this.enabled) {
      return [];
    }

    return this.handles;
  }

  /** 当前dom元素使用的类 */
  get selfClass() {

    let res = this.className + ' ';
    if (this.enabled && this.classNameActive && this.classNameActive !== '') {
      res += this.classNameActive + ' ';
    }
    if (this.dragging && this.classNameDragging && this.classNameDragging !== '') {
      res += this.classNameDragging + ' ';
    }
    if (this.resizing && this.classNameResizing && this.classNameResizing !== '') {
      res += this.classNameResizing + ' ';
    }
    if (this.draggable && this.classNameDraggable && this.classNameDraggable !== '') {
      res += this.classNameDraggable + ' ';
    }
    if (this.resizable && this.classNameResizable && this.classNameResizable !== '') {
      res += this.classNameResizable + ' ';
    }

    return res;
  }

  /** 当前dom元素 */
  get $el(): HTMLElement {
    return this.elRef.nativeElement;
  }

  /** 当前dom元素的parnet */
  get parentElement() {
    return this.$el.parentElement;
  }

  /** 当前dom元素的样式 */
  get style() {
    return {
      transform: `translate(${this.left}px, ${this.top}px)`,
      zIndex: this.zIndex,
      ...(this.dragging && this.disableUserSelect ? userSelectNone : userSelectAuto)
    }
  }

  /** 当前dom元素实际宽度 */
  get computedWidth() {
    if (this.w === 'auto') {
      if (!this.widthTouched) {
        return 'auto'
      }
    }
    return this.width + 'px'
  }

  /** 当前dom元素实际高度 */
  get computedHeight() {
    if (this.h === 'auto') {
      if (!this.heightTouched) {
        return 'auto'
      }
    }
    return this.height + 'px'
  }


  // 内部使用的包装方法
  protected deselect: Function;
  protected handleUp: Function;
  protected move: Function;
  protected handleResize: Function;
  protected checkParentSize: Function;

  constructor(
    public elRef: ElementRef<HTMLElement>
  ) {

  }


  ngOnInit(): void {
    if (this.maxWidth && this.minWidth > this.maxWidth) {
      console.warn('[Vdr warn]: Invalid prop: minWidth cannot be greater than maxWidth')
    }
    if (this.maxWidth && this.minHeight > this.maxHeight) {
      console.warn('[Vdr warn]: Invalid prop: minHeight cannot be greater than maxHeight')
    }

    const self = this;
    this.deselect = function (e) {
      self.onDeselect(e);
    };
    this.handleUp = function (e) {
      self.onHandleUp(e);
    };
    this.move = function (e) {
      self.onMove(e);
    };
    this.handleResize = function (e) {
      self.onHandleResize(e);
    };
    this.checkParentSize = function (e) {
      self.onCheckParentSize();
    };

  }

  ngAfterViewInit(): void {

    if (!this.enableNativeDrag) {
      this.$el.ondragstart = () => false;
    }

    const [parentWidth, parentHeight] = this.getParentSize()

    this.parentWidth = parentWidth
    this.parentHeight = parentHeight
    const [width, height] = getComputedSize(this.$el)
    this.aspectFactor = (this.w !== 'auto' ? this.w : width) / (this.h !== 'auto' ? this.h : height)
    this.width = this.w !== 'auto' ? this.w : width
    this.height = this.h !== 'auto' ? this.h : height
    this.right = this.parentWidth - this.width - this.left
    this.bottom = this.parentHeight - this.height - this.top

    this.settingAttribute()

    // 优化：取消选中的行为优先绑定在父节点上
    const parentElement = this.$el.parentNode;
    addEvent(parentElement || document.documentElement, 'mousedown', this.deselect);
    addEvent(parentElement || document.documentElement, 'touchend touchcancel', this.deselect);

    addEvent(window, 'resize', this.checkParentSize);
  }

  ngOnChanges(changes: { [P in keyof this]?: SimpleChange } & SimpleChanges): void {

    if (changes.w) {
      if (typeof (this.width) !== 'number') {
        this.changeWidth(changes.w.currentValue);
      }
      if (!this.resizing && !this.dragging) {
        if (this.parent) {
          this.bounds = this.calcResizeLimits();
        }

        this.changeWidth(changes.w.currentValue);
      }
    }

    if (changes.h) {
      if (typeof (this.height) !== 'number') {
        this.changeHeight(changes.h.currentValue);
      }
      if (!this.resizing && !this.dragging) {
        if (this.parent) {
          this.bounds = this.calcResizeLimits();
        }

        this.changeHeight(changes.h.currentValue);
      }
    }

    if (changes.minWidth) {
      if (changes.minWidth.currentValue > 0 && changes.minWidth.currentValue <= this.width) {
        this.minW = changes.minWidth.currentValue;
      }
    }

    if (changes.minHeight) {
      if (changes.minHeight.currentValue > 0 && changes.minHeight.currentValue <= this.height) {
        this.minH = changes.minHeight.currentValue;
      }
    }

    if (changes.maxWidth) {
      this.maxW = changes.maxWidth.currentValue;
    }

    if (changes.maxHeight) {
      this.maxH = changes.maxHeight.currentValue;
    }

    if (changes.active) {
      if (changes.active.currentValue) {
        this.activated.emit(true);
      } else {
        this.deactivated.emit(false);
      }
    }

    if (changes.z) {
      if (changes.z.currentValue >= 0 || changes.z.currentValue === 'auto') {
        this.zIndex = changes.z.currentValue
      }
    }

    if (changes.x) {
      if (!this.resizing && !this.dragging) {
        if (this.parent) {
          this.bounds = this.calcDragLimits();
        }

        this.moveHorizontally(changes.x.currentValue);
      }
    }

    if (changes.y) {
      if (!this.resizing && !this.dragging) {
        if (this.parent) {
          this.bounds = this.calcDragLimits();
        }

        this.moveVertically(changes.y.currentValue);
      }
    }

    if (changes.lockAspectRatio) {
      if (changes.lockAspectRatio.currentValue) {
        this.aspectFactor = this.width / this.height;
      } else {
        this.aspectFactor = undefined;
      }
    }
  }

  ngOnDestroy(): void {
    removeEvent(document.documentElement, 'mousedown', this.deselect)
    removeEvent(document.documentElement, 'touchstart', this.handleUp)
    removeEvent(document.documentElement, 'mousemove', this.move)
    removeEvent(document.documentElement, 'touchmove', this.move)
    removeEvent(document.documentElement, 'mouseup', this.handleUp)
    removeEvent(document.documentElement, 'touchend touchcancel', this.deselect)

    removeEvent(window, 'resize', this.checkParentSize)
  }

  handleStyle(handle: string) {
    const stick = handle;

    if (!this.handleInfo.switch) {
      return { display: this.enabled ? 'block' : 'none' }
    }

    const size = parseFloat((this.handleInfo.size / this.scaleRatio).toFixed(2));
    const offset = (this.handleInfo.offset / this.scaleRatio).toFixed(2)
    const center = (size / 2).toFixed(2)

    const styleMap = {
      tl: {
        top: `${offset}px`,
        left: `${offset}px`
      },
      tm: {
        top: `${offset}px`,
        left: `calc(50% - ${center}px)`
      },
      tr: {
        top: `${offset}px`,
        right: `${offset}px`
      },
      mr: {
        top: `calc(50% - ${center}px)`,
        right: `${offset}px`
      },
      br: {
        bottom: `${offset}px`,
        right: `${offset}px`
      },
      bm: {
        bottom: `${offset}px`,
        right: `calc(50% - ${center}px)`
      },
      bl: {
        bottom: `${offset}px`,
        left: `${offset}px`
      },
      ml: {
        top: `calc(50% - ${center}px)`,
        left: `${offset}px`
      }
    }
    const stickStyle = {
      width: `${size}px`,
      height: `${size}px`,
      top: styleMap[stick].top,
      left: styleMap[stick].left,
      right: styleMap[stick].right,
      bottom: styleMap[stick].bottom,
      display: 'none'
    }
    stickStyle.display = this.enabled ? 'block' : 'none'
    return stickStyle
  }

  handleClass(handle: string): string {
    return `${this.classNameHandle} ${this.classNameHandle}-${handle}`;
  }

  // 右键菜单
  onContextMenu(e) {
    this.contextmenu.emit(e);
  }

  // 控制柄触摸按下
  handleTouchDown(handle: string, e: TouchEvent) {
    eventsFor = events.touch

    this.handleDown(handle, e)
  }

  // 控制柄按下
  handleDown(handle: string, e: MouseEvent | TouchEvent) {
    if (e instanceof MouseEvent && e.which !== 1) {
      return
    }

    if (this.onResizeStart(this, e) === false) {
      return
    }

    if (e.stopPropagation) e.stopPropagation()

    // Here we avoid a dangerous recursion by faking
    // corner handles as middle handles
    if (this.lockAspectRatio && !handle.includes('m')) {
      this.handle = 'm' + handle.substring(1)
    } else {
      this.handle = handle
    }

    this.resizing = true

    this.mouseClickPosition.mouseX = e instanceof TouchEvent ? e.touches[0].pageX : e.pageX
    this.mouseClickPosition.mouseY = e instanceof TouchEvent ? e.touches[0].pageY : e.pageY
    this.mouseClickPosition.left = this.left
    this.mouseClickPosition.right = this.right
    this.mouseClickPosition.top = this.top
    this.mouseClickPosition.bottom = this.bottom
    this.mouseClickPosition.w = this.width
    this.mouseClickPosition.h = this.height

    this.bounds = this.calcResizeLimits()

    addEvent(document.documentElement, eventsFor.move, this.handleResize)
    addEvent(document.documentElement, eventsFor.stop, this.handleUp);
  }

  // 重置边界和鼠标状态
  resetBoundsAndMouseState() {
    this.mouseClickPosition = { mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0 }

    this.bounds = {
      minLeft: null,
      maxLeft: null,
      minRight: null,
      maxRight: null,
      minTop: null,
      maxTop: null,
      minBottom: null,
      maxBottom: null
    }
  }

  // 检查父元素大小
  protected onCheckParentSize() {
    if (this.parent) {
      const [newParentWidth, newParentHeight] = this.getParentSize()
      // 修复父元素改变大小后，组件resizing时活动异常
      this.right = newParentWidth - this.width - this.left
      this.bottom = newParentHeight - this.height - this.top

      this.parentWidth = newParentWidth
      this.parentHeight = newParentHeight
    }
  }

  // 获取父元素大小
  protected getParentSize() {
    if (this.parent === true) {
      const style = window.getComputedStyle(this.parentElement, null)
      return [
        parseInt(style.getPropertyValue('width'), 10),
        parseInt(style.getPropertyValue('height'), 10)
      ]
    }
    if (typeof (this.parent) === 'string') {
      const parentNode = document.querySelector(this.parent)
      if (!(parentNode instanceof HTMLElement)) {
        throw new Error(`The selector ${this.parent} does not match any element`)
      }
      return [parentNode.offsetWidth, parentNode.offsetHeight]
    }

    return [null, null]
  }


  // 元素触摸按下
  elementTouchDown(e: TouchEvent) {
    eventsFor = events.touch

    this.elementDown(e)
  }

  elementMouseDown(e: MouseEvent) {
    eventsFor = events.mouse
    this.elementDown(e)
  }

  // 元素按下
  elementDown(e: TouchEvent | MouseEvent) {
    if (e instanceof MouseEvent && e.which !== 1) {
      return
    }

    const target = e.target || e.srcElement

    if (this.$el.contains(target as Element)) {
      if (this.onDragStart(this, e) === false) {
        return
      }

      if (
        (this.dragHandle && !matchesSelectorToParentElements(target as HTMLElement, this.dragHandle, this.$el)) ||
        (this.dragCancel && matchesSelectorToParentElements(target as HTMLElement, this.dragCancel, this.$el))
      ) {
        this.dragging = false

        return
      }

      if (!this.enabled) {
        this.enabled = true;
      }

      if (this.draggable) {
        this.dragging = true
      }
      this.mouseClickPosition.mouseX = e instanceof TouchEvent ? e.touches[0].pageX : e.pageX
      this.mouseClickPosition.mouseY = e instanceof TouchEvent ? e.touches[0].pageY : e.pageY

      this.mouseClickPosition.left = this.left
      this.mouseClickPosition.right = this.right
      this.mouseClickPosition.top = this.top
      this.mouseClickPosition.bottom = this.bottom
      this.mouseClickPosition.w = this.width
      this.mouseClickPosition.h = this.height

      if (this.parent) {
        this.bounds = this.calcDragLimits()
      }

      addEvent(document.documentElement, eventsFor.move, this.move);
      addEvent(document.documentElement, eventsFor.stop, this.handleUp);
    }
  }

  // 移动
  protected async onMove(e) {
    if (this.resizing) {
      this.onHandleResize(e)
    } else if (this.dragging) {
      await this.onHandleDrag(e)
    }
  }

  // 元素移动
  protected async onHandleDrag(e) {
    const axis = this.axis
    const grid = this.grid
    const bounds = this.bounds
    const mouseClickPosition = this.mouseClickPosition

    const tmpDeltaX = axis && axis !== 'y' ? mouseClickPosition.mouseX - (e.touches ? e.touches[0].pageX : e.pageX) : 0
    const tmpDeltaY = axis && axis !== 'x' ? mouseClickPosition.mouseY - (e.touches ? e.touches[0].pageY : e.pageY) : 0

    const [deltaX, deltaY] = snapToGrid(grid, tmpDeltaX, tmpDeltaY, this.scaleRatio)

    const left = restrictToBounds(mouseClickPosition.left - deltaX, bounds.minLeft, bounds.maxLeft)
    const top = restrictToBounds(mouseClickPosition.top - deltaY, bounds.minTop, bounds.maxTop)
    if (this.onDrag(this, left, top) === false) {
      return
    }
    const right = restrictToBounds(mouseClickPosition.right + deltaX, bounds.minRight, bounds.maxRight)
    const bottom = restrictToBounds(mouseClickPosition.bottom + deltaY, bounds.minBottom, bounds.maxBottom)
    this.left = left
    this.top = top
    this.right = right
    this.bottom = bottom

    await this.snapCheck()
    this.onDragging.emit({
      left: this.left,
      top: this.top
    });
  }

  // 从控制柄松开
  protected async onHandleUp(e) {
    this.handle = null

    // 初始化辅助线数据
    const temArr = new Array(3).fill({ display: false, position: '', origin: '', lineLength: '' })
    const refLine = { vLine: [], hLine: [] }
    for (let i in refLine) {
      refLine[i] = JSON.parse(JSON.stringify(temArr))
    }

    if (this.resizing) {
      this.resizing = false
      await this.conflictCheck()
      this.refLineChange.emit(
        {
          vLine: refLine.vLine.filter(o => o.display),
          hLine: refLine.hLine.filter(o => o.display)
        }
      );
      this.onResizeStop.emit({
        left: this.left,
        top: this.top,
        width: this.width,
        height: this.height
      });
    }
    if (this.dragging) {
      this.dragging = false
      await this.conflictCheck()
      this.refLineChange.emit(
        {
          vLine: refLine.vLine.filter(o => o.display),
          hLine: refLine.hLine.filter(o => o.display)
        }
      );
      this.onDragStop.emit({
        left: this.left,
        top: this.top
      });
    }
    this.resetBoundsAndMouseState()
    removeEvent(document.documentElement, eventsFor.move, this.handleResize)
  }

  // 设置属性
  protected settingAttribute() {
    // 设置冲突检测
    this.$el.setAttribute('data-is-check', `${this.isConflictCheck}`)
    // 设置对齐元素
    this.$el.setAttribute('data-is-snap', `${this.snap}`)
  }

  // 冲突检测
  conflictCheck() {
    const top = this.top
    const left = this.left
    const width = this.width
    const height = this.height

    if (this.isConflictCheck) {
      const nodes = Array.from(this.$el.parentNode!.childNodes).map(o => o as HTMLElement); // 获取当前父节点下所有子节点
      for (let item of nodes) {
        if (item.className !== undefined && !item.className.includes(this.classNameActive) && item.getAttribute('data-is-check') !== null && item.getAttribute('data-is-check') !== 'false') {
          const tw = item.offsetWidth
          const th = item.offsetHeight
          // 正则获取left与right
          let [tl, tt] = this.formatTransformVal(item.style.transform)

          // 左上角与右下角重叠
          const tfAndBr = (top >= tt && left >= tl && tt + th > top && tl + tw > left) || (top <= tt && left < tl && top + height > tt && left + width > tl)
          // 右上角与左下角重叠
          const brAndTf = (left <= tl && top >= tt && left + width > tl && top < tt + th) || (top < tt && left > tl && top + height > tt && left < tl + tw)
          // 下边与上边重叠
          const bAndT = (top <= tt && left >= tl && top + height > tt && left < tl + tw) || (top >= tt && left <= tl && top < tt + th && left > tl + tw)
          // 上边与下边重叠（宽度不一样）
          const tAndB = (top <= tt && left >= tl && top + height > tt && left < tl + tw) || (top >= tt && left <= tl && top < tt + th && left > tl + tw)
          // 左边与右边重叠
          const lAndR = (left >= tl && top >= tt && left < tl + tw && top < tt + th) || (top > tt && left <= tl && left + width > tl && top < tt + th)
          // 左边与右边重叠（高度不一样）
          const rAndL = (top <= tt && left >= tl && top + height > tt && left < tl + tw) || (top >= tt && left <= tl && top < tt + th && left + width > tl)

          // 如果冲突，就将回退到移动前的位置
          if (tfAndBr || brAndTf || bAndT || tAndB || lAndR || rAndL) {
            this.top = this.mouseClickPosition.top
            this.left = this.mouseClickPosition.left
            this.right = this.mouseClickPosition.right
            this.bottom = this.mouseClickPosition.bottom
            this.width = this.mouseClickPosition.w
            this.height = this.mouseClickPosition.h

            this.onResizing.emit({
              left: this.left,
              top: this.top,
              width: this.width,
              height: this.height
            });
          }
        }
      }
    }
  }

  // 检测对齐元素
  async snapCheck() {
    let width = this.width
    let height = this.height
    if (this.snap) {
      let activeLeft = this.left
      let activeRight = this.left + width
      let activeTop = this.top
      let activeBottom = this.top + height

      // 初始化辅助线数据
      const temArr = new Array(3).fill({ display: false, position: '', origin: '', lineLength: '' })
      const refLine = { vLine: [], hLine: [] }
      for (let i in refLine) {
        refLine[i] = JSON.parse(JSON.stringify(temArr))
      }

      // 获取当前父节点下所有子节点
      // const nodes = this.$el.parentNode.childNodes
      const nodes = Array.from(this.$el.parentNode.childNodes).map(o => o as HTMLElement);

      let tem = {
        value: { x: [[], [], []], y: [[], [], []] },
        display: [],
        position: []
      }
      const { groupWidth, groupHeight, groupLeft, groupTop, bln } = await this.getActiveAll(nodes)
      if (!bln) {
        width = groupWidth
        height = groupHeight
        activeLeft = groupLeft
        activeRight = groupLeft + groupWidth
        activeTop = groupTop
        activeBottom = groupTop + groupHeight
      }
      for (let item of nodes) {
        if (item.className !== undefined && !item.className.includes(this.classNameActive) && item.getAttribute('data-is-snap') !== null && item.getAttribute('data-is-snap') !== 'false') {
          const w = item.offsetWidth
          const h = item.offsetHeight
          const [l, t] = this.formatTransformVal(item.style.transform)
          const r = l + w // 对齐目标right
          const b = t + h // 对齐目标的bottom

          const hc = Math.abs((activeTop + height / 2) - (t + h / 2)) <= this.snapTolerance // 水平中线
          const vc = Math.abs((activeLeft + width / 2) - (l + w / 2)) <= this.snapTolerance // 垂直中线

          const ts = Math.abs(t - activeBottom) <= this.snapTolerance // 从上到下
          const TS = Math.abs(b - activeBottom) <= this.snapTolerance // 从上到下
          const bs = Math.abs(t - activeTop) <= this.snapTolerance // 从下到上
          const BS = Math.abs(b - activeTop) <= this.snapTolerance // 从下到上

          const ls = Math.abs(l - activeRight) <= this.snapTolerance // 外左
          const LS = Math.abs(r - activeRight) <= this.snapTolerance // 外左
          const rs = Math.abs(l - activeLeft) <= this.snapTolerance // 外右
          const RS = Math.abs(r - activeLeft) <= this.snapTolerance // 外右

          tem['display'] = [ts, TS, bs, BS, hc, hc, ls, LS, rs, RS, vc, vc]
          tem['position'] = [t, b, t, b, t + h / 2, t + h / 2, l, r, l, r, l + w / 2, l + w / 2]

          // fix：中线自动对齐，元素可能超过父元素边界的问题
          if (ts) {
            if (bln) {
              this.top = Math.max(t - height, this.bounds.minTop)
              this.bottom = this.parentHeight - this.top - height
            }
            tem.value.y[0].push(l, r, activeLeft, activeRight)
          }
          if (bs) {
            if (bln) {
              this.top = t
              this.bottom = this.parentHeight - this.top - height
            }
            tem.value.y[0].push(l, r, activeLeft, activeRight)
          }
          if (TS) {
            if (bln) {
              this.top = Math.max(b - height, this.bounds.minTop)
              this.bottom = this.parentHeight - this.top - height
            }
            tem.value.y[1].push(l, r, activeLeft, activeRight)
          }
          if (BS) {
            if (bln) {
              this.top = b
              this.bottom = this.parentHeight - this.top - height
            }
            tem.value.y[1].push(l, r, activeLeft, activeRight)
          }

          if (ls) {
            if (bln) {
              this.left = Math.max(l - width, this.bounds.minLeft)
              this.right = this.parentWidth - this.left - width
            }
            tem.value.x[0].push(t, b, activeTop, activeBottom)
          }
          if (rs) {
            if (bln) {
              this.left = l
              this.right = this.parentWidth - this.left - width
            }
            tem.value.x[0].push(t, b, activeTop, activeBottom)
          }
          if (LS) {
            if (bln) {
              this.left = Math.max(r - width, this.bounds.minLeft)
              this.right = this.parentWidth - this.left - width
            }
            tem.value.x[1].push(t, b, activeTop, activeBottom)
          }
          if (RS) {
            if (bln) {
              this.left = r
              this.right = this.parentWidth - this.left - width
            }
            tem.value.x[1].push(t, b, activeTop, activeBottom)
          }

          if (hc) {
            if (bln) {
              this.top = Math.max(t + h / 2 - height / 2, this.bounds.minTop)
              this.bottom = this.parentHeight - this.top - height
            }
            tem.value.y[2].push(l, r, activeLeft, activeRight)
          }
          if (vc) {
            if (bln) {
              this.left = Math.max(l + w / 2 - width / 2, this.bounds.minLeft)
              this.right = this.parentWidth - this.left - width
            }
            tem.value.x[2].push(t, b, activeTop, activeBottom)
          }
          // 辅助线坐标与是否显示(display)对应的数组,易于循环遍历
          const arrTem = [0, 1, 0, 1, 2, 2, 0, 1, 0, 1, 2, 2]
          for (let i = 0; i <= arrTem.length; i++) {
            // 前6为Y辅助线,后6为X辅助线
            const xory = i < 6 ? 'y' : 'x'
            const horv = i < 6 ? 'hLine' : 'vLine'
            if (tem.display[i]) {
              const { origin, length } = this.calcLineValues(tem.value[xory][arrTem[i]])
              refLine[horv][arrTem[i]].display = tem.display[i]
              refLine[horv][arrTem[i]].position = tem.position[i];
              refLine[horv][arrTem[i]].origin = origin
              refLine[horv][arrTem[i]].lineLength = length
            }
          }
        }
      }
      this.refLineChange.emit(
        {
          vLine: refLine.vLine.filter(o => o.display),
          hLine: refLine.hLine.filter(o => o.display)
        }
      );
    }
  }

  protected calcLineValues(arr: number[]): { length: number, origin: number } {
    const length = Math.max(...arr) - Math.min(...arr);
    const origin = Math.min(...arr);
    return { length, origin }
  }

  /** 取消 */
  protected onDeselect(e) {
    const target = e.target || e.srcElement
    const regex = new RegExp(this.className + '-([trmbl]{2})', '')

    if (!this.$el.contains(target) && !regex.test(target.className)) {
      if (this.enabled && !this.preventDeactivation) {
        this.enabled = false;
      }

      removeEvent(document.documentElement, eventsFor.move, this.handleResize)
    }

    this.resetBoundsAndMouseState()
  }

  /** 获取所有激活的节点 */
  protected async getActiveAll(nodes: HTMLElement[]) {
    const activeAll = []
    const XArray = []
    const YArray = []
    let groupWidth = 0
    let groupHeight = 0
    let groupLeft = 0
    let groupTop = 0
    for (let item of nodes) {
      if (item.className !== undefined && item.className.includes(this.classNameActive)) {
        activeAll.push(item)
      }
    }
    const AllLength = activeAll.length
    if (AllLength > 1) {
      for (let i of activeAll) {
        const l = i.offsetLeft
        const r = l + i.offsetWidth
        const t = i.offsetTop
        const b = t + i.offsetHeight
        XArray.push(t, b)
        YArray.push(l, r)
      }
      groupWidth = Math.max(...YArray) - Math.min(...YArray)
      groupHeight = Math.max(...XArray) - Math.min(...XArray)
      groupLeft = Math.min(...YArray)
      groupTop = Math.min(...XArray)
    }
    const bln = AllLength === 1
    return { groupWidth, groupHeight, groupLeft, groupTop, bln }
  }

  // 正则获取left与top
  protected formatTransformVal(string) {
    let [left, top] = string.replace(/[^0-9\-,]/g, '').split(',')
    if (top === undefined) top = 0
    return [+left, +top]
  }

  // 计算移动范围
  protected calcDragLimits() {
    return {
      minLeft: this.left % this.grid[0],
      maxLeft: Math.floor((this.parentWidth - this.width - this.left) / this.grid[0]) * this.grid[0] + this.left,
      minRight: this.right % this.grid[0],
      maxRight: Math.floor((this.parentWidth - this.width - this.right) / this.grid[0]) * this.grid[0] + this.right,
      minTop: this.top % this.grid[1],
      maxTop: Math.floor((this.parentHeight - this.height - this.top) / this.grid[1]) * this.grid[1] + this.top,
      minBottom: this.bottom % this.grid[1],
      maxBottom: Math.floor((this.parentHeight - this.height - this.bottom) / this.grid[1]) * this.grid[1] + this.bottom
    }
  }

  protected moveHorizontally(val: number) {
    const [deltaX, _] = snapToGrid(this.grid, val, this.top, this.scale)
    const left = restrictToBounds(deltaX, this.bounds.minLeft, this.bounds.maxLeft)
    this.left = left
    this.right = this.parentWidth - this.width - left
  }

  protected moveVertically(val: number) {
    const [_, deltaY] = snapToGrid(this.grid, this.left, val, this.scale)
    const top = restrictToBounds(deltaY, this.bounds.minTop, this.bounds.maxTop)
    this.top = top
    this.bottom = this.parentHeight - this.height - top
  }

  // 计算调整大小范围
  protected calcResizeLimits() {
    let minW = this.minW
    let minH = this.minH
    let maxW = this.maxW
    let maxH = this.maxH

    const aspectFactor = this.aspectFactor
    const [gridX, gridY] = this.grid
    const width = this.width
    const height = this.height
    const left = this.left
    const top = this.top
    const right = this.right
    const bottom = this.bottom

    if (this.lockAspectRatio) {
      if (minW / minH > aspectFactor) {
        minH = minW / aspectFactor
      } else {
        minW = aspectFactor * minH
      }

      if (maxW && maxH) {
        maxW = Math.min(maxW, aspectFactor * maxH)
        maxH = Math.min(maxH, maxW / aspectFactor)
      } else if (maxW) {
        maxH = maxW / aspectFactor
      } else if (maxH) {
        maxW = aspectFactor * maxH
      }
    }

    maxW = maxW - (maxW % gridX)
    maxH = maxH - (maxH % gridY)

    const limits = {
      minLeft: null,
      maxLeft: null,
      minTop: null,
      maxTop: null,
      minRight: null,
      maxRight: null,
      minBottom: null,
      maxBottom: null
    }

    if (this.parent) {
      limits.minLeft = left % gridX
      limits.maxLeft = left + Math.floor((width - minW) / gridX) * gridX
      limits.minTop = top % gridY
      limits.maxTop = top + Math.floor((height - minH) / gridY) * gridY
      limits.minRight = right % gridX
      limits.maxRight = right + Math.floor((width - minW) / gridX) * gridX
      limits.minBottom = bottom % gridY
      limits.maxBottom = bottom + Math.floor((height - minH) / gridY) * gridY

      if (maxW) {
        limits.minLeft = Math.max(limits.minLeft, this.parentWidth - right - maxW)
        limits.minRight = Math.max(limits.minRight, this.parentWidth - left - maxW)
      }

      if (maxH) {
        limits.minTop = Math.max(limits.minTop, this.parentHeight - bottom - maxH)
        limits.minBottom = Math.max(limits.minBottom, this.parentHeight - top - maxH)
      }

      if (this.lockAspectRatio) {
        limits.minLeft = Math.max(limits.minLeft, left - top * aspectFactor)
        limits.minTop = Math.max(limits.minTop, top - left / aspectFactor)
        limits.minRight = Math.max(limits.minRight, right - bottom * aspectFactor)
        limits.minBottom = Math.max(limits.minBottom, bottom - right / aspectFactor)
      }
    } else {
      limits.minLeft = null
      limits.maxLeft = left + Math.floor((width - minW) / gridX) * gridX
      limits.minTop = null
      limits.maxTop = top + Math.floor((height - minH) / gridY) * gridY
      limits.minRight = null
      limits.maxRight = right + Math.floor((width - minW) / gridX) * gridX
      limits.minBottom = null
      limits.maxBottom = bottom + Math.floor((height - minH) / gridY) * gridY

      if (maxW) {
        limits.minLeft = -(right + maxW)
        limits.minRight = -(left + maxW)
      }

      if (maxH) {
        limits.minTop = -(bottom + maxH)
        limits.minBottom = -(top + maxH)
      }

      if (this.lockAspectRatio && (maxW && maxH)) {
        limits.minLeft = Math.min(limits.minLeft, -(right + maxW))
        limits.minTop = Math.min(limits.minTop, -(maxH + bottom))
        limits.minRight = Math.min(limits.minRight, -left - maxW)
        limits.minBottom = Math.min(limits.minBottom, -top - maxH)
      }
    }

    return limits
  }


  // 控制柄移动
  protected async onHandleResize(e) {
    let left = this.left
    let top = this.top
    let right = this.right
    let bottom = this.bottom

    const mouseClickPosition = this.mouseClickPosition
    // const lockAspectRatio = this.lockAspectRatio
    const aspectFactor = this.aspectFactor

    const tmpDeltaX = mouseClickPosition.mouseX - (e.touches ? e.touches[0].pageX : e.pageX)
    const tmpDeltaY = mouseClickPosition.mouseY - (e.touches ? e.touches[0].pageY : e.pageY)

    if (!this.widthTouched && tmpDeltaX) {
      this.widthTouched = true
    }
    if (!this.heightTouched && tmpDeltaY) {
      this.heightTouched = true
    }
    const [deltaX, deltaY] = snapToGrid(this.grid, tmpDeltaX, tmpDeltaY, this.scaleRatio)

    if (this.handle.includes('b')) {
      bottom = restrictToBounds(
        mouseClickPosition.bottom + deltaY,
        this.bounds.minBottom,
        this.bounds.maxBottom
      )
      if (this.lockAspectRatio && this.resizingOnY) {
        right = this.right - (this.bottom - bottom) * aspectFactor
      }
    } else if (this.handle.includes('t')) {
      top = restrictToBounds(
        mouseClickPosition.top - deltaY,
        this.bounds.minTop,
        this.bounds.maxTop
      )
      if (this.lockAspectRatio && this.resizingOnY) {
        left = this.left - (this.top - top) * aspectFactor
      }
    }

    if (this.handle.includes('r')) {
      right = restrictToBounds(
        mouseClickPosition.right + deltaX,
        this.bounds.minRight,
        this.bounds.maxRight
      )
      if (this.lockAspectRatio && this.resizingOnX) {
        bottom = this.bottom - (this.right - right) / aspectFactor
      }
    } else if (this.handle.includes('l')) {
      left = restrictToBounds(
        mouseClickPosition.left - deltaX,
        this.bounds.minLeft,
        this.bounds.maxLeft
      )
      if (this.lockAspectRatio && this.resizingOnX) {
        top = this.top - (this.left - left) / aspectFactor
      }
    }

    const width = computeWidth(this.parentWidth, left, right)
    const height = computeHeight(this.parentHeight, top, bottom)
    if (this.onResize(this.handle, this.left, this.top, this.width, this.height) === false) {
      return
    }
    this.left = left
    this.top = top
    this.right = right
    this.bottom = bottom
    this.width = width
    this.height = height
    this.onResizing.emit({
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height
    });
  }

  protected changeWidth(val: number) {
    const [newWidth, _] = snapToGrid(this.grid, val, 0, this.scale)
    let right = restrictToBounds(
      (this.parentWidth - newWidth - this.left),
      this.bounds.minRight,
      this.bounds.maxRight
    )
    let bottom = this.bottom
    if (this.lockAspectRatio) {
      bottom = this.bottom - (this.right - right) / this.aspectFactor
    }
    const width = computeWidth(this.parentWidth, this.left, right)
    const height = computeHeight(this.parentHeight, this.top, bottom)
    this.right = right
    this.bottom = bottom
    this.width = width
    this.height = height
  }

  protected changeHeight(val: number) {
    const [_, newHeight] = snapToGrid(this.grid, 0, val, this.scale)
    let bottom = restrictToBounds(
      (this.parentHeight - newHeight - this.top),
      this.bounds.minBottom,
      this.bounds.maxBottom
    )
    let right = this.right
    if (this.lockAspectRatio) {
      right = this.right - (this.bottom - bottom) * this.aspectFactor
    }
    const width = computeWidth(this.parentWidth, this.left, right)
    const height = computeHeight(this.parentHeight, this.top, bottom)
    this.right = right
    this.bottom = bottom
    this.width = width
    this.height = height
  }
}
