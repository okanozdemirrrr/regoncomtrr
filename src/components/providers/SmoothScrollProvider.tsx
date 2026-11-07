'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '@/lib/animations'
import { LENIS_RESIZE_EVENT } from '@/lib/lenis-bridge'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface SmoothScrollProviderProps {
  children: React.ReactNode
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      ScrollTrigger.refresh()
      return
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
    })

    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(updateTicker)
    gsap.ticker.lagSmoothing(0)

    const syncAfterLayout = () => {
      // ScrollTrigger.refresh sonrası Lenis ölçülerini yenile; kaydırma konumunu koru
      const y = lenis.scroll
      ScrollTrigger.refresh()
      lenis.resize()
      lenis.scrollTo(y, { immediate: true })
    }

    const handleResize = () => syncAfterLayout()
    window.addEventListener('resize', handleResize)
    window.addEventListener(LENIS_RESIZE_EVENT, syncAfterLayout)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener(LENIS_RESIZE_EVENT, syncAfterLayout)
      gsap.ticker.remove(updateTicker)
      lenis.destroy()
      lenisRef.current = null
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true })
    }
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
      lenisRef.current?.resize()
    }, 100)
    return () => clearTimeout(timer)
  }, [pathname])

  return <>{children}</>
}
