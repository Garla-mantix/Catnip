// ------------------------------------------------------------
// Entry point. Sets up the cart display and the order form.
// ------------------------------------------------------------
function initCartPage() {
  const empty = document.getElementById('cart-empty');
  const items = document.getElementById('cart-items');
  const form = document.getElementById('order-form');

  // formSection is the parent <section> of the form, which we hide when the cart is empty.
  const formSection = form.closest('.order-form');

  // ------------------------------------------------------------
  // Redraw the cart based on the current localStorage contents.
  // ------------------------------------------------------------
  function render() {
    const cart = getCart();

    if (!cart.length) {
      // Cart is empty → show the "empty" message and hide the items and form.
      empty.style.display = '';
      items.style.display = 'none';
      formSection.style.display = 'none';
      return;
    }

    // Cart has items → hide the "empty" message and show the items and form.
    empty.style.display = 'none';
    items.style.display = '';
    formSection.style.display = '';

    // Map each cart entry to a card HTML string. 
    items.innerHTML = cart.map((c, idx) => {
      const img = c.image
        ? `<img src="${c.image}" alt="${c.name}">`
        : `<div class="cart-item-placeholder" aria-hidden="true">🐱</div>`;
  
      return `
        <article class="cart-item">
          ${img}
          <div class="cart-item-info">
            <h3>${c.name}</h3>
            <p>${c.origin}</p>
          </div>
          <button class="btn-remove" data-idx="${idx}">Remove</button>
        </article>
      `;
    }).join('');

    // After innerHTML replaces the DOM, attach handlers to the new Remove buttons.
    items.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const cart = getCart();
        cart.splice(idx, 1);
        saveCart(cart);
        render();
      });
    });
  }

  render();

  // ------------------------------------------------------------
  // Order form submission — confirmation alert + clear cart.
  // ------------------------------------------------------------
  form.addEventListener('submit', e => {
    // Stop the browser from submitting the form to a server / reloading the page.
    e.preventDefault();

    const cart = getCart();

    // form.elements is indexed by the input's name attribute.
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const address = form.elements.address.value.trim();

    // Builds a multi-line summary of the cats in the cart.
    const list = cart.map(c => `• ${c.name} (${c.origin})`).join('\n');

    // Shows an alert with the order details.
    alert(
      `Thank you for your order, ${name}!\n\n` +
      `An order confirmation will be sent to ${email}.\n\n` +
      `Delivery address:\n${address}\n\n` +
      `Cats ordered (${cart.length}):\n${list}`
    );

    // Clear the cart and reset the form for a new order.
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
    form.reset();
    render();
  });
}

document.addEventListener('DOMContentLoaded', initCartPage);