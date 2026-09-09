"""Browser checks for the staged public portfolio. No credentials or tracking."""
import functools
import http.server
import json
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path('_qa')
OUT.mkdir(exist_ok=True)
report = {'errors': [], 'layouts': [], 'checks': {}}
class QuietServer(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
handler = functools.partial(QuietServer, directory=str(Path('_site').resolve()))
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/'

def check(name, condition):
    report['checks'][name] = bool(condition)
    if not condition:
        raise AssertionError(name)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        page = browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
        page.on('pageerror', lambda error: report['errors'].append(str(error)))
        response = page.goto(url, wait_until='networkidle', timeout=60000)
        check('HTTP 200', response.status == 200)
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(1800)
        report['state'] = page.evaluate('portfolioState()')
        report['fonts'] = page.evaluate('Array.from(document.fonts).map(f=>({family:f.family,status:f.status}))')
        check('Version 2 running', report['state']['version'] == 2)
        check('Animated renderer available', report['state']['renderer'] in ('webgl', 'canvas'))
        check('Black background', page.evaluate('getComputedStyle(document.body).backgroundColor') == 'rgb(0, 0, 0)')
        first = page.locator('#hero-canvas').screenshot()
        page.wait_for_timeout(550)
        second = page.locator('#hero-canvas').screenshot()
        check('Hero changes over time', first != second)
        page.screenshot(path=str(OUT/'desktop-hero.png'))
        page.click('#remix')
        check('Sculpture remix', page.evaluate('portfolioState().form') == 1)
        page.click('#remix')
        page.click('#remix')
        page.add_style_tag(content='html{scroll-behavior:auto!important}')
        page.click('#palette-toggle')
        check('Palette control', page.evaluate('portfolioState().palette') == 1)
        for _ in range(3):
            page.click('#palette-toggle')
        page.locator('#play').scroll_into_view_if_needed()
        page.wait_for_timeout(1100)
        page.screenshot(path=str(OUT/'desktop-play.png'))
        page.click('.motion-toggle')
        stopped = page.evaluate('portfolioState().clock')
        page.wait_for_timeout(500)
        check('Pause holds animation clock', stopped == page.evaluate('portfolioState().clock'))
        for key, count in [('fresh',9),('independent',7),('acb',1),('acuity',3)]:
            page.click(f'[data-project="{key}"]')
            check(f'{key} dialog opens', page.locator('#project-dialog').evaluate('(e)=>e.open'))
            check(f'{key} image gallery', page.locator('#project-dialog img').count() == count)
            for image in page.locator('#project-dialog img').all():
                image.scroll_into_view_if_needed()
                image.evaluate('(e)=>e.decode()')
            page.locator('#project-dialog').evaluate('(e)=>e.scrollTop=0')
            if key == 'fresh':
                page.screenshot(path=str(OUT/'project-gallery.png'))
            page.keyboard.press('Escape')
            check(f'{key} closes with Escape', not page.locator('#project-dialog').evaluate('(e)=>e.open'))
        manifest = json.loads(Path('_site/media/manifest.json').read_text())
        check('20 original images local', len(manifest) == 20 and all(item['ok'] for item in manifest))
        for width in [320,375,390,520,768,1024,1440,1920]:
            page.set_viewport_size({'width':width,'height':900})
            page.evaluate('window.scrollTo(0,0)')
            page.wait_for_timeout(250)
            result = page.evaluate('''() => ({width:innerWidth,documentWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('main h1,main h2,main h3')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent)})''')
            report['layouts'].append(result)
            check(f'No horizontal overflow at {width}px', result['documentWidth'] <= width)
            check(f'Headings fit at {width}px', not result['overflow'])
            if width in (390,768):
                page.screenshot(path=str(OUT/f'viewport-{width}.png'))
        page.set_viewport_size({'width':390,'height':844})
        page.click('.menu-toggle')
        check('Mobile menu opens', page.locator('#mobile-nav').is_visible())
        page.click('#mobile-nav a[href="#play"]')
        check('Mobile navigation closes menu', not page.locator('#mobile-nav').is_visible())
        page.wait_for_timeout(300)
        page.screenshot(path=str(OUT/'mobile-play.png'))
        page.set_viewport_size({'width':1440,'height':1000})
        page.evaluate('window.scrollTo(0,0)')
        page.wait_for_timeout(300)
        page.screenshot(path=str(OUT/'desktop-full.png'), full_page=True)
        reduced = browser.new_context(reduced_motion='reduce', viewport={'width':390,'height':844})
        reduced_page = reduced.new_page()
        reduced_page.goto(url, wait_until='networkidle')
        check('Reduced motion respected', reduced_page.evaluate('portfolioState().paused'))
        check('Reduced motion clock stationary', reduced_page.evaluate('portfolioState().clock') == 0)
        reduced.close()
        check('No JavaScript errors', not report['errors'])
        browser.close()
except Exception as error:
    report['failure'] = str(error)
    raise
finally:
    (OUT/'report.json').write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))
    server.shutdown()
