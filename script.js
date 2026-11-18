


(function(){
 const root=document.querySelector('.mdi-widget');
 const track=root.querySelector('.mdi-carousel'),cards=[...root.querySelectorAll('.mdi-card')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let carouselVisible=true;
 let position=0,target=0,paused=reduced.matches,hover=false,focused=false,dragging=false,startX=0,startY=0,startPosition=0,moved=false,axis='',pointer=null,downCard=null,last=performance.now(),autoAt=last+2000,frame;
 let introStart=null,introDone=reduced.matches, introObserver;
 const ease=v=>1-Math.pow(1-Math.max(0,Math.min(1,v)),3);
 function finishIntro(){introDone=true;introObserver?.disconnect();autoAt=performance.now()+2000;}
 const count=cards.length,mod=(v,n)=>((v%n)+n)%n;
 function cardSpacing(){return track.clientWidth<700?163:Math.max(205,track.clientWidth/5.25);}
 function draw(){
  const narrow=track.clientWidth<700,spacing=cardSpacing();
  const elapsed=introStart===null?0:performance.now()-introStart;
  const rise=introDone?1:ease(elapsed/750);
  const spread=introDone?1:ease((elapsed-650)/1100);
  cards.forEach((card,i)=>{
   const d=mod(i-position+count/2,count)-count/2,a=Math.abs(d),active=i===mod(Math.round(position),count);
   const opacity=active?1:a>2.5?Math.max(0,(3-a)*.24):Math.max(.12,.35-(a-1)*.23);
   card.style.transform=`translate3d(${d*spacing*spread}px,${a*(narrow?32:track.clientWidth*.045)*spread+(1-rise)*180}px,0) rotate(${d*12*spread}deg) scale(${(1-Math.min(a,3)*.025)*(.94+.06*rise)})`;
   card.classList.toggle('is-active',active);
   card.style.opacity=opacity*(active?rise:spread);
   card.style.zIndex=String(10-Math.round(a*2));
   card.style.pointerEvents=a>2.65||!introDone?'none':'auto';
  });
  if(!introDone&&introStart!==null&&elapsed>=1750)finishIntro();
 }

 function step(dir){finishIntro();target=Math.round(target)+dir;autoAt=performance.now()+2000;if(reduced.matches){position=target;draw();}}
 function tick(now){if(!carouselVisible||document.hidden){frame=null;return;}let dt=Math.min(now-last,50);last=now;if(!dragging){if(introDone&&!paused&&!hover&&!focused&&!document.hidden&&now>=autoAt){target=Math.round(target)+1;autoAt=now+2000;}position+=(target-position)*(1-Math.exp(-dt/100));if(Math.abs(target-position)<.001)position=target;}draw();frame=requestAnimationFrame(tick);}
 track.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;finishIntro();dragging=true;moved=false;axis='';pointer=e.pointerId;startX=e.clientX;startY=e.clientY;startPosition=position;downCard=e.target.closest('a');track.classList.add('is-dragging');});
 track.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==pointer)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(!axis&&Math.max(Math.abs(dx),Math.abs(dy))>7)axis=Math.abs(dx)>Math.abs(dy)?'x':'y';if(axis!=='x')return;if(!moved){moved=true;track.setPointerCapture(pointer);}position=startPosition-dx/cardSpacing();target=position;});
 function finish(e){if(!dragging||e.pointerId!==pointer)return;dragging=false;target=Math.round(position);track.classList.remove('is-dragging');autoAt=performance.now()+2000;if(track.hasPointerCapture(pointer))track.releasePointerCapture(pointer);pointer=null;}
 track.addEventListener('pointerup',finish);track.addEventListener('pointercancel',finish);window.addEventListener('pointerup',finish);
 track.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);track.addEventListener('dragstart',e=>e.preventDefault());
 root.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hover=true;});root.addEventListener('pointerleave',()=>{hover=false;autoAt=performance.now()+2000;});
 root.addEventListener('focusin',()=>{focused=true;finishIntro();});root.addEventListener('focusout',()=>setTimeout(()=>{focused=root.contains(document.activeElement);autoAt=performance.now()+2000;},0));
 track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}});
 reduced.addEventListener('change',()=>{paused=reduced.matches;if(reduced.matches)finishIntro();});document.addEventListener('visibilitychange',()=>{autoAt=performance.now()+2000;last=performance.now();if(!document.hidden&&carouselVisible&&!frame)frame=requestAnimationFrame(tick);});
 if(!introDone&&'IntersectionObserver' in window){
  introObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){introObserver.disconnect();if(window.mdiLoading)window.addEventListener('mdi-loaded',()=>{introStart=performance.now();},{once:true});else introStart=performance.now();}},{threshold:.1});
  introObserver.observe(track);
 }else finishIntro();
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
  carouselVisible=entries[0].isIntersecting;
  if(carouselVisible&&!frame){last=performance.now();autoAt=last+2000;frame=requestAnimationFrame(tick);}
 },{threshold:0}).observe(track);
 draw();frame=requestAnimationFrame(tick);
})();

