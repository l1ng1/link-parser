const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'])
const VIDEO_ID = /^[\w-]{11}$/

// Returns the 11-character video id for youtube.com/watch?v=, youtu.be/, /shorts/ and
// /embed/ links, or null for anything else. Checking the hostname (not url.includes)
// keeps links like evil.com/?youtube.com out.
export function getYoutubeVideoId(input: string): string | null {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    return null
  }

  let id: string | null = null
  if (url.hostname === 'youtu.be') {
    id = url.pathname.slice(1).split('/')[0] ?? null
  } else if (YOUTUBE_HOSTS.has(url.hostname)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v')
    else {
      const match = /^\/(?:shorts|embed|live)\/([^/]+)/.exec(url.pathname)
      id = match?.[1] ?? null
    }
  }

  return id && VIDEO_ID.test(id) ? id : null
}
