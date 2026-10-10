#!/usr/bin/env python3
"""Builds the Vantix Bio retention email templates (table-based, inline CSS) into this folder.
Merge tags: {{first_name}} {{product}} {{weeks}} {{email}} {{month}} {{batch_rows}} {{offer_block}}"""
import html, json, os, re, sys

NAVY, CREAM, PAPER, BLUE, SAGE, HAIR, INK, MUT = '#0F1B2D', '#F1EFE8', '#FAFAF7', '#3973B0', '#4A8568', '#D9D2BF', '#243247', '#5E6877'
SERIF = "Georgia,'Times New Roman',serif"
SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
MONO = "'SFMono-Regular',Menlo,Consolas,monospace"
UTM = 'utm_source=email&utm_medium=retention&utm_campaign={{flow}}'
SHOP = 'https://vantixbio.com/shop.html?' + UTM
VERIFY = 'https://vantixbio.com/verify.html?' + UTM
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

def wrap(preheader, eyebrow, headline, body, why='You are receiving this because you ordered from vantixbio.com or asked to be notified.'):
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Vantix Bio</title>
<style>@media (max-width:620px){{.shell{{width:100%!important}}.pad{{padding-left:22px!important;padding-right:22px!important}}.h1{{font-size:28px!important}}}}</style></head>
<body style="margin:0;padding:0;background:{CREAM}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:{CREAM}">{preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{CREAM}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" class="shell" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:{PAPER};border-radius:6px;overflow:hidden">
<tr><td class="pad" style="background:{NAVY};padding:24px 40px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td valign="middle" style="font:600 15px {SANS};letter-spacing:.34em;color:#ffffff">VANTIX BIO</td></tr></table></td></tr>
<tr><td class="pad" style="padding:44px 40px 12px">
<div style="font:11px {MONO};letter-spacing:.16em;text-transform:uppercase;color:{SAGE};padding-bottom:14px">{eyebrow}</div>
<h1 class="h1" style="margin:0 0 22px;font:400 34px/1.15 {SERIF};letter-spacing:-.01em;color:{NAVY}">{headline}</h1>
{body}
</td></tr>
<tr><td class="pad" style="padding:20px 40px 40px"><div style="border-top:1px solid {HAIR};padding-top:20px;font:12px/1.7 {SANS};color:{MUT}">{RUO}<br>{ADDR}<br>{why} <a href="{UNSUB}" style="color:{MUT};text-decoration:underline">Unsubscribe</a></div></td></tr>
</table></td></tr></table></body></html>'''

E = {}
E['1-post-purchase'] = dict(day='Day 3 after delivery', subject='Your order, verified', pre='How to check the testing results for your batch.', html=wrap(
 'How to check the testing results for your batch.', 'Your order, verified', 'Every vial has a paper trail.',
 p('Hi {{first_name}}, thank you for your order. Each vial ships with a QR code that links to the independent testing results for its batch, so you can confirm what you received.')
 + steps([('Scan the label', 'The QR code on each vial opens our verification portal.'), ('Enter your batch number', 'Type the batch number from your vial and the results come up.'), ('Review the report', 'View the data and PDF, or open the original report on the third-party lab website.')])
 + button('Verify your batch', VERIFY)
 + p(f'<span style="color:{MUT};font-size:14px">Keep sealed vials as directed on your product sheet. Questions about a result? Reply to this email and we will go through it with you.</span>')))
E['2-reorder'] = dict(day='Day 28 after last order', subject='Your next order, whenever you are ready', pre='Your product is in stock. Orders typically ship within one business day.', html=wrap(
 'Your product is in stock. Orders typically ship within one business day.', 'When you are ready', 'Ready when you are, {{first_name}}.',
 p('It has been about {{weeks}} weeks since your last Vantix Bio order. {{product}} is in stock, and every lot has published batch-level testing results.')
 + card([('Product', '{{product}}'), ('Availability', 'In stock'), ('Dispatch', 'Typically within 1 business day'), ('Shipping', 'Free over $150')])
 + button('View {{product}}', SHOP) + '{{offer_block}}'))
E['2b-reorder-portal'] = dict(day='Day 28 after last order (variant B)', subject='Your next order, whenever you are ready', pre='Check any batch before you reorder.', html=wrap(
 'Check any batch before you reorder.', 'When you are ready', 'Check the batch, then reorder.',
 p('Hi {{first_name}}, it has been about {{weeks}} weeks since your last order. Before you reorder, you can look up any batch on our verification portal: scan the QR code on the vial or type in the batch number.')
 + p('You will see the data, the PDF, and a direct link to the original report on the third-party lab website. {{product}} is in stock, and orders typically ship within one business day.')
 + button('Open the verification portal', VERIFY) + '{{offer_block}}'))
E['2c-reorder-plain'] = dict(day='Day 28 after last order (variant C)', subject='Checking in from Vantix Bio', pre='A short note from Vantix Bio.', html=wrap(
 'A short note from Vantix Bio.', 'A note from Vantix Bio', 'Checking in, {{first_name}}.',
 p('Hi {{first_name}}, it has been about {{weeks}} weeks since your last order, so I wanted to check in. {{product}} is in stock if you need it, and orders typically ship within one business day.')
 + button('Visit the shop', SHOP)
 + p(f'<span style="color:{MUT};font-size:14px">If there is something you would like us to carry, or a question about a past order, reply to this email and I will get back to you.</span>') + '{{offer_block}}'))
E['3-second-nudge'] = dict(day='Day 42 if no reorder', subject='A note on shipping', pre='Free shipping starts at $150.', html=wrap(
 'Free shipping starts at $150.', 'Worth knowing', 'Free shipping starts at $150.',
 p('Hi {{first_name}}, a short note in case it is useful. Orders over $150 after any discounts ship free, and orders typically ship within one business day, with a tracking email when they leave us.')
 + p('Every Vantix Bio batch is independently tested, and you can look up the results for any batch at any time.')
 + button('Browse the catalog', SHOP) + '{{offer_block}}'))
E['4-winback'] = dict(day='Day 75 if no reorder', subject='What is new at Vantix Bio', pre='Batch-level verification, published for every lot.', html=wrap(
 'Batch-level verification, published for every lot.', 'What is new', 'It has been a while, {{first_name}}.',
 p('Since your last order we have kept one thing constant: you can check the testing results for any batch before you rely on it.')
 + steps([('Independent testing', 'Purity and endotoxin results for each batch are published.'), ('Verification portal', 'Scan the QR code, enter your batch number, and view the data, the PDF, or the original lab report.'), ('Fast dispatch', 'Orders typically ship within one business day, free over $150.')])
 + button('See what is in stock', SHOP) + '{{offer_block}}'))
E['5-back-in-stock'] = dict(day='Triggered when a waitlisted item restocks', subject='You asked us to let you know', pre='It is available again.', html=wrap(
 'It is available again.', 'Back in stock', '{{product}} is available again.',
 p('You asked us to let you know, {{first_name}}. This lot has been tested, and the results are published on the verification page.')
 + card([('Product', '{{product}}'), ('Status', 'In stock'), ('Batch results', 'Published')])
 + button('View {{product}}', SHOP)))
E['6-batch-report'] = dict(day='Only when a new lot is published', subject='New lot published: {{month}}', pre='What we tested this month.', html=wrap(
 'What we tested this month.', 'Batch Report / {{month}}', 'What we tested this month.',
 p('Every month we publish the results for the batches released, so you can see the numbers behind each lot.')
 + '{{batch_rows}}'
 + button('Open the verification portal', VERIFY)
 + p(f'<span style="font-size:14px;color:{MUT}">New to reading a certificate of analysis? Our <a href="https://vantixbio.com/blog/how-to-verify-third-party-coa.html" style="color:{BLUE}">short guide</a> walks through it.</span>')))

E['7-winback'] = dict(day='One-time buyers, about 4+ weeks after order', subject='Checking in from Vantix Bio', pre='A thank-you for your first order.', html=wrap(
 'A thank-you for your first order.', 'A note from Vantix Bio', 'Thank you, {{first_name}}.',
 p('Hi {{first_name}}, it has been a little while since your first order from Vantix Bio, and we wanted to say thank you. Every lot we release has published batch-level testing results you can check any time on our verification page.')
 + p('If you are planning another order, here is 10% off your next one as a thank-you for being one of our early customers. It is valid on one order, and orders typically ship within one business day.')
 + card([('Your code', 'VB10'), ('Applies to', 'Your whole order'), ('Dispatch', 'Typically within 1 business day'), ('Shipping', 'Free over $150')])
 + button('Visit the shop', SHOP)
 + p(f'<span style="color:{MUT};font-size:14px">Need anything? Just reply to this email.</span>')))
E['8-reorder-personal'] = dict(day='Repeat customers, about 3+ weeks after last order', subject='Checking in from Vantix Bio', pre='Thank you for ordering again.', html=wrap(
 'Thank you for ordering again.', 'A note from Vantix Bio', 'Thank you, {{first_name}}.',
 p('Hi {{first_name}}, thank you for ordering from Vantix Bio more than once. It means a lot to a small team. Everything we release has published batch-level testing results, and orders typically ship within one business day.')
 + button('Visit the shop', SHOP)
 + p(f'<span style="color:{MUT};font-size:14px">If there is something you would like us to carry, or a question about a past order, reply to this email and I will get back to you.</span>')))

# ---- Welcome flow for homepage-popup signups (no name collected, so greeting is "Hello,") ----
SHOPCODE = SHOP + '&code=WELCOME15'   # shop.html keeps ?code= and checkout applies it
SIGNUP_WHY = 'You are receiving this because you signed up at vantixbio.com.'
GUIDE = 'https://vantixbio.com/blog/how-to-verify-third-party-coa.html?' + UTM

def plain(preheader, body):
    """Near plain-text layout for the personal note: no header band, no headline, same footer."""
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Vantix Bio</title></head>
<body style="margin:0;padding:0;background:#ffffff">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#ffffff">{preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%"><tr><td>
{body}
<div style="border-top:1px solid {HAIR};margin-top:28px;padding-top:16px;font:12px/1.7 {SANS};color:{MUT}">{RUO}<br>{ADDR}<br>You are receiving this because you signed up at vantixbio.com. <a href="{UNSUB}" style="color:{MUT};text-decoration:underline">Unsubscribe</a></div>
</td></tr></table></td></tr></table></body></html>'''

def pp(t): return f'<p style="margin:0 0 16px;font:16px/1.65 {SANS};color:#1a1a1a">{t}</p>'

E['welcome-d0'] = dict(day='Day 0: signup (drafted by the daily job)', subject='Welcome to Vantix Bio: your 15% is ready', pre='Your welcome code, and how to check any batch.', html=wrap(
 'Your welcome code, and how to check any batch.', 'Welcome', 'Welcome to Vantix Bio.',
 p('Thanks for joining us. Your 15% first-order discount is ready below.')
 + card([('Your code', '<strong style="letter-spacing:.08em">WELCOME15</strong>'), ('Applies to', 'Your whole first order'), ('Shipping', 'Free on orders of $150+ after discounts')])
 + p('Every batch we release is independently tested, and the results are published. Every vial is labeled with a batch number and a QR code that opens that batch\'s own report: the data, the PDF and the original lab report.')
 + button('Shop with 15% off', SHOPCODE)
 + p(f'<span style="color:{MUT};font-size:14px">Any questions about our products, COAs, ordering, or shipping? Just reply to this email.<br><br>Frabrizio<br>Vantix Bio</span>'), why=SIGNUP_WHY))

WALK = 'https://vantixbio.com/blog/real-janoshik-coa-walkthrough.html?' + UTM
FLAGS = 'https://vantixbio.com/blog/5-red-flags-fake-peptide-coas.html?' + UTM

def readcard(kicker, title, desc, url, label):
    return (f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;background:#fff;border:1px solid {HAIR};border-radius:6px"><tr><td style="padding:20px 22px">'
            f'<div style="font:11px {MONO};letter-spacing:.14em;text-transform:uppercase;color:{BLUE};padding-bottom:8px">{kicker}</div>'
            f'<div style="font:400 21px/1.25 {SERIF};color:{NAVY};padding-bottom:8px">{title}</div>'
            f'<div style="font:14px/1.65 {SANS};color:{MUT};padding-bottom:12px">{desc}</div>'
            f'<a href="{url}" style="font:600 14px {SANS};color:{BLUE};text-decoration:none">{label} &rarr;</a></td></tr></table>')

E['welcome-d2'] = dict(day='Day 2: only if they have not ordered', subject='See the testing behind every batch', pre='Your 15% code is still good.', html=wrap(
 'Your 15% code is still good.', 'Before you order', 'See the testing behind every batch.',
 p('Before you place an order, you should be able to see exactly what was tested.')
 + steps([('Independently tested', 'Every batch we release has a report from a third-party lab.'), ('Batch-specific verification', 'Every vial is labeled with a batch number and a QR code that opens that batch\'s own report on our verification page.'), ('Results you can verify', 'See the data, the PDF, and a link to the original lab report, so you do not have to take our word for it.')])
 + button('Shop with 15% off', SHOPCODE)
 + p(f'<span style="color:{MUT};font-size:14px">Your first-order code <strong>WELCOME15</strong> is still good, and it is applied for you when you use the button above. Orders typically ship within one business day.</span>')
 + p(f'<span style="color:{MUT};font-size:14px">New to reading a certificate of analysis? <a href="{WALK}" style="color:{BLUE}">Read a real one, line by line</a>.</span>'), why=SIGNUP_WHY))

E['welcome-d5'] = dict(day='Day 5: only if they have not ordered', subject='A quick note from Frabrizio', pre='Have a question about a COA? Reply here.', html=plain(
 'Have a question about a COA? Reply here.',
 pp('Hello,')
 + pp('I\'m Frabrizio, the founder of Vantix Bio. Thanks again for joining us.')
 + pp('If you have any questions about our products, COAs, ordering, or shipping, just reply to this email. I\'ll answer you myself, and I\'m happy to help.')
 + pp(f'Your first-order code <strong>WELCOME15</strong> is still good whenever you are ready: <a href="{SHOPCODE}" style="color:{BLUE}">vantixbio.com</a>.')
 + pp('Frabrizio<br>Vantix Bio')))


# ---- Customer flows used by the daily job (stored in email_templates; job fills first_name, weeks, month, email) ----
CUST_WHY = 'You are receiving this because you ordered from vantixbio.com.'
def plain_c(preheader, body):
    return plain(preheader, body).replace('You are receiving this because you signed up at vantixbio.com.', CUST_WHY)

E['reorder-d28'] = dict(day='First-time buyer, in their reorder window (about 5 weeks by default)', subject='Checking in on your order from {{month}}', pre='A quick note from Frabrizio.', html=plain_c(
 'A quick note from Frabrizio.',
 pp('Hi {{first_name}},')
 + pp('It has been about {{weeks}} weeks since your order from {{month}}, so I wanted to say thank you and check in.')
 + pp('If you are thinking about ordering again, the testing results for every batch are still published, and you can look up any batch on our <a href="' + VERIFY + '" style="color:' + BLUE + '">verification page</a> first. Orders typically ship within one business day, and shipping is free on orders of $150 or more.')
 + pp('<a href="' + SHOP + '" style="color:' + BLUE + '">Visit the shop</a>')
 + pp('If you have a question about a COA or an order, or there is something you would like us to carry, just reply to this email. I will answer it myself.')
 + pp('Frabrizio<br>Vantix Bio')))

E['reorder-repeat'] = dict(day='Repeat customer, in their own reorder window', subject='Ready when you are, {{first_name}}', pre='Thank you for ordering again.', html=wrap(
 'Thank you for ordering again.', 'Thank you', 'Ready when you are.',
 p('Hi {{first_name}}, thank you for ordering from Vantix Bio more than once. It means a lot to a small team. It has been about {{weeks}} weeks since your last order.')
 + card([('Dispatch', 'Typically within 1 business day'), ('Shipping', 'Free on orders of $150+'), ('Batch results', 'Published for every lot')])
 + button('Visit the shop', SHOP)
 + p(f'<span style="color:{MUT};font-size:14px">If there is something you would like us to carry, or a question about a past order, reply to this email and I will answer it myself.<br><br>Frabrizio<br>Vantix Bio</span>'), why=CUST_WHY))

E['nudge-d42'] = dict(day='In the window after the reorder email, before day 75', subject='A note on shipping', pre='Free shipping starts at $150.', html=wrap(
 'Free shipping starts at $150.', 'Worth knowing', 'Free shipping starts at $150.',
 p('Hi {{first_name}}, a short note in case it is useful. Orders of $150 or more, after any discounts, ship free. Orders typically ship within one business day, and you get a tracking email when yours leaves us.')
 + p('Every batch is independently tested, and you can check the results for any batch on our verification page whenever you like.')
 + button('Visit the shop', SHOP)
 + p(f'<span style="color:{MUT};font-size:14px">Questions about a COA or an order? Just reply to this email.<br><br>Frabrizio<br>Vantix Bio</span>'), why=CUST_WHY))

E['winback-d75'] = dict(day='One-time buyer, 75+ days since order', subject='15% off your next order, {{first_name}}', pre='Your code is good through {{expires}}.', html=wrap(
 'Your code is good through {{expires}}.', 'A thank-you', 'It has been a while, {{first_name}}.',
 p('Thank you for ordering from Vantix Bio. As a thank-you, here is <b>15% off</b> your next order with code <b>WINBACK15</b>. It is good through {{expires}} and works once. It is applied for you when you use the button below.')
 + button('Shop with 15% off', SHOP + '&code=WINBACK15')
 + p('Since your last order we have kept one thing constant: you can check the testing results for any batch before you rely on it. Scan the QR code or enter a batch number on the verification page to see the data, the PDF and the original report. Orders typically ship within one business day, and shipping is free on orders of $150 or more after discounts.')
 + p(f'<span style="color:{MUT};font-size:14px">Questions about a COA or an order, or something you would like us to carry? Reply to this email and I will answer it myself.<br><br>Frabrizio<br>Vantix Bio</span>'), why=CUST_WHY))

SAMPLE = dict(first_name='Alex', product='VX-2T 30mg', weeks='4', email='alex@example.com', month='October 2026', offer_block='',
  batch_rows=card([('VX-2T 30mg', 'Batch VX-2T-1001'), ('Purity', '99.1%'), ('Endotoxin', 'Within spec'), ('Tested', 'Independent lab')]))

def to_text(h):
    """Plain-text twin of an email (used as the text part of the message)."""
    h = re.sub(r'(?is)<(style|title)[^>]*>.*?</\1>', '', h)
    h = re.sub(r'(?is)<div style="display:none[^>]*>.*?</div>', '', h)
    h = re.sub(r'(?is)<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>', lambda m: re.sub(r'<[^>]+>', '', m.group(2)) + ' (' + m.group(1) + ')', h)
    h = re.sub(r'(?i)<br\s*/?>', '\n', h)
    h = re.sub(r'(?i)</(p|div|tr|h1)>', '\n', h)
    h = re.sub(r'(?i)</td>', ' ', h)
    h = html.unescape(re.sub(r'<[^>]+>', '', h))
    h = re.sub(r'[ \t]+', ' ', h)
    h = re.sub(r' ?\n ?', '\n', h)
    return re.sub(r'\n{3,}', '\n\n', h).strip() + '\n'

WELCOME = ('welcome-d0', 'welcome-d2', 'welcome-d5')
CUSTOMER = ('reorder-d28', 'reorder-repeat', 'nudge-d42', 'winback-d75')

def fill(s, d):
    s = s.replace('{{flow}}', d.get('flow', ''))
    for k, v in d.items(): s = s.replace('{{' + k + '}}', v)
    return s

if __name__ == '__main__':
    here = os.path.dirname(os.path.abspath(__file__))
    meta = []
    for k, v in E.items():
        open(os.path.join(here, k + '.html'), 'w', encoding='utf-8').write(v['html'].replace('{{flow}}', k))
        meta.append(dict(id=k, day=v['day'], subject=fill(v['subject'], SAMPLE), html=fill(v['html'].replace('{{flow}}', k), SAMPLE)))
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, 'preview.json')
    json.dump(meta, open(out, 'w'))
    # SQL that loads the welcome templates into public.email_templates (run after supabase/email_welcome_flow.sql).
    rows = []
    for k in WELCOME:
        v = E[k]; h = v['html'].replace('{{flow}}', k)
        rows.append("(" + "'" + k + "', $s$" + v['subject'] + "$s$, $h$" + h + "$h$, $t$" + to_text(h) + "$t$)")
    open(os.path.join(here, '..', 'supabase', 'email_welcome_templates.sql'), 'w', encoding='utf-8').write(
        "-- Generated by email/build.py. Loads the welcome-flow templates ({{email}} is filled in when queued).\n"
        "insert into public.email_templates (flow, subject, html_body, text_body) values\n" + ",\n".join(rows) +
        "\non conflict (flow) do update set subject = excluded.subject, html_body = excluded.html_body, text_body = excluded.text_body, updated_at = now();\n")

    rows = []
    for k in CUSTOMER:
        v = E[k]; h = v['html'].replace('{{flow}}', k)
        rows.append("(" + "'" + k + "', $s$" + v['subject'] + "$s$, $h$" + h + "$h$, $t$" + to_text(h) + "$t$)")
    open(os.path.join(here, '..', 'supabase', 'email_customer_templates.sql'), 'w', encoding='utf-8').write(
        "-- Generated by email/build.py. Loads the customer-flow templates. Merge tags filled when queued: {{first_name}} {{weeks}} {{month}} {{expires}} {{email}}.\n"
        "insert into public.email_templates (flow, subject, html_body, text_body) values\n" + ",\n".join(rows) +
        "\non conflict (flow) do update set subject = excluded.subject, html_body = excluded.html_body, text_body = excluded.text_body, updated_at = now();\n")
    print('built', len(E), 'emails')