(function(){
 const section=document.querySelector('.mdi-about');
 if(!section)return;
 const path=section.querySelector('.mdi-about-trace');
 const photos=[...section.querySelectorAll('.mdi-about-photo')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches||!('IntersectionObserver' in window))return;
 const length=path.getTotalLength();
 path.style.strokeDasharray=String(length);
 path.style.strokeDashoffset=String(length);
 section.classList.add('about-motion');
 // Trigger each image when the moving line reaches its horizontal position.
 const thresholds=[240,610,990].map(x=>{
  for(let i=0;i<=1000;i++)if(path.getPointAtLength(length*i/1000).x>=x)return i/1000;
  return 1;
 });
 let frame=0,started=false;
 const mobile=matchMedia('(max-width:760px)');
 const art=section.querySelector('.mdi-about-art');
 function paint(progress){path.style.strokeDashoffset=String(length*(1-progress));photos.forEach((photo,i)=>photo.classList.toggle('is-visible',progress>=thresholds[i]));}
 function finish(){cancelAnimationFrame(frame);frame=0;paint(1);}
 function scrollPaint(){frame=0;if(!mobile.matches||reduced.matches)return;
  const rect=art.getBoundingClientRect();
  paint(Math.max(0,Math.min(1,(innerHeight*.88-rect.top)/Math.max(1,rect.height+innerHeight*.12))));
 }
 const observer=new IntersectionObserver(entries=>{
  if(!entries.some(entry=>entry.isIntersecting)||started||mobile.matches)return;
  started=true;const start=performance.now();
  function animate(now){const progress=Math.min(1,(now-start)/2000);paint(progress);if(progress<1)frame=requestAnimationFrame(animate);else frame=0;}
  frame=requestAnimationFrame(animate);
 },{threshold:0,rootMargin:'0px 0px -60px 0px'});
 observer.observe(section);
 addEventListener('scroll',()=>{if(mobile.matches&&!frame)frame=requestAnimationFrame(scrollPaint);},{passive:true});
 mobile.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;if(mobile.matches)scrollPaint();else finish();});
 reduced.addEventListener('change',()=>{if(reduced.matches){observer.disconnect();finish();}});
 if(mobile.matches)scrollPaint();

})();

(function(){
 const toggle=document.querySelector('.mdi-menu-toggle');
 const menu=document.querySelector('#mdi-mobile-menu');
 const header=document.querySelector('.mdi-header');
 const mobile=matchMedia('(max-width:760px)');
 function setOpen(open){
  menu.hidden=!open;
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
 }
 toggle.addEventListener('click',()=>setOpen(menu.hidden));
 menu.addEventListener('click',event=>{if(event.target.closest('a'))setOpen(false);});
 document.addEventListener('click',event=>{if(!header.contains(event.target))setOpen(false);});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){setOpen(false);toggle.focus();}});
 header.addEventListener('focusout',()=>setTimeout(()=>{if(!header.contains(document.activeElement))setOpen(false);},0));
 mobile.addEventListener('change',()=>setOpen(false));
})();

