"""Stage the public site and optimize Elliana's existing, publicly displayed artwork.
No credentials are read. Only the explicitly listed portfolio images are downloaded.
"""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
import json
import shutil
import urllib.request
from PIL import Image, ImageOps

BASE = 'https://www.ellianahau.com/__static/production-domaincom-2/212/1956212/SwOF9GB3/'
GROUPS = {
    'fresh': ['47128fccb50c48dda90f64df5bba7c32','4e1eb3313404475f84f551792648b13b','f82b6bc8e898425e9f6be0d4721d4f1b','4af4accdf8c04826b09604c2452fe11a','a21055c46ef14b7094c5374a4c3ed679','cdef2f1cff5e4b96a7e985de27991f6a','831dfa7f414c448ea1369c9da55cdbf6','959735af50b24ca29656c6241ab1bc92','6883a739b5244ed1975f56881b5629db'],
    'acuity': ['5607c72381ce4fc4aa0aa56538757a45','e3c17c16e6f140ae96862cf90e8bdb6b','2435ab1f5b244e969766dd50d3b6f00b'],
    'independent': ['5342a467cd84494094d6fa456c1cffcf','78549b99eb3f4a71b64e0200cce8de40','b2566bb81bb94c4d8ee81950641a9f5b','5afd2dc9b8b348eaace0fcc340179b50','35ac8530973a43d7a5b3db464aab7d2d','7f0941ec6c1a4a87bd7a685187ade06f','88dc6dee8b5641efa5cc93dda0a7bcd5']
}
ASSETS = [(f'{group}-{i+1:02}', BASE + asset) for group, values in GROUPS.items() for i, asset in enumerate(values)]
ASSETS += [('acb-01', 'https://img.youtube.com/vi/rPtnit3YFyg/maxresdefault.jpg')]
OUT = Path('_site')
CACHE = Path('_media')
OUT.mkdir(exist_ok=True)
CACHE.mkdir(exist_ok=True)

def get_image(item):
    key, url = item
    destination = CACHE / f'{key}.webp'
    try:
        if not destination.exists():
            request = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0','Referer':'https://www.ellianahau.com/'})
            with urllib.request.urlopen(request, timeout=35) as response:
                data = response.read(30*1024*1024+1)
            if len(data) > 30*1024*1024:
                raise ValueError('Image exceeds 30 MB')
            with Image.open(BytesIO(data)) as original:
                image = ImageOps.exif_transpose(original).convert('RGBA' if 'A' in original.getbands() else 'RGB')
                image.thumbnail((1800,1800), Image.Resampling.LANCZOS)
                image.save(destination,'WEBP',quality=88,method=6)
        with Image.open(destination) as image:
            width, height = image.size
        print(f'OK {key}: {width}x{height}', flush=True)
        return {'id':key,'source':url,'path':f'media/{key}.webp','width':width,'height':height,'ok':True}
    except Exception as exc:
        print(f'::warning::Artwork unavailable: {key}: {exc}', flush=True)
        return {'id':key,'source':url,'ok':False,'error':str(exc)}

with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(get_image, ASSETS))

for name in ('index.html','styles.css','app.js','favicon.svg','social.svg','robots.txt'):
    source = Path(name)
    if source.is_file():
        text = source.read_text(encoding='utf-8')
        for result in results:
            if result['ok']:
                text = text.replace(result['source'], result['path'])
        (OUT/name).write_text(text,encoding='utf-8')

shutil.copytree(CACHE, OUT/'media',dirs_exist_ok=True)
(OUT/'media'/'manifest.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
(OUT/'.nojekyll').touch()
print(f"Prepared site with {sum(r['ok'] for r in results)}/{len(results)} local artwork files.")
