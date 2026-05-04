// Key used in localStorage to store the cart array.
const CART_KEY = 'catnip_cart';

// ------------------------------------------------------------
// Reads the cart from localStorage and returns an array.
// localStorage can only store strings, so we JSON.parse it back into an array.
// ------------------------------------------------------------
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// ------------------------------------------------------------
// Persists the cart array to localStorage and refreshes the badge.
// Converts the array into a string that localStorage can store.
// ------------------------------------------------------------
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// ------------------------------------------------------------
// Sets the number next to the Cart-link in the navbar.
// ------------------------------------------------------------
function updateCartBadge() {
  const count = getCart().length;
  document.querySelectorAll('#cart-count').forEach(el => {
    el.textContent = count;
  });
}

// ------------------------------------------------------------
// Sets up the hamburger menu on small screens.
// ------------------------------------------------------------
function initNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // When the user clicks the hamburger button, toggle the "open" class on the link list.
  // CSS uses this class to show/hide the menu on small screens.
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // When the user taps any link inside the menu, close the menu.
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

// ------------------------------------------------------------
// Entry point: makes sure querySelector finds the elements.
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  updateCartBadge();
});
