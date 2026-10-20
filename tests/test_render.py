"""Offline assertions against the generated page, not generator internals."""
import json
import unittest
from html.parser import HTMLParser
from pathlib import Path

class Element:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []
    def all(self, tag=None):
        result = []
        for child in self.children:
            if isinstance(child, Element):
                if tag is None or child.tag == tag:
                    result.append(child)
                result.extend(child.all(tag))
        return result
    def text(self):
        return ''.join(x.text() if isinstance(x, Element) else x for x in self.children)

class Document(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Element()
        self.stack = [self.root]
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in {'meta', 'link', 'br', 'img', 'hr', 'input', 'source'}:
            self.stack.append(node)
    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return
    def handle_data(self, text):
        self.stack[-1].children.append(text)

class TributeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = json.loads(Path('content/catalog.json').read_text())
        cls.html = Path('dist/index.html').read_text()
        cls.page = Document(cls.html).root
    def section(self, id):
        matches = [n for n in self.page.all() if n.attrs.get('id') == id]
        self.assertEqual(len(matches), 1, f'one #{id}')
        return matches[0]
    def test_wall_exact_names_and_order(self):
        wall = self.section('game-wall')
        self.assertEqual([n.text() for n in wall.all('h3')], ['Pixel Fall','Abode','Monster Jump','Boom','Johnny Ace'])
        self.assertEqual(len(wall.all('article')), 5)
        for name in ['Pixel Fall','Abode','Monster Jump','Boom','Johnny Ace']:
            self.assertEqual([n.text() for n in wall.all('h3')].count(name), 1)
    def test_game_links_match_catalog_allowlist(self):
        for game in self.catalog['wall']:
            article = next(n for n in self.page.all('article') if n.attrs.get('data-game') == game['id'])
            expected = [x['url'] for x in game['links']+game['stores'] if x.get('live_button') is True]
            self.assertEqual([n.attrs['href'] for n in article.all('a')], expected)
        boom = next(n for n in self.page.all('article') if n.attrs.get('data-game') == 'boom')
        self.assertEqual(boom.all('a'), [])
        johnny = next(n for n in self.page.all('article') if n.attrs.get('data-game') == 'johnny-ace')
        self.assertEqual(johnny.all('a'), [])
    def test_store_ids_preserved_offline_only(self):
        expected = {'pixel-fall':['com.sps.pxelfall','905884027'], 'monster-jump':['com.sps.monsterjump','1184881974'], 'boom':['com.sps.boom','1184904558']}
        for game in self.catalog['wall']:
            if game['id'] not in expected:
                continue
            self.assertEqual([s['id'] for s in game['stores']], expected[game['id']])
            for store in game['stores']:
                self.assertFalse(store['live_button'])
                self.assertNotIn(store['id'], self.html)
    def test_exact_credit_names_and_roles(self):
        rows = self.section('credit-wall').all('li')
        pairs = [(row.all('h3')[0].text(),row.all('p')[0].text()) for row in rows]
        self.assertEqual(pairs, [('USMAN','creative guru'),('MAT','3d wizard'),('ALI','back-end specialist'),('MUBBASHER','biz dev'),('HASEEB','mr. artist'),('SHAH','game engineer'),('IMRAN','jnr engineer'),('SAYYAM','2014 website'),('MUBASSIR','2014 website')])
        for row in rows:
            self.assertEqual(len(row.all('p')), 1)
        self.assertNotIn('Johnny Ace', self.section('credit-wall').text())
        for name in self.catalog['withheld']:
            self.assertNotIn(name['name'], self.page.text())
    def test_trailers_separate(self):
        links = self.section('trailers').all('a')
        self.assertEqual([n.attrs['href'] for n in links],[t['url'] for t in self.catalog['trailers'] if t['live_button']])
        self.assertNotIn('Shootman Runner', self.section('game-wall').text())
        self.assertNotIn('Zama Truck', self.section('game-wall').text())
    def test_platform_labels_only_when_catalogued(self):
        for game in self.catalog['wall']:
            article = next(n for n in self.page.all('article') if n.attrs.get('data-game') == game['id'])
            labels = [n.text() for n in article.all('span') if n.attrs.get('class') == 'platform']
            self.assertEqual(labels, [' · '.join(game['platforms'])] if game['platforms'] else [])

    def test_studio_blurb_and_quote_preserved(self):
        archive = self.section('archive')
        self.assertIn(self.catalog['studio']['blurb'], archive.all('blockquote')[0].text())
        quotes = [n.text() for n in archive.all('p') if n.attrs.get('class') == 'quote']
        self.assertEqual(quotes, [self.catalog['studio']['quote']])

    def test_title_and_preservation_scope(self):
        self.assertTrue(self.page.all('title')[0].text().startswith('SWEET PIXEL STUDIO'))
        title = self.section('title').text().replace('✳','')
        self.assertEqual(title, 'SWEET PIXEL STUDIO')
        for tag in ['script','iframe','form','canvas','audio','video']:
            self.assertEqual(self.page.all(tag), [], tag)
        for banned in ['mailchimp','google-analytics','googletagmanager','play now','play pixel fall','press kit']:
            self.assertNotIn(banned, self.html.lower())
        self.assertEqual([n.attrs.get('href') for n in self.page.all('link')], ['style.css'])
    def test_accessible_navigation_and_local_assets(self):
        ids = [n.attrs['id'] for n in self.page.all() if 'id' in n.attrs]
        self.assertEqual(len(ids),len(set(ids)))
        for anchor in self.page.all('a'):
            href = anchor.attrs['href']
            self.assertTrue(href)
            if href.startswith('#') and len(href)>1:
                self.assertIn(href[1:], ids)
        self.assertEqual(len(self.page.all('h1')),1)
        self.assertTrue(any(n.attrs.get('name')=='viewport' for n in self.page.all('meta')))
        css = Path('dist/style.css').read_text()
        self.assertNotIn('url(',css)
        self.assertIn('prefers-reduced-motion',css)

    def test_original_artwork_and_past_tense(self):
        studio = self.catalog['studio']
        self.assertFalse(studio['active'])
        self.assertEqual(studio['tense'], 'past')
        self.assertIn(studio['status_line'], self.section('main').text())
        archive_heading = self.section('archive').all('h2')[0].text()
        self.assertEqual(archive_heading, studio['archive_heading'])
        self.assertIn(studio['hero_kicker'], self.html)
        self.assertIn(studio['hero_footer'], self.html)
        self.assertIn(studio['art_caption'], self.html)
        self.assertNotIn('Once upon a time.', self.html)
        self.assertNotIn(studio['story_source'], self.html)
        for game in self.catalog['wall']:
            article = next(n for n in self.page.all('article') if n.attrs.get('data-game') == game['id'])
            memories = [n.text() for n in article.all('p') if n.attrs.get('class') == 'memory']
            self.assertIn(game['summary'], article.text())
            self.assertEqual(memories, [game['memory']] if game.get('memory') else [])
        self.assertNotIn(studio['invitation'], self.html)
        for banned in ['always in play', 'still a scrappy clan', 'new graphic studies', 'sweet-deadpool', 'playstation-icons']:
            self.assertNotIn(banned, self.html.lower())
        for game in self.catalog['wall']:
            article = next(n for n in self.page.all('article') if n.attrs.get('data-game') == game['id'])
            imgs = article.all('img')
            if game.get('thumbnail'):
                self.assertEqual([(n.attrs['src'], n.attrs['alt']) for n in imgs], [(game['thumbnail']['src'], game['thumbnail']['alt'])])
                self.assertTrue((Path('web') / game['thumbnail']['src']).is_file())
                self.assertTrue((Path('dist') / game['thumbnail']['src']).is_file())
            else:
                self.assertEqual(imgs, [])
        for person in self.catalog['credits']:
            row = next(li for li in self.section('credit-wall').all('li') if li.all('h3')[0].text() == person['short'])
            imgs = row.all('img')
            if person.get('portrait'):
                self.assertEqual([n.attrs.get('src') for n in imgs], [person['portrait']['src']])
                self.assertEqual(imgs[0].attrs.get('alt'), '')
                self.assertTrue((Path('dist') / person['portrait']['src']).is_file())
            else:
                self.assertEqual(imgs, [])
        for img in self.page.all('img'):
            src = img.attrs['src']
            self.assertTrue(src.startswith('assets/'), src)
            self.assertNotIn('..', src)
        header_src = self.page.all('header')[0].all('img')[0].attrs['src']
        self.assertEqual(header_src, studio['mark']['src'])
        for svg in Path('web/assets').rglob('*.svg'):
            text = svg.read_text().lower()
            self.assertNotIn('<!doctype', text)
            self.assertNotIn('<script', text)

if __name__ == '__main__':
    unittest.main()
