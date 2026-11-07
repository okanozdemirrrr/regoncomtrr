import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProjectBySlug, projects } from '@/content/projects'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { PhotoSlot } from '@/components/ui/PhotoSlot'
import { ProductDetail } from '@/components/ui/ProductDetail'
import { siteConfig } from '@/content/siteConfig'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) return {}

  return {
    title: `${project.name} | ${project.tagline} | Regon Teknoloji`,
    description: `${project.descriptionShort} ${project.problemSolved}`,
    openGraph: {
      title: `${project.name} — Regon Teknoloji`,
      description: project.descriptionShort,
      type: 'article',
    },
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) notFound()

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.name,
    description: project.descriptionShort,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
    },
    author: {
      '@type': 'Organization',
      name: siteConfig.company.name,
      legalName: siteConfig.company.legalName,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="py-12 sm:py-20 bg-background text-text-primary">
        <Container>
          <div className="mx-auto max-w-4xl space-y-12">
            {/* Geri Dönüş Linki */}
            <Link
              href="/#urunler"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-secondary hover:text-accent-ink"
            >
              <span>←</span>
              <span>Tüm Ürünler ve Operasyon Masasına Dön</span>
            </Link>

            {/* Başlık Kartı */}
            <div className="border border-[#1A1612] bg-surface-paper p-6 sm:p-10 lg:p-12 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs uppercase text-accent-ink font-bold">
                  {`// SİSTEM DOKÜMANI // ${project.stepLabel}`}
                </span>
                <Badge variant={project.status} />
              </div>

              <div className="space-y-2">
                <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight text-text-primary">
                  {project.name}
                </h1>
                {project.subname && (
                  <p className="font-mono text-xs text-text-muted">
                    {project.subname}
                  </p>
                )}
                <p className="font-mono text-base sm:text-lg font-semibold text-accent-ink border-l-2 border-accent-ink pl-3 py-1">
                  {project.tagline}
                </p>
              </div>
            </div>

            {/* Ana Hero Görseli */}
            <div className="space-y-2">
              <PhotoSlot
                no={project.heroSlotNo}
                caption={`// Slot ${String(project.heroSlotNo).padStart(2, '0')}: ${project.name} Ana Operasyon Görseli`}
              />
            </div>

            {/* ProductDetail Component (Reusable) */}
            <ProductDetail project={project} showHeader={false} />

            {/* Alt Aksiyon Butonları */}
            <div className="flex flex-wrap items-center justify-between gap-4 border border-[#1A1612] bg-surface-1 p-6 font-mono text-xs">
              <div className="space-y-1">
                <p className="font-bold text-text-primary">
                  Bu ürünü işletmenizde canlıya almak ister misiniz?
                </p>
                <p className="text-text-muted">
                  Doğrudan teknik ekiple iletişime geçerek yerinde kurulum ve demo talep edin.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/#iletisim"
                  className="border border-[#1A1612] bg-[#FAF8F3] px-5 py-2.5 uppercase font-bold text-text-primary hover:bg-[#1A1612] hover:text-[#FAF8F3] transition-colors"
                >
                  İletişim Masası
                </Link>
                <Link
                  href="/portal/giris"
                  className="border border-[#1A1612] bg-accent px-5 py-2.5 uppercase font-bold text-[#100F0D] hover:bg-accent-hover transition-colors shadow-[2px_2px_0px_#1A1612]"
                >
                  Müşteri Portalı
                </Link>
              </div>
            </div>

            {/* Önceki/Sonraki Ürün Navigasyonu */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-dashed border-[#1A1612]/30">
              {(() => {
                const currentIndex = projects.findIndex((p) => p.slug === slug)
                const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null
                const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null

                return (
                  <>
                    {prevProject && (
                      <Link
                        href={`/projeler/${prevProject.slug}`}
                        className="flex items-center gap-2 font-mono text-xs text-text-secondary hover:text-accent-ink"
                      >
                        <span>←</span>
                        <span>{prevProject.name}</span>
                      </Link>
                    )}
                    {!prevProject && <div />}
                    {nextProject && (
                      <Link
                        href={`/projeler/${nextProject.slug}`}
                        className="flex items-center gap-2 font-mono text-xs text-text-secondary hover:text-accent-ink"
                      >
                        <span>{nextProject.name}</span>
                        <span>→</span>
                      </Link>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}
