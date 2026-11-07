'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/ui/Container'
import { PhotoSlot } from '@/components/ui/PhotoSlot'
import { ProductDetailDrawer } from '@/components/ui/ProductDetailDrawer'
import { projects } from '@/content/projects'
import type { Project } from '@/types/project'
import { cn } from '@/lib/utils'

export function ProductsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // URL hash desteği (#urun-regon-kurye vb.)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (!hash.startsWith('urun-')) return
      const slug = hash.replace('urun-', '')
      const found = projects.find((p) => p.slug === slug)
      if (found) {
        setSelectedProject(found)
      }
    }

    handleHash()
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  const handleOpenDrawer = (project: Project) => {
    setSelectedProject(project)
    if (window.location.hash !== `#urun-${project.slug}`) {
      history.replaceState(null, '', `#urun-${project.slug}`)
    }
  }

  const handleCloseDrawer = () => {
    setSelectedProject(null)
    if (window.location.hash.startsWith('#urun-')) {
      history.replaceState(null, '', window.location.pathname)
    }
  }

  return (
    <section id="urunler" className="relative py-12 sm:py-16 border-b border-[#1A1612]/20 bg-background">
      <Container>
        {/* Bölüm Başlığı */}
        <div className="mb-8 border-b border-[#1A1612] pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-accent-ink font-bold mb-1">
                {'// 01 · ÜRÜNLERİMİZ'}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-text-primary">
                Dört bağımsız sistem, tek operasyonel güç.
              </h2>
            </div>
            <span className="hidden sm:inline-block font-mono text-[11px] text-text-muted">
              [ 2x2 BENTO VİTRİNİ ]
            </span>
          </div>
        </div>

        {/* 2x2 Asimetrik Endüstriyel Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
          {projects.map((project, idx) => {
            const isStar = project.isStar
            // Asimetrik bento dağılımı: 1. ürün (Kurye - 7 col), 2. ürün (POS - 5 col), 3. ürün (Bayi - 5 col), 4. ürün (Market - 7 col)
            const colSpanClass =
              idx === 0
                ? 'lg:col-span-7'
                : idx === 1
                  ? 'lg:col-span-5'
                  : idx === 2
                    ? 'lg:col-span-5'
                    : 'lg:col-span-7'

            return (
              <div
                key={project.slug}
                className={cn(
                  'group flex flex-col justify-between border bg-surface-paper transition-all duration-200',
                  isStar
                    ? 'border-2 border-[#1A1612] shadow-[4px_4px_0px_#1A1612] bg-[#FAF8F3]'
                    : 'border-[#1A1612]/30 shadow-[2px_2px_0px_#1A1612]/20 hover:border-[#1A1612]',
                  colSpanClass,
                )}
              >
                {/* Kart Başlığı ve Bilgileri */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Üst Bar: Kod + Başlık + Yıldız Rozeti */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xl sm:text-2xl font-black text-accent-ink">
                        0{idx + 1}
                      </span>
                      <div>
                        <h3 className="font-display text-xl sm:text-2xl font-black text-text-primary group-hover:text-accent-ink transition-colors">
                          {project.name}
                        </h3>
                        {project.subname && (
                          <span className="font-mono text-[10px] text-text-muted block">
                            {project.subname}
                          </span>
                        )}
                      </div>
                    </div>

                    {isStar && (
                      <span className="shrink-0 bg-accent px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-[#100F0D] border border-[#1A1612]">
                        ★ VİTRİNİN YILDIZI
                      </span>
                    )}
                  </div>

                  {/* 1 Cümlelik Net Operasyonel Fayda */}
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                    {project.keyBenefit ?? project.descriptionShort}
                  </p>

                  {/* 3 Anahtar Etiket */}
                  <div className="flex flex-wrap gap-1.5 pt-1 font-mono text-[10px]">
                    {project.keyTags?.map((tag) => (
                      <span
                        key={tag}
                        className="border border-[#1A1612]/20 bg-surface-2 px-2 py-0.5 text-text-primary font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* PhotoSlot Görsel Alanı */}
                  <div className="pt-2">
                    <PhotoSlot
                      no={project.heroSlotNo}
                      ratio={project.slug === 'regon-market' ? '16/10' : '16/10'}
                      caption={`// ${project.name} Arayüzü`}
                    />
                  </div>
                </div>

                {/* Alt Çubuk: Detay Çekmecesi Açma Butonu */}
                <div className="border-t border-[#1A1612]/20 bg-surface-1 p-3.5 sm:p-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-text-muted">
                    {project.features.length} Teknik Modül · Detaylı Şema
                  </span>

                  <button
                    type="button"
                    onClick={() => handleOpenDrawer(project)}
                    className="inline-flex items-center gap-1.5 border border-[#1A1612] bg-[#FAF8F3] px-3.5 py-1.5 font-mono text-xs uppercase font-bold tracking-wider text-text-primary hover:bg-[#1A1612] hover:text-[#FAF8F3] transition-colors shadow-[2px_2px_0px_#1A1612]"
                  >
                    <span>Detayları İncele</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Container>

      {/* Detay Çekmecesi (Drawer) */}
      <ProductDetailDrawer project={selectedProject} onClose={handleCloseDrawer} />
    </section>
  )
}
