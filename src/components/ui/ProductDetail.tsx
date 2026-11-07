import type { Project } from '@/types/project'
import { PhotoSlot } from '@/components/ui/PhotoSlot'
import { ProjectIcon } from '@/components/ui/Icons'

interface ProductDetailProps {
  project: Project
  showHeader?: boolean // For standalone page, show full header
}

export function ProductDetail({ project, showHeader = false }: ProductDetailProps) {
  return (
    <div className="space-y-8">
      {/* Header (only for standalone page) */}
      {showHeader && (
        <div className="space-y-2 border-b border-dashed border-[#1A1612]/30 pb-6">
          <h2 className="font-display text-3xl sm:text-4xl font-black text-text-primary">
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
      )}

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

      {/* Ekran Görüntüleri ve Fotoğraf Slotları */}
      <div className="space-y-3 pt-4 border-t border-dashed border-[#1A1612]/30">
        <p className="font-mono text-xs uppercase font-bold text-text-secondary">
          {'// EKRAN GÖRÜNTÜLERİ VE MOBİL ARAYÜZLER'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {project.detailSlotNos.map((slotNo) => (
            <PhotoSlot
              key={slotNo}
              no={slotNo}
              caption={`// Slot ${String(slotNo).padStart(2, '0')}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
