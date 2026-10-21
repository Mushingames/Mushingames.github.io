try { var h = localStorage.getItem('mh-home'); if (h === 'es' || (!h && (navigator.language || '').toLowerCase().indexOf('es') === 0)) location.replace('es.html' + location.hash); } catch (e) {}
