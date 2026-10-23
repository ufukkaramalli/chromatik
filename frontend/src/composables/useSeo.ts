import { onBeforeUnmount, watchEffect, toValue, type MaybeRefOrGetter } from 'vue'

export interface SeoOptions {
  title?: MaybeRefOrGetter<string | undefined | null>
  description?: MaybeRefOrGetter<string | undefined | null>
  canonical?: MaybeRefOrGetter<string | undefined | null>
  image?: MaybeRefOrGetter<string | undefined | null>
  type?: MaybeRefOrGetter<string | undefined | null>
  robots?: MaybeRefOrGetter<string | undefined | null>
  twitterCard?: MaybeRefOrGetter<string | undefined | null>
}

/**
 * Helper to get or set a meta tag, or remove it if content is falsy.
 */
function setMeta(attribute: 'name' | 'property', attrValue: string, content?: string | null): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${attrValue}"]`)
  if (content) {
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attribute, attrValue)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  } else if (el) {
    el.remove()
  }
}

/**
 * Helper to ensure image URLs are absolute for social crawlers (og:image).
 */
function toAbsoluteUrl(url?: string | null): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * Reactive SEO meta manager for SPA.
 * Updates document.title, meta[name="description"], link[rel="canonical"], meta[name="robots"],
 * Open Graph (og:title, og:description, og:image, og:url, og:type), and Twitter Cards.
 */
export function useSeo(options: SeoOptions = {}): void {
  const updateMeta = (): void => {
    const titleVal = toValue(options.title)
    const descVal = toValue(options.description)
    const canonicalVal = toValue(options.canonical)
    const imageVal = toValue(options.image)
    const typeVal = toValue(options.type) || 'website'
    const robotsVal = toValue(options.robots)
    const twitterCardVal = toValue(options.twitterCard)

    // 1. Document Title
    if (titleVal) {
      document.title = titleVal
    }

    // 2. Standard Meta Description
    setMeta('name', 'description', descVal)

    // 3. Robots Meta Tag
    setMeta('name', 'robots', robotsVal)

    // 4. Canonical Link
    let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (canonicalVal) {
      if (!linkCanonical) {
        linkCanonical = document.createElement('link')
        linkCanonical.rel = 'canonical'
        document.head.appendChild(linkCanonical)
      }
      linkCanonical.href = canonicalVal
    } else if (linkCanonical) {
      linkCanonical.remove()
    }

    // 5. Open Graph Meta Tags
    const absImage = toAbsoluteUrl(imageVal)
    const pageUrl = canonicalVal || (typeof window !== 'undefined' ? window.location.href : '')

    setMeta('property', 'og:title', titleVal)
    setMeta('property', 'og:description', descVal)
    setMeta('property', 'og:type', typeVal)
    setMeta('property', 'og:url', pageUrl)
    setMeta('property', 'og:image', absImage)

    // 6. Twitter Card Meta Tags
    if (absImage) {
      setMeta('name', 'twitter:card', twitterCardVal || 'summary_large_image')
      setMeta('name', 'twitter:image', absImage)
    } else {
      setMeta('name', 'twitter:card', twitterCardVal || 'summary')
      setMeta('name', 'twitter:image', '')
    }
    setMeta('name', 'twitter:title', titleVal)
    setMeta('name', 'twitter:description', descVal)
  }

  const stop = watchEffect(updateMeta)

  onBeforeUnmount(() => {
    stop()
  })
}
