document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.filter-btn[data-category]');
  const foodCards = document.querySelectorAll('.food-card[data-category]');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;

      filterButtons.forEach((filterButton) => {
        const isSelected = filterButton === button;
        filterButton.classList.toggle('active', isSelected);
        filterButton.setAttribute('aria-pressed', String(isSelected));
      });

      foodCards.forEach((card) => {
        card.hidden = category !== 'all' && card.dataset.category !== category;
      });
    });
  });
});
