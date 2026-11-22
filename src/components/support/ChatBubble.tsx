'use client'

import { isImageMime } from '@/lib/support'
import { cn } from '@/lib/utils'
import type { TicketMessageDto } from '@/types/support'

export function ChatBubble({
  message,
  align,
}: {
  message: TicketMessageDto
  align: 'left' | 'right'
}) {
  const mine = align === 'right'
  return (
    <div className={cn('flex w-full', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] border border-[#1A1612] px-3 py-2',
          mine ? 'bg-accent-soft' : 'bg-surface-paper',
        )}
      >
        <p className="font-mono text-[10px] uppercase text-text-muted mb-1">
          {message.sender === 'admin' ? 'Regon Destek' : 'Siz'}
        </p>
        {message.body ? (
          <p className="text-sm text-text-primary whitespace-pre-wrap break-words">{message.body}</p>
        ) : null}
        {message.attachments.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {message.attachments.map((att) => (
              <li key={att.id}>
                {att.url && isImageMime(att.mimeType) ? (
                  <a href={att.url} target="_blank" rel="noreferrer" className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={att.url}
                      alt={att.fileName}
                      className="max-h-48 w-auto border border-[#1A1612]/20"
                    />
                  </a>
                ) : null}
                {att.url ? (
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] text-accent-ink underline"
                  >
                    {att.fileName}
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-text-muted">{att.fileName}</span>
                )}
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-1 font-mono text-[10px] text-text-muted">
          {new Date(message.createdAt).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}
