#!/usr/bin/env python3
"""Builds the Vantix retention email templates (table-based, inline CSS) into this folder.
Merge tags: {{first_name}} {{product}} {{weeks}} {{email}} {{month}} {{batch_rows}} {{offer_block}}"""
import html, json, os, sys

NAVY, CREAM, PAPER, BLUE, SAGE, HAIR, INK, MUT = '#0F1B2D', '#F1EFE8', '#FAFAF7', '#3973B0', '#4A8568', '#D9D2BF', '#243247', '#5E6877'
SERIF = "Georgia,'Times New Roman',serif"
SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
MONO = "'SFMono-Regular',Menlo,Consolas,monospace"
SHOP = 'https://vantixbio.com/shop.html'
VERIFY = 'https://vantixbio.com/verify.html'
UNSUB = 'https://vantixbio.com/unsubscribe.html#e={{email}}'
RUO = 'For laboratory research use only. Not for human consumption.'
ADDR = 'Vantix Bio, PO Box 389, Santa Cruz, CA 95061'

def card(rows):
    r = ''.join(f'<tr><td style="padding:11px 0;border-top:1px solid {HAIR};font:11px {MONO};letter-spacing:.12em;text-transform:uppercase;color:{MUT};width:42%">{k}</td><td style="padding:11px 0;border-top:1px solid {HAIR};font:15px {SANS};color:{NAVY};text-align:right">{v}</td></tr>' for k, v in rows)
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 8px;background:#fff;border:1px solid {HAIR};border-radius:6px"><tr><td style="padding:6px 22px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">{r}</table></td></tr></table>'

def button(label, url):
    return f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px"><tr><td style="background:{NAVY};border-radius:999px"><a href="{url}" style="display:inline-block;padding:15px 34px;font:600 15px {SANS};letter-spacing:.02em;color:#ffffff;text-decoration:none">{label}</a></td></tr></table>'

def steps(items):
    out = ''
    for i, (t, d) in enumerate(items, 1):
        out += f'<tr><td valign="top" style="padding:12px 16px 12px 0;font:13px {MONO};color:{BLUE};width:28px">{i:02d}</td><td style="padding:12px 0;border-top:1px solid {HAIR}"><div style="font:600 15px {SANS};color:{NAVY}">{t}</div><div style="font:14px/1.6 {SANS};color:{MUT};padding-top:2px">{d}</div></td></tr>'
    return f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 4px">{out}</table>'

def p(t): return f'<p style="margin:0 0 16px;font:16px/1.7 {SANS};color:{INK}">{t}</p>'

