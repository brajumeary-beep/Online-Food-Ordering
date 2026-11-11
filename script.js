document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  const cartModal = document.getElementById('checkout-modal');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const cartCount = document.querySelector('.cart-count');
  const closeCartBtn = document.querySelector('.close-cart');
  const cart = [];

  const formatPrice = (value) => `₹${value}`;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(() => {
      toast.classList.remove('show');
    }, 1800);
  };

  const getItemFromButton = (button) => {
    const name = button.dataset.name || button.closest('.food-card')?.querySelector('h4')?.textContent?.trim() || 'Velora Special';
    const price = Number(button.dataset.price || button.closest('.food-card')?.querySelector('.price')?.textContent?.replace(/[^\d]/g, '') || 0);
    return { name, price };
  };

  const renderCart = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    cartTotal.textContent = formatPrice(total);

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalItems;

    if (!cart.length) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
      return;
    }

    cartItemsContainer.innerHTML = cart.map((item) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <small>${formatPrice(item.price)} each</small>
        </div>
        <div class="cart-item-actions">
          <button type="button" class="qty-btn" data-action="decrease" data-name="${item.name}">-</button>
          <span>${item.qty}</span>
          <button type="button" class="qty-btn" data-action="increase" data-name="${item.name}">+</button>
        </div>
      </div>
    `).join('');
  };

  const openCart = () => {
    cartModal.classList.add('show');
    renderCart();
  };

  const closeCart = () => {
    cartModal.classList.remove('show');
  };

  const addToCart = (name, price) => {
    const found = cart.find((item) => item.name === name);
    if (found) {
      found.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    renderCart();
    showToast(`${name} added to cart`);
  };

  const navLinks = document.querySelectorAll('.nav-link');
  const panels = document.querySelectorAll('.page-panel');
  const footer = document.querySelector('.site-footer');
  const websiteFrame = document.querySelector('.website-frame');

  const updateFooterVisibility = (target) => {
    const shouldShowFooter = target === 'home';
    footer.classList.toggle('visible', shouldShowFooter);
    websiteFrame.dataset.page = target;
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = link.dataset.target;

      navLinks.forEach((nav) => nav.classList.toggle('active', nav === link));
      panels.forEach((panel) => {
        panel.classList.toggle('active', panel.id === `${target}-page`);
      });

      updateFooterVisibility(target);
      showToast(`${link.textContent.trim()} page opened`);
    });
  });

  updateFooterVisibility('home');

  const filterButtons = document.querySelectorAll('.filter-btn');
  const foodCards = document.querySelectorAll('.food-card');
  const searchWrapper = document.querySelector('.search-wrapper');
  const searchInput = document.getElementById('menu-search');
  const searchButton = document.querySelector('.search-btn');
  const cartButton = document.querySelector('.cart-btn');
  const noResults = document.querySelector('.no-results');
  const categoryItems = document.querySelectorAll('.category-item[data-category]');

  let selectedCategory = 'all';

  const applyMenuFilters = () => {
    const query = searchInput.value.trim().toLowerCase();

    foodCards.forEach((card) => {
      const category = (card.dataset.category || 'all').toLowerCase();
      const text = card.textContent.toLowerCase();
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
      const matchesQuery = !query || text.includes(query);
      card.style.display = matchesCategory && matchesQuery ? 'block' : 'none';
    });

    noResults.hidden = Array.from(foodCards).some((card) => card.style.display !== 'none');
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');

      selectedCategory = button.textContent.trim().toLowerCase();
      applyMenuFilters();

      showToast(`${button.textContent.trim()} filter selected`);
    });
  });

  categoryItems.forEach((categoryItem) => {
    categoryItem.addEventListener('click', () => {
      const category = categoryItem.dataset.category;
      selectedCategory = category;
      searchInput.value = '';
      searchWrapper.classList.remove('visible');
      navLinks.forEach((link) => link.classList.toggle('active', link.dataset.target === 'menu'));
      panels.forEach((panel) => panel.classList.toggle('active', panel.id === 'menu-page'));
      filterButtons.forEach((button) => {
        button.classList.toggle('active', button.textContent.trim().toLowerCase() === category);
      });
      updateFooterVisibility('menu');
      applyMenuFilters();
    });
  });

  searchInput.addEventListener('input', () => {
    applyMenuFilters();
  });

  searchButton.addEventListener('click', (event) => {
    event.preventDefault();
    const isVisible = searchWrapper.classList.toggle('visible');

    if (isVisible) {
      navLinks.forEach((link) => link.classList.toggle('active', link.dataset.target === 'menu'));
      panels.forEach((panel) => panel.classList.toggle('active', panel.id === 'menu-page'));
      updateFooterVisibility('menu');
      searchInput.focus();
      return;
    }

    searchInput.value = '';
    selectedCategory = 'all';
    filterButtons.forEach((button) => button.classList.toggle('active', button.textContent.trim() === 'All'));
    applyMenuFilters();
  });

  document.querySelectorAll('.order-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const item = getItemFromButton(button);
      addToCart(item.name, item.price);
    });
  });

  cartButton.addEventListener('click', (event) => {
    event.preventDefault();
    openCart();
  });

  applyMenuFilters();

  closeCartBtn.addEventListener('click', closeCart);
  cartModal.addEventListener('click', (event) => {
    if (event.target === cartModal) {
      closeCart();
    }
  });

  document.addEventListener('click', (event) => {
    const qtyButton = event.target.closest('.qty-btn');
    if (!qtyButton) return;

    const itemName = qtyButton.dataset.name;
    const item = cart.find((entry) => entry.name === itemName);
    if (!item) return;

    if (qtyButton.dataset.action === 'increase') {
      item.qty += 1;
    } else {
      item.qty -= 1;
      if (item.qty <= 0) {
        const index = cart.findIndex((entry) => entry.name === itemName);
        cart.splice(index, 1);
      }
    }

    renderCart();
  });

  document.querySelectorAll('.pay-btn').forEach((button) => {
    button.addEventListener('click', () => {
      if (!cart.length) {
        showToast('Cart is empty');
        return;
      }

      const paymentName = button.classList.contains('phonepe') ? 'PhonePe' : 'Google Pay';
      closeCart();
      showToast(`${paymentName} payment started`);
    });
  });

  const newsletterForm = document.querySelector('.newsletter form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = newsletterForm.querySelector('input');
      const email = input.value.trim();

      if (!email) {
        showToast('Please enter your email');
        return;
      }

      showToast(`Subscribed: ${email}`);
      input.value = '';
    });
  }
});
