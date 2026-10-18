import json
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]

class MagazineTests(unittest.TestCase):
    def test_assets_exist(self):
        for p in ('magazine.html', 'assets/magazine.js', 'assets/magazine.css'):
            self.assertTrue((ROOT / p).is_file(), p)

    def test_article_manifest(self):
        manifest = json.loads((ROOT / 'data/articles/index.json').read_text())
        self.assertEqual(manifest['schema'], 1)
        self.assertTrue(manifest['articles'])
        for rel in manifest['articles']:
            self.assertTrue(rel.startswith('data/articles/'))
            a = json.loads((ROOT / rel).read_text())
            for key in ('id','title','category','priority','published_at','sections','sources'):
                self.assertIn(key, a)
            self.assertTrue(a['sections'])
            self.assertTrue(a['sources'])
            for src in a['sources']:
                self.assertTrue(src['url'].startswith('https://'))

    def test_magazine_data_references(self):
        js = (ROOT / 'assets/magazine.js').read_text()
        for ref in ('data/editorial.json', 'data/inbox.json', 'data/articles/index.json', 'data-rich'):
            self.assertIn(ref, js)

if __name__ == '__main__':
    unittest.main()
