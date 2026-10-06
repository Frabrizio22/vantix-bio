/**
 * Vantix Bio: turn rows in Supabase email_queue into Gmail drafts with clean links.
 * Creates DRAFTS only. It never sends. You review and send from Gmail.
 *
 * ONE-TIME SETUP
 *  1. Sign in to Google as support@vantixbio.com. Go to script.google.com > New project.
 *  2. Paste this whole file and save.
 *  3. Project Settings (gear icon) > Script properties > Add:
 *       SUPABASE_URL          = https://mxhtxcpqgjmgwnurxguv.supabase.co
 *       SUPABASE_SERVICE_KEY  = (your Supabase service_role key; Supabase > Project Settings > API)
 *     Keep the key in Script properties only. Never paste it into this file.
 *  4. Pick the function setup in the toolbar and click Run. Approve the permission prompts.
 *     This creates a timer that runs processQueue every 10 minutes.
 *  5. To test right away, pick processQueue and click Run, then look in Gmail > Drafts.
 */

function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processQueue') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('processQueue').timeBased().everyMinutes(10).create();
  Logger.log('Timer created: processQueue runs every 10 minutes.');
}

function props_() {
  var p = PropertiesService.getScriptProperties();
  var url = p.getProperty('SUPABASE_URL'), key = p.getProperty('SUPABASE_SERVICE_KEY');
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Script properties.');
  return { url: url, key: key };
}

function sb_(method, path, body) {
  var c = props_();
  var res = UrlFetchApp.fetch(c.url + '/rest/v1/' + path, {
    method: method,
    muteHttpExceptions: true,
    contentType: 'application/json',
    headers: { apikey: c.key, Authorization: 'Bearer ' + c.key, Prefer: 'return=minimal' },
    payload: body ? JSON.stringify(body) : undefined
  });
  var code = res.getResponseCode();
  if (code >= 300) throw new Error('Supabase ' + code + ': ' + res.getContentText().slice(0, 200));
  var t = res.getContentText();
  return t ? JSON.parse(t) : null;
}

function processQueue() {
  var rows = sb_('get', 'email_queue?status=eq.pending&order=created_at.asc&limit=40&select=*') || [];
  if (!rows.length) return;

  // Never draft for anyone who opted out or is excluded.
  var blocked = {};
  (sb_('get', 'email_optouts?select=email') || []).forEach(function (r) { blocked[String(r.email).toLowerCase()] = 'opted out'; });
  (sb_('get', 'email_exclusions?select=email') || []).forEach(function (r) { blocked[String(r.email).toLowerCase()] = 'excluded'; });

  rows.forEach(function (r) {
    var patch = 'email_queue?id=eq.' + r.id;
    try {
      var why = blocked[String(r.to_email).toLowerCase()];
      if (why) { sb_('patch', patch, { status: 'skipped', detail: why }); return; }
      GmailApp.createDraft(r.to_email, r.subject, r.text_body || 'Please view this email in an HTML-capable client.', {
        htmlBody: r.html_body,
        name: 'Vantix Bio'
      });
      sb_('patch', patch, { status: 'drafted', drafted_at: new Date().toISOString() });
    } catch (e) {
      sb_('patch', patch, { status: 'error', detail: String(e.message).slice(0, 300) });
    }
  });
}
