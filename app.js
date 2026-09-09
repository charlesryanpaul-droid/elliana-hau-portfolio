/* Elliana Hau / kinetic portfolio, version 2. Original site visuals are separate from client work. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let saved = null;
  try { saved = localStorage.getItem('elliana-motion-v2'); } catch (_) {}
  let paused = reduce.matches || saved === 'off';
  let clock = 0, last = 0, overlay = false, palette = 0, form = 0;
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
  reduce.addEventListener('change', e => { paused = e.matches; syncMotion(); });
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

  // Software-rendered fallback: the same interactive 3D idea without requiring WebGL.
  function sculpture2d(canvas) {
    const ctx=canvas.getContext('2d');
    if(!ctx){document.body.classList.add('no-webgl');return null;}
    let w=1,h=1,visible=true,pointer=[0,0],soft=[0,0],vertices=[],normals=[],faces=[];
    const unit=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l);};
    const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    function center(t,type){if(type===1){const r=1.8+.35*Math.cos(5*t);return[r*Math.cos(t),r*Math.sin(t),.57*Math.sin(5*t)];}if(type===2){const r=1.55+.49*Math.cos(3*t);return[r*Math.cos(t),r*Math.sin(t),.62*Math.sin(3*t)];}const r=1.62+.59*Math.cos(3*t);return[r*Math.cos(2*t),r*Math.sin(2*t),.83*Math.sin(3*t)];}
    function geometry(type){vertices=[];normals=[];faces=[];const steps=128,sides=24;
      for(let i=0;i<=steps;i++){const t=i/steps*Math.PI*2,c=center(t,type),p=center(t+.001,type),m=center(t-.001,type),T=unit(p.map((x,j)=>x-m[j])),N=unit(cross(T,[0,0,1])),B=unit(cross(T,N)),radius=type===0?.32:type===1?.31:.42;
        for(let j=0;j<=sides;j++){const v=j/sides*Math.PI*2,n=N.map((x,k)=>x*Math.cos(v)+B[k]*Math.sin(v));vertices.push(c.map((x,k)=>x+n[k]*radius));normals.push(n);if(i<steps&&j<sides){const a=i*(sides+1)+j,b=a+sides+1;faces.push([a,b,b+1,a+1]);}}
      }
    }
    geometry(0);
    function resize(){const dpr=Math.min(devicePixelRatio||1,2);w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
    new ResizeObserver(()=>{resize();requestAnimationFrame(drawOnce);}).observe(canvas);resize();
    new IntersectionObserver(e=>visible=e[0].isIntersecting,{rootMargin:'80px'}).observe(canvas);
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer=[(e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1];});canvas.addEventListener('pointerleave',()=>pointer=[0,0]);
    $('#remix').addEventListener('click',()=>{form=(form+1)%3;$('#form-number').textContent=String(form+1).padStart(3,'0');geometry(form);drawOnce();});
    return {renderer:'canvas',draw(t,force=false){if(!visible&&!force)return;soft=soft.map((x,i)=>x+(pointer[i]-x)*.05);ctx.clearRect(0,0,w,h);
      const ax=.55+soft[1]*.28,ay=t*.261799+soft[0]*.45,az=-.2+Math.sin(t*.523599)*.13,sx=Math.sin(ax),cx=Math.cos(ax),sy=Math.sin(ay),cy=Math.cos(ay),sz=Math.sin(az),cz=Math.cos(az);
      function rotate(v){const X=v[0]*cz-v[1]*sz,Y=v[0]*sz+v[1]*cz,Z=v[2],xx=X*cy+Z*sy,zz=-X*sy+Z*cy;return[xx,Y*cx-zz*sx,Y*sx+zz*cx];}
      const transformed=vertices.map(rotate),ns=normals.map(rotate),size=Math.min(w,h)*1.14;
      const projected=transformed.map(p=>[w/2+p[0]*size/(7.4-p[2]),h*.48+p[1]*size/(7.4-p[2]),p[2]]);
      const order=faces.map(f=>({f,z:f.reduce((s,i)=>s+projected[i][2],0)})).sort((a,b)=>a.z-b.z),light=unit([-.6,-1.15,1.2]),col=colors[palette];
      ctx.lineJoin='round';ctx.lineWidth=.7;
      for(const entry of order){const f=entry.f,n=unit(f.reduce((sum,i)=>sum.map((v,k)=>v+ns[i][k]),[0,0,0]));const d=Math.max(0,n.reduce((s,v,k)=>s+v*light[k],0)),spec=Math.pow(Math.max(0,-n[0]*.23-n[1]*.45+n[2]*.86),46),rim=Math.pow(1-Math.abs(n[2]),2.5),tone=.18+.79*d;
        const rgb=col.map((v,k)=>Math.min(255,Math.round((v*tone+spec*.9+[.76,1,.85][k]*rim*.18)*255)));
        ctx.fillStyle=ctx.strokeStyle=`rgb(${rgb.join(',')})`;ctx.beginPath();f.forEach((i,j)=>{const p=projected[i];j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);});ctx.closePath();ctx.fill();ctx.stroke();
      }
    }};
  }

  // A small WebGL engine, with no external graphics framework or remote assets.
  function sculpture(canvas) {
    const gl = canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});
    if(!gl) return sculpture2d(canvas);
    const vertex = `
      attribute vec3 aPosition; attribute vec3 aNormal; attribute vec2 aUV;
      uniform float uTime; uniform float uAspect; uniform vec2 uPointer;
      varying vec3 vNormal; varying vec3 vPosition; varying vec2 vUV;
      mat3 rx(float a){float s=sin(a),c=cos(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
      mat3 ry(float a){float s=sin(a),c=cos(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
      mat3 rz(float a){float s=sin(a),c=cos(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
      void main(){
        mat3 m=rx(.55+uPointer.y*.28)*ry(uTime*.261799+uPointer.x*.45)*rz(-.2+sin(uTime*.523599)*.13);
        vec3 p=m*aPosition; vNormal=normalize(m*aNormal); vPosition=p; vUV=aUV;
        float z=p.z-7.4;
        gl_Position=vec4(p.x*2.0/uAspect,p.y*2.0,-1.0202*z-.20202,-z);
      }`;
    const fragment = `
      precision mediump float;
      varying vec3 vNormal; varying vec3 vPosition; varying vec2 vUV;
      uniform vec3 uColor; uniform float uTime;
      void main(){
        vec3 n=normalize(vNormal); vec3 view=normalize(vec3(0.,0.,7.4)-vPosition);
        vec3 light=normalize(vec3(-.6,1.15,1.2));
        float diffuse=max(dot(n,light),0.);
        float rim=pow(1.-max(dot(n,view),0.),2.4);
        float spec=pow(max(dot(n,normalize(light+view)),0.),54.);
        float spec2=pow(max(dot(n,normalize(vec3(.8,-.35,.75)+view)),0.),100.);
        float bands=.93+.07*cos(vUV.x*6.283185*76.);
        vec3 color=uColor*(.18+.79*diffuse)*bands;
        color+=vec3(.91,1.,.8)*spec*.95+vec3(.72,.94,.91)*spec2*.5;
        color+=mix(uColor,vec3(.77,1.,.86),.5)*rim*.42;
        color+=uColor*.06*max(n.y,0.);
        gl_FragColor=vec4(color,1.);
      }`;
    function shader(type, code) {
      const s=gl.createShader(type); gl.shaderSource(s,code);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));return s;
    }
    let program;
    try {
      program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    } catch(error) { console.warn('Sculpture fallback:',error.message);const replacement=canvas.cloneNode();canvas.replaceWith(replacement);return sculpture2d(replacement); }
    gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
    const uniform = name => gl.getUniformLocation(program,name);
    const uTime=uniform('uTime'),uAspect=uniform('uAspect'),uPointer=uniform('uPointer'),uColor=uniform('uColor');
    const vertexBuffer=gl.createBuffer(),normalBuffer=gl.createBuffer(),uvBuffer=gl.createBuffer(),indexBuffer=gl.createBuffer();
    let count=0, width=1,height=1,visible=true;
    let pointer=[0,0],smooth=[0,0];
    const norm=v=>{const l=Math.hypot(...v)||1;return v.map(n=>n/l);};
    const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    function center(t,type) {
      if(type===1) { const r=1.8+.35*Math.cos(5*t);return [r*Math.cos(t),r*Math.sin(t),.57*Math.sin(5*t)]; }
      if(type===2) { const r=1.55+.49*Math.cos(3*t);return [r*Math.cos(t),r*Math.sin(t),.62*Math.sin(3*t)]; }
      const r=1.62+.59*Math.cos(3*t);return [r*Math.cos(2*t),r*Math.sin(2*t),.83*Math.sin(3*t)];
    }
    function geometry(type) {
      const positions=[],normals=[],uvs=[],indices=[];const steps=272,sides=32;
      for(let i=0;i<=steps;i++) {
        const t=i/steps*Math.PI*2,c=center(t,type),p=center(t+.001,type),m=center(t-.001,type),tangent=norm(p.map((x,j)=>x-m[j]));
        const N=norm(cross(tangent,[0,0,1])),B=norm(cross(tangent,N));
        const radius=type===0?.32:type===1?.31:.42;
        for(let j=0;j<=sides;j++) {
          const v=j/sides*Math.PI*2,n=N.map((x,k)=>x*Math.cos(v)+B[k]*Math.sin(v));
          positions.push(...c.map((x,k)=>x+n[k]*radius));normals.push(...n);uvs.push(i/steps,j/sides);
          if(i<steps&&j<sides){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,a+1,b,b+1);}
        }
      }
      function bind(buffer,name,size,values){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,0,0);}
      bind(vertexBuffer,'aPosition',3,positions);bind(normalBuffer,'aNormal',3,normals);bind(uvBuffer,'aUV',2,uvs);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);count=indices.length;
    }
    geometry(0);
    const resize=()=>{const dpr=Math.min(devicePixelRatio||1,2);width=Math.max(1,canvas.clientWidth);height=Math.max(1,canvas.clientHeight);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);};
    new ResizeObserver(()=>{resize();requestAnimationFrame(drawOnce);}).observe(canvas);resize();
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'80px'}).observe(canvas);
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer=[(e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1];});
    canvas.addEventListener('pointerleave',()=>{pointer=[0,0];});
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.body.classList.add('no-webgl');});
    $('#remix').addEventListener('click',()=>{form=(form+1)%3;$('#form-number').textContent=String(form+1).padStart(3,'0');geometry(form);drawOnce();});
    return {renderer:'webgl',draw(t,force=false){if(!visible&&!force)return;smooth=smooth.map((x,i)=>x+(pointer[i]-x)*.05);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniform1f(uTime,t);gl.uniform1f(uAspect,width/height);gl.uniform2f(uPointer,...smooth);gl.uniform3f(uColor,...colors[palette]);gl.drawElements(gl.TRIANGLES,count,gl.UNSIGNED_SHORT,0);}};
  }
  const hero = sculpture($('#hero-canvas'));

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
  function lock(){overlay=!!$('dialog[open]');document.body.style.overflow=overlay?'hidden':'';}
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
  window.portfolioState=()=>({version:2,paused,form,palette,webgl:hero?.renderer==='webgl',renderer:hero?.renderer||'css',clock});
})();
