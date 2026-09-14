import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReplyThread from '@/components/ReplyThread'

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const postId = parseInt(id, 10)

  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*, profiles(full_name)')
    .eq('id', postId)
    .single()

  if (!post) notFound()

  const { data: repliesRaw } = await supabase
    .from('post_replies')
    .select('*, profiles(full_name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  const replies = (repliesRaw ?? []).map((r) => ({
    id: r.id,
    post_id: r.post_id,
    author_id: r.author_id,
    body: r.body,
    created_at: r.created_at,
    authorName: (r as any).profiles?.full_name ?? 'Someone',
  }))

  const { data: userData } = await supabase.auth.getUser()
  const isLoggedIn = !!userData?.user

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="font-display text-2xl font-semibold">{post.title}</h1>
      <p className="text-sm text-[var(--muted)] mt-1 mb-4">
        {(post as any).profiles?.full_name ?? 'Someone'}
        {post.locality ? " · " + post.locality : ""}
      </p>

      <p className="mb-8">{post.body}</p>

      <hr className="mb-6 border-[var(--border-hairline)]" />

      <h2 className="font-display text-lg font-semibold mb-3">Replies</h2>
      <ReplyThread postId={postId} initialReplies={replies} isLoggedIn={isLoggedIn} />
    </div>
  )
}
