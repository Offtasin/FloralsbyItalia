(function(){
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav, menu, action bar ---------- */
  var nav=$('#nav'),bar=$('#actionbar'),form=$('#orderForm');
  var menuBtn=$('#menuBtn'),menu=$('#menu');
  if(menuBtn) menuBtn.addEventListener('click',function(){var o=menu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(o))});
  function onScroll(){
    if(nav) nav.classList.toggle('scrolled',scrollY>8);
    if(bar){
      var hide=false;
      if(form){var r=form.getBoundingClientRect();hide=r.top<innerHeight*.8&&r.bottom>innerHeight*.2}
      bar.classList.toggle('show',scrollY>innerHeight*.5&&!hide);
    }
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  $$('[data-year]').forEach(function(e){e.textContent=new Date().getFullYear()});

  /* ---------- "Ask for this look" carries the bouquet name to the order page ---------- */
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-look]');if(!a) return;
    try{localStorage.setItem('fbi-look',a.dataset.look)}catch(err){}
  });

  /* ---------- order form ---------- */
  if(form){
    var notes=$('#notes'),look=null;
    try{look=new URLSearchParams(location.search).get('look')}catch(err){}
    if(!look){try{look=localStorage.getItem('fbi-look')}catch(err){}}
    if(look){notes.value='I love the "'+look+'" bouquet from your site.';try{localStorage.removeItem('fbi-look')}catch(err){}}
    var date=$('#date'),t=new Date();t.setDate(t.getDate()+2);date.min=t.toISOString().slice(0,10);
    var customToggle=$('#customToggle'),customWrap=$('#customWrap');
    customToggle.addEventListener('change',function(){customWrap.classList.toggle('show',customToggle.checked);if(customToggle.checked)$('#custom').focus()});
    var err=$('#err'),done=$('#done'),sum=$('#summary');
    var val=function(n){var e=form.elements[n];return e&&e.value?e.value.trim():''};
    var copy=function(text){
      function fallback(){var a=document.createElement('textarea');a.value=text;a.setAttribute('readonly','');a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()}
      try{if(navigator.clipboard){navigator.clipboard.writeText(text).catch(fallback);return}}catch(e){}
      fallback();
    };
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var missing=[];
      if(!val('name'))missing.push('your name');
      if(val('phone').replace(/\D/g,'').length<10)missing.push('a 10-digit phone number');
      if(!val('date'))missing.push('the date you need it');
      if(missing.length){err.textContent='Add '+missing.join(', ')+' so we can quote your bouquet.';err.hidden=false;return}
      err.hidden=true;
      var flowers=$$('[name=flowers]:checked',form).map(function(i){return i.value}).join(', ');
      var size=($('[name=size]:checked',form)||{}).value||'Not sure yet';
      var d=new Date(val('date')+'T12:00:00');
      var lines=[
        "Hi Italia! I'd like a custom bouquet.",
        'Name: '+val('name'),
        'Phone: '+val('phone'),
        val('insta')?'Instagram: '+val('insta'):'',
        'Date: '+d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}),
        'Occasion: '+val('occasion'),
        'Size: '+size,
        'Budget: '+val('budget'),
        flowers?'Flowers: '+flowers:'',
        val('custom')?'My custom bouquet: '+val('custom'):'',
        val('colors')?'Colors: '+val('colors'):'',
        val('ribbon')?'Ribbon: '+val('ribbon'):'',
        'Pickup or delivery: '+val('get'),
        val('notes')?'Notes: '+val('notes'):''
      ].filter(Boolean).join('\n');
      sum.textContent=lines;copy(lines);
      $('#smsBtn').href='sms:+13238420960?&body='+encodeURIComponent(lines);
      done.hidden=false;
      done.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'});
    });
    $('#copyAgain').addEventListener('click',function(){copy(sum.textContent);this.textContent='Copied'});
  }

  /* ---------- motion: the page is complete without it ---------- */
  if(reduce||!window.gsap||!window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  var mobile=matchMedia('(max-width:860px)').matches;

  // Home hero: the wrap paper unfolds, the bouquet fills the head, the ribbon ties across.
  if($('.hero')){
    var tl=gsap.timeline({defaults:{ease:'power4.out'}});
    tl.from('.bq .layer',{scale:.4,rotation:-50,svgOrigin:'200 205',opacity:0,duration:1.3,stagger:.12},0)
      .from('.bq .cone,.bq .fold',{scaleY:0,svgOrigin:'200 290',duration:1,ease:'power3.out'},.15)
      .from('.bq .head',{scale:.3,opacity:0,duration:1.2,ease:'back.out(1.4)'},.4)
      .from('.bq .flap',{scale:0,svgOrigin:'200 300',opacity:0,duration:.8,stagger:.1,ease:'back.out(1.6)'},.85)
      .from('.bq .bow',{scale:0,rotation:-30,svgOrigin:'200 333',duration:.8,ease:'back.out(2)'},1.1)
      .from('.hero .hl__in',{yPercent:110,duration:1.15,stagger:.1},.3)
      .from('[data-intro]',{y:18,autoAlpha:0,duration:.9,stagger:.08},.6)
      .from('.bq .sticker',{scale:0,rotation:-90,duration:.8,ease:'back.out(1.7)'},1.3);
    gsap.to('.bq',{rotation:2,y:-6,duration:4,yoyo:true,repeat:-1,ease:'sine.inOut',delay:2.4});
    gsap.to('.bq',{yPercent:-6,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  }

  // Inner page headers rise in.
  if($('.page-head')){
    gsap.from('.page-head > .wrap > *',{y:30,autoAlpha:0,duration:1,stagger:.1,ease:'power4.out',delay:.1});
  }

  // Bouquets page: each bouquet flies in on top of the last while the section is pinned.
  var scards=$$('.scard');
  if(scards.length){
    var n=scards.length;
    document.body.classList.add('pinned');
    var num=$('#stackNum'),barEl=$('#stackBar'),nm=$('#stackName'),mx=$('#stackMix'),ask=$('#stackAsk'),cur=0;
    var setActive=function(i){
      if(i===cur) return;cur=i;var s=scards[i];
      num.textContent=String(i+1).padStart(2,'0');
      nm.textContent=s.dataset.name;mx.textContent=s.dataset.mix;
      ask.dataset.look=s.dataset.name;ask.href='order.html?look='+encodeURIComponent(s.dataset.name);
      gsap.fromTo('.now',{y:12,autoAlpha:0},{y:0,autoAlpha:1,duration:.5,ease:'power3.out',overwrite:true});
    };
    var stl=gsap.timeline({scrollTrigger:{trigger:'.stack-sec',start:'top top',end:'+='+(n*75)+'%',pin:true,scrub:.7,
      onUpdate:function(self){barEl.style.transform='scaleX('+(0.25+self.progress*0.75).toFixed(3)+')';setActive(Math.min(n-1,Math.round(self.progress*(n-1))))}}});
    scards.forEach(function(s,i){
      if(i===0) return;
      var fromRight=i%2===1;
      stl.fromTo(s,{xPercent:fromRight?120:20,yPercent:fromRight?30:130,rotation:fromRight?28:-22,scale:.85},{xPercent:0,yPercent:0,rotation:0,scale:1,duration:1,ease:'power3.out'},i-1)
         .to(scards.slice(0,i),{scale:'-=0.04',yPercent:'-=3',duration:1,ease:'power3.out'},i-1);
    });
    stl.to({},{duration:.4});
  }

  // Headings rise; cards and tiles fade up in small batches.
  $$('[data-reveal]').forEach(function(h){
    gsap.from(h,{yPercent:40,autoAlpha:0,duration:1.1,ease:'power4.out',scrollTrigger:{trigger:h,start:'top 88%',once:true}});
  });
  var rise=$$('[data-rise]');
  if(rise.length){
    gsap.set(rise,{y:50,autoAlpha:0});
    ScrollTrigger.batch(rise,{start:'top 92%',once:true,onEnter:function(b){
      gsap.to(b,{y:0,autoAlpha:1,duration:1,ease:'power3.out',stagger:.12,overwrite:true});
    }});
  }
  $$('.piece .frame img,.piece .frame video').forEach(function(m){
    gsap.fromTo(m,{yPercent:-5,scale:1.12},{yPercent:5,scale:1.12,ease:'none',scrollTrigger:{trigger:m.parentNode,start:'top bottom',end:'bottom top',scrub:true}});
  });
  addEventListener('load',function(){ScrollTrigger.refresh()});
})();
