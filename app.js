/* Elliana Hau / Kinetic portfolio. No libraries, tracking, or credentials. */
(() => {
'use strict';
const root=document.documentElement;
root.classList.add('js');
const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerFine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if(pointerFine) root.classList.add('has-pointer');
let saved=null;
try{saved=localStorage.getItem('elliana-motion')}catch(e){}
let paused=prefersReduced.matches||saved==='off';
const motionButton=document.getElementById('motion-toggle');
function setMotion(next,save=true){
  paused=next;root.classList.toggle('motion-off',paused);
  motionButton.setAttribute('aria-pressed',String(paused));
  motionButton.querySelector('.motion-label').textContent=paused?'Resume motion':'Pause motion';
  motionButton.querySelector('.motion-icon').textContent=paused?'▶':'Ⅱ';
  if(save)try{localStorage.setItem('elliana-motion',paused?'off':'on')}catch(e){}
  if(paused)document.querySelectorAll('.reveal').forEach(el=>el.classList.add('shown'));
}
setMotion(paused,false);
motionButton.addEventListener('click',()=>setMotion(!paused));
prefersReduced.addEventListener('change',event=>setMotion(event.matches,false));
document.getElementById('year').textContent=new Date().getFullYear();
document.querySelectorAll('.rhythm-object i').forEach((el,i)=>el.style.setProperty('--i',i));
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
 if(entry.isIntersecting){entry.target.classList.add('shown');revealObserver.unobserve(entry.target)}
}),{threshold:.075,rootMargin:'0px 0px -15px 0px'});
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));
const progress=document.querySelector('.reading-progress');
let scrollQueued=false;
function updateScroll(){const range=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${range>0?scrollY/range:0})`;scrollQueued=false}
window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll)}},{passive:true});
updateScroll();
const cursor=document.querySelector('.cursor-label');
if(pointerFine){
 document.addEventListener('pointermove',e=>{cursor.style.transform=`translate(${e.clientX+16}px,${e.clientY+16}px)`},{passive:true});
 document.querySelectorAll('.project-visual').forEach(el=>{el.addEventListener('pointerenter',()=>cursor.classList.add('active'));el.addEventListener('pointerleave',()=>cursor.classList.remove('active'))});
}
document.querySelectorAll('[data-experiment]').forEach(button=>{
 let hue=0;button.addEventListener('click',()=>{hue=(hue+65)%360;button.style.setProperty('--hue',`${hue}deg`)});
});
const PROJECTS={
 fresh:{number:'01',name:'Fresh Fizz',title:'Fresh by nature.<br>Bold by design.',description:'An organic soda identity built around a hand-designed typeface, expressive color, and playful packaging. The aim was to make the all-natural ingredients feel as distinctive as the flavors, with a visual language full of warmth and character.',tags:['Brand identity','Custom typography','Packaging'],credit:'Design by Elliana Hau, created during an internship with ACB Studio.',source:'https://www.ellianahau.com/fresh-fizz-sodas/',images:['fresh-08','fresh-02','fresh-03','fresh-04','fresh-01','fresh-09','fresh-05','fresh-06'],alts:['Fresh Fizz soda packaging in an overhead arrangement.','Fresh Fizz can held against a blue sky with bubbles.','Fresh Fizz refer-a-friend social campaign.','Friends holding Fresh Fizz cans together.','Fresh Fizz flavor packaging and award graphics.','Fresh Fizz soda can held up in sunlight.','Fresh Fizz editorial and digital brand communications.','Fresh Fizz branded shipping carton with soda cans.'],next:'acb'},
 acb:{number:'02',name:'ACB Studio',title:'Different identities.<br>One moving story.',description:'I animated ACB Studio’s brand identities in After Effects, using rhythm, transitions, and pacing to connect distinct visual worlds. The reel brings the studio’s work together without losing what makes each identity its own.',tags:['Animation','After Effects','Transitions'],credit:'Animation by Elliana Hau. Featured brand identities by ACB Studio.',source:'https://www.ellianahau.com/acbreel/',images:['acb-01'],alts:['A frame from the ACB Studio motion reel.'],video:true,next:'independent'},
 independent:{number:'03',name:'Independent voices',title:'Their world.<br>A visual voice.',description:'Album covers, logos, flyers, and merchandise for independent clients. Each project begins with the individual behind it, translating a distinct personality into expressive typography, imagery, and a visual world that feels unmistakably theirs.',tags:['Cover artwork','Logos & flyers','Merchandise'],credit:'Selected freelance design by Elliana Hau. All client marks and artwork belong to their respective owners.',source:'https://www.ellianahau.com/freelance/',images:['independent-01','independent-02','independent-03','independent-04','independent-05','independent-06','independent-07'],alts:['Orange and yellow Based Negative Squad graphic designs.','Independent music performance poster.','Morse Code music cover artwork in red and black.','Independent performance poster with custom typography.','Black Acid Souljah merchandise T-shirt design.','Bapeman single artwork with illustrated character and typography.','White graphic merchandise T-shirt design.'],next:'acuity'},
 acuity:{number:'04',name:'Acuity Brands',title:'Many formats.<br>One clear voice.',description:'Marketing design support across social content, sell sheets, brochures, page layouts, and promotional video. Working with designers and project managers, I helped translate product information into clear, consistent print and digital communications.',tags:['Marketing design','Editorial layout','Print & digital'],credit:'Marketing design contributions by Elliana Hau, in collaboration with the Acuity Brands team.',source:'https://www.ellianahau.com/acuitybrands/',images:['acuity-02','acuity-03','acuity-01'],alts:['Illuminated football stadium in sports lighting campaign artwork.','Acuity Brands trade show display and supporting marketing materials.','Lithonia Lighting M3 Sports Lighting digital campaign banner.'],next:'fresh'}
};
const projectDialog=document.getElementById('project-dialog');
const reelDialog=document.getElementById('reel-dialog');
const baseTitle=document.title;
function escapeHTML(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function updateDialogState(){document.body.classList.toggle('dialog-open',!!document.querySelector('dialog[open]'));cursor.classList.remove('active')}
function openProject(id){
 const p=PROJECTS[id];if(!p)return;
 const gallery=p.images.map((name,i)=>`<figure><img src="media/${name}.webp" alt="${escapeHTML(p.alts[i])}" loading="${i===0?'eager':'lazy'}" decoding="async"><figcaption>${String(i+1).padStart(2,'0')} / ${String(p.images.length).padStart(2,'0')}</figcaption></figure>`).join('');
 document.getElementById('project-content').innerHTML=`<div class="case-heading"><div><span class="mono section-kicker">${p.number} / ${escapeHTML(p.name.toUpperCase())}</span><h2 id="project-title">${p.title}</h2><div class="tags">${p.tags.map(tag=>`<span>${escapeHTML(tag)}</span>`).join('')}</div></div><p>${p.description}</p></div><div class="case-credit"><span>${p.credit}</span><a href="${p.source}" target="_blank" rel="noopener">Original project ↗</a></div>${p.video?'<div class="case-reel"><button class="button solid" data-reel>Watch the full reel <span>▶</span></button><p class="mono">ANIMATION: ELLIANA HAU / BRAND IDENTITIES: ACB STUDIO</p></div>':''}<div class="case-gallery">${gallery}</div><div class="case-footer"><button data-project="${p.next}">Next project: ${PROJECTS[p.next].name} ↗</button><a href="mailto:ellianahau@gmail.com">Let’s make something together ↗</a></div>`;
 document.querySelectorAll('.case-gallery img').forEach(img=>img.addEventListener('error',()=>{const figure=img.closest('figure');figure.classList.add('asset-failed');figure.innerHTML=`<a href="${p.source}" target="_blank" rel="noopener">View original artwork ↗</a>`},{once:true}));
 if(!projectDialog.open)projectDialog.showModal();
 projectDialog.scrollTop=0;
 projectDialog.querySelector('.dialog-close').focus({preventScroll:true});
 document.title=`${p.name} · Elliana Hau`;
 updateDialogState();
}
function openReel(){
 document.getElementById('video-container').innerHTML='<iframe title="ACB Studio reel animated by Elliana Hau" src="https://www.youtube-nocookie.com/embed/rPtnit3YFyg?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
 if(!reelDialog.open)reelDialog.showModal();updateDialogState();
}
document.addEventListener('click',event=>{
 const project=event.target.closest('[data-project]');if(project){event.preventDefault();openProject(project.dataset.project);return}
 if(event.target.closest('[data-reel]')){event.preventDefault();openReel();return}
 const close=event.target.closest('.dialog-close');if(close){close.closest('dialog').close();return}
 if(event.target.closest('.dialog-wordmark')){event.preventDefault();projectDialog.close()}
});
[projectDialog,reelDialog].forEach(dialog=>{
 dialog.addEventListener('close',()=>{if(dialog===reelDialog)document.getElementById('video-container').innerHTML='';if(dialog===projectDialog)document.title=baseTitle;updateDialogState()});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
});
/* Original procedural forms. Surface lighting is calculated on the CPU, not a video. */
const TAU=Math.PI*2;
const normalize=v=>{const m=Math.hypot(...v)||1;return v.map(x=>x/m)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function rotate(p,ax,ay,az){
 let [x,y,z]=p,c=Math.cos(ax),s=Math.sin(ax);[y,z]=[y*c-z*s,y*s+z*c];
 c=Math.cos(ay);s=Math.sin(ay);[x,z]=[x*c+z*s,-x*s+z*c];
 c=Math.cos(az);s=Math.sin(az);return [x*c-y*s,x*s+y*c,z];
}
const canvasStates=[...document.querySelectorAll('.kinetic-canvas')].map(canvas=>({canvas,ctx:canvas.getContext('2d',{alpha:true}),visible:false,w:0,h:0,px:0,py:0,tx:0,ty:0})).filter(s=>s.ctx);
const canvasObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{const state=canvasStates.find(s=>s.canvas===entry.target);if(state)state.visible=entry.isIntersecting}),{rootMargin:'100px'});
const resizeObserver=new ResizeObserver(entries=>entries.forEach(entry=>{
 const s=canvasStates.find(state=>state.canvas===entry.target);if(!s)return;
 s.w=entry.contentRect.width;s.h=entry.contentRect.height;
 const dpr=Math.min(devicePixelRatio||1,1.7);s.canvas.width=Math.round(s.w*dpr);s.canvas.height=Math.round(s.h*dpr);s.ctx.setTransform(dpr,0,0,dpr,0,0);s.dirty=true;
}));
canvasStates.forEach(state=>{canvasObserver.observe(state.canvas);resizeObserver.observe(state.canvas);state.canvas.addEventListener('pointermove',event=>{const r=state.canvas.getBoundingClientRect();state.tx=(event.clientX-r.left)/r.width-.5;state.ty=(event.clientY-r.top)/r.height-.5},{passive:true});state.canvas.addEventListener('pointerleave',()=>{state.tx=0;state.ty=0})});
function drawSculpture(s,time){
 const {ctx,w,h}=s;if(!w||!h)return;
 ctx.clearRect(0,0,w,h);
 const phase=time*TAU/24;
 s.px+=(s.tx-s.px)*.045;s.py+=(s.ty-s.py)*.045;
 const ax=.82+Math.sin(phase)*.15+s.py*.38,ay=-.18+Math.cos(phase)*.32+s.px*.45,az=-.6+phase;
 const columns=w<450?144:216,rows=32,vertices=[],normals=[],scale=Math.min(w,h)*.224;
 for(let i=0;i<=columns;i++){
  const u=i/columns*TAU;
  const radial=1.25+.22*Math.cos(u*3+phase);
  const center=[radial*Math.cos(u),radial*Math.sin(u),.38*Math.sin(u*3+phase)];
  const dr=-.66*Math.sin(u*3+phase),tangent=normalize([dr*Math.cos(u)-radial*Math.sin(u),dr*Math.sin(u)+radial*Math.cos(u),1.14*Math.cos(u*3+phase)]);
  let normal=normalize([Math.cos(u),Math.sin(u),0]);const correction=dot(normal,tangent);normal=normalize(normal.map((x,k)=>x-correction*tangent[k]));
  const binormal=normalize(cross(tangent,normal));
  const radius=.385+.045*Math.cos(u*48)+.045*Math.sin(u*4-phase);
  for(let j=0;j<=rows;j++){
   const v=j/rows*TAU,n=normal.map((value,k)=>value*Math.cos(v)+binormal[k]*Math.sin(v));
   const p=rotate(center.map((value,k)=>value+radius*n[k]),ax,ay,az),rn=rotate(n,ax,ay,az),perspective=6/(6-p[2]);
   vertices.push([w*.505+p[0]*scale*perspective,h*.46+p[1]*scale*perspective,p[2]]);normals.push(rn);
  }
 }
 const faces=[];const stride=rows+1;
 for(let i=0;i<columns;i++)for(let j=0;j<rows;j++){
  const a=i*stride+j,b=a+stride,c=b+1,d=a+1;
  const n=normalize(normals[a].map((v,k)=>v+normals[b][k]+normals[c][k]+normals[d][k]));
  faces.push({a,b,c,d,z:(vertices[a][2]+vertices[b][2]+vertices[c][2]+vertices[d][2])/4,n});
 }
 faces.sort((a,b)=>a.z-b.z);
 const light=normalize([-.55,-.65,1]),highlight=normalize([-.3,-.6,1]);
 for(const f of faces){
  const lighting=Math.max(0,dot(f.n,light)),spec=Math.pow(Math.max(0,dot(f.n,highlight)),24),depth=.82+.18*(f.z+1.8)/3.6;
  const rib=.90+.10*Math.sin(Math.floor(f.a/stride)/columns*TAU*48);
  const red=Math.min(255,(63+164*lighting+50*spec)*depth*rib),green=Math.min(255,(83+169*lighting+28*spec)*depth*rib),blue=Math.min(235,(9+55*lighting+146*spec)*depth*rib);
  const color=`rgb(${red|0},${green|0},${blue|0})`;ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=.65;
  ctx.beginPath();[f.a,f.b,f.c,f.d].forEach((index,k)=>{const p=vertices[index];if(!k)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1])});ctx.closePath();ctx.fill();ctx.stroke();
 }
}
function drawElastic(s,time){
 const {ctx,w,h}=s;if(!w||!h)return;ctx.clearRect(0,0,w,h);
 const phase=time*TAU/9,size=Math.min(w,h)*.32;
 ctx.save();ctx.translate(w*.5,h*.505);ctx.rotate(-.45+Math.sin(phase)*.16);
 for(let k=0;k<60;k++){
  const r=.25+k/60*.76;ctx.beginPath();
  for(let i=0;i<=120;i++){
   const a=i/120*TAU,fold=1+.17*Math.sin(a*3+phase+r*4),x=Math.cos(a)*size*r*fold,y=Math.sin(a)*size*r*(1+.25*Math.cos(phase+r*3))+.24*size*Math.sin(a*2+phase)*r;
   if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.strokeStyle=`rgba(4,39,27,${.42+(k/60)*.5})`;ctx.lineWidth=1.55;ctx.stroke();
 }
 ctx.restore();
}
let clock=0,last=0,painted=0,first=true;
function animate(now){
 const delta=last?Math.min((now-last)/1000,.06):0;last=now;
 const allowed=!paused&&!document.hidden&&!document.body.classList.contains('dialog-open');
 if(allowed)clock+=delta;
 if(first||now-painted>33){
  for(const state of canvasStates){if((first||state.visible||state.dirty)&&(allowed||state.dirty||first)){
   (state.canvas.dataset.shape==='sculpture'?drawSculpture:drawElastic)(state,clock);state.dirty=false;
  }}
  painted=now;first=false;
 }
 requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
})();