(function(){
 const section=document.querySelector('.mdi-comparison');
 const sticky=section.querySelector('.mdi-compare-sticky');
 const viewport=section.querySelector('.mdi-compare-viewport');
 const track=section.querySelector('.mdi-compare-track');
 const cards=[...section.querySelectorAll('.mdi-compare-card')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let travel=0,pinned=false,frame=0,measuredWidth=0,stableHeight=innerHeight;
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 function paint(){frame=0;if(!pinned)return;const offset=clamp(-section.getBoundingClientRect().top,0,travel);track.style.transform=`translate3d(${-offset}px,0,0)`;}
 function measure(){
  measuredWidth=innerWidth;stableHeight=innerHeight;section.style.setProperty('--compare-height',`${stableHeight}px`);
  pinned=!reduced.matches&&innerHeight>600;
  section.classList.toggle('is-scroll-pinned',pinned);
  travel=Math.max(0,track.scrollWidth-viewport.clientWidth);
  pinned=pinned&&travel>0&&cards.every(card=>card.scrollHeight<=card.clientHeight+2);
  section.classList.toggle('is-scroll-pinned',pinned);
  section.style.height=pinned?`${sticky.offsetHeight+travel+Math.min(180,innerHeight*.18)}px`:'';
  if(!pinned)track.style.transform='';else{viewport.scrollLeft=0;paint();}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',()=>{if(innerWidth>760||innerWidth!==measuredWidth)measure();});reduced.addEventListener('change',measure);
 track.addEventListener('keydown',event=>{
  if(!pinned||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const current=clamp(-section.getBoundingClientRect().top,0,travel);
  const step=cards[1].offsetLeft-cards[0].offsetLeft;
  const next=event.key==='Home'?0:event.key==='End'?travel:clamp(current+(event.key==='ArrowRight'?step:-step),0,travel);
  window.scrollTo({top:scrollY+section.getBoundingClientRect().top+next,behavior:'smooth'});
 });
 track.addEventListener('focusin',event=>{
  if(!pinned)return;
  const card=event.target.closest('.mdi-compare-card');if(!card)return;
  const offset=clamp(card.offsetLeft-cards[0].offsetLeft,0,travel);
  viewport.scrollLeft=0;
  window.scrollTo({top:scrollY+section.getBoundingClientRect().top+offset,behavior:'instant'});
 });
 measure();
 if(document.fonts)document.fonts.ready.then(measure);
})();

(function(){
 const section=document.querySelector('.mdi-workflow');
 const stage=section.querySelector('.mdi-workflow-stage');
 const svg=section.querySelector('svg');
 const base=section.querySelector('.mdi-workflow-base');
 const blue=section.querySelector('.mdi-workflow-blue');
 const steps=[...section.querySelectorAll('.mdi-workflow-step')];
 const mobile=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const desktopD=base.getAttribute('d');
 const mobileD='M -35 150 C 5 155 28 175 65 200 C 135 245 325 270 315 380 C 305 485 90 475 90 580 C 90 685 280 690 285 800 C 290 875 350 900 430 925';
 let length=0,thresholds=[],frame=0,samples=[],layoutWidth=0,headingSpace=0;
 function update(){
  frame=0;
  const rect=stage.getBoundingClientRect();
  let progress=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight*.7-rect.top)/Math.max(1,rect.height-innerHeight*.35)));
  if(mobile.matches&&!reduced.matches){
   const y=(innerHeight*.78-rect.top-headingSpace)/(rect.height-headingSpace)*1000;
   const index=samples.findIndex(p=>p.y>=y);
   if(y<=samples[0].y)progress=0;
   else if(index<0)progress=1;
   else{const prev=samples[index-1],next=samples[index];progress=(index-1+(y-prev.y)/Math.max(.001,next.y-prev.y))/(samples.length-1);}
  }
  blue.style.strokeDashoffset=String(length*(1-progress));
  steps.forEach((step,i)=>step.classList.toggle('is-visible',progress>=thresholds[i]));
 }
 function layout(){
  layoutWidth=innerWidth;
  const small=mobile.matches,w=small?400:1140,h=small?1000:1080;
  headingSpace=small?section.querySelector('h2').offsetHeight+60:0;
  stage.style.setProperty('--workflow-heading-space',`${headingSpace}px`);
  const targets=small?[[65,200],[315,380],[90,580],[285,800]]:[[325,205],[595,465],[630,750],[850,925]];
  svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  // Match the coordinate system to the section even on short desktop layouts.
  svg.setAttribute('preserveAspectRatio','none');
  [base,blue].forEach(path=>path.setAttribute('d',small?mobileD:desktopD));
  length=blue.getTotalLength();blue.style.strokeDasharray=String(length);
  samples=Array.from({length:401},(_,i)=>blue.getPointAtLength(length*i/400));
  thresholds=targets.map(([x,y],index)=>{
   let nearest=0,distance=Infinity,point=null;
   for(let i=0;i<=1600;i++){const p=blue.getPointAtLength(length*i/1600),d=(p.x-x)**2+(p.y-y)**2;if(d<distance){distance=d;nearest=i/1600;point=p;}}
   steps[index].style.left=`${point.x/w*100}%`;steps[index].style.top=small?`${headingSpace+point.y/h*(stage.offsetHeight-headingSpace)}px`:`${point.y/h*100}%`;
   return nearest;
  });
  section.classList.toggle('has-scroll-motion',!reduced.matches);update();
 }
 addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update);},{passive:true});
 addEventListener('resize',()=>{if(innerWidth!==layoutWidth)layout();else if(!frame)frame=requestAnimationFrame(update);});mobile.addEventListener('change',layout);reduced.addEventListener('change',layout);
 layout();
})();

