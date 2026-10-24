(function(){
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ---------- words the script writes, in English and Spanish ---------- */
  var ES=document.documentElement.lang==='es',LOC=ES?'es-MX':'en-US';
  var L=ES?{
    vday:'San Valentín',mday:'Día de las Madres',today:'es hoy',tomorrow:'es mañana',is:'es el',
    bookBy:function(d){return 'Reserva antes del '+d+', los lugares se llenan rápido.'},late:'Ya casi no hay lugares. Mándanos un mensaje para ver si queda alguno.',bookNow:'Reservar',textUs:'Escríbenos',
    look:function(n){return 'Me encanta el ramo "'+n+'" de su página.'},
    addPhoto:'Agregar foto',addAnother:'Agregar otra foto',maxPhotos:'Máximo 4 fotos',removePhoto:function(i){return 'Quitar foto '+i},
    errName:'Escribe tu nombre.',errPhone:'Escribe un número de 10 dígitos, como 323-555-0100.',errDate:'Elige la fecha en que necesitas tu ramo.',
    fix:function(n){return 'Corrige '+(n===1?'1 campo':n+' campos')+' arriba para continuar.'},
    hello:'¡Hola Italia! Quiero un ramo personalizado.',name:'Nombre',phone:'Teléfono',insta:'Instagram',date:'Fecha',occasion:'Ocasión',size:'Tamaño',budget:'Presupuesto',flowers:'Flores',custom:'Mi ramo',colors:'Colores',ribbon:'Listón',get:'Recoger o entrega',notes:'Notas',notSure:'Todavía no sé',
    photoLine:function(n){return 'Inspiración: '+(n===1?'Te mando mi foto':'Te mando '+n+' fotos')},copied:'Copiado'
  }:{
    vday:"Valentine's Day",mday:"Mother's Day",today:'is today',tomorrow:'is tomorrow',is:'is',
    bookBy:function(d){return 'Book by '+d+', spots fill fast.'},late:'Spots are almost gone. Text us to check.',bookNow:'Book now',textUs:'Text us',
    look:function(n){return 'I love the "'+n+'" bouquet from your site.'},
    addPhoto:'Add a photo',addAnother:'Add another photo',maxPhotos:'4 photos max',removePhoto:function(i){return 'Remove photo '+i},
    errName:'Enter your name.',errPhone:'Enter a 10-digit phone number, like 323-555-0100.',errDate:'Pick the date you need your bouquet.',
    fix:function(n){return 'Fix '+(n===1?'1 field':n+' fields')+' above to continue.'},
    hello:"Hi Italia! I'd like a custom bouquet.",name:'Name',phone:'Phone',insta:'Instagram',date:'Date',occasion:'Occasion',size:'Size',budget:'Budget',flowers:'Flowers',custom:'My custom bouquet',colors:'Colors',ribbon:'Ribbon',get:'Pickup or delivery',notes:'Notes',notSure:'Not sure yet',
    photoLine:function(n){return 'Inspiration: '+(n===1?"I'll attach my photo":"I'll attach "+n+' photos')},copied:'Copied'
  };

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

  /* ---------- sizes sub-nav: highlight the size in view ---------- */
  var spy=$$('[data-spy]');
  if(spy.length&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){spy.forEach(function(a){a.setAttribute('aria-current',String(a.dataset.spy===e.target.id))})}})},{rootMargin:'-45% 0px -50% 0px'});
    spy.forEach(function(a){var t=document.getElementById(a.dataset.spy);if(t)io.observe(t)});
  }

  /* ---------- sizes: the bouquet grows stem by stem as you scroll (signature) ---------- */
  // Wrap paper grows with the bouquet, and the flower head always sits on the cone.
  function posyShape(svg,n){
    var k=Math.min(1,Math.sqrt(n/100)),drop=(1-k)*44;
    var w=$('.wrap-back',svg),f=$('.blooms',svg);
    if(w)w.style.transform='translateY('+drop.toFixed(1)+'px) scale('+(.2+.8*k).toFixed(3)+')';
    if(f)f.style.transform='translateY('+drop.toFixed(1)+'px)';
  }
  var live=$('.posy-live');
  if(live){
    var blooms=$$('.bl',live),objs=$$('.obj'),num=$('#posyNum'),nameEl=$('#posyName'),wrapBack=$('.wrap-back',live),shown=-1;
    var setCount=function(n){
      n=Math.max(1,Math.min(blooms.length,Math.round(n)));
      if(n===shown) return;shown=n;
      blooms.forEach(function(b,i){b.classList.toggle('off',i>=n)});
      num.textContent=n>=100?'100+':n;
      posyShape(live,n);
    };
    var update=function(){
      var mid=innerHeight*.45,stems=+objs[0].dataset.stems,name=objs[0].querySelector('h2').textContent;
      for(var i=0;i<objs.length;i++){
        var r=objs[i].getBoundingClientRect(),a=+objs[i].dataset.stems,b=objs[i+1]?+objs[i+1].dataset.stems:a+8;
        if(r.top<=mid){
          var t=Math.max(0,Math.min(1,((mid-r.top)/Math.max(1,r.height)-.6)/.4));
          stems=a+(b-a)*t;name=objs[i].querySelector('h2').textContent;
        }
      }
      setCount(stems);if(nameEl.textContent!==name)nameEl.textContent=name;
    };
    addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
  }

  /* static bouquets (phones): show each size's own stem count */
  $$('.posy-static').forEach(function(svg){var n=+svg.dataset.show;$$('.bl',svg).forEach(function(b,i){b.classList.toggle('off',i>=n)});posyShape(svg,n)});

  /* ---------- pricing: keep holiday dates current ---------- */
  var nextDate=function(fn){var t=new Date();t.setHours(0,0,0,0);var d=fn(t.getFullYear());return d>=t?d:fn(t.getFullYear()+1)};
  var mday=function(y){var d=new Date(y,4,1);d.setDate(1+((7-d.getDay())%7)+7);return d};
  var dates={vday:nextDate(function(y){return new Date(y,1,14)}),mday:nextDate(mday)};
  $$('[data-date]').forEach(function(el){var d=dates[el.dataset.date];if(d)el.textContent=d.toLocaleDateString(LOC,{weekday:'short',month:'short',day:'numeric'})});
  var bookBy=function(d){var b=new Date(d);b.setDate(b.getDate()-7);return b};
  $$('[data-by]').forEach(function(el){var d=dates[el.dataset.by];if(d)el.textContent=bookBy(d).toLocaleDateString(LOC,{month:ES?'long':'short',day:'numeric'})});

  /* ---------- home: holiday banner in the 6 weeks before Valentine's Day and Mother's Day ---------- */
  var promo=$('#promo');
  if(promo){
    var today=new Date();today.setHours(0,0,0,0);
    [['vday',L.vday],['mday',L.mday]].some(function(h){
      var day=dates[h[0]],by=bookBy(day),left=Math.round((day-today)/864e5);
      if(left>42) return false;
      var fmt=function(d,o){return d.toLocaleDateString(LOC,o)};
      var mon=ES?'long':'short',when=left===0?L.today:left===1?L.tomorrow:L.is+' '+fmt(day,{weekday:'long',month:mon,day:'numeric'});
      var early=today<=by;
      $('#promoText').innerHTML='<b>'+h[1]+' '+when+'.</b> '+(early?L.bookBy(fmt(by,{month:mon,day:'numeric'})):L.late);
      var cta=$('#promoCta');
      if(early){cta.href='order.html?occasion='+encodeURIComponent(h[1]);cta.textContent=L.bookNow}
      else{cta.href='sms:+13238420960';cta.textContent=L.textUs}
      promo.hidden=false;return true;
    });
  }

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
    if(look){notes.value=L.look(look);try{localStorage.removeItem('fbi-look')}catch(err){}}
    var sizeParam=null;try{sizeParam=new URLSearchParams(location.search).get('size')}catch(err){}
    if(sizeParam){$$('[name=size]',form).forEach(function(r){if(r.dataset.key===sizeParam)r.checked=true})}
    var occParam=null;try{occParam=new URLSearchParams(location.search).get('occasion')}catch(err){}
    if(occParam){$$('#occasion option').forEach(function(o){if(o.value===occParam)o.selected=true})}
    /* inspiration photos: add up to 4, remove any with its × button */
    var photo=$('#photo'),thumbs=$('#thumbs'),photoAdd=$('#photoAdd'),photoMax=$('#photoMax'),photos=[];
    var drawPhotos=function(){
      thumbs.innerHTML='';
      photos.forEach(function(f,n){
        var box=document.createElement('div'),i=document.createElement('img'),x=document.createElement('button');
        box.className='thumb';i.alt='';i.src=URL.createObjectURL(f);i.onload=function(){URL.revokeObjectURL(i.src)};
        x.type='button';x.className='thumb-x';x.setAttribute('aria-label',L.removePhoto(n+1));x.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
        x.addEventListener('click',function(){
          photos.splice(n,1);drawPhotos();
          var next=thumbs.querySelectorAll('.thumb-x')[Math.min(n,photos.length-1)];(next||photo).focus();
        });
        box.appendChild(i);box.appendChild(x);thumbs.appendChild(box);
      });
      thumbs.hidden=!photos.length;
      var full=photos.length>=4;
      photoAdd.hidden=full;photo.disabled=full;photoMax.hidden=!full;
      $('span',photoAdd).textContent=photos.length?L.addAnother:L.addPhoto;
    };
    photo.addEventListener('change',function(){
      [].slice.call(photo.files||[]).forEach(function(f){
        if(!/^image\//.test(f.type)||photos.length>=4) return;
        if(photos.some(function(p){return p.name===f.name&&p.size===f.size})) return;
        photos.push(f);
      });
      photo.value='';drawPhotos();
    });
    var date=$('#date'),t=new Date();t.setDate(t.getDate()+2);date.min=t.toISOString().slice(0,10);
    var customToggle=$('#customToggle'),customWrap=$('#customWrap');
    customToggle.addEventListener('change',function(){customWrap.classList.toggle('show',customToggle.checked);if(customToggle.checked)$('#custom').focus()});
    var err=$('#err'),done=$('#done'),sum=$('#summary');
    var setFieldError=function(name,msg){
      var input=form.elements[name],id=name+'-err',p=document.getElementById(id);
      if(!p){p=document.createElement('p');p.id=id;p.className='field-error';input.insertAdjacentElement('afterend',p);input.setAttribute('aria-describedby',id)}
      p.textContent=msg;p.hidden=!msg;
      if(msg)input.setAttribute('aria-invalid','true');else input.removeAttribute('aria-invalid');
    };
    ['name','phone','date'].forEach(function(n){form.elements[n].addEventListener('input',function(){if(this.getAttribute('aria-invalid'))setFieldError(n,'')})});

    var val=function(n){var e=form.elements[n];return e&&e.value?e.value.trim():''};
    var copy=function(text){
      function fallback(){var a=document.createElement('textarea');a.value=text;a.setAttribute('readonly','');a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove()}
      try{if(navigator.clipboard){navigator.clipboard.writeText(text).catch(fallback);return}}catch(e){}
      fallback();
    };
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var checks=[['name',!val('name'),L.errName],
                  ['phone',val('phone').replace(/\D/g,'').length<10,L.errPhone],
                  ['date',!val('date'),L.errDate]];
      var bad=[];
      checks.forEach(function(c){setFieldError(c[0],c[1]?c[2]:'');if(c[1])bad.push(c[0])});
      if(bad.length){err.textContent=L.fix(bad.length);err.hidden=false;form.elements[bad[0]].focus();return}
      err.hidden=true;
      var flowers=$$('[name=flowers]:checked',form).map(function(i){return i.value}).join(', ');
      var size=($('[name=size]:checked',form)||{}).value||L.notSure;
      var d=new Date(val('date')+'T12:00:00');
      var line=function(k,v){return v?L[k]+': '+v:''};
      var lines=[
        L.hello,
        line('name',val('name')),
        line('phone',val('phone')),
        line('insta',val('insta')),
        line('date',d.toLocaleDateString(LOC,{weekday:'long',month:'long',day:'numeric'})),
        line('occasion',val('occasion')),
        line('size',size),
        line('budget',val('budget')),
        line('flowers',flowers),
        line('custom',val('custom')),
        line('colors',val('colors')),
        line('ribbon',val('ribbon')),
        line('get',val('get')),
        line('notes',val('notes')),
        photos.length?L.photoLine(photos.length):''
      ].filter(Boolean).join('\n');
      sum.textContent=lines;copy(lines);
      $('#smsBtn').href='sms:+13238420960?&body='+encodeURIComponent(lines);
      $('#photoNote').hidden=!photos.length;
      var share=$('#shareBtn'),canShare=false;
      try{canShare=photos.length&&navigator.canShare&&navigator.canShare({files:photos,text:lines})}catch(e){}
      share.hidden=!canShare;
      share.onclick=function(){navigator.share({files:photos,text:lines}).catch(function(){})};
      done.hidden=false;
      done.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'});
    });
    $('#copyAgain').addEventListener('click',function(){copy(sum.textContent);this.textContent=L.copied});
  }

  /* ---------- motion: the page is complete without it ---------- */
  if(!window.gsap||!window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Reduced-motion setting (common on PCs with Windows animation effects off):
  // keep gentle fades only, with no flying, spinning or pinned scrolling.
  if(reduce){
    if($('.hero')) gsap.from(['.wreath','.hero h1','[data-intro]'],{autoAlpha:0,duration:1.2,stagger:.15,ease:'power2.out'});
    if($('.page-head')) gsap.from('.page-head > .wrap > *',{autoAlpha:0,duration:1,stagger:.12,ease:'power2.out'});
    var soft=$$('[data-reveal],[data-rise]');
    if(soft.length){
      gsap.set(soft,{autoAlpha:0});
      ScrollTrigger.batch(soft,{start:'top 92%',once:true,onEnter:function(b){gsap.to(b,{autoAlpha:1,duration:1,stagger:.1,ease:'power2.out',overwrite:true})}});
    }
    return;
  }
  var mobile=matchMedia('(max-width:860px)').matches;

  // Home hero: the wreath blooms in, the bouquet opens inside it, the ribbon tags tie on.
  if($('.hero')){
    var tl=gsap.timeline({defaults:{ease:'power4.out'}});
    tl.from('.wreath .ring',{scale:.6,rotation:-35,autoAlpha:0,duration:1.5},0)
      .from('.wreath .glow',{scale:.4,autoAlpha:0,duration:1.6},0)
      .from('.wreath .vid',{clipPath:'circle(0% at 50% 50%)',duration:1.3,ease:'power3.inOut'},.35)
      .from('.wreath video',{scale:1.8,duration:1.8},.35)
      .from('.hero .hl__in',{yPercent:110,duration:1.15},.55)
      .from('[data-intro]',{y:18,autoAlpha:0,duration:.9,stagger:.08},.8)
      .from('.wreath .tag',{clipPath:'inset(0 100% 0 0)',duration:.9,stagger:.2,ease:'power3.inOut'},1.1);
    gsap.to('.wreath .ring',{rotation:4,duration:6,yoyo:true,repeat:-1,ease:'sine.inOut',delay:1.6});
    gsap.to('.wreath',{yPercent:-8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
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
    var sizeEl=$('#stackSize'),barEl=$('#stackBar'),nm=$('#stackName'),mx=$('#stackMix'),ask=$('#stackAsk'),cur=0;
    var setActive=function(i){
      if(i===cur) return;cur=i;var s=scards[i];
      sizeEl.textContent=s.dataset.size;
      nm.textContent=s.dataset.name;mx.textContent=s.dataset.mix;
      ask.dataset.look=s.dataset.name;ask.href='order.html?look='+encodeURIComponent(s.dataset.name);
      gsap.fromTo('.now',{y:12,autoAlpha:0},{y:0,autoAlpha:1,duration:.5,ease:'power3.out',overwrite:true});
    };
    var stl=gsap.timeline({scrollTrigger:{trigger:'.stack-sec',start:'top top',end:'+='+(n*40)+'%',pin:true,scrub:.7,
      onUpdate:function(self){barEl.style.transform='scaleX('+(0.25+self.progress*0.75).toFixed(3)+')';setActive(Math.min(n-1,Math.round(self.progress*(n-1+0.4))))}}});
    scards.forEach(function(s,i){
      if(i===0) return;
      var fromRight=i%2===1;
      stl.fromTo(s,{xPercent:fromRight?120:20,yPercent:fromRight?30:130,rotation:fromRight?28:-22,scale:.85},{xPercent:0,yPercent:0,rotation:0,scale:1,duration:1,ease:'power3.out'},i-1)
         .to(scards.slice(0,i),{scale:'-=0.04',yPercent:'-=3',duration:1,ease:'power3.out'},i-1);
    });
    stl.to({},{duration:.4});
  }

  // Gallery objects arrive with a clip wipe, once.
  $$('[data-wipe] .sp-img').forEach(function(el){
    gsap.fromTo(el,{clipPath:'inset(18% 0% 0% 0% round 20px)',opacity:.4},{clipPath:'inset(0% 0% 0% 0% round 20px)',opacity:1,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
  });
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
