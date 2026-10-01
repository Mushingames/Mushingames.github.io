(function(){
  var saved=null;try{saved=localStorage.getItem('mh-lang')}catch(e){}
  var lang=saved||((navigator.language||'es').toLowerCase().indexOf('es')===0?'es':'en');
  function set(l){document.documentElement.lang=l;try{localStorage.setItem('mh-lang',l)}catch(e){}
    document.querySelectorAll('.langs button').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.set===l))});
    var t=document.querySelector('meta[name=title-'+l+']');if(t)document.title=t.content}
  document.addEventListener('click',function(e){var b=e.target.closest('.langs button');if(b)set(b.dataset.set)});
  set(lang);
})();
