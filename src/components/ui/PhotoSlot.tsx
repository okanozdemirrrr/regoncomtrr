'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getPhotoSlot } from '@/content/photoSlots'
import { cn } from '@/lib/utils'

interface PhotoSlotProps {
  no: number
  ratio?: string
  alt?: string
  caption?: string
  className?: string
  priority?: boolean
}

// En boy oranı eşleme tablosu
const ratioClassMap: Record<string, string> = {
  '16/10': 'aspect-[16/10]',
  '16/9': 'aspect-[16/9]',
  '4/5': 'aspect-[4/5]',
  '9/16': 'aspect-[9/16]',
  '1/1': 'aspect-square',
}

export function PhotoSlot({
  no,
  ratio: overrideRatio,
  alt: overrideAlt,
  caption,
  className,
  priority = false,
}: PhotoSlotProps) {
  const [copied, setCopied] = useState(false)
  const slot = getPhotoSlot(no)

  if (!slot) {
    return (
      <div className="border border-red-500 bg-red-50 p-4 font-mono text-xs text-red-700">
        [HATA: Slot #{no} photoSlots.ts içinde tanımlanmamış!]
      </div>
    )
  }

  const effectiveRatio = overrideRatio ?? slot.ratio
  const aspectClass = ratioClassMap[effectiveRatio] ?? 'aspect-[16/10]'
  const hasImage = Boolean(slot.imagePath && slot.imagePath.trim() !== '')

  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!slot.prompt) return

    try {
      await navigator.clipboard.writeText(slot.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = slot.prompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <figure className={cn('relative w-full overflow-hidden text-text-primary', className)}>
      <div
        className={cn(
          'relative w-full border border-[#1A1612]/30 bg-surface-paper transition-colors',
          aspectClass,
          !hasImage && 'border-dashed hover:border-[#1A1612]/60 bg-[#FAF8F3]',
        )}
      >
        {hasImage ? (
          /* Görsel yüklendiğinde next/image ile görüntüleme */
          <Image
            src={slot.imagePath}
            alt={overrideAlt ?? slot.description}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover"
          />
        ) : (
          /* Görsel henüz yüklenmemişse: Numaralandırılmış ve AI Prompt Kutulu Operasyon Çerçevesi */
          <div className="absolute inset-0 flex flex-col justify-between p-3.5 sm:p-5 select-none overflow-y-auto">
            {/* 1. Üst Çubuk: Büyük Slot Numarası ve Tür Rozeti */}
            <div className="flex items-start justify-between gap-2 border-b border-dashed border-[#1A1612]/20 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center border-2 border-[#1A1612] bg-[#1A1612] px-2.5 py-1 font-mono text-xs sm:text-sm font-black uppercase text-[#FAF8F3] tracking-wider shadow-[2px_2px_0px_rgba(20,201,190,0.5)]">
                  [ FOTO #{String(slot.no).padStart(2, '0')} ]
                </span>
                <span className="font-mono text-[10px] font-bold text-accent-ink uppercase tracking-wider bg-surface-2 px-1.5 py-0.5 border border-[#1A1612]/20">
                  {slot.type}
                </span>
              </div>
              <span className="font-mono text-[10px] text-text-muted hidden sm:inline-block">
                {effectiveRatio} · {slot.pixelSize}
              </span>
            </div>

            {/* 2. Orta: Türkçe Operasyonel Açıklama */}
            <div className="my-2 space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted font-bold block">
                {'// BEKLENEN GÖRSEL:'}
              </span>
              <p className="text-[11px] sm:text-xs leading-relaxed text-text-secondary line-clamp-3">
                {slot.description}
              </p>
            </div>

            {/* 3. Alt: Kopyalanabilir Yapay Zeka (AI) Prompt Kutucuğu */}
            <div
              className="mt-auto border border-[#1A1612]/25 bg-surface-1 p-2 sm:p-2.5 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5 border-b border-[#1A1612]/15 pb-1">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-accent-ink flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-accent animate-pulse" />
                  AI GÖRSEL PROMPTU
                </span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className={cn(
                    'inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[9px] uppercase font-bold tracking-wider transition-all cursor-pointer',
                    copied
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-[#1A1612] bg-[#FAF8F3] text-text-primary hover:bg-[#1A1612] hover:text-[#FAF8F3]',
                  )}
                  title="Yapay zeka promptunu panoya kopyala"
                >
                  {copied ? (
                    <>
                      <span>✓</span>
                      <span>Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Promptu Kopyala</span>
                    </>
                  )}
                </button>
              </div>

              {/* Prompt Metni */}
              <p
                className="font-mono text-[10px] leading-tight text-text-muted line-clamp-2 select-text cursor-text"
                title={slot.prompt}
              >
                {slot.prompt}
              </p>
            </div>
          </div>
        )}
      </div>

      {caption && (
        <figcaption className="mt-1.5 font-mono text-[10px] text-text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
