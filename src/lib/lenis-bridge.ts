/** Accordion / layout değişiminde Lenis + ScrollTrigger senkronu */

export const LENIS_RESIZE_EVENT = 'regon:lenis-resize'

export function requestLenisResize() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(LENIS_RESIZE_EVENT))
}
