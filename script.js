const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function showToast(msg, time = 2200) {
  const t = $('#toast');
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => (t.style.display = 'none'), time);
}

/* ---------- Navbar ---------- */
$('#logo').addEventListener('click', e => {
  e.preventDefault();
  location.reload();
});
$('#hamburger').addEventListener('click', () =>
  $('#navbar').classList.toggle('show')
);
window.scrollToSection = id =>
  document.querySelector(id).scrollIntoView({ behavior: 'smooth' });

/* ---------- MENU DATA ---------- */
const MENU = {
  starters: [
    { id: 's1', name: 'Spring Rolls', price: 120, img: 'https://5.imimg.com/data5/SELLER/Default/2024/7/434300433/DS/BL/YU/190305657/frozen-schezwan-roll.jpg', feedback: 'Crispy rolls loved by all!' },
    { id: 's2', name: 'Chicken Wings', price: 180, img: 'https://www.loveandotherspices.com/wp-content/uploads/2023/06/air-fryer-bbq-chicken-wings-featured.jpg', feedback: 'Juicy, spicy & crispy!' },
    { id: 's3', name: 'Veg Manchurian', price: 150, img: 'https://www.indianveggiedelight.com/wp-content/uploads/2017/06/gobi-manchurian-featured.jpg', feedback: 'A vegetarian favorite!' }
  ],
  maincourse: [
    { id: 'm1', name: 'Fried Rice', price: 160, img: 'https://minuterice.com/wp-content/uploads/2019/03/CLASSIC-FRIED-RICE-768x432.jpg', feedback: 'Perfectly stir-fried with soy!' },
    { id: 'm2', name: 'Hakka Noodles', price: 170, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi9gq_xH_cwngMOcqoYxTWI0sExvEEcBVQJg&s', feedback: 'Classic Indo-Chinese taste.' },
    { id: 'm3', name: 'Kung Pao Chicken', price: 220, img: 'https://athletelunchbox.com/wp-content/uploads/2024/07/DSCF6304.jpg', feedback: 'Tangy, spicy & nutty.' }
  ],
  desserts: [
    { id: 'd1', name: 'Chocolate Lava Cake', price: 140, img: 'https://images.getrecipekit.com/20250325120225-how-20to-20make-20chocolate-20molten-20lava-20cake-20in-20the-20microwave.png?width=650&quality=90&', feedback: 'Hot molten chocolate center — a top seller!' },
    { id: 'd2', name: 'Ice Cream Scoop', price: 80, img: 'https://img.freepik.com/premium-photo/ice-cream-scoops-with-vanilla-chocolate-berry-scoops-topping_488220-3949.jpg', feedback: 'Creamy vanilla delight loved by kids!' },
    { id: 'd3', name: 'Honey Noodles with Ice Cream', price: 160, img: 'https://content.instructables.com/F9Y/LR5P/KAS7WZWD/F9YLR5PKAS7WZWD.jpg?auto=webp&fit=bounds&frame=1&height=1024&width=1024', feedback: 'Crispy, sweet noodles served with ice cream.' }
  ],
  drinks: [
    { id: 'dr1', name: 'Lemon Soda', price: 50, img: 'https://singhbakers.com/wp-content/uploads/2024/09/Add-a-little-bit-of-body-text-14.png', feedback: 'Cool & refreshing for any meal.' },
    { id: 'dr2', name: 'Mocktail', price: 120, img: 'https://frobishers.com/cdn/shop/articles/1_277e9d30-bede-4b80-8c2d-d4abef8305b3.png?v=1680083939', feedback: 'Fruity & fizzy twist to energize you!' },
    { id: 'dr3', name: 'Iced Tea', price: 90, img: 'https://cdn.shopify.com/s/files/1/0069/6467/4613/files/shutterstock_199051802.jpg', feedback: 'Light, chilled, and rejuvenating classic drink.' }
  ]
};

/* ---------- Render Menu ---------- */
const menuItemsEl = $('#menu-items');
const tabs = $$('.tab');

function renderMenu(cat) {
  const items = MENU[cat];
  menuItemsEl.innerHTML = items.map(it => `
    <div class="item-card">
      <div class="item-media"><img src="${it.img}" alt="${it.name}"></div>
      <div class="item-body">
        <div class="item-name">${it.name}</div>
        <div class="item-price">₹${it.price}</div>
        <div class="item-feedback">${it.feedback}</div>
        <button class="btn" data-id="${it.id}">Add to Cart</button>
      </div>
    </div>`).join('');

  menuItemsEl.querySelectorAll('button').forEach(b =>
    b.addEventListener('click', e => {
      const item = findItem(e.target.dataset.id);
      addToCart(item);
    })
  );
}

tabs.forEach(tab =>
  tab.addEventListener('click', e => {
    tabs.forEach(t => t.classList.remove('active'));
    e.currentTarget.classList.add('active');
    renderMenu(e.currentTarget.dataset.cat);
  })
);
renderMenu('starters');

/* ---------- Cart Logic ---------- */
let cart = JSON.parse(localStorage.getItem('ct_cart') || '[]');
const listEl = $('#cart-list');
const totalEl = $('#cart-total');

function persist() {
  localStorage.setItem('ct_cart', JSON.stringify(cart));
  renderCart();
}

function findItem(id) {
  for (const category of Object.values(MENU)) {
    const found = category.find(i => i.id === id);
    if (found) return found;
  }
}

function addToCart(item) {
  const existing = cart.find(i => i.id === item.id);
  if (existing) existing.qty++;
  else cart.push({ ...item, qty: 1 });
  persist();
  showToast(`${item.name} added!`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  persist();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else persist();
}

function renderCart() {
  listEl.innerHTML = '';
  if (cart.length === 0) {
    listEl.innerHTML = '<p style="text-align:center;color:#777;">Your cart is empty.</p>';
    totalEl.textContent = '0';
    return;
  }
  let total = 0;
  cart.forEach(it => {
    const subtotal = it.price * it.qty;
    total += subtotal;
    listEl.innerHTML += `
      <div class="cart-item">
        <strong>${it.name}</strong>
        <div style="color:#555;font-size:0.9rem;">₹${it.price} × ${it.qty} = ₹${subtotal}</div>
        <div class="qty-controls">
          <button class="btn outline" onclick="changeQty('${it.id}', -1)">-</button>
          <span>${it.qty}</span>
          <button class="btn" onclick="changeQty('${it.id}', 1)">+</button>
          <button class="btn outline" onclick="removeFromCart('${it.id}')">Remove</button>
        </div>
      </div>`;
  });
  totalEl.textContent = total.toFixed(2);
}

$('#clear-cart').onclick = () => {
  cart = [];
  persist();
  showToast('Cart cleared.');
};

$('#order-now').onclick = () => {
  if (!cart.length) return showToast('Your cart is empty.');
  showToast('Order placed successfully!');
  cart = [];
  persist();
};

renderCart();

/* ---------- Forms ---------- */
$('#book-table-form').addEventListener('submit', e => {
  e.preventDefault();
  showToast('Table booked successfully!');
  e.target.reset();
});
$('#party-form').addEventListener('submit', e => {
  e.preventDefault();
  showToast('Party request submitted!');
  e.target.reset();
});
