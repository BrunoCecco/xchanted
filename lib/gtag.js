// Based on https://github.com/vercel/next.js/blob/canary/examples/with-google-analytics

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-E7T97G1G4Q' // Move this to ENV variable

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}