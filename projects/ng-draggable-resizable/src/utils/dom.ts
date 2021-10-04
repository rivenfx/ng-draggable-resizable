import {isFunction} from './fns'

// 将选择器与父元素匹配
export function matchesSelectorToParentElements(el: HTMLElement, selector: string, baseNode: HTMLElement) {
  let node = el

  const matchesSelectorFunc = [
    'matches',
    'webkitMatchesSelector',
    'mozMatchesSelector',
    'msMatchesSelector',
    'oMatchesSelector'
  ].find(func => isFunction(node[func]))

  if (!isFunction(node[matchesSelectorFunc])) {
    return false
  }

  do {
    if (node[matchesSelectorFunc](selector)) {
      return true
    }
    if (node === baseNode) {
      return false
    }
    node = node.parentNode as any;
  } while (node)

  return false
}

export function getComputedSize($el: HTMLElement): number[] {
  const style = window.getComputedStyle($el)

  return [
    parseFloat(style.getPropertyValue('width')),
    parseFloat(style.getPropertyValue('height'))
  ]
}

// 添加事件
export function addEvent(el: HTMLElement | Node | Window, event: string, handler: Function) {
  if (!el) {
    return
  }
  if (el['attachEvent']) {
    el['attachEvent']('on' + event, handler)
  } else if (el.addEventListener) {
    el.addEventListener(event, handler as any, true)
  } else {
    el['on' + event] = handler
  }
}

// 删除事件
export function removeEvent(el: HTMLElement | Node | Window, event: string, handler: Function) {
  if (!el) {
    return
  }
  if (el['detachEvent']) {
    el['detachEvent']('on' + event, handler)
  } else if (el.removeEventListener) {
    el.removeEventListener(event, handler as any, true)
  } else {
    el['on' + event] = null
  }
}
