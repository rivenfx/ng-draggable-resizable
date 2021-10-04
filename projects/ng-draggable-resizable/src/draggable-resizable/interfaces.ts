/** 事件 */
export const events = {
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup'
  },
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend'
  }
}

/** 禁止用户选取样式 */
export const userSelectNone = {
  userSelect: 'none',
  MozUserSelect: 'none',
  WebkitUserSelect: 'none',
  MsUserSelect: 'none'
}

/** 用户选中自动选中样式 */
export const userSelectAuto = {
  userSelect: 'auto',
  MozUserSelect: 'auto',
  WebkitUserSelect: 'auto',
  MsUserSelect: 'auto'
}

/** 修改大小 */
export interface IResize {
  left: number,
  top: number,
  width: number;
  height: number;
}

/** 拖拽 */
export interface IDrag {
  left: number,
  top: number,
}

/** 参考线 */
export interface IRefLine {
  display: boolean;
  position: number;
  origin: number;
  lineLength: number;
}

/** 参考线组 */
export interface IRefLineGroup {
  vLine: IRefLine[];
  hLine: IRefLine[];
}

/** 鼠标点击位置 */
export interface IMouseClickPosition {
  mouseX: number;
  mouseY: number;
  x: number;
  y: number;
  w: number;
  h: number;
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

/** resize handle结构 */
export interface IHandleInfo {
  size: number;
  offset: -5;
  switch: boolean;
}
