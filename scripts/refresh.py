#!/usr/bin/env python3
"""Feed-only source collection for the public, static Daily AI Radar.

Run via GitHub Actions twice around the daylight-saving switch; only 08:00
Europe/Berlin proceeds. workflow_dispatch works at any time. Does NOT claim
new items are fact-checked or re-evaluate editorial assessments/benchmarks.
"""
from __future__ import annotations
import datetime as dt
import email.utils
import hashlib
import html
import json
import os
import pathlib
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parents[1]
TARGET = ROOT / 'data' / 'inbox.json'
SOURCES = [
    ('GitHub Changelog', 'https://github.blog/changelog/feed/', 'Engineering'),
    ('Google Blog', 'https://blog.google/rss/', 'Modelle'),
    ('Microsoft Blog', 'https://blogs.microsoft.com/blog/feed/', 'Agenten'),
]
TERMS = ('ai ', 'artificial intelligence', 'copilot', 'agent', 'gemini', 'openai',
         'anthropic', 'model', 'coding', 'research', 'machine learning', 'security',
         'automation', 'developer', 'llm', 'health', 'cloud', 'software', 'intelligence')


def clean(s: str) -> str:
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]*>', ' ', s or ''))).strip()


def parsedate(s):
    if not s:
        return None
    try:
        x = email.utils.parsedate_to_datetime(s)
        return x.date().isoformat()
    except (TypeError, ValueError):
        pass
    try:
        return dt.datetime.fromisoformat(s.replace('Z', '+00:00')).date().isoformat()
    except (TypeError, ValueError):
        return None


def first(element, names):
    for tag in names:
        node = element.find(tag)
        if node is not None and (node.text or '').strip():
            return node.text.strip()
    return ''


def parse_feed(xml: bytes, source: str, base_category: str, now: dt.date):
    root = ET.fromstring(xml)
    atom = '{http://www.w3.org/2005/Atom}'
    if root.tag.endswith('feed'):
        entries = root.findall(atom + 'entry')
    else:
        entries = root.findall('.//item')
    out = []
    for e in entries[:45]:
        title = clean(first(e, ['title', atom + 'title']))
        summary = clean(first(e, ['description', atom + 'summary', atom + 'content']))[:360]
        url = first(e, ['link'])
        if not url:
            for link in e.findall(atom + 'link'):
                if link.attrib.get('rel', 'alternate') == 'alternate' and link.attrib.get('href'):
                    url = link.attrib['href']; break
        date = parsedate(first(e, ['pubDate', 'published', atom + 'published', atom + 'updated']))
        if not title or not url.startswith('https://') or not date:
            continue
        try:
            age = (now - dt.date.fromisoformat(date)).days
        except ValueError:
            continue
        if age < 0 or age > 60:
            continue
        if not any(term in (title + ' ' + summary).lower() for term in TERMS):
            continue
        key = hashlib.sha256(url.split('?')[0].encode()).hexdigest()[:16]
        out.append({'id': key, 'date': date, 'title': title[:210], 'summary': summary,
                    'url': url, 'source': source, 'category': base_category,
                    'status': 'NEU · UNGEPRÜFT'})
    return out


def main():
    now = dt.datetime.now(ZoneInfo('Europe/Berlin'))
    manual = os.getenv('GITHUB_EVENT_NAME') == 'workflow_dispatch' or '--force' in sys.argv
    if not manual and now.hour != 8:
        print('Skip: currently', now.isoformat(), '– scheduled only at 08:00 Berlin')
        return 0
    if os.getenv('RADAR_TEST_FEED'):
        fixture = pathlib.Path(os.environ['RADAR_TEST_FEED']).read_bytes()
        print('Test fixture:', len(parse_feed(fixture, 'Testquelle', 'Engineering', now.date())))
        return 0
    previous = json.loads(TARGET.read_text(encoding='utf-8'))
    merged = {x['id']: x for x in previous.get('items', [])}
    errors = []
    succeeded = 0
    for name, url, cat in SOURCES:
        try:
            req = urllib.request.Request(url, headers={'User-Agent':'Daily-AI-Radar/1.0 (+https://github.com/skaruporis-netizen/Daily-AI-Radar)', 'Accept':'application/rss+xml, application/atom+xml, application/xml, text/xml'})
            with urllib.request.urlopen(req, timeout=18) as r:
                feed = r.read(2_000_000)
            rows = parse_feed(feed, name, cat, now.date())
            for row in rows: merged[row['id']] = row
            succeeded += 1
            print(name, ':', len(rows), 'items')
        except Exception as ex:
            errors.append(f'{name}: {type(ex).__name__}: {str(ex)[:100]}')
            print('Feed unavailable:', errors[-1])
    items = [v for v in merged.values() if 0 <= (now.date() - dt.date.fromisoformat(v['date'])).days <= 60]
    items = sorted(items, key=lambda x: (x['date'], x['id']), reverse=True)[:180]
    if succeeded == 0:
        print('All feeds unavailable; retaining earlier snapshot, no misleading updated_at.')
        # Mark errors for audit only. Do not pretend the data were refreshed.
        return 1
    current = {'schema':1, 'updated_at': now.isoformat(timespec='seconds'),
               'window_days':60, 'success_count':succeeded, 'errors':errors,
               'items':items, 'note':'Automatisierte Quellenfunde, nicht redaktionell geprüft.'}
    TARGET.write_text(json.dumps(current, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Stored', len(items), 'items,', len(errors), 'source errors')
    return 0


if __name__ == '__main__':
    sys.exit(main())
