// Descarga: "releases/latest" de GitHub se salta las pre-releases, así que el botón
// pregunta cuál es la más reciente y lleva directo a su instalador.
(function () {
  var ALL = 'https://github.com/Mushingames/MushHub-Descargas/releases';
  var API = 'https://api.github.com/repos/Mushingames/MushHub-Descargas/releases?per_page=10';
  var CACHE = 'mh-dl';
  function apply(url) { Array.prototype.forEach.call(document.querySelectorAll('a[href="' + ALL + '"]'), function (a) { a.href = url; }); }
  try { var c = JSON.parse(sessionStorage.getItem(CACHE) || 'null'); if (c && c.url && Date.now() - c.t < 3600000) { apply(c.url); return; } } catch (e) {}
  fetch(API).then(function (r) { return r.ok ? r.json() : []; }).then(function (list) {
    var url = null;
    (list || []).some(function (rel) {
      if (rel.draft) return false;
      var a = (rel.assets || []).find(function (x) { return /Setup-.*\.exe$/i.test(x.name) && !/Companion/i.test(x.name); });
      if (a && /^https:\/\/github\.com\/Mushingames\/MushHub-Descargas\/releases\/download\//.test(a.browser_download_url)) { url = a.browser_download_url; return true; }
      return false;
    });
    if (!url) return;
    apply(url);
    try { sessionStorage.setItem(CACHE, JSON.stringify({ url: url, t: Date.now() })); } catch (e) {}
  }).catch(function () {});
  // Recuerda el idioma elegido (index.html manda a es.html si el navegador está en español).
  Array.prototype.forEach.call(document.querySelectorAll('.lang a'), function (a) {
    a.addEventListener('click', function () { try { localStorage.setItem('mh-home', a.dataset.lang); } catch (e) {} });
  });
})();
