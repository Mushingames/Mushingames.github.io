(function () {
  var btns = Array.prototype.slice.call(document.querySelectorAll('#bill .bill-btn'));
  function set(p) {
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.p === p)); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-price]'), function (e) { e.textContent = e.dataset[p]; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-note]'), function (e) { e.textContent = e.dataset[p]; });
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { set(b.dataset.p); }); });
})();
