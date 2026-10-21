(function () {
  function copy(text, done) {
    function ok() { done(); }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(ok, fallback); } else { fallback(); }
    function fallback() {
      var t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.left = '-9999px';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); ok(); } catch (e) {} t.remove();
    }
  }
  Array.prototype.forEach.call(document.querySelectorAll('button.copy'), function (b) {
    b.addEventListener('click', function () {
      copy(document.getElementById(b.dataset.target).textContent.trim(), function () {
        b.textContent = '✓ ' + b.dataset.done; setTimeout(function () { b.textContent = b.dataset.label; }, 2000);
      });
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('button.copy-color'), function (b) {
    b.addEventListener('click', function () {
      copy(b.dataset.hex, function () {
        var h = b.querySelector('.hex'), old = h.textContent; h.textContent = '✓ ' + b.dataset.done; setTimeout(function () { h.textContent = old; }, 1600);
      });
    });
  });
})();
