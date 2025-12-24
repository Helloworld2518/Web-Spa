var jt_db = [];

// Fungsi Render Utama - Dipanggil otomatis oleh Blogger
function jt_callback(json) {
  var container = document.getElementById("jt-feed-container");
  if (!container) return;

  // Error handling
  if (!json || !json.feed || !json.feed.entry) {
    container.innerHTML = '<p style="color:#999;">Tidak ada konten berita tersedia saat ini.</p>';
    return;
  }

  jt_db = json.feed.entry || [];

  if (!jt_db.length) {
    container.innerHTML = '<p style="color:#999;">Tidak ada konten berita tersedia saat ini.</p>';
    return;
  }

  // Render menggunakan elemen dengan class agar CSS responsif bekerja
  renderList(jt_db);
  attachSearchHandler();
  return;

  function renderListSync(list) {
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < list.length; i++) {
    var post = jt_db[i];
    var title = post.title.$t || '';
    var date = new Date(post.published.$t).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    var thumb = post.media$thumbnail
      ? post.media$thumbnail.url.replace("s72-c", "w400")
      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240'%3E%3Crect fill='%23f0f0f0' width='400' height='240'/%3E%3C/svg%3E";
    var summary = post.summary
      ? post.summary.$t.replace(/<[^>]*>?/gm, "").substring(0, 120)
      : (post.content ? post.content.$t.replace(/<[^>]*>?/gm, "").substring(0, 120) : "");

    var itemEl = document.createElement('article');
    itemEl.className = 'jt-item';
    itemEl.setAttribute('role', 'article');

    var imgWrap = document.createElement('div');
    imgWrap.className = 'jt-img-side';
    var img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = title;
    img.src = thumb;
    imgWrap.appendChild(img);

    var contentWrap = document.createElement('div');
    contentWrap.className = 'jt-content-side';

    var tag = document.createElement('span');
    tag.className = 'jt-tag';
    tag.textContent = 'Berita • ' + date;

    var h2 = document.createElement('h2');
    h2.className = 'jt-title';
    h2.textContent = title;

    var p = document.createElement('p');
    p.className = 'jt-desc';
    p.textContent = summary + '...';

    contentWrap.appendChild(tag);
    contentWrap.appendChild(h2);
    contentWrap.appendChild(p);

    // clickable behavior
    (function(index){
      itemEl.addEventListener('click', function(){
        window.jt_view(index);
      });
    })(i);

    itemEl.appendChild(imgWrap);
    itemEl.appendChild(contentWrap);
    
      fragment.appendChild(itemEl);
    }

    container.innerHTML = '';
    container.appendChild(fragment);
  }
}

// Render helper (used by search and initial load)
function renderList(list) {
  var container = document.getElementById("jt-feed-container");
  if (!container) return;
  // create elements from provided list
  var fragment = document.createDocumentFragment();
  for (var i = 0; i < list.length; i++) {
    var post = list[i];
    var title = post.title.$t || '';
    var date = new Date(post.published.$t).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    var thumb = post.media$thumbnail ? post.media$thumbnail.url.replace("s72-c", "w400") : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240'%3E%3Crect fill='%23f0f0f0' width='400' height='240'/%3E%3C/svg%3E";
    var summary = post.summary ? post.summary.$t.replace(/<[^>]*>?/gm, "").substring(0, 120) : (post.content ? post.content.$t.replace(/<[^>]*>?/gm, "").substring(0, 120) : "");

    var itemEl = document.createElement('article');
    itemEl.className = 'jt-item';

    var imgWrap = document.createElement('div'); imgWrap.className = 'jt-img-side';
    var img = document.createElement('img'); img.loading = 'lazy'; img.alt = title; img.src = thumb; imgWrap.appendChild(img);

    var contentWrap = document.createElement('div'); contentWrap.className = 'jt-content-side';
    var tag = document.createElement('span'); tag.className = 'jt-tag'; tag.textContent = 'Berita • ' + date;
    var h2 = document.createElement('h2'); h2.className = 'jt-title'; h2.textContent = title;
    var p = document.createElement('p'); p.className = 'jt-desc'; p.textContent = summary + '...';
    contentWrap.appendChild(tag); contentWrap.appendChild(h2); contentWrap.appendChild(p);

    (function(idx){ itemEl.addEventListener('click', function(){ window.jt_view(idx); }); })(i);

    itemEl.appendChild(imgWrap); itemEl.appendChild(contentWrap);
    fragment.appendChild(itemEl);
  }

  container.innerHTML = '';
  container.appendChild(fragment);
}

// Attach search input handler (debounced)
var _jt_search_attached = false;
function attachSearchHandler() {
  if (_jt_search_attached) return; _jt_search_attached = true;
  var input = document.getElementById('jt-search');
  if (!input) return;
  var timeout = null;
  input.addEventListener('input', function(e){
    clearTimeout(timeout);
    var q = e.target.value.trim().toLowerCase();
    timeout = setTimeout(function(){
      if (!q) {
        renderList(jt_db);
        return;
      }
      var filtered = jt_db.filter(function(post){
        var title = (post.title && post.title.$t) ? post.title.$t.toLowerCase() : '';
        var summary = (post.summary && post.summary.$t) ? post.summary.$t.toLowerCase() : '';
        var content = (post.content && post.content.$t) ? post.content.$t.toLowerCase().replace(/<[^>]*>?/gm, '') : '';
        return title.indexOf(q) !== -1 || summary.indexOf(q) !== -1 || content.indexOf(q) !== -1;
      });
      renderList(filtered);
    }, 250);
  });
}

// Fungsi Detail
window.jt_view = function (i) {
  if (!jt_db[i]) return;
  var container = document.getElementById("jt-feed-container");
  if (!container) return;
  var p = jt_db[i];

  var content = p.content ? p.content.$t : '';
  // Lazy load images dalam konten
  content = content.replace(/<img /g, '<img loading="lazy" ');

  var detailHtml = document.createElement('div');
  detailHtml.className = 'jt-detail';

  var back = document.createElement('div');
  back.className = 'jt-back';
  back.style.cssText = 'color:#2d7d6f; font-weight:bold; margin-bottom:15px; cursor:pointer;';
  back.textContent = '← Kembali';
  back.addEventListener('click', function(){ location.reload(); });

  var titleEl = document.createElement('h1');
  titleEl.textContent = p.title.$t || '';
  titleEl.style.cssText = 'color:#2d7d6f; font-size:26px; margin-bottom:10px;';

  var meta = document.createElement('div');
  meta.className = 'jt-meta';
  meta.textContent = '👤 Admin • 📅 ' + new Date(p.published.$t).toLocaleDateString("id-ID");

  var body = document.createElement('div');
  body.className = 'jt-body';
  body.innerHTML = content;

  detailHtml.appendChild(back);
  detailHtml.appendChild(titleEl);
  detailHtml.appendChild(meta);
  detailHtml.appendChild(body);

  container.innerHTML = '';
  container.appendChild(detailHtml);
  window.scrollTo(0, 0);
};