(function(){
 const section=document.querySelector('.mdi-pricing');
 if(!section||!('IntersectionObserver' in window))return;
 const cards=[...section.querySelectorAll('.mdi-price-card')];
 const grid=section.querySelector('.mdi-pricing-grid');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width:760px)');
 if(reduced.matches)return;
 function setDelays(){cards.forEach((card,i)=>card.style.setProperty('--pricing-reveal-delay',mobile.matches?'0ms':`${i*200}ms`));}
 setDelays();
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   if(entry.target===grid)cards.forEach(card=>card.classList.add('pricing-revealed'));
   else entry.target.classList.add('pricing-revealed');
   observer.unobserve(entry.target);
  });
 },{threshold:0,rootMargin:'0px 0px -70px 0px'});
 cards.forEach(card=>card.classList.add('pricing-reveal-ready'));
 function observeLayout(){observer.disconnect();setDelays();if(mobile.matches){cards.filter(card=>!card.classList.contains('pricing-revealed')).forEach(card=>observer.observe(card));}else if(cards.some(card=>!card.classList.contains('pricing-revealed')))observer.observe(grid);}
 observeLayout();
 mobile.addEventListener('change',observeLayout);
 function revealAll(){observer.disconnect();cards.forEach(card=>{card.style.setProperty('--pricing-reveal-delay','0ms');card.classList.add('pricing-revealed');});}
 reduced.addEventListener('change',()=>{if(reduced.matches)revealAll();});
 section.addEventListener('focusin',revealAll);
})();

// Smooth FAQ accordion, including interrupted/reversed clicks.
(function(){
 const section=document.querySelector('.mdi-faq');
 if(!section)return;
 const items=[...section.querySelectorAll('.mdi-faq-item')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const states=new Map(items.map(item=>[item,{open:item.open,animation:null}]));
 function expand(item,open){
  const state=states.get(item),summary=item.querySelector('summary'),answer=item.querySelector('.mdi-faq-answer');
  const start=item.getBoundingClientRect().height;
  if(state.animation){state.animation.onfinish=null;state.animation.cancel();state.animation=null;}
  state.open=open;
  item.classList.toggle('faq-expanded',open);
  summary.setAttribute('aria-expanded',String(open));
  if(reduced.matches||!item.animate){item.open=open;return;}
  item.open=true;
  const style=getComputedStyle(item);
  const border=parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
  const end=summary.getBoundingClientRect().height+(open?answer.getBoundingClientRect().height:0)+border;
  const animation=item.animate([{height:`${start}px`},{height:`${end}px`}],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'});
  state.animation=animation;
  animation.onfinish=()=>{if(state.animation!==animation)return;item.open=state.open;state.animation=null;};
 }
 items.forEach(item=>{
  item.removeAttribute('name');
  item.classList.toggle('faq-expanded',item.open);
  const summary=item.querySelector('summary');
  summary.setAttribute('aria-expanded',String(item.open));
  summary.addEventListener('click',event=>{
   event.preventDefault();
   const open=!states.get(item).open;
   if(open)items.forEach(other=>{if(other!==item&&states.get(other).open)expand(other,false);});
   expand(item,open);
  });
 });
 let observer;
 function revealAll(){if(observer)observer.disconnect();section.querySelectorAll('.faq-enter').forEach(el=>{el.style.transitionDelay='0ms';el.classList.add('faq-entered');});}
 if(!reduced.matches&&'IntersectionObserver' in window){
  observer=new IntersectionObserver(entries=>{
   const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
   visible.forEach((entry,i)=>{entry.target.style.transitionDelay=`${i*100}ms`;entry.target.classList.add('faq-entered');observer.unobserve(entry.target);});
  },{threshold:0,rootMargin:'0px 0px -35px 0px'});
  [section.querySelector('h2'),...items].forEach(el=>{el.classList.add('faq-enter');observer.observe(el);});
 }
 section.addEventListener('focusin',revealAll);
 reduced.addEventListener('change',()=>{if(reduced.matches){revealAll();items.forEach(item=>expand(item,states.get(item).open));}});
})();

(() => {
 const band = document.querySelector('.mdi-signup-band');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 if (!band || reduced.matches || !('IntersectionObserver' in window)) return;
 const reveal = () => {
  band.classList.remove('signup-pending');
  band.classList.add('signup-visible');
  observer.disconnect();
 };
 const observer = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) reveal();
 }, {threshold: .12});
 band.classList.add('signup-pending');
 observer.observe(band);
 band.addEventListener('focusin', reveal, {once: true});
 reduced.addEventListener('change', () => {if (reduced.matches) reveal();});
})();

