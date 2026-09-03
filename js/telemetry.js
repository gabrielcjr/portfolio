/**
 * Real User Monitoring (RUM) & OpenTelemetry Tracing for Portfolio
 * Captures browser navigation timings, web vitals, and user interactions,
 * exporting standard OTLP traces to Tempo.
 */

function generateHexId(length) {
  const bytes = new Uint8Array(length / 2);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function timeToNano(timeMs) {
  const perfNow = performance.now();
  const timeOrigin = performance.timeOrigin || (Date.now() - perfNow);
  const epochMs = timeOrigin + timeMs;
  return (BigInt(Math.floor(epochMs)) * 1000000n).toString();
}

export function sendOtelSpan(spanName, startTimeMs, endTimeMs, attributes = {}) {
  const traceId = generateHexId(32);
  const spanId = generateHexId(16);

  const spanAttributes = [
    { key: 'service.name', value: { stringValue: 'portfolio-web' } },
    { key: 'browser.user_agent', value: { stringValue: navigator.userAgent } },
    { key: 'http.url', value: { stringValue: window.location.href } },
    ...Object.entries(attributes).map(([k, v]) => ({
      key: k,
      value: typeof v === 'number' ? { doubleValue: v } : { stringValue: String(v) }
    }))
  ];

  const payload = {
    resourceSpans: [
      {
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'portfolio-web' } },
            { key: 'service.version', value: { stringValue: '1.0.0' } }
          ]
        },
        scopeSpans: [
          {
            scope: { name: 'portfolio-browser-rum', version: '1.0.0' },
            spans: [
              {
                traceId,
                spanId,
                name: spanName,
                kind: 1, // SPAN_KIND_INTERNAL
                startTimeUnixNano: timeToNano(startTimeMs),
                endTimeUnixNano: timeToNano(endTimeMs),
                attributes: spanAttributes,
                status: { code: 1 } // STATUS_CODE_OK
              }
            ]
          }
        ]
      }
    ]
  };

  const endpoint = 'https://grafana.gabrielcjr.website/v1/traces';
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {});
    }
  } catch (e) {
    // Fail silently in browser to not affect user experience
  }
}

// Automatically capture full Page Navigation timings once loaded
window.addEventListener('load', () => {
  setTimeout(() => {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      const nav = navEntries[0];
      sendOtelSpan('PageLoad', nav.startTime, nav.duration, {
        'page.ttfb_ms': Math.round(nav.responseStart - nav.requestStart),
        'page.dom_interactive_ms': Math.round(nav.domInteractive),
        'page.dom_complete_ms': Math.round(nav.domComplete),
        'page.duration_ms': Math.round(nav.duration)
      });
    }
  }, 100);
});

// Capture Modal interaction timing
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-modal-target], .project-card, .btn');
  if (target) {
    const label = target.textContent?.trim().slice(0, 40) || target.id || 'click';
    sendOtelSpan(`UserInteraction: ${label}`, performance.now(), performance.now() + 5, {
      'user.action': 'click',
      'user.target': label
    });
  }
});
