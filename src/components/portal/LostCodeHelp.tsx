'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const CONTACT = {
  phone: '+90 505 059 16 29',
  phoneHref: 'tel:+905050591629',
  email: 'regoniletisim@gmail.com',
  emailHref: 'mailto:regoniletisim@gmail.com',
} as const

export function LostCodeHelp() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-6 text-center space-y-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="font-mono text-xs text-accent-ink hover:underline min-h-[44px] inline-flex items-center"
      >
        Kodunu mu kaybettin? Bize ulaş
      </button>

      {open ? (
        <div
          className={cn(
            'border border-[#1A1612] bg-surface-1 px-4 py-3 text-left space-y-2',
          )}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent-ink">
            {'// İLETİŞİM'}
          </p>
          <a
            href={CONTACT.phoneHref}
            className="block font-mono text-sm text-text-primary hover:text-accent-ink hover:underline"
          >
            {CONTACT.phone}
          </a>
          <a
            href={CONTACT.emailHref}
            className="block font-mono text-sm text-text-primary hover:text-accent-ink hover:underline break-all"
          >
            {CONTACT.email}
          </a>
        </div>
      ) : null}
    </div>
  )
}