(() => {
 const root=document.querySelector('.mdi-widget');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(!root||reduced.matches||!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{
  if(entries.some(e=>e.isIntersecting)){observer.disconnect();if(window.mdiLoading)window.addEventListener('mdi-loaded',()=>root.classList.add('hero-entered'),{once:true});else root.classList.add('hero-entered');}
 },{threshold:0});
 root.classList.add('hero-motion');
 observer.observe(root);
 const reveal=()=>{root.classList.remove('hero-motion');observer.disconnect();};
 root.addEventListener('focusin',reveal,{once:true});
 reduced.addEventListener('change',()=>{if(reduced.matches)reveal();});
})();

(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 if (reduced.matches || !('IntersectionObserver' in window)) return;
 // Photos on the About path, workflow steps, pricing cards, FAQ, and signup
 // already fade in with their own coordinated sequences. Reveal remaining content.
 const selectors = [
  '.mdi-about-label', '.mdi-about h2', '.mdi-about-description',
  '.mdi-compare-heading > *', '.mdi-compare-card-top',
  '.mdi-compare-card > p', '.mdi-compare-image', '.mdi-compare-hint',
  '.mdi-workflow h2', '.mdi-workflow-ribbon',
  '.mdi-pricing-heading > *',
  '.mdi-footer-brand', '.mdi-footer-column', '.mdi-footer-legal', '.mdi-footer-ribbons'
 ];
 const elements = [...document.querySelectorAll(selectors.join(','))];
 const observer = new IntersectionObserver(entries => {
  entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
   entry.target.style.transitionDelay = `${Math.min(index, 3) * 90}ms`;
   entry.target.classList.add('section-fade-visible');
   observer.unobserve(entry.target);
  });
 }, {threshold: .08});
 elements.forEach(element => {
  element.classList.add('section-fade-ready');
  observer.observe(element);
 });
 document.addEventListener('focusin', event => {
  elements.filter(element => element.contains(event.target)).forEach(element => {
   element.style.transitionDelay = '0ms';
   element.classList.add('section-fade-visible');
   observer.unobserve(element);
  });
 });
 reduced.addEventListener('change', () => {
  if (!reduced.matches) return;
  observer.disconnect();
  elements.forEach(element => {
   element.style.transitionDelay = '0ms';
   element.classList.add('section-fade-visible');
  });
 });
})();

(() => {
 const stage = document.querySelector('.mdi-percy-stage');
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 if (!stage || reduced.matches || !('IntersectionObserver' in window)) return;
 const reveal = () => {
  stage.classList.add('percy-slide-visible');
  observer.disconnect();
 };
 const observer = new IntersectionObserver(entries => {
  if (entries.some(entry => entry.isIntersecting)) reveal();
 }, {threshold: .15});
 stage.classList.add('percy-slide-ready');
 observer.observe(stage);
 reduced.addEventListener('change', () => {if (reduced.matches) reveal();});
})();
