/**
 * Send push via OneSignal REST API.
 * Requires: ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY in .env
 * @param {string[]} subscriptionIds - OneSignal subscription IDs (we store as playerId)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Custom data { jobId?, schemeId?, notificationId? }
 * @returns {Promise<{ ok: boolean, id?: string, error?: string }>}
 */
async function sendPush(subscriptionIds, title, body, data = {}) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[OneSignal] Missing ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY. Skip push.');
    }
    return { ok: false, error: 'OneSignal not configured' };
  }

  if (!subscriptionIds || subscriptionIds.length === 0) {
    return { ok: false, error: 'No subscription IDs' };
  }

  const payload = {
    app_id: appId,
    target_channel: 'push',
    include_subscription_ids: subscriptionIds,
    contents: { en: body || ' ' },
    headings: { en: title || 'RojgaAlert' },
    data: { ...data },
  };

  try {
    const res = await fetch('https://api.onesignal.com/notifications?c=push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error('[OneSignal] API error:', res.status, json);
      return { ok: false, error: json.errors ? JSON.stringify(json.errors) : 'OneSignal API error' };
    }

    return { ok: true, id: json.id };
  } catch (err) {
    console.error('[OneSignal] Send error:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendPush };
