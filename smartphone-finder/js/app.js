const app = {
  allPhones: [],
  filteredPhones: [],
  filters: {
    search: '',
    maxPrice: 180000,
    minPrice: 0,
    brand: '',
    year: '',
    ram: null,
    storage: null,
    battery: null,
    camera: null,
    processor: '',
    useCase: null,
    topFilter: 'all',
    sort: 'newest'
  },

  async init() {
    this.allPhones = await DataModule.loadPhones();
    this.populateBrands();
    this.bindEvents();
    this.updateCompareDock();
    this.applyFilters();

    window.addEventListener('compare-updated', () => {
      this.updateCompareDock();
      this.render();
    });
  },

  bindEvents() {
    // Search Input
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
      this.filters.search = e.target.value.trim().toLowerCase();
      this.applyFilters();
    });

    // Price Slider
    const priceSlider = document.getElementById('priceRange');
    priceSlider?.addEventListener('input', (e) => {
      this.filters.maxPrice = Number(e.target.value);
      this.filters.minPrice = 0;
      document.getElementById('priceLabel').innerText = Utils.formatINR(e.target.value);
      document.querySelectorAll('.budget-preset-btn').forEach(b => b.classList.remove('active'));
      this.applyFilters();
    });

    // Quick Budget Presets
    document.querySelectorAll('.budget-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.budget-preset-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.filters.minPrice = Number(e.target.dataset.min || 0);
        this.filters.maxPrice = Number(e.target.dataset.max || 180000);
        if (priceSlider) priceSlider.value = this.filters.maxPrice;
        document.getElementById('priceLabel').innerText = Utils.formatINR(this.filters.maxPrice);
        this.applyFilters();
      });
    });

    // Select Dropdowns
    document.getElementById('brandSelect')?.addEventListener('change', (e) => {
      this.filters.brand = e.target.value;
      this.applyFilters();
    });

    document.getElementById('yearSelect')?.addEventListener('change', (e) => {
      this.filters.year = e.target.value;
      this.applyFilters();
    });

    document.getElementById('procSelect')?.addEventListener('change', (e) => {
      this.filters.processor = e.target.value;
      this.applyFilters();
    });

    document.getElementById('sortSelect')?.addEventListener('change', (e) => {
      this.filters.sort = e.target.value;
      this.applyFilters();
    });

    // Toggle Filter Pills (RAM, Storage, Battery, Camera, Use-case)
    const setupToggleGroup = (containerId, filterKey) => {
      document.querySelectorAll(`#${containerId} .pill-btn`).forEach(btn => {
        btn.addEventListener('click', (e) => {
          const val = e.target.dataset.val;
          if (this.filters[filterKey] === val) {
            this.filters[filterKey] = null;
            e.target.classList.remove('active');
          } else {
            document.querySelectorAll(`#${containerId} .pill-btn`).forEach(b => b.classList.remove('active'));
            this.filters[filterKey] = val;
            e.target.classList.add('active');
          }
          this.applyFilters();
        });
      });
    };

    setupToggleGroup('ramPills', 'ram');
    setupToggleGroup('storagePills', 'storage');
    setupToggleGroup('batteryPills', 'battery');
    setupToggleGroup('cameraPills', 'camera');

    // Priority Pills
    document.querySelectorAll('#useCasePills .pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const uc = e.target.dataset.usecase;
        if (this.filters.useCase === uc) {
          this.filters.useCase = null;
          e.target.classList.remove('active');
        } else {
          document.querySelectorAll('#useCasePills .pill-btn').forEach(b => b.classList.remove('active'));
          this.filters.useCase = uc;
          e.target.classList.add('active');
        }
        this.applyFilters();
      });
    });

    // Top 10 / Top 20 Best Quick Filter Bar
    document.querySelectorAll('.top-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.top-pill').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.filters.topFilter = e.target.dataset.top;
        this.applyFilters();
      });
    });

    // Reset All Filters
    document.getElementById('resetFilters')?.addEventListener('click', () => {
      this.resetAllFilters();
    });

    // Mobile Sidebar Toggles
    document.getElementById('mobileFilterToggle')?.addEventListener('click', () => {
      document.getElementById('filterSidebar')?.classList.add('open');
    });
    document.getElementById('closeFilterMobile')?.addEventListener('click', () => {
      document.getElementById('filterSidebar')?.classList.remove('open');
    });
    document.getElementById('closeModal')?.addEventListener('click', () => {
      document.getElementById('detailModal').style.display = 'none';
    });
  },

  resetAllFilters() {
    this.filters = {
      search: '',
      maxPrice: 180000,
      minPrice: 0,
      brand: '',
      year: '',
      ram: null,
      storage: null,
      battery: null,
      camera: null,
      processor: '',
      useCase: null,
      topFilter: 'all',
      sort: 'newest'
    };

    if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
    if (document.getElementById('priceRange')) document.getElementById('priceRange').value = 180000;
    if (document.getElementById('priceLabel')) document.getElementById('priceLabel').innerText = '₹1,80,000';
    if (document.getElementById('brandSelect')) document.getElementById('brandSelect').value = '';
    if (document.getElementById('yearSelect')) document.getElementById('yearSelect').value = '';
    if (document.getElementById('procSelect')) document.getElementById('procSelect').value = '';
    if (document.getElementById('sortSelect')) document.getElementById('sortSelect').value = 'newest';

    document.querySelectorAll('.pill-btn, .budget-preset-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.top-pill').forEach(b => b.classList.remove('active'));
    document.querySelector('.top-pill[data-top="all"]')?.classList.add('active');

    this.applyFilters();
  },

  populateBrands() {
    const brandSelect = document.getElementById('brandSelect');
    if (!brandSelect) return;
    const brands = [...new Set(this.allPhones.map(p => p.brand).filter(Boolean))].sort();
    brands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.innerText = b;
      brandSelect.appendChild(opt);
    });
  },

  applyFilters() {
    let result = this.allPhones.filter(p => {
      // 1. Price Range
      const price = p.price?.inr || 0;
      if (price < this.filters.minPrice || price > this.filters.maxPrice) return false;

      // 2. Brand
      if (this.filters.brand && p.brand !== this.filters.brand) return false;

      // 3. Launch Year
      if (this.filters.year && String(p.launchYear) !== this.filters.year) return false;

      // 4. Processor Type
      if (this.filters.processor) {
        const chip = (p.specs?.processor || '').toLowerCase();
        if (!chip.includes(this.filters.processor.toLowerCase())) return false;
      }

      // 5. Min RAM
      if (this.filters.ram) {
        const requiredRam = Number(this.filters.ram);
        const ramList = Array.isArray(p.specs?.ram) ? p.specs.ram : [Number(p.specs?.ram) || 0];
        const maxDeviceRam = Math.max(...ramList);
        if (maxDeviceRam < requiredRam) return false;
      }

      // 6. Min Storage
      if (this.filters.storage) {
        const requiredStorage = Number(this.filters.storage);
        const storageList = Array.isArray(p.specs?.storage) ? p.specs.storage : [Number(p.specs?.storage) || 0];
        const maxDeviceStorage = Math.max(...storageList);
        if (maxDeviceStorage < requiredStorage) return false;
      }

      // 7. Min Battery
      if (this.filters.battery) {
        const batteryCap = p.specs?.battery || 0;
        if (batteryCap < Number(this.filters.battery)) return false;
      }

      // 8. Main Camera MP
      if (this.filters.camera) {
        const camMp = p.specs?.cameras?.main || 0;
        if (camMp < Number(this.filters.camera)) return false;
      }

      // 9. Priority Use-Case Score
      if (this.filters.useCase) {
        const score = p.useCases?.[this.filters.useCase] || 0;
        if (score < 8.0) return false;
      }

      // 10. Search Query Text
      if (this.filters.search) {
        const searchBlob = `${p.brand} ${p.model} ${p.specs?.processor || ''} ${p.specs?.battery || ''} ${p.launchYear || ''}`.toLowerCase();
        if (!searchBlob.includes(this.filters.search)) return false;
      }

      return true;
    });

    // Composite Rating Score (Gaming + Camera + Battery + Value)
    const calcScore = (p) => {
      const g = p.useCases?.gaming || 7;
      const c = p.useCases?.camera || 7;
      const b = p.useCases?.battery || 7;
      const v = p.useCases?.value || 7;
      return (g * 0.25) + (c * 0.3) + (b * 0.2) + (v * 0.25);
    };

    // Quick Top Handler
    if (this.filters.topFilter === '10') {
      result.sort((a, b) => calcScore(b) - calcScore(a));
      result = result.slice(0, 10);
    } else if (this.filters.topFilter === '20') {
      result.sort((a, b) => calcScore(b) - calcScore(a));
      result = result.slice(0, 20);
    } else if (this.filters.topFilter === 'camera') {
      result.sort((a, b) => (b.useCases?.camera || 0) - (a.useCases?.camera || 0));
      result = result.slice(0, 15);
    } else if (this.filters.topFilter === 'gaming') {
      result.sort((a, b) => (b.useCases?.gaming || 0) - (a.useCases?.gaming || 0));
      result = result.slice(0, 15);
    } else if (this.filters.topFilter === 'budget') {
      result = result.filter(p => p.price?.inr <= 20000);
      result.sort((a, b) => (b.useCases?.value || 0) - (a.useCases?.value || 0));
      result = result.slice(0, 15);
    } else {
      // Sorting
      if (this.filters.sort === 'newest') result.sort((a, b) => (b.launchYear || 2024) - (a.launchYear || 2024));
      else if (this.filters.sort === 'best') result.sort((a, b) => calcScore(b) - calcScore(a));
      else if (this.filters.sort === 'price-asc') result.sort((a, b) => a.price.inr - b.price.inr);
      else if (this.filters.sort === 'price-desc') result.sort((a, b) => b.price.inr - a.price.inr);
      else if (this.filters.sort === 'battery') result.sort((a, b) => (b.specs?.battery || 0) - (a.specs?.battery || 0));
      else if (this.filters.sort === 'ram') {
        result.sort((a, b) => {
          const ramA = Math.max(...(Array.isArray(a.specs?.ram) ? a.specs.ram : [0]));
          const ramB = Math.max(...(Array.isArray(b.specs?.ram) ? b.specs.ram : [0]));
          return ramB - ramA;
        });
      }
    }

    this.filteredPhones = result;
    this.render();
  },

  render() {
    const grid = document.getElementById('phoneGrid');
    const countEl = document.getElementById('matchCount');
    const loadingView = document.getElementById('loadingView');
    const emptyView = document.getElementById('emptyView');

    if (loadingView) loadingView.style.display = 'none';
    if (countEl) countEl.innerText = this.filteredPhones.length;

    if (this.filteredPhones.length === 0) {
      grid.innerHTML = '';
      if (emptyView) emptyView.style.display = 'block';
      return;
    }

    if (emptyView) emptyView.style.display = 'none';
    const isTopMode = ['10', '20'].includes(this.filters.topFilter);

    grid.innerHTML = this.filteredPhones.map((p, index) => {
      const isCompared = CompareModule.isInCompare(p.id);
      const rank = isTopMode ? index + 1 : null;
      return RenderModule.renderCard(p, isCompared, rank);
    }).join('');
  },

  toggleCompare(id) {
    CompareModule.toggleCompare(id);
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
      <div style="margin: 14px 0; font-size: 1.5rem; font-weight:800; color:var(--primary-indigo);">${Utils.formatINR(phone.price.inr)}</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:0.9rem;">
        <div><b>Launch Year:</b> ${phone.launchYear}</div>
        <div><b>Processor:</b> ${phone.specs?.processor || 'N/A'}</div>
        <div><b>Battery:</b> ${phone.specs?.battery ? phone.specs.battery + ' mAh' : 'N/A'}</div>
        <div><b>RAM:</b> ${(Array.isArray(phone.specs?.ram) ? phone.specs.ram.join('/') : phone.specs?.ram) || 'N/A'} GB</div>
        <div><b>Storage:</b> ${(Array.isArray(phone.specs?.storage) ? phone.specs.storage.join('/') : phone.specs?.storage) || 'N/A'} GB</div>
        <div><b>Display:</b> ${phone.specs?.display?.size || 'N/A'}" ${phone.specs?.display?.refreshRate || ''}Hz ${phone.specs?.display?.type || ''}</div>
        <div><b>Main Camera:</b> ${phone.specs?.cameras?.main ? phone.specs.cameras.main + ' MP' : 'N/A'}</div>
        <div><b>Front Camera:</b> ${phone.specs?.cameras?.front ? phone.specs.cameras.front + ' MP' : 'N/A'}</div>
      </div>
      <div style="margin-top:16px; padding-top:14px; border-top:1px solid #e2e8f0;">
        <h4 style="margin-bottom:8px; font-size:0.95rem;">Performance Ratings</h4>
        <div style="display:flex; flex-wrap:wrap; gap:12px; font-size:0.85rem;">
          <span style="background:#fffbeb; padding:4px 10px; border-radius:6px; color:#92400e;">🎮 Gaming: <b>${phone.useCases?.gaming || 8}/10</b></span>
          <span style="background:#f0f9ff; padding:4px 10px; border-radius:6px; color:#0369a1;">📸 Camera: <b>${phone.useCases?.camera || 8}/10</b></span>
          <span style="background:#f0fdf4; padding:4px 10px; border-radius:6px; color:#166534;">🔋 Battery: <b>${phone.useCases?.battery || 8}/10</b></span>
          <span style="background:#faf5ff; padding:4px 10px; border-radius:6px; color:#6b21a8;">💎 Value: <b>${phone.useCases?.value || 8}/10</b></span>
        </div>
      </div>
    `;
    document.getElementById('detailModal').style.display = 'flex';
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
