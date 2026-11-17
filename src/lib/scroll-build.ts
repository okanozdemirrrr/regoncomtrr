// ============================================================
// Regon Teknoloji — Scroll-Triggered Build Animation
// ------------------------------------------------------------
// Kullanıcı aşağı kaydırdıkça her section 3 aşamadan geçer:
//   1. wireframe → sadece turkuaz kesik çizgili iskelet
//   2. filling   → arka plan dolar, yazılar daktilo ile yazılır,
//                  görseller clip-path ile açılır, butonlar pop-in
//   3. complete  → gerçek tasarım (bir kez tamamlanan geri dönmez)
//
// İşaretleme (markup) sözleşmesi:
//   .build-section                    → izlenen bölüm (ayrı observer)
//   .build-element                    → animasyonlanan eleman
//     data-build-delay="0|100|200…"   → aynı bölüm içinde stagger (ms)
//     data-build-duration="900"       → dolma süresi (ms, opsiyonel)
//     data-build-lite="skip"          → mobilde animasyonu atla
//   .build-typewriter                 → başlık, karakter karakter yazılır
//   .build-media                      → görsel, soldan sağa açılır
//   .build-pop                        → buton, en son pop-in
//
// Hero / navbar scroll-build KULLANMAZ (hızlı CSS giriş animasyonu).
//
// Durum CSS'e şu yollarla aktarılır:
//   data-build-stage="wireframe|filling|complete"
//   --build-progress : 0-1 (gösterilen inşa ilerlemesi)
//   --build-view     : 0-1 (viewport konumu: girişte 0, ortada 0.5, çıkışta 1)
//   --bt-typed       : daktilo için yazılmış karakter sayısı
// ============================================================

type Stage = 'wireframe' | 'filling' | 'complete'

/**
 * Hydration öncesi (HTML parse edilirken) <head> içinde çalışan inline script.
 * Sadece ana sayfada ve hareket azaltma kapalıyken `build-pending` ekler →
 * elemanlar React yüklenene kadar iskelet (wireframe) görünümünde bekler.
 * JS hiç yüklenmezse 6 sn sonra içerik güvenle görünür hale gelir.
 */
export const SCROLL_BUILD_PREPAINT_SCRIPT = `(function(){try{if(location.pathname!=="/")return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var d=document.documentElement;d.setAttribute("data-build-mode",window.matchMedia("(max-width:767px)").matches?"lite":"full");d.classList.add("build-pending");setTimeout(function(){d.classList.remove("build-pending")},6000)}catch(e){}})()`

interface BuildItem {
  el: HTMLElement
  section: SectionState
  delay: number
  duration: number
  /** Scroll'dan gelen hedef ilerleme (monoton artar) */
  target: number
  /** Ekranda gösterilen ilerleme (hedefe doğru yumuşakça yaklaşır) */
  shown: number
  /** Animasyonun başlayacağı an (delay dahil, performance.now cinsinden) */
  startAt: number | null
  stage: Stage
  visible: boolean
  chars: HTMLElement[]
  caret: HTMLElement | null
  lastWritten: number
}

interface SectionState {
  el: HTMLElement
  active: boolean
  items: BuildItem[]
}

// İnşa penceresi: eleman üst kenarı viewport'un %92'sine gelince başlar,
// %47'sine geldiğinde hedef 1 olur. (Sabit pikseller yerine vh oranı.)
const HOLD = 0.08
const SPAN = 0.45
const SETTLE_MS = 650

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** Türkçe karakterler ve emoji/birleşik karakterler için güvenli bölme */
function splitGraphemes(text: string): string[] {
  const Seg = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter }).Segmenter
  if (Seg) {
    const seg = new Seg('tr', { granularity: 'grapheme' })
    return Array.from(seg.segment(text), (s) => s.segment)
  }
  return Array.from(text)
}

