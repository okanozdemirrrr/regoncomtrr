'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Project } from '@/types/project'
import { Badge } from '@/components/ui/Badge'
import { ProjectIcon } from '@/components/ui/Icons'
import { startLenis, stopLenis } from '@/lib/lenis-bridge'

interface ProductDetailDrawerProps {
  project: Project | null
  onClose: () => void
}

export function ProductDetailDrawer({ project, onClose }: ProductDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // ESC tuşu ve scroll kilidi yönetimi
  useEffect(() => {
    if (!project) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Arka plan scroll'unu kilitle; Lenis wheel yakalamasın
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    stopLenis()
    window.addEventListener('keydown', handleKeyDown)

    if (drawerRef.current) {
      drawerRef.current.focus()
    }
    bodyRef.current?.scrollTo({ top: 0 })

    return () => {
      document.body.style.overflow = originalOverflow
      startLenis()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [project, onClose])

  if (!project) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#100F0D]/65 backdrop-blur-[2px] transition-opacity duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div
        ref={drawerRef}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-[#1A1612] bg-[#FAF8F3] text-text-primary shadow-2xl focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sabit Üst Çubuk */}
        <div className="shrink-0 z-20 flex items-center justify-between border-b border-[#1A1612] bg-surface-paper px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-accent-ink uppercase">
              {project.stepLabel}
            </span>
            <Badge variant={project.status} />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 border border-[#1A1612] bg-[#FAF8F3] px-3 py-1 font-mono text-xs uppercase font-bold text-text-primary hover:bg-[#1A1612] hover:text-[#FAF8F3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink"
            aria-label="Kapat"
          >
            <span>Kapat</span>
            <span>[ESC]</span>
          </button>
        </div>

        {/* Kaydırılabilir gövde — Lenis'in wheel yakalamasını engelle */}
        <div
          ref={bodyRef}
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-8"
        >
          {/* Başlık ve Vaat */}
          <div className="space-y-2 border-b border-dashed border-[#1A1612]/30 pb-6">
            <h2 id="drawer-title" className="font-display text-3xl sm:text-4xl font-black text-text-primary">
              {project.name}
            </h2>
            {project.subname && (
              <p className="font-mono text-xs text-text-muted">
                {project.subname}
              </p>
            )}
            <p className="font-mono text-sm sm:text-base font-semibold text-accent-ink pt-1">
              {project.tagline}
            </p>
          </div>

          {/* Kime Hitap Eder & Hangi Sorunu Çözer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="border border-[#1A1612]/20 bg-surface-1 p-4 space-y-1">
              <strong className="font-mono uppercase text-accent-ink block font-bold">
                KİME HİTAP EDER:
              </strong>
              <p className="text-text-secondary leading-relaxed">
                {project.targetAudience}
              </p>
            </div>
            <div className="border border-[#1A1612]/20 bg-surface-1 p-4 space-y-1">
              <strong className="font-mono uppercase text-accent-ink block font-bold">
                HANGİ SORUNU ÇÖZER:
              </strong>
              <p className="text-text-secondary leading-relaxed">
                {project.problemSolved}
              </p>
            </div>
          </div>

          {/* Uzun Açıklama */}
          <div className="border border-[#1A1612]/25 bg-surface-paper p-5 space-y-2">
            <p className="font-mono text-xs uppercase font-bold text-text-secondary">
              {'// MİMARİ VE ÇALIŞMA PRENSİBİ'}
            </p>
            <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-text-secondary">
              {project.descriptionLong}
            </p>
          </div>

          {/* Nasıl Çalışır Stepper */}
          <div className="border border-[#1A1612]/25 bg-surface-1 p-5 space-y-4">
            <p className="font-mono text-xs uppercase font-bold text-accent-ink">
              {'// NASIL ÇALIŞIR: OPERASYONEL ADIMLAR'}
            </p>
            <div className="space-y-3">
              {project.workflowSteps.map((ws) => (
                <div
                  key={ws.step}
                  className="flex items-start gap-3 border border-[#1A1612]/15 bg-surface-paper p-3"
                >
                  <span className="shrink-0 flex size-6 items-center justify-center border border-[#1A1612] bg-accent font-mono text-xs font-black text-[#100F0D]">
                    {ws.step}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-display text-sm font-bold text-text-primary">
                      {ws.title}
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {ws.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6+ Teknik Özellik */}
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase font-bold text-text-secondary">
              {`// TÜM TEKNİK ÖZELLİKLER (${project.features.length} KALEM)`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.features.map((feat) => (
                <div
                  key={feat.label}
                  className="border border-[#1A1612]/20 bg-surface-paper p-3.5 space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-accent-ink">
                    <ProjectIcon name={feat.icon} />
                    <span className="font-mono text-xs font-bold text-text-primary">
                      {feat.label}
                    </span>
                  </div>
                  {feat.description && (
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {feat.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Alt Aksiyonlar */}
          <div className="pt-6 border-t border-[#1A1612] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <Link
              href={`/projeler/${project.slug}`}
              className="inline-flex items-center gap-2 border border-[#1A1612] bg-[#FAF8F3] px-4 py-2.5 font-bold uppercase text-text-primary hover:bg-[#1A1612] hover:text-[#FAF8F3] transition-colors"
            >
              <span>Kalıcı Rota Sayfasını Aç</span>
              <span>→</span>
            </Link>

            <a
              href="#iletisim"
              onClick={onClose}
              className="inline-flex items-center gap-2 border border-[#1A1612] bg-accent px-5 py-2.5 font-bold uppercase text-[#100F0D] hover:bg-accent-hover transition-colors shadow-[2px_2px_0px_#1A1612]"
            >
              <span>Bu Ürün İçin Demo İste</span>
              <span>↓</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
