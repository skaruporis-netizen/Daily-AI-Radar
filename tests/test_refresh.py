import datetime as dt
import importlib.util
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('radar_refresh', ROOT / 'scripts' / 'refresh.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class FeedTests(unittest.TestCase):
    def test_rss_parsing(self):
        payload = b'''<rss><channel><item><title>New AI model for coding agent</title><link>https://example.org/post</link><pubDate>Sat, 17 Oct 2026 06:00:00 GMT</pubDate><description>A model for engineering automation.</description></item></channel></rss>'''
        entries = module.parse_feed(payload, 'Test', 'Engineering', dt.date(2026, 10, 17))
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0]['date'], '2026-10-17')
        self.assertEqual(entries[0]['status'], 'NEU · UNGEPRÜFT')

    def test_filters_old_records(self):
        payload = b'''<rss><channel><item><title>Old AI model</title><link>https://example.org/old</link><pubDate>Sat, 01 Aug 2026 06:00:00 GMT</pubDate></item></channel></rss>'''
        self.assertEqual(module.parse_feed(payload, 'Test', 'Engineering', dt.date(2026, 10, 17)), [])

if __name__ == '__main__': unittest.main()