function textNodesOf(root: HTMLElement, directOnly: boolean): Text[] {
  const nodes: Text[] = []
  if (directOnly) {
    root.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE && n.textContent && n.textContent.trim()) {
        nodes.push(n as Text)
      }
    })
    return nodes
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let n = walker.nextNode()
  while (n) {
    if (n.textContent && n.textContent.trim()) nodes.push(n as Text)
    n = walker.nextNode()
  }
  return nodes
}

export function prefersReducedBuildMotion(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Scroll-build sistemini başlatır. Temizleme fonksiyonu döndürür;
 * temizleme DOM'u (bölünmüş metinler, attribute'lar) eski haline getirir.
 * useLayoutEffect içinde çağrılmalıdır (ilk paint'ten önce wireframe'e geçer).
 */
export function initScrollBuild(root: ParentNode = document): () => void {
  if (typeof window === 'undefined') return () => {}

  const html = document.documentElement
  // Paint öncesi gizleme sınıfını (layout'taki inline script) kaldır.
  // Aynı senkron görevde wireframe aşamasına geçildiği için arada paint olmaz.
  html.classList.remove('build-pending')

  // Erişilebilirlik: hareket azaltma isteniyorsa hiçbir şey yapma → içerik direkt tamamlanmış.
  if (prefersReducedBuildMotion()) return () => {}

  const lite = window.matchMedia('(max-width: 767px)').matches
  html.setAttribute('data-build-mode', lite ? 'lite' : 'full')

  const restorers: Array<() => void> = []
  const timers = new Set<number>()
  const sections: SectionState[] = []
  const allItems: BuildItem[] = []
  const byEl = new Map<Element, BuildItem>()
  const vh0 = window.innerHeight

  // ---------- Metin hazırlama ----------
  const wrapTextNode = (node: Text, mode: 'chars' | 'fade', counter: { i: number }) => {
    const original = node
    const wrapper = document.createElement('span')
    wrapper.className = mode === 'chars' ? 'bt-split' : 'bt-fade'
    if (mode === 'fade') {
      wrapper.textContent = original.textContent
    } else {
      wrapper.setAttribute('aria-hidden', 'true')
      const tokens = (original.textContent ?? '').split(/(\s+)/)
      const chars: HTMLElement[] = []
      for (const token of tokens) {
        if (!token) continue
        if (/^\s+$/.test(token)) {
          wrapper.appendChild(document.createTextNode(token))
          continue
        }
        const word = document.createElement('span')
        word.className = 'bt-word'
        for (const g of splitGraphemes(token)) {
          const c = document.createElement('span')
          c.className = 'bt-char'
          c.textContent = g
          c.style.setProperty('--i', String(counter.i++))
          word.appendChild(c)
          chars.push(c)
        }
        wrapper.appendChild(word)
      }
      ;(wrapper as HTMLElement & { _chars?: HTMLElement[] })._chars = chars
    }
    original.replaceWith(wrapper)
    restorers.push(() => {
      if (wrapper.isConnected) wrapper.replaceWith(original)
    })
    return wrapper as HTMLElement & { _chars?: HTMLElement[] }
  }

  const prepareTypewriter = (el: HTMLElement): HTMLElement[] => {
    if (!el.hasAttribute('aria-label')) {
      const label = (el.textContent ?? '').replace(/\s+/g, ' ').trim()
      if (label) {
        el.setAttribute('aria-label', label)
        restorers.push(() => el.removeAttribute('aria-label'))
      }
    }
    const counter = { i: 0 }
    const chars: HTMLElement[] = []
    for (const node of textNodesOf(el, false)) {
      if (lite) {
        wrapTextNode(node, 'fade', counter)
      } else {
        const w = wrapTextNode(node, 'chars', counter)
        if (w._chars) chars.push(...w._chars)
      }
    }
    return chars
  }

  // ---------- Elemanları topla ----------
  const sectionEls = Array.from(root.querySelectorAll<HTMLElement>('.build-section'))

  // Önce tüm ölçümleri ve stil okumalarını yap (yazma öncesi → layout thrash yok)
  type Pending = {
    el: HTMLElement
    section: SectionState
    rect: DOMRect
    bg: string
    ink: string
  }
  const pending: Pending[] = []
  const seen = new Set<Element>()

  for (const sEl of sectionEls) {
    // Hero scroll-build kullanmaz
    if (sEl.dataset.buildVariant === 'hero') continue

    const section: SectionState = {
      el: sEl,
      active: false,
      items: [],
    }
    sections.push(section)
    sEl.querySelectorAll<HTMLElement>('.build-element').forEach((el) => {
      if (seen.has(el)) return
      seen.add(el)
      const cs = getComputedStyle(el)
      pending.push({
        el,
        section,
        rect: el.getBoundingClientRect(),
        bg: cs.backgroundColor,
        ink: cs.color,
      })
    })
  }

  for (const p of pending) {
    const { el, section, rect } = p
    const isNested = Boolean(el.parentElement?.closest('.build-element'))
    const skip =
      rect.top < 0 || // viewport'un üstünde (sayfa ortasında yenileme) → direkt tamamlanmış
      (lite && (el.dataset.buildLite === 'skip' || isNested))

    const isTypewriter = el.classList.contains('build-typewriter')
    const isLogo = el.classList.contains('build-logo')

    let chars: HTMLElement[] = []
    let duration = Number(el.dataset.buildDuration) || 0

    if (!skip) {
      el.style.setProperty('--build-bg', p.bg)
      if (isLogo) el.style.setProperty('--build-ink', p.ink)
      if (isTypewriter) {
        chars = prepareTypewriter(el)
        if (!duration) duration = Math.min(2400, Math.max(700, chars.length * 40))
      } else if (!isLogo) {
        // Doğrudan metin düğümlerini sarmala → "> *" kuralı ile gizlenebilsin
        for (const node of textNodesOf(el, true)) wrapTextNode(node, 'fade', { i: 0 })
      }
    }
    if (!duration) duration = 650
    if (!lite) duration *= 0.75
    if (lite) duration *= 0.55

    const delay = (Number(el.dataset.buildDelay) || 0) * (lite ? 0.35 : 0.7)

    const item: BuildItem = {
      el,
      section,
      delay,
      duration,
      target: skip ? 1 : 0,
      shown: skip ? 1 : 0,
      startAt: null,
      stage: skip ? 'complete' : 'wireframe',
      visible: rect.top < vh0 && rect.bottom > 0,
      chars,
      caret: null,
      lastWritten: -1,
    }

    el.setAttribute('data-build-stage', item.stage)
    if (!skip) {
      el.style.setProperty('--build-progress', '0')
      if (chars.length) el.style.setProperty('--bt-typed', '0')
    }

    section.items.push(item)
    allItems.push(item)
    byEl.set(el, item)
  }

  // ---------- Aşama yazımı ----------
  const setStage = (item: BuildItem, stage: Stage, animated: boolean) => {
    if (item.stage === stage) return
    item.stage = stage
    const el = item.el
    el.setAttribute('data-build-stage', stage)
    if (stage === 'complete') {
      el.style.removeProperty('--build-progress')
      el.style.removeProperty('--bt-typed')
      el.style.removeProperty('--build-view')
      item.caret?.classList.remove('bt-caret')
      item.caret = null
      elementObserver.unobserve(el)
      if (animated) {
        el.setAttribute('data-build-settling', '')
        const t = window.setTimeout(() => {
          el.removeAttribute('data-build-settling')
          timers.delete(t)
        }, SETTLE_MS)
        timers.add(t)
      }
    }
  }

  const completeNow = (item: BuildItem) => {
    item.target = 1
    item.shown = 1
    setStage(item, 'complete', false)
  }

  // ---------- rAF döngüsü (throttle) ----------
  let rafId = 0
  let last = 0

  const schedule = () => {
    if (!rafId) rafId = requestAnimationFrame(tick)
  }

  const tick = (now: number) => {
    rafId = 0
    const dt = last ? Math.min(now - last, 64) : 16
    last = now
    const vh = window.innerHeight
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4

    // 1) Okuma aşaması: sadece görünür + aktif bölümdeki elemanların rect'i
    const reads: Array<[BuildItem, number, number]> = []
    for (const item of allItems) {
      if (item.stage === 'complete' || !item.visible || !item.section.active) continue
      const r = item.el.getBoundingClientRect()
      reads.push([item, r.top, r.height])
    }

    // 2) Hesap + yazma aşaması
    for (const [item, top, height] of reads) {
      const view = clamp01((vh - top) / (vh + height))
      item.el.style.setProperty('--build-view', view.toFixed(3))
      if (top + height <= 0) {
        // Hızlı kaydırmayla üstten çıktı → direkt tamamla
        completeNow(item)
        continue
      }
      let local = clamp01((vh - top - vh * HOLD) / (vh * SPAN))
      // Sayfanın dibinde merkeze hiç ulaşamayacak elemanlar da tamamlansın
      if (atBottom && top < vh) local = 1
      if (local > item.target) item.target = local // geri scroll'da asla azalmaz
    }

    let animating = false
    for (const item of allItems) {
      if (item.stage === 'complete') continue
      if (item.target > 0 && item.startAt === null) item.startAt = now + item.delay
      if (item.startAt === null) continue
      if (now < item.startAt) {
        animating = true
        continue
      }
      const gap = item.target - item.shown
      if (gap > 0) {
        const boost = 0.55 + 1.8 * gap
        const step = (dt / item.duration) * boost
        item.shown = gap < 0.002 ? item.target : Math.min(item.target, item.shown + step)
        animating = animating || item.shown < item.target
      }

      if (item.shown >= 0.999) {
        setStage(item, 'complete', true)
        continue
      }
      if (item.shown > 0) setStage(item, 'filling', true)

      const q = Math.round(item.shown * 1000)
      if (q !== item.lastWritten) {
        item.lastWritten = q
        item.el.style.setProperty('--build-progress', (q / 1000).toFixed(3))
        if (item.chars.length) {
          const typed = item.shown * (item.chars.length + 1)
          item.el.style.setProperty('--bt-typed', typed.toFixed(2))
          const caretChar = item.chars[Math.min(item.chars.length, Math.floor(typed)) - 1] ?? null
          if (caretChar !== item.caret) {
            item.caret?.classList.remove('bt-caret')
            caretChar?.classList.add('bt-caret')
            item.caret = caretChar
          }
        }
      }
    }

    if (animating) schedule()
  }

  // ---------- Observer'lar ----------
  // Bölüm observer'ı: hangi bölümler aktif (rect ölçümü sadece bunlarda)
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const s = sections.find((x) => x.el === entry.target)
        if (s) s.active = entry.isIntersecting
      }
      schedule()
    },
    { threshold: 0 },
  )

  // Eleman observer'ı: hangi elemanlar viewport'ta
  const elementObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const item = byEl.get(entry.target)
        if (!item || item.stage === 'complete') continue
        item.visible = entry.isIntersecting
        // Görünmeden üstten geçildiyse (anchor link / hızlı scroll) → direkt tamamla
        if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) completeNow(item)
      }
      schedule()
    },
    { threshold: 0 },
  )

  for (const s of sections) {
    s.active = true // ilk karede ölçülsün; observer hemen düzeltir
    sectionObserver.observe(s.el)
  }
  for (const item of allItems) {
    if (item.stage !== 'complete') elementObserver.observe(item.el)
  }

  const onScroll = () => schedule()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  schedule()

  // ---------- Temizlik ----------
  return () => {
    if (rafId) cancelAnimationFrame(rafId)
    timers.forEach((t) => clearTimeout(t))
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    sectionObserver.disconnect()
    elementObserver.disconnect()
    for (const item of allItems) {
      const el = item.el
      el.removeAttribute('data-build-stage')
      el.removeAttribute('data-build-settling')
      for (const prop of ['--build-progress', '--build-view', '--bt-typed', '--build-bg', '--build-ink']) {
        el.style.removeProperty(prop)
      }
    }
    for (let i = restorers.length - 1; i >= 0; i--) restorers[i]()
    html.removeAttribute('data-build-mode')
  }
}
