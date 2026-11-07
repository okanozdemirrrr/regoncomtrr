import { Container } from '@/components/ui/Container'

export default function PortalLoading() {
  return (
    <Container className="py-12">
      <div className="border-2 border-[#1A1612] bg-surface-paper p-8 sm:p-10 min-h-[240px] flex items-center justify-center">
        <p className="font-mono text-xs uppercase text-text-muted">Yükleniyor…</p>
      </div>
    </Container>
  )
}
