const app = {
  allPhones: [],
  filteredPhones: [],
  activeTopFilter: 'all',
  currentPage: 1,
  pageSize: 24,

  async init() {
    this.bindEvents();
    this.allPhones = await DataModule.loadPhones();
    this.populateBrands();
    this.applyFilters();
  },

  bindEvents() {
    document.getElementById('searchInput')?.addEventListener('input', () => this.applyFilters());
    document.getElementById('priceRange')?.addEventListener('input', (e) => {
      document.getElementById('priceLabel').innerText = Utils.formatINR(e.target.value);
      this.applyFilters();
    });
    document.getElementById('brandSelect')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('yearSelect')?.addEventListener('change', () => this.applyFilters());
    document.getElementById('sortSelect')?.addEventListener('change', () => this.applyFilters());

    // Top 10 / Top 20 buttons
    document.querySelectorAll('.top-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.top-pill').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.activeTopFilter = e.target.dataset.top;
        this.applyFilters();
      });
    });

    // Reset
    document.getElementById('resetFilters')?.addEventListener('click', () => {
      document.getElementById('searchInput').value = '';
      document.getElementById('priceRange').value = 180000;
      document.getElementById('priceLabel').innerText = '₹1,80,000';
      document.getElementById('brandSelect').value = '';
      document.getElementById('yearSelect').value = '';
      this.activeTopFilter = 'all';
      document.querySelectorAll('.top-pill').forEach(b => b.classList.remove('active'));
      document.querySelector('.top-pill[data-top="all"]')?.classList.add('active');
      this.applyFilters();
    });

    // Mobile filter toggle
    document.getElementById('mobileFilterToggle')?.addEventListener('click', () => {
      document.getElementById('filterSidebar')?.classList.toggle('open');
    });
    document.getElementById('closeFilterMobile')?.addEventListener('click', () => {
      document.getElementById('filterSidebar')?.classList.remove('open');
    });
    document.getElementById('closeModal')?.addEventListener('click', () => {
      document.getElementById('detailModal').style.display = 'none';
    });
  },

  populateBrands() {
    const brandSelect = document.getElementById('brandSelect');
    if (!brandSelect) return;
    const brands = [...new Set(this.allPhones.map(p => p.brand))].sort();
    brands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.innerText = b;
      brandSelect.appendChild(opt);
    });
  },

  applyFilters() {
    const query = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
    const maxPrice = Number(document.getElementById('priceRange')?.value) || 180000;
    const selectedBrand = document.getElementById('brandSelect')?.value || '';
    const selectedYear = document.getElementById('yearSelect')?.value || '';
    const sortVal = document.getElementById('sortSelect')?.value || 'newest';

    let result = this.allPhones.filter(p => {
      if (p.price.inr > maxPrice) return false;
      if (selectedBrand && p.brand !== selectedBrand) return false;
      if (selectedYear && String(p.launchYear) !== selectedYear) return false;
      if (query) {
        const fullText = `${p.brand} ${p.model} ${p.specs?.processor || ''}`.toLowerCase();
        if (!fullText.includes(query)) return false;
      }
      return true;
    });

    // Smart Score Calculation: Composite (Gaming + Camera + Battery + Value)
    const getScore = (p) => {
      const g = p.useCases?.gaming || 5;
      const c = p.useCases?.camera || 5;
      const b = p.useCases?.battery || 5;
      const v = p.useCases?.value || 5;
      return (g * 0.25) + (c * 0.3) + (b * 0.2) + (v * 0.25);
    };

    // Quick Top Filters handler
    if (this.activeTopFilter === '10') {
      result.sort((a, b) => getScore(b) - getScore(a));
      result = result.slice(0, 10);
    } else if (this.activeTopFilter === '20') {
      result.sort((a, b) => getScore(b) - getScore(a));
      result = result.slice(0, 20);
    } else if (this.activeTopFilter === 'camera') {
      result.sort((a, b) => (b.useCases?.camera || 0) - (a.useCases?.camera || 0));
      result = result.slice(0, 15);
    } else if (this.activeTopFilter === 'gaming') {
      result.sort((a, b) => (b.useCases?.gaming || 0) - (a.useCases?.gaming || 0));
      result = result.slice(0, 15);
    } else if (this.activeTopFilter === 'budget') {
      result = result.filter(p => p.price.inr <= 20000);
      result.sort((a, b) => (b.useCases?.value || 0) - (a.useCases?.value || 0));
      result = result.slice(0, 15);
    } else {
      // Normal Sorting
      if (sortVal === 'newest') result.sort((a, b) => (b.launchYear || 2024) - (a.launchYear || 2024));
      else if (sortVal === 'best') result.sort((a, b) => getScore(b) - getScore(a));
      else if (sortVal === 'price-asc') result.sort((a, b) => a.price.inr - b.price.inr);
      else if (sortVal === 'price-desc') result.sort((a, b) => b.price.inr - a.price.inr);
      else if (sortVal === 'battery') result.sort((a, b) => (b.specs?.battery || 0) - (a.specs?.battery || 0));
    }

    this.filteredPhones = result;
    this.render();
  },

  render() {
    const grid = document.getElementById('phoneGrid');
    const countEl = document.getElementById('matchCount');
    const loadingView = document.getElementById('loadingView');
    const emptyView = document.getElementById('emptyView');

    loadingView.style.display = 'none';
    countEl.innerText = this.filteredPhones.length;

    if (this.filteredPhones.length === 0) {
      grid.innerHTML = '';
      emptyView.style.display = 'block';
      return;
    }

    emptyView.style.display = 'none';
    const compareList = CompareModule.getCompareList();
    const isTopMode = ['10', '20'].includes(this.activeTopFilter);

    grid.innerHTML = this.filteredPhones.map((p, index) => {
      const isCompared = compareList.includes(p.id);
      const rank = isTopMode ? index + 1 : null;
      return RenderModule.renderCard(p, isCompared, rank);
    }).join('');

    this.updateCompareDock();
  },

  toggleCompare(id) {
    CompareModule.toggleCompare(id);
    this.render();
  },

  updateCompareDock() {
    const list = CompareModule.getCompareList();
    const dock = document.getElementById('compareDock');
    const count = document.getElementById('dockCount');
    const navCount = document.getElementById('compareCount');
    if (navCount) navCount.innerText = list.length;
    if (count) count.innerText = list.length;
    if (dock) dock.style.display = list.length > 0 ? 'flex' : 'none';
  },

  openModal(id) {
    const phone = this.allPhones.find(p => p.id === id);
    if (!phone) return;
    document.getElementById('modalTitle').innerText = `${phone.brand} ${phone.model}`;
    document.getElementById('modalBody').innerHTML = `
      <div style="margin: 16px 0; font-size: 1.4rem; font-weight:800; color:var(--primary-indigo);">${Utils.formatINR(phone.price.inr)}</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.9rem;">
        <div><b>Launch Year:</b> ${phone.launchYear}</div>
        <div><b>Processor:</b> ${phone.specs?.processor || 'N/A'}</div>
        <div><b>Battery:</b> ${phone.specs?.battery || 'N/A'} mAh</div>
        <div><b>RAM:</b> ${(phone.specs?.ram || []).join('/')} GB</div>
        <div><b>Storage:</b> ${(phone.specs?.storage || []).join('/')} GB</div>
        <div><b>Main Camera:</b> ${phone.specs?.cameras?.main || 'N/A'} MP</div>
      </div>
      <div style="margin-top:16px; padding-top:12px; border-top:1px solid #e2e8f0;">
        <h4 style="margin-bottom:8px;">Performance Scores (out of 10)</h4>
        <div style="display:flex; gap:14px; font-size:0.85rem;">
          <span>🎮 Gaming: <b>${phone.useCases?.gaming || 8}/10</b></span>
          <span>📸 Camera: <b>${phone.useCases?.camera || 8}/10</b></span>
          <span>🔋 Battery: <b>${phone.useCases?.battery || 8}/10</b></span>
        </div>
      </div>
    `;
    document.getElementById('detailModal').style.display = 'flex';
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
