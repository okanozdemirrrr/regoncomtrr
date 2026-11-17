'use client'

import { useLayoutEffect } from 'react'
import { initScrollBuild } from '@/lib/scroll-build'

/**
 * Sayfadaki tüm `.build-section` / `.build-element` işaretlemelerini
 * scroll-build animasyonuna bağlar. useLayoutEffect: hydration sonrası,
 * ilk paint'ten ÖNCE wireframe aşamasına geçilir (içerik flaşı olmaz).
 */
export function ScrollBuild() {
  useLayoutEffect(() => initScrollBuild(document), [])
  return null
}
