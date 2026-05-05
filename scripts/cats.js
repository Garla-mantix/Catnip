// How many cat cards to show per page.
const PAGE_SIZE = 10;

// Fetching the full list of breeds from the API.
const API_URL = 'https://api.thecatapi.com/v1/breeds';

// ------------------------------------------------------------
// Holds the data and UI state for the Cats-page.
//   all      = the unfiltered list of breeds from the API
//   filtered = the list after applying the search filter
//   page     = the current pagination page
// ------------------------------------------------------------
const catsState = {
  all: [],
  filtered: [],
  page: 1,
};

// ------------------------------------------------------------
// Entry point for the Cats-page. 
// Fetches data, sets up event handlers, and renders the first page.
// ------------------------------------------------------------
async function initCatsPage() {
  const grid = document.getElementById('cat-grid');
  const search = document.getElementById('search-input');

  // Show a temporary message while loading.
  grid.innerHTML = '<p class="cats-status">Loading cats…</p>';

  try {
    // Fetches the list of breeds from the API.
    const res = await fetch(API_URL);

    // Reads the response body and parses it as JSON.
    const breeds = await res.json();

    // Drop breeds the API has no image for so they don't show up as broken images.
    // Initially the filtered list is the same as the full list (no search query yet).
    catsState.all = breeds.filter(c => c.reference_image_id);
    catsState.filtered = catsState.all;

    renderCats();
  } 
  catch (err) {
    grid.innerHTML = '<p class="cats-status">Could not load cats. Please try again later.</p>';
    console.error(err);
    return;
  }

  // Wires up the search input (updates on every keystroke).
  search.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();

    catsState.filtered = q
      ? catsState.all.filter(c => c.name.toLowerCase().includes(q))
      : catsState.all;

    catsState.page = 1; // Reset to first page after filtering.
    renderCats();
  });
}

// ------------------------------------------------------------
// Draws the current page of cards plus pagination buttons.
// Called whenever the data, search query, or current page changes.
// ------------------------------------------------------------
function renderCats() {
  const grid = document.getElementById('cat-grid');

  // Calculate how many pages we have based on the filtered list length.
  const totalPages = Math.max(1, Math.ceil(catsState.filtered.length / PAGE_SIZE));

  // Page 1 → indices 0..9, page 2 → 10..19, etc.
  const start = (catsState.page - 1) * PAGE_SIZE;
  const slice = catsState.filtered.slice(start, start + PAGE_SIZE);

  if (!slice.length) {
    grid.innerHTML = '<p class="cats-status">No cats matched your search.</p>';
  } 
  else {
    // Map each cat to a card HTML string, then join into one big string.
    grid.innerHTML = slice.map(buildCatCard).join('');

    // After innerHTML replaces the DOM, attach handlers to the new buttons/images.
    grid.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => addToCart(btn));
    });
    grid.querySelectorAll('.cat-card-image').forEach(img => {
      img.addEventListener('error', handleImageError);
    });
  }

  renderPagination(totalPages);
}

// ------------------------------------------------------------
// Returns the HTML string for one cat card.
// ------------------------------------------------------------
function buildCatCard(cat) {
  const refId = cat.reference_image_id;
  const img = `<img src="https://cdn2.thecatapi.com/images/${refId}.jpg" alt="${cat.name}" class="cat-card-image" data-ref="${refId}" loading="lazy">`;
  const origin = cat.origin || 'Unknown';
  const description = cat.description || 'No description available.';

  // data-id stores the breed id so addToCart() can look up which cat was clicked.
  return `
    <article class="cat-card">
      ${img}
      <div class="cat-card-body">
        <h2>${cat.name}</h2>
        <p class="origin">${origin}</p>
        <p class="description">${description}</p>
        <button class="btn btn-primary add-to-cart" data-id="${cat.id}">Add to cart</button>
      </div>
    </article>
  `;
}

// ------------------------------------------------------------
// Runs when an <img>'s src fails to load.
// Most breeds are .jpg, but a few are .png.
// ------------------------------------------------------------
function handleImageError(e) {
  const img = e.target;

  // First failure → swap to .png and let the browser try again.
  if (!img.dataset.retried) {
    img.dataset.retried = '1';
    img.src = `https://cdn2.thecatapi.com/images/${img.dataset.ref}.png`;
    return;
  }

  // Second failure → show placeholder.
  const placeholder = document.createElement('div');
  placeholder.className = 'cat-card-image-placeholder';
  placeholder.setAttribute('aria-hidden', 'true');
  placeholder.textContent = '🐱';
  img.replaceWith(placeholder);
}

// ------------------------------------------------------------
// Handler for clicking "Add to cart" button.
// ------------------------------------------------------------
function addToCart(btn) {
  // Find the cat object whose id matches data-id on the clicked button.
  const cat = catsState.all.find(c => c.id === btn.dataset.id);

  const cart = getCart();

  // Store only the fields the cart-page needs, not the whole object.
  cart.push({
    id: cat.id,
    name: cat.name,
    origin: cat.origin || 'Unknown',
    image: `https://cdn2.thecatapi.com/images/${cat.reference_image_id}.jpg`,
  });
  saveCart(cart); // Persists to localStorage and updates the badge.

  // UX feedback so the user sees cat was added to cart.
  const original = btn.textContent;
  btn.textContent = 'Added ✓';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 1100);
}

// ------------------------------------------------------------
// Shows the « Previous / 1 / 2 / 3 / Next » buttons.
// ------------------------------------------------------------
function renderPagination(totalPages) {
  const nav = document.getElementById('pagination');
  const { page } = catsState;

  // Previous is disabled on page 1.
  let html = `<button data-action="prev" ${page === 1 ? 'disabled' : ''}>&laquo; Previous</button>`;

  // One numbered button per page; mark the current one with the "active" class.
  for (let i = 1; i <= totalPages; i++) {
    html += `<button data-page="${i}" class="${i === page ? 'active' : ''}">${i}</button>`;
  }

  // Next is disabled on the last page.
  html += `<button data-action="next" ${page === totalPages ? 'disabled' : ''}>Next &raquo;</button>`;
  nav.innerHTML = html;

  // Wire up clicks on every pagination button.
  nav.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'prev') catsState.page--;
      else if (btn.dataset.action === 'next') catsState.page++;
      else catsState.page = parseInt(btn.dataset.page, 10);

      renderCats();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

document.addEventListener('DOMContentLoaded', initCatsPage);