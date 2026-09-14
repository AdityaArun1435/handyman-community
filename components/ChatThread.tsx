'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: number
  booking_id: number
  sender_id: string
  message_text: string
  created_at: string
}

export default function ChatThread({
  bookingId,
  currentUserId,
  otherPartyName,
}: {
  bookingId: number
  currentUserId: string
  otherPartyName: string
}) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true })
      setMessages(data ?? [])
      setLoading(false)
    }
    loadMessages()

    const channel = supabase
      .channel('booking-' + bookingId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: 'booking_id=eq.' + bookingId },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookingId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return

    const messageText = text
    setText('')

    await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: currentUserId,
      message_text: messageText,
    })
  }

  return (
    <div>
      <div className="border border-[var(--border-hairline)] rounded-sm p-4 h-96 overflow-y-auto flex flex-col gap-2 bg-white">
        {loading && <p className="text-sm text-[var(--muted)]">Loading...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-[var(--muted)]">
            No messages yet. Say hello to {otherPartyName}.
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.sender_id === currentUserId
          return (
            <div
              key={m.id}
              className={"max-w-[75%] px-3 py-2 rounded-sm text-sm " + (isMine ? "self-end bg-[var(--accent)] text-white" : "self-start bg-[var(--background)] border border-[var(--border-hairline)]")}
            >
              {m.message_text}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          className="flex-1 border border-[var(--border-hairline)] rounded-sm px-3 py-2 bg-white"
        />
        <button
          type="submit"
          className="bg-[var(--accent)] text-white rounded-sm px-4 py-2 text-sm"
        >
          Send
        </button>
      </form>
    </div>
  )
}
