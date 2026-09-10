"""Browser regression checks for the portfolio and in-card slideshow navigation."""
import functools
import http.server
import json
import os
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
        options = {'headless': True}
        if os.environ.get('CHROMIUM_PATH'):
            options['executable_path'] = os.environ['CHROMIUM_PATH']
        browser = p.chromium.launch(**options)
        page = browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
        page.on('pageerror',lambda error:report['errors'].append(str(error)))
        response = page.goto(url,wait_until='networkidle',timeout=60000)
        check('HTTP 200',response.status == 200)
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(1200)
        check('Slideshow replaces sculpture',page.locator('#hero-canvas, #remix').count() == 0)
        check('Three featured projects',page.locator('.hero-slide').count() == 3)
        check('Slideshow initialized',page.evaluate('portfolioState().renderer') == 'slideshow')
        check('Black background',page.evaluate('getComputedStyle(document.body).backgroundColor') == 'rgb(0, 0, 0)')
        check('Top playback button removed',page.locator('#slideshow-toggle,.showcase-top button').count() == 0)
        check('Diagonal card arrows removed',page.locator('.showcase-open').count() == 0)
        check('Exactly two in-card navigation buttons',page.locator('#showcase-stage .showcase-arrows button').count() == 2)
        check('Previous button uses less-than',page.locator('#slide-prev').inner_text() == '<')
        check('Next button uses greater-than',page.locator('#slide-next').inner_text() == '>')
        check('No buttons nested in project links',page.locator('.showcase-project button').count() == 0)
        check('No duplicate navigation below cards',page.locator('.showcase-bottom .showcase-arrows').count() == 0)
        for image in page.locator('.hero-slide img').all():
            image.evaluate('(e)=>e.decode()')
        page.screenshot(path=str(OUT/'desktop-hero.png'))
        start = page.evaluate('portfolioState().slideshow.rotations')
        page.wait_for_function('(n)=>portfolioState().slideshow.rotations >= n+3',arg=start,timeout=22000)
        check('Autoplay completes a three-project loop',page.evaluate('portfolioState().slideshow.rotations') >= start+3)
        page.mouse.move(900,300)
        held = page.evaluate('portfolioState().slideshow.elapsed')
        page.wait_for_timeout(350)
        check('Hover pauses rotation',page.evaluate('portfolioState().slideshow.elapsed') == held)
        page.mouse.move(0,0)
        page.wait_for_timeout(150)
        check('Hover exit resumes rotation',page.evaluate('portfolioState().slideshow.elapsed') > held)
        for i, key in enumerate(['fresh','independent','acuity']):
            page.click(f'[data-show-slide="{i}"]')
            page.wait_for_timeout(900)
            check(f'Picker selects {key}',page.evaluate('portfolioState().slideshow.project') == key)
            check(f'{key} alone is interactive',page.locator('.hero-slide:not([inert])').count() == 1)
            page.locator('#hero-showcase').screenshot(path=str(OUT/f'hero-{key}.png'))
            page.click('.hero-slide.is-current [data-project]')
            check(f'Hero opens {key} gallery',page.locator('#project-dialog').evaluate('(e)=>e.open'))
            page.keyboard.press('Escape')
        page.click('#slide-next')
        check('Next wraps to first project',page.evaluate('portfolioState().slideshow.index') == 0)
        page.click('#slide-prev')
        check('Previous wraps to last project',page.evaluate('portfolioState().slideshow.index') == 2)
        check('Navigation does not open a gallery',not page.locator('#project-dialog').evaluate('(e)=>e.open'))
        page.locator('#slide-next').focus()
        page.keyboard.press('Enter')
        check('Next is keyboard accessible',page.evaluate('portfolioState().slideshow.index') == 0)
        page.keyboard.press('ArrowLeft')
        check('Arrow key navigation',page.evaluate('portfolioState().slideshow.index') == 2)
        page.mouse.move(0,0)
        check('Focus stops autoplay until requested',not page.evaluate('portfolioState().slideshow.playing'))
        page.click('.motion-toggle')
        stopped = page.evaluate('portfolioState().clock')
        page.wait_for_timeout(250)
        check('Global pause holds animation clock',stopped == page.evaluate('portfolioState().clock'))
        check('Global pause holds slideshow',not page.evaluate('portfolioState().slideshow.playing'))
        page.click('.motion-toggle')
        page.wait_for_timeout(200)
        check('Global Motion on resumes autoplay',page.evaluate('portfolioState().slideshow.playing'))
        page.click('.motion-toggle')
        page.click('#slide-prev')
        check('Manual navigation works while paused',page.evaluate('portfolioState().slideshow.index') == 1)
        page.add_style_tag(content='html{scroll-behavior:auto!important}')
        page.click('#palette-toggle')
        check('Playground palette still works',page.evaluate('portfolioState().palette') == 1)
        for _ in range(3):page.click('#palette-toggle')
        for key, count in [('fresh',9),('independent',7),('acb',1),('acuity',3)]:
            page.click(f'#work [data-project="{key}"]')
            check(f'{key} gallery opens',page.locator('#project-dialog').evaluate('(e)=>e.open'))
            check(f'{key} image count',page.locator('#project-dialog img').count() == count)
            for image in page.locator('#project-dialog img').all():
                image.scroll_into_view_if_needed();image.evaluate('(e)=>e.decode()')
            page.keyboard.press('Escape')
            check(f'{key} closes',not page.locator('#project-dialog').evaluate('(e)=>e.open'))
        page.click('[data-show-slide="1"]')
        for width in [320,375,390,520,768,820,1024,1440,1920]:
            page.set_viewport_size({'width':width,'height':900})
            page.evaluate('scrollTo(0,0)');page.wait_for_timeout(100)
            result = page.evaluate('''() => {
              const caption=document.querySelector('.hero-slide.is-current .showcase-caption').getBoundingClientRect();
              const text=document.querySelector('.hero-slide.is-current .showcase-caption>div').getBoundingClientRect();
              const controls=document.querySelector('.showcase-arrows').getBoundingClientRect();
              const buttons=[...document.querySelectorAll('.showcase-arrows button')];
              return {width:innerWidth, documentWidth:document.documentElement.scrollWidth,
                overflow:[...document.querySelectorAll('main h1,main h2,main h3')].filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent),
                textFits: text.bottom<=caption.bottom+1 && text.top>=caption.top-1,
                controlsInside:controls.top>=caption.top && controls.bottom<=caption.bottom && controls.right<=caption.right,
                noTextOverlap:text.right+4<=controls.left,
                circles:buttons.every(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return Math.abs(r.width-r.height)<1 && r.width>=44 && s.borderRadius==='50%' && s.borderTopStyle==='solid';})};
            }''')
            report['layouts'].append(result)
            check(f'No horizontal overflow at {width}',result['documentWidth'] <= width)
            check(f'Headings fit at {width}',not result['overflow'])
            check(f'Caption fits at {width}',result['textFits'])
            check(f'Outlined controls fit without overlap at {width}',result['controlsInside'] and result['noTextOverlap'] and result['circles'])
        page.set_viewport_size({'width':390,'height':844})
        page.locator('#hero-showcase').scroll_into_view_if_needed()
        page.locator('#hero-showcase').screenshot(path=str(OUT/'mobile-slideshow.png'))
        page.click('.menu-toggle')
        check('Mobile menu opens',page.locator('#mobile-nav').is_visible())
        page.click('#mobile-nav a[href="#play"]')
        check('Mobile menu closes',not page.locator('#mobile-nav').is_visible())
        page.locator('#hero-showcase').scroll_into_view_if_needed()
        before = page.evaluate('portfolioState().slideshow.index')
        page.locator('#showcase-stage').dispatch_event('pointerdown',{'pointerType':'touch','clientX':290,'clientY':300})
        page.locator('#showcase-stage').dispatch_event('pointerup',{'pointerType':'touch','clientX':160,'clientY':305})
        check('Touch swipe advances project',page.evaluate('portfolioState().slideshow.index') == (before+1)%3)
        reduced = browser.new_context(reduced_motion='reduce',viewport={'width':390,'height':844})
        reduced_page = reduced.new_page()
        reduced_page.goto(url,wait_until='networkidle')
        check('Reduced motion respected',reduced_page.evaluate('portfolioState().paused'))
        check('Reduced motion has no autoplay',not reduced_page.evaluate('portfolioState().slideshow.playing'))
        reduced_page.click('#slide-next')
        check('Reduced motion permits manual browsing',reduced_page.evaluate('portfolioState().slideshow.index') == 1)
        reduced.close()
        check('No JavaScript exceptions',not report['errors'])
        report['state'] = page.evaluate('portfolioState()')
        browser.close()
except Exception as error:
    report['failure'] = str(error)
    raise
finally:
    (OUT/'report.json').write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))
    server.shutdown()