def wrap(preheader, eyebrow, headline, body):
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Vantix</title>
<style>@media (max-width:620px){{.shell{{width:100%!important}}.pad{{padding-left:22px!important;padding-right:22px!important}}.h1{{font-size:28px!important}}}}</style></head>
<body style="margin:0;padding:0;background:{CREAM}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:{CREAM}">{preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{CREAM}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" class="shell" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:{PAPER};border-radius:6px;overflow:hidden">
<tr><td class="pad" style="background:{NAVY};padding:24px 40px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td valign="middle" style="padding-right:12px"><img src="https://vantixbio.com/logo-mark-white.png" width="26" alt="" style="display:block;border:0"></td><td valign="middle" style="font:600 15px {SANS};letter-spacing:.34em;color:#ffffff">VANTIX</td></tr></table></td></tr>
<tr><td class="pad" style="padding:44px 40px 12px">
<div style="font:11px {MONO};letter-spacing:.16em;text-transform:uppercase;color:{SAGE};padding-bottom:14px">{eyebrow}</div>
<h1 class="h1" style="margin:0 0 22px;font:400 34px/1.15 {SERIF};letter-spacing:-.01em;color:{NAVY}">{headline}</h1>
{body}
</td></tr>
<tr><td class="pad" style="padding:20px 40px 40px"><div style="border-top:1px solid {HAIR};padding-top:20px;font:12px/1.7 {SANS};color:{MUT}">{RUO}<br>{ADDR}<br>You are receiving this because you ordered from vantixbio.com or asked to be notified. <a href="{UNSUB}" style="color:{MUT};text-decoration:underline">Unsubscribe</a></div></td></tr>
</table></td></tr></table></body></html>'''

E = {}
E['1-post-purchase'] = dict(day='Day 3 after delivery', subject='Your order, verified', pre='How to check the testing results for your batch.', html=wrap(
 'How to check the testing results for your batch.', 'Your order, verified', 'Every vial has a paper trail.',
 p('Hi {{first_name}}, thank you for your order. Each vial ships with a QR code that links to the independent testing results for its batch, so you can confirm what you received.')
 + steps([('Scan the label', 'The QR code on each vial opens the record for that batch.'), ('Match the batch ID', 'Check that the ID on your vial matches the ID on the page.'), ('Review the results', 'Purity and endotoxin results are published for every batch.')])
 + button('Verify your batch', VERIFY)
 + p(f'<span style="color:{MUT};font-size:14px">Keep sealed vials as directed on your product sheet. Questions about a result? Reply to this email and we will go through it with you.</span>')))
E['2-reorder'] = dict(day='Day 28 after last order', subject='Your next order, whenever you are ready', pre='Your product is in stock and ships in 1-2 business days.', html=wrap(
 'Your product is in stock and ships in 1-2 business days.', 'When you are ready', 'Ready when you are, {{first_name}}.',
 p('It has been about {{weeks}} weeks since your last Vantix order. {{product}} is in stock, and every lot has published batch-level testing results.')
 + card([('Product', '{{product}}'), ('Availability', 'In stock'), ('Dispatch', '1-2 business days after payment'), ('Shipping', 'Free over $150')])
 + button('View {{product}}', SHOP) + '{{offer_block}}'))
E['3-second-nudge'] = dict(day='Day 42 if no reorder', subject='A note on shipping', pre='Free shipping starts at $150.', html=wrap(
 'Free shipping starts at $150.', 'Worth knowing', 'Free shipping starts at $150.',
 p('Hi {{first_name}}, a short note in case it is useful. Orders over $150 after any discounts ship free, and most orders leave within 1-2 business days of payment.')
 + p('Every Vantix batch is independently tested, and you can look up the results for any batch at any time.')
 + button('Browse the catalog', SHOP) + '{{offer_block}}'))
E['4-winback'] = dict(day='Day 75 if no reorder', subject='What is new at Vantix', pre='Batch-level verification, published for every lot.', html=wrap(
 'Batch-level verification, published for every lot.', 'What is new', 'It has been a while, {{first_name}}.',
 p('Since your last order we have kept one thing constant: you can check the testing results for any batch before you rely on it.')
 + steps([('Independent testing', 'Purity and endotoxin results for each batch are published.'), ('Verification portal', 'Look up any batch by its ID or the QR code on the label.'), ('Fast dispatch', 'Orders ship within 1-2 business days of payment, free over $150.')])
 + button('See what is in stock', SHOP) + '{{offer_block}}'))
E['5-back-in-stock'] = dict(day='Triggered when a waitlisted item restocks', subject='You asked us to let you know', pre='It is available again.', html=wrap(
 'It is available again.', 'Back in stock', '{{product}} is available again.',
 p('You asked us to let you know, {{first_name}}. This lot has been tested, and the results are published on the verification page.')
 + card([('Product', '{{product}}'), ('Status', 'In stock'), ('Batch results', 'Published')])
 + button('View {{product}}', SHOP)))
E['6-batch-report'] = dict(day='Monthly newsletter', subject='Batch Report: {{month}}', pre='What we tested this month.', html=wrap(
 'What we tested this month.', 'Batch Report / {{month}}', 'What we tested this month.',
 p('Every month we publish the results for the batches released, so you can see the numbers behind each lot.')
 + '{{batch_rows}}'
 + button('Open the verification portal', VERIFY)
 + p(f'<span style="font-size:14px;color:{MUT}">New to reading a certificate of analysis? Our <a href="https://vantixbio.com/blog/how-to-verify-third-party-coa.html" style="color:{BLUE}">short guide</a> walks through it.</span>')))

SAMPLE = dict(first_name='Alex', product='VX-2T 30mg', weeks='4', email='alex@example.com', month='October 2026', offer_block='',
  batch_rows=card([('VX-2T 30mg', 'Batch VX-2T-1001'), ('Purity', '99.1%'), ('Endotoxin', 'Within spec'), ('Tested', 'Independent lab')]))

def fill(s, d):
    for k, v in d.items(): s = s.replace('{{' + k + '}}', v)
    return s

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    meta = []
    for k, v in E.items():
        open(os.path.join(here, k + '.html'), 'w', encoding='utf-8').write(v['html'])
        meta.append(dict(id=k, day=v['day'], subject=fill(v['subject'], SAMPLE), html=fill(v['html'], SAMPLE)))
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, 'preview.json')
    json.dump(meta, open(out, 'w'))
    print('built', len(E), 'emails')
