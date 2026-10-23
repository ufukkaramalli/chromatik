import { onBeforeUnmount, watchEffect } from 'vue'

/**
 * Helper to get or set a meta tag, or remove it if content is falsy.
 */
function setMeta(attribute, attrValue, content) {
  let el = document.querySelector(`meta[${attribute}="${attrValue}"]`)
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
function toAbsoluteUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * Reactive SEO meta manager for SPA.
 * Updates document.title, meta[name="description"], link[rel="canonical"], meta[name="robots"],
 * Open Graph (og:title, og:description, og:image, og:url, og:type), and Twitter Cards.
 *
 * @param {Object} options
 * @param {import('vue').Ref<string>} [options.title]
 * @param {import('vue').Ref<string>} [options.description]
 * @param {import('vue').Ref<string>} [options.canonical]
 * @param {import('vue').Ref<string>} [options.image]
 * @param {import('vue').Ref<string>} [options.type]
 * @param {import('vue').Ref<string>} [options.robots]
 * @param {import('vue').Ref<string>} [options.twitterCard]
 */
export function useSeo({
  title,
  description,
  canonical,
  image,
  type,
  robots,
  twitterCard
} = {}) {
  const updateMeta = () => {
    // 1. Document Title
    if (title && title.value) {
      document.title = title.value
    }

    // 2. Standard Meta Description
    setMeta('name', 'description', description?.value)

    // 3. Robots Meta Tag
    setMeta('name', 'robots', robots?.value)

    // 4. Canonical Link
    let linkCanonical = document.querySelector('link[rel="canonical"]')
    if (canonical?.value) {
      if (!linkCanonical) {
        linkCanonical = document.createElement('link')
        linkCanonical.rel = 'canonical'
        document.head.appendChild(linkCanonical)
      }
      linkCanonical.href = canonical.value
    } else if (linkCanonical) {
      linkCanonical.remove()
    }

    // 5. Open Graph Meta Tags
    const absImage = toAbsoluteUrl(image?.value)
    const pageUrl = canonical?.value || (typeof window !== 'undefined' ? window.location.href : '')

    setMeta('property', 'og:title', title?.value)
    setMeta('property', 'og:description', description?.value)
    setMeta('property', 'og:type', type?.value || 'website')
    setMeta('property', 'og:url', pageUrl)
    setMeta('property', 'og:image', absImage)

    // 6. Twitter Card Meta Tags
    if (absImage) {
      setMeta('name', 'twitter:card', twitterCard?.value || 'summary_large_image')
      setMeta('name', 'twitter:image', absImage)
    } else {
      setMeta('name', 'twitter:card', twitterCard?.value || 'summary')
      setMeta('name', 'twitter:image', '')
    }
    setMeta('name', 'twitter:title', title?.value)
    setMeta('name', 'twitter:description', description?.value)
  }

  const stop = watchEffect(updateMeta)

  onBeforeUnmount(() => {
    stop()
  })
}
