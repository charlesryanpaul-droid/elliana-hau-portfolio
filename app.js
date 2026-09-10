/* Elliana Hau / kinetic portfolio, version 2. Original site visuals are separate from client work. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let saved = null;
  try { saved = localStorage.getItem('elliana-motion-v2'); } catch (_) {}
  let paused = reduce.matches || saved === 'off';
  let clock = 0, last = 0, overlay = false, palette = 0;
  const root = document.documentElement;
  root.classList.add('js');
  $('#year').textContent = new Date().getFullYear();
  const motionButton = $('.motion-toggle');
  function syncMotion() {
    document.body.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Resume animations' : 'Pause animations');
    $('.motion-text').textContent = paused ? 'Motion off' : 'Motion on';
  }
  syncMotion();
  motionButton.addEventListener('click', () => {
    paused = !paused; syncMotion(); drawOnce();
    try { localStorage.setItem('elliana-motion-v2', paused ? 'off' : 'on'); } catch (_) {}
  });
  reduce.addEventListener('change', e => { paused = e.matches; syncMotion(); drawOnce(); });
  const menu = $('#mobile-nav'), menuButton = $('.menu-toggle');
  function closeMenu() { menu.hidden = true; menuButton.setAttribute('aria-expanded','false'); }
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menu.hidden = expanded; menuButton.setAttribute('aria-expanded',String(!expanded));
  });
  $$('#mobile-nav a').forEach(a => a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e => { if(e.key === 'Escape') closeMenu(); });
  matchMedia('(min-width: 781px)').addEventListener('change',e => { if(e.matches) closeMenu(); });
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  }), { threshold:.08, rootMargin:'0px 0px 0px 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));
  let scrollDirty = true;
  addEventListener('scroll', () => {scrollDirty = true;}, {passive:true});
  addEventListener('resize', () => {scrollDirty = true;}, {passive:true});
  const colors = [[.80,1,.37],[.70,.52,1],[1,.43,.24],[.43,.94,.88]];
  $('#palette-toggle').addEventListener('click', () => { palette = (palette + 1) % colors.length; drawOnce(); });

  // Real portfolio artwork replaces the decorative hero sculpture.
  // The deck advances only while visible, with motion on and no open dialogs.
  function projectSlideshow(element) {
    const slides = $$('.hero-slide', element);
    const pickers = $$('[data-show-slide]', element);
    const toggle = $('#slideshow-toggle');
    const stage = $('#showcase-stage');
    const announcement = $('#showcase-status');
    const interval = 5.2;
    const transforms = [
      'translate3d(0, 0, 0) rotate(0deg) scale(1)',
      'translate3d(13px, -12px, 0) rotate(4deg) scale(.965)',
      'translate3d(-13px, 10px, 0) rotate(-5deg) scale(.94)'
    ];
    let index = 0, elapsed = 0, previousTime = 0, rotations = 0;
    let localPaused = false, hovered = false, visible = true, animations = [];
    let pointerPause = null, touchStart = null, lastSwipe = -Infinity;
    const playing = () => !paused && !localPaused && !hovered && visible && !document.hidden && !overlay;

    function sync() {
      element.style.setProperty('--showcase-accent', slides[index].dataset.accent);
      element.classList.toggle('showcase-resting', !playing());
      toggle.disabled = paused;
      toggle.setAttribute('aria-label', paused ? 'Slideshow paused by the Motion off setting' : localPaused ? 'Play project slideshow' : 'Pause project slideshow');
      toggle.title = paused ? 'Enable Motion in the navigation to autoplay the projects.' : '';
      $('.showcase-toggle-label', toggle).textContent = paused ? 'Motion off' : localPaused ? 'Play' : 'Pause';
      $('.showcase-pause-icon', toggle).textContent = paused || localPaused ? '▶' : 'Ⅱ';
      pickers.forEach((button, i) => {
        button.classList.toggle('is-current', i === index);
        if(i === index) button.setAttribute('aria-current','true');
        else button.removeAttribute('aria-current');
        $('i',button).style.transform = `scaleX(${i === index ? Math.min(elapsed / interval,1) : 0})`;
      });
    }

    function settle() {
      animations.forEach(animation => animation.cancel());
      animations = [];
      slides.forEach((slide, i) => {
        const slot = (i - index + slides.length) % slides.length;
        slide.classList.toggle('is-current',slot === 0);
        slide.classList.toggle('is-next',slot === 1);
        slide.classList.toggle('is-back',slot === 2);
        slide.style.transform = transforms[slot];
        slide.style.zIndex = String(3 - slot);
        slide.inert = slot !== 0;
        slide.setAttribute('aria-hidden', String(slot !== 0));
        $('a',slide).tabIndex = slot === 0 ? 0 : -1;
      });
    }

    function go(next, manual = false, direction = 1) {
      next = (next + slides.length) % slides.length;
      if(next === index) return;
      // Finish any in-flight transition before responding to rapid button presses.
      settle();
      const old = index;
      const from = slides.map(slide => ({transform: slide.style.transform, zIndex: slide.style.zIndex}));
      index = next; elapsed = 0; rotations++;
      settle();
      if(!reduce.matches && !paused && typeof slides[0].animate === 'function') {
        const duration = 850;
        slides.forEach((slide, i) => {
          const target = slide.style.transform;
          const targetZ = slide.style.zIndex;
          const frames = i === old ? [
            {transform: from[i].transform, opacity: 1, zIndex: '4', offset: 0},
            {transform: `translate3d(${-direction * 24}%, 18px, 0) rotate(${-direction * 12}deg) scale(.91)`, opacity: 0, zIndex: '4', offset: .48},
            {transform: target, opacity: 0, zIndex: targetZ, offset: .49},
            {transform: target, opacity: 1, zIndex: targetZ, offset: 1}
          ] : [
            {transform: from[i].transform, opacity: 1, zIndex: i === index ? '3' : '2'},
            {transform: target, opacity: 1, zIndex: targetZ}
          ];
          animations.push(slide.animate(frames,{duration,easing:'cubic-bezier(.22,1,.36,1)'}));
        });
      }
      if(manual) announcement.textContent = slides[index].getAttribute('aria-label');
      sync();
    }

    toggle.addEventListener('pointerdown', () => {pointerPause = !localPaused;});
    toggle.addEventListener('click', () => {
      localPaused = pointerPause === null ? !localPaused : pointerPause;
      pointerPause = null; elapsed = 0; sync();
    });
    // A focused carousel remains paused until the visitor explicitly starts it.
    element.addEventListener('focusin', () => {localPaused = true; sync();});
    element.addEventListener('pointerenter', e => {if(e.pointerType === 'mouse'){hovered = true; sync();}});
    element.addEventListener('pointerleave', e => {if(e.pointerType === 'mouse'){hovered = false; sync();}});
    $('#slide-prev').addEventListener('click', () => go(index - 1,true,-1));
    $('#slide-next').addEventListener('click', () => go(index + 1,true,1));
    pickers.forEach(button => button.addEventListener('click', () => {
      const next = Number(button.dataset.showSlide);
      go(next,true,next < index ? -1 : 1);
    }));
    element.addEventListener('keydown', e => {
      if(e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault(); localPaused = true;
        const direction = e.key === 'ArrowLeft' ? -1 : 1;
        go(index + direction,true,direction);
      }
    });
    stage.addEventListener('pointerdown', e => {
      if(e.pointerType === 'touch') touchStart = {x:e.clientX,y:e.clientY};
    },{passive:true});
    stage.addEventListener('pointercancel', () => {touchStart = null;});
    stage.addEventListener('pointerup', e => {
      if(!touchStart) return;
      const dx = e.clientX - touchStart.x, dy = e.clientY - touchStart.y;
      touchStart = null;
      if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        lastSwipe = performance.now(); localPaused = true;
        go(index + (dx < 0 ? 1 : -1),true,dx < 0 ? 1 : -1);
      }
    },{passive:true});
    stage.addEventListener('click', e => {
      if(performance.now() - lastSwipe < 400){e.preventDefault();e.stopPropagation();}
    },true);
    new IntersectionObserver(entries => {visible = entries[0].isIntersecting;sync();},{threshold:.25}).observe(element);
    document.addEventListener('visibilitychange',sync);
    settle(); sync();
    return {
      renderer:'slideshow',
      get state(){return {index, count:slides.length, project:$('a',slides[index]).dataset.project, rotations, playing:playing(), elapsed};},
      draw(t,force = false) {
        const dt = Math.max(0,t - previousTime); previousTime = t;
        if(paused || reduce.matches) settle();
        if(!force && playing()) {
          elapsed += dt;
          if(elapsed >= interval) go(index + 1);
        }
        sync();
      }
    };
  }
  const hero = projectSlideshow($('#hero-showcase'));

  // Canvas line sculptures: a different, endlessly looping language for each experiment.
  function experiment(canvas,index) {
    const ctx=canvas.getContext('2d');let w=1,h=1,visible=true,mouse=[0,0],soft=[0,0];
    const resize=()=>{let dpr=Math.min(devicePixelRatio||1,2);w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
    new ResizeObserver(()=>{resize();requestAnimationFrame(drawOnce);}).observe(canvas);resize();
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(canvas);
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();mouse=[(e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5];});canvas.addEventListener('pointerleave',()=>mouse=[0,0]);
    const rgb=c=>`rgb(${c.map(x=>Math.round(x*255)).join(',')})`;
    const project=(x,y,z,t)=>{const a=t*.261799+soft[0],b=.65+soft[1];let X=x*Math.cos(a)+z*Math.sin(a),Z=-x*Math.sin(a)+z*Math.cos(a),Y=y*Math.cos(b)-Z*Math.sin(b);Z=y*Math.sin(b)+Z*Math.cos(b);const scale=Math.min(w,h)*.29/(1-Z*.13);return [X*scale,Y*scale,Z];};
    return {draw(t,force=false) {
      if(!visible&&!force)return;soft=soft.map((x,i)=>x+(mouse[i]-x)*.06);ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);
      const col=colors[(palette+index)%colors.length],grad=ctx.createLinearGradient(-w*.3,-h*.3,w*.32,h*.4);grad.addColorStop(0,rgb(col.map(x=>Math.min(1,x*1.1+.05))));grad.addColorStop(.55,rgb(col));grad.addColorStop(1,rgb(col.map(x=>x*.44)));
      ctx.strokeStyle=grad;ctx.lineWidth=1.2;ctx.lineJoin='round';
      if(index===0) {
        const rings=[];for(let i=0;i<40;i++){const u=i/40*Math.PI*2;const points=[];for(let j=0;j<=60;j++){const v=j/60*Math.PI*2,r=1.12+.44*Math.cos(v);points.push(project(r*Math.cos(u),r*Math.sin(u),.44*Math.sin(v)+.16*Math.sin(3*u+t*.523599),t));}rings.push({points,z:points.reduce((a,p)=>a+p[2],0)/points.length});}
        rings.sort((a,b)=>a.z-b.z);for(const r of rings){ctx.globalAlpha=.45+(r.z+1.7)/3.4*.5;ctx.beginPath();r.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}
      } else if(index===1) {
        ctx.rotate(-.26+soft[0]*.24);for(let j=0;j<34;j++){ctx.beginPath();for(let k=0;k<=100;k++){const s=k/100,phase=s*Math.PI*2+t*1.047198+j*.092,x=(s-.5)*w*.83+Math.sin(j*.2+t*.523599)*w*.025,y=(j-16.5)*h*.01+Math.sin(phase)*h*.20*Math.sin(s*Math.PI)*(1+soft[1]*.35);k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.globalAlpha=.55+Math.sin(j/33*Math.PI)*.4;ctx.stroke();}
      } else {
        ctx.rotate(t*.13+soft[0]*.5);for(let j=0;j<27;j++){ctx.beginPath();const scale=.35+j/26*.65;for(let k=0;k<=220;k++){const a=k/220*Math.PI*2,r=(1+.23*Math.cos(6*a+t*.523599)+.1*Math.sin(3*a-t*.523599))*Math.min(w,h)*.31*scale;let x=Math.cos(a)*r,y=Math.sin(a)*r*(.91+soft[1]*.2);k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.globalAlpha=.38+j/26*.6;ctx.stroke();}
      }
      ctx.restore();
    }};
  }
  const experiments=$$('.experiment-canvas').map(experiment);
  function drawOnce() { if(hero)hero.draw(clock,true);experiments.forEach(e=>e.draw(clock,true)); }
  let frameCount=0;
  function frame(now) {
    const dt=Math.min((now-last)/1000 || 0,.06);last=now;
    if(scrollDirty){const max=document.documentElement.scrollHeight-innerHeight;$('.progress').style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;scrollDirty=false;}
    if(!paused&&!document.hidden&&!overlay){clock+=dt;if(hero)hero.draw(clock);experiments.forEach(e=>e.draw(clock));}
    else if(frameCount<3)drawOnce();
    frameCount++;requestAnimationFrame(frame);
  }
  document.fonts.ready.then(()=>{scrollDirty=true;drawOnce();});
  requestAnimationFrame(frame);
  addEventListener('resize',()=>requestAnimationFrame(drawOnce),{passive:true});

  const projects = {
    fresh:{number:'01',name:'Fresh Fizz',headline:'Naturally full\nof character.',color:'#ccff5e',intro:'An organic soda identity with a hand-designed typeface, expressive color, and playful packaging. Created during my ACB Studio internship.',scope:'Brand identity / Custom type / Packaging',context:'ACB Studio internship',credit:'Design by Elliana Hau, created during an internship with ACB Studio.',url:'https://www.ellianahau.com/fresh-fizz-sodas/',images:['fresh-08','fresh-02','fresh-03','fresh-01','fresh-04','fresh-06','fresh-09','fresh-05','fresh-07'],captions:['The packaging family','Campaign imagery','A brand made for sharing','The soda range','Fresh Fizz in the real world','Packaging application','Product storytelling','Editorial and campaign application','Promotional design'],next:'independent'},
    independent:{number:'02',name:'Independent voices',headline:'Their world.\nA visual voice.',color:'#ff794f',intro:'Album covers, logos, flyers, and merchandise for independent clients. Typography and imagery shaped around each client’s individual style, not a template.',scope:'Cover artwork / Logos / Flyers / Merchandise',context:'Selected freelance projects',credit:'Selected freelance design by Elliana Hau. Music and client identities belong to their respective owners.',url:'https://www.ellianahau.com/freelance/',images:['independent-01','independent-02','independent-03','independent-04','independent-05','independent-06','independent-07'],captions:['Identity explorations','Event artwork','Cover artwork','Event poster','Merchandise design','Release artwork','Merchandise design'],next:'acb'},
    acb:{number:'03',name:'ACB Studio',headline:'Distinct identities.\nOne moving story.',color:'#c1a0ff',intro:'I animated ACB Studio’s brand identities in After Effects, using transitions and pacing to connect distinct visual worlds in a cohesive reel.',scope:'Animation / Transitions / Visual storytelling',context:'Studio collaboration',credit:'Animation by Elliana Hau. Featured brand identities by ACB Studio.',url:'https://www.ellianahau.com/acbreel/',images:['acb-01'],captions:['A frame from the ACB Studio reel'],video:true,next:'acuity'},
    acuity:{number:'04',name:'Acuity Brands',headline:'Many formats.\nOne clear voice.',color:'#8fe6ef',intro:'Marketing design support across social content, sell sheets, brochures, layouts, and promotional video, in collaboration with designers and project managers at Acuity Brands.',scope:'Marketing design / Editorial layout / Print + digital',context:'Marketing team collaboration',credit:'Marketing design contributions by Elliana Hau, in collaboration with the Acuity Brands team.',url:'https://www.ellianahau.com/acuitybrands/',images:['acuity-02','acuity-01','acuity-03'],captions:['Sports lighting campaign imagery','Digital marketing application','Environmental and event graphics'],next:'fresh'}
  };
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const projectDialog=$('#project-dialog'),reelDialog=$('#reel-dialog');
  const opener=new Map();
  function lock(){overlay=!!$('dialog[open]');document.body.style.overflow=overlay?'hidden':'';hero.draw(clock,true);}
  function openProject(key,trigger) {
    const p=projects[key];if(!p)return;
    opener.set(projectDialog,trigger||opener.get(projectDialog));
    $('#project-content').innerHTML=`<article class="project-detail" style="--detail-color:${p.color}"><span class="eyebrow">${p.number} / ${escape(p.name)}</span><h2 id="dialog-title">${escape(p.headline).replace('\n','<br>')}</h2><div class="detail-intro"><p>${escape(p.intro)}</p><div class="detail-meta"><div><strong>Contribution</strong><p>${escape(p.scope)}</p></div><div><strong>Context</strong><p>${escape(p.context)}</p></div></div></div><div class="detail-links">${p.video?'<button type="button" class="button solid" data-reel>Play the reel <span aria-hidden="true">▶</span></button>':''}<a class="text-link" href="${p.url}" target="_blank" rel="noopener">View original project ↗</a></div><div class="detail-gallery">${p.images.map((id,i)=>`<figure class="${i===0||key==='acuity'?'wide':''}"><img src="media/${id}.webp" alt="${escape(p.name+': '+p.captions[i])}" loading="${i===0?'eager':'lazy'}"><figcaption>${String(i+1).padStart(2,'0')} / ${escape(p.captions[i])}</figcaption></figure>`).join('')}</div><p class="detail-credit">${escape(p.credit)}</p><button class="detail-next" type="button" data-next="${p.next}"><span>NEXT PROJECT</span><strong>${escape(projects[p.next].name)} ↗</strong></button></article>`;
    if(!projectDialog.open)projectDialog.showModal();projectDialog.scrollTop=0;lock();
    const play=$('[data-reel]',projectDialog);if(play)play.addEventListener('click',()=>openReel(play));
    $('[data-next]',projectDialog).addEventListener('click',e=>{openProject(e.currentTarget.dataset.next);$('.dialog-close',projectDialog).focus({preventScroll:true});});
    $$('img',projectDialog).forEach(handleImage);
  }
  function openReel(trigger) {
    opener.set(reelDialog,trigger);
    $('#video-container').innerHTML='<iframe title="ACB Studio reel, animation by Elliana Hau" src="https://www.youtube-nocookie.com/embed/rPtnit3YFyg?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    reelDialog.showModal();lock();
  }
  $$('[data-project]').forEach(a=>a.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();openProject(a.dataset.project,a);}));
  $$('[data-reel]').forEach(b=>b.addEventListener('click',()=>openReel(b)));
  $$('dialog').forEach(d=>{
    $('.dialog-close',d).addEventListener('click',()=>d.close());
    d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
    d.addEventListener('close',()=>{if(d===reelDialog)$('#video-container').replaceChildren();lock();const button=opener.get(d);if(button&&button.isConnected)button.focus({preventScroll:true});});
  });
  function handleImage(img){
    const fail=()=>{if(img.dataset.failed)return;img.dataset.failed='true';img.hidden=true;const message=document.createElement('div');message.className='image-unavailable';message.textContent='This artwork is unavailable. View the original project using the link above.';img.parentElement.appendChild(message);};
    img.addEventListener('error',fail,{once:true});if(img.complete&&img.naturalWidth===0)fail();
  }
  $$('img').forEach(handleImage);
  // Expose only non-sensitive diagnostics to aid QA, not a network or tracking interface.
  window.portfolioState=()=>({version:2,feature:'project-slideshow',paused,palette,renderer:hero?.renderer||'css',slideshow:hero?.state,clock});
})();
