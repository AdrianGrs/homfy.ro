/* Homfy — main.js */

// ── Mobile nav ──────────────────────────────────────────
const burger = document.querySelector('.nav-burger');
const navLinks = document.querySelector('.nav-links');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
}

// ── Supabase config ─────────────────────────────────────
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';  // <-- înlocuiește
const SUPABASE_KEY = 'YOUR_ANON_KEY';                     // <-- înlocuiește

async function supabaseFetch(table, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

// ── Homepage: produse pe categorii ──────────────────────
const productsGrid = document.getElementById('products-grid');
const catTabs = document.querySelectorAll('.cat-tab');

async function loadProducts(categorie = 'Bucatarie') {
  if (!productsGrid) return;
  productsGrid.innerHTML = '<p class="loading-msg">Se încarcă…</p>';
  try {
    const data = await supabaseFetch(
      'produse',
      `?categorie=eq.${encodeURIComponent(categorie)}&order=created_at.desc&limit=8`
    );
    if (!data.length) {
      productsGrid.innerHTML = '<p class="loading-msg">Niciun produs momentan.</p>';
      return;
    }
    productsGrid.innerHTML = data.map(p => `
      <div class="product-card">
        <div class="product-card__img">
          ${p.imagine_url
            ? `<img src="${p.imagine_url}" alt="${p.nume}" loading="lazy" />`
            : '🛒'}
        </div>
        <div class="product-card__body">
          <div class="product-card__name">${p.nume}</div>
          <div class="product-card__price">
            ${p.pret} lei
            ${p.pret_vechi ? `<s>${p.pret_vechi} lei</s>` : ''}
          </div>
          <a href="${p.link_afiliat}" class="btn-emag"
             rel="nofollow sponsored noopener" target="_blank">
            🛒 Vezi pe eMAG
          </a>
        </div>
      </div>
    `).join('');
  } catch {
    productsGrid.innerHTML = '<p class="error-msg">Nu s-au putut încărca produsele.</p>';
  }
}

catTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    catTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    loadProducts(tab.dataset.cat);
  });
});

if (productsGrid) loadProducts('Bucatarie');

// ── Homepage: ghiduri recente din Supabase ───────────────
const guidesGrid = document.getElementById('guides-grid');

async function loadGuides() {
  if (!guidesGrid) return;
  try {
    const data = await supabaseFetch(
      'articole',
      '?publicat=eq.true&order=created_at.desc&limit=6'
    );
    if (!data.length) return; // lasam cardul static deja afișat
    guidesGrid.innerHTML = data.map(a => `
      <a href="/blog/${a.slug}.html" class="guide-card">
        <div class="guide-card__img">
          ${a.imagine_url
            ? `<img src="${a.imagine_url}" alt="${a.titlu}" loading="lazy" />`
            : '🎁'}
        </div>
        <div class="guide-card__body">
          <span class="tag tag--coral">${a.tag || 'Ghid'}</span>
          <h3>${a.titlu}</h3>
          <p>${a.excerpt || ''}</p>
          <span class="read-more">Citește ghidul →</span>
        </div>
      </a>
    `).join('');
  } catch { /* păstrăm cardul static */ }
}

loadGuides();
