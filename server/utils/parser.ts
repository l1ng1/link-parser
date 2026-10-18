import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'
import sanitizeHtml from 'sanitize-html'
import { getYoutubeVideoId } from '#shared/utils/youtube'
import { readTextLimited, safeFetch } from '#server/utils/safe-fetch'

export interface ParsedLink {
  data: {
    title: string | null
    description: string | null
    imageUrl: string | null
    content: string | null
  }
  type: 'article' | 'video'
}

interface YoutubeOembed {
  title?: string
  author_name?: string
  thumbnail_url?: string
}

export default async function linkParser(url: string): Promise<ParsedLink> {
  if (getYoutubeVideoId(url)) return parseYoutube(url)
  return parseArticle(url)
}

async function parseYoutube(url: string): Promise<ParsedLink> {
  const endpoint = new URL('https://www.youtube.com/oembed')
  endpoint.searchParams.set('url', url)
  endpoint.searchParams.set('format', 'json')

  const { response } = await safeFetch(endpoint.href, { accept: 'application/json' })
  const res = JSON.parse(await readTextLimited(response)) as YoutubeOembed

  return {
    data: {
      title: res.title ?? null,
      imageUrl: res.thumbnail_url ?? null,
      description: res.author_name ?? null,
      content: null,
    },
    type: 'video',
  }
}

async function parseArticle(url: string): Promise<ParsedLink> {
  const { response, url: finalUrl } = await safeFetch(url)

  const contentType = response.headers.get('content-type') ?? ''
  if (!/text\/html|application\/xhtml\+xml/i.test(contentType)) {
    await response.body?.cancel()
    throw new Error(`Not an HTML page (${contentType || 'unknown type'})`)
  }

  return extractArticle(await readTextLimited(response), finalUrl)
}

// Pure function, no network: HTML in, title/description/image/clean text out.
export function extractArticle(html: string, pageUrl: URL): ParsedLink {
  // linkedom's typings describe a whole browser window; Readability only needs the document
  const { document } = parseHTML(html) as unknown as { document: ConstructorParameters<typeof Readability>[0] }

  const meta = (selector: string) =>
    document.querySelector(selector)?.getAttribute('content')?.trim() || null

  // Read the meta tags first: Readability rewrites the document it gets.
  const title = meta('meta[property="og:title"]') ?? document.querySelector('title')?.textContent?.trim() ?? null
  const description = meta('meta[property="og:description"]') ?? meta('meta[name="description"]')
  const image = meta('meta[property="og:image"]')

  const article = new Readability(document).parse()
  const finalTitle = title || article?.title || null
  let content = article?.content ? cleanContent(article.content, pageUrl) : ''

  // The reader shows the title itself, so drop the article's own copy of it at the top.
  const lead = /^<h2>([\s\S]*?)<\/h2>/.exec(content)
  if (lead && finalTitle && lead[1]!.replace(/<[^>]+>/g, '').trim() === finalTitle) {
    content = content.slice(lead[0].length).trim()
  }

  return {
    data: {
      title: finalTitle,
      description: description ?? article?.excerpt ?? null,
      imageUrl: image ? toAbsolute(image, pageUrl) : null,
      content: content || null,
    },
    type: 'article',
  }
}

function toAbsolute(value: string, base: URL): string | null {
  try {
    const url = new URL(value, base)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

// The article HTML comes from a stranger's site and is later rendered with v-html,
// so everything except plain reading markup is dropped: no scripts, styles, iframes,
// inline handlers or javascript: links. Relative links and images are made absolute.
function cleanContent(html: string, base: URL): string {
  const clean = sanitizeHtml(html, {
    allowedTags: [
      'p', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code', 'ul', 'ol', 'li',
      'a', 'em', 'strong', 'b', 'i', 'br', 'hr', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub',
    ],
    allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt', 'loading'] },
    allowedSchemes: ['http', 'https'],
    transformTags: {
      h1: 'h2',
      a: (tagName, attribs) => {
        const href = attribs.href ? toAbsolute(attribs.href, base) : null
        const next: sanitizeHtml.Attributes = {}
        if (href) Object.assign(next, { href, target: '_blank', rel: 'noopener noreferrer nofollow' })
        return { tagName, attribs: next }
      },
      img: (tagName, attribs) => {
        const src = attribs.src ? toAbsolute(attribs.src, base) : null
        const next: sanitizeHtml.Attributes = {}
        if (src) Object.assign(next, { src, alt: attribs.alt ?? '', loading: 'lazy' })
        return { tagName, attribs: next }
      },
    },
    exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
  })
  return clean.trim()
}
