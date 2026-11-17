/** Accordion / layout değişiminde Lenis + ScrollTrigger senkronu */

export const LENIS_RESIZE_EVENT = 'regon:lenis-resize'
export const LENIS_STOP_EVENT = 'regon:lenis-stop'
export const LENIS_START_EVENT = 'regon:lenis-start'

export function requestLenisResize() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(LENIS_RESIZE_EVENT))
}

/** Drawer / modal açıkken sayfa smooth-scroll'unu durdur */
export function stopLenis() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(LENIS_STOP_EVENT))
}

export function startLenis() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(LENIS_START_EVENT))
}
