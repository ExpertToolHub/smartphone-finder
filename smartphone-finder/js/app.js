const app = {
  allPhones: [],
  filteredPhones: [],
  activeFilters: { maxPrice: 160000, brand: '', minRam: null, year: '', useCasePriority: null },
  activeSort: 'newest',
  searchQuery: '',
  currentPage: 1,
  pageSize: 24,

  async init() {
    this.allPhones = await DataModule.loadPhones();
    document.getElementById('loadingView').style.display = 'none';
    this.populateBrands();
    this.bindEvents();
    this.updateUI();
  },

  populateBrands() {
    const brands = [...new Set(this.allPhones.map(p => p.brand))].sort();
    const sel = document.getElementById('brandSelect');
    brands.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b; opt.textContent = b;
      sel.appendChild(opt);
    });
  },

  bindEvents() {
    document.getElementById('searchInput').addEventListener('input', Utils.debounce((e) => {
      this.searchQuery = e.target.value;
      this.currentPage = 1;
      this.updateUI();
    }, 250));

    document.getElementById('priceRange').addEventListener('input', (e) => {
      this.activeFilters.maxPrice = Number(e.target.value);
      document.getElementById('priceLabel').textContent = Utils.formatINR(this.activeFilters.maxPrice);
      this.currentPage = 1;
      this.updateUI();
    });

    document.getElementById('brandSelect').addEventListener('change', (e) => {
      this.activeFilters.brand = e.target.value;
      this.currentPage = 1;
      this.updateUI();
    });

    document.getElementById('yearSelect').addEventListener('change', (e) => {
      this.activeFilters.year = e.target.value;
      this.currentPage = 1;
      this.updateUI();
    });

    document.getElementById('sortSelect').addEventListener('change', (e) => {
      this.activeSort = e.target.value;
      this.updateUI();
    });

    document.querySelectorAll('#ramPills button').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = Number(btn.dataset.val);
        this.activeFilters.minRam = this.activeFilters.minRam === val ? null : val;
        document.querySelectorAll('#ramPills button').forEach(b => b.classList.remove('active'));
        if (this.activeFilters.minRam) btn.classList.add('active');
        this.currentPage = 1;
        this.updateUI();
      });
    });

    document.querySelectorAll('#useCasePills button').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.usecase;
        this.activeFilters.useCasePriority = this.activeFilters.useCasePriority === val ? null : val;
        document.querySelectorAll('#useCasePills button').forEach(b => b.classList.remove('active'));
        if (this.activeFilters.useCasePriority) btn.classList.add('active');
        this.currentPage = 1;
        this.updateUI();
      });
    });

    document.getElementById('resetFilters').addEventListener('click', () => {
      this.activeFilters = { maxPrice: 160000, brand: '', minRam: null, year: '', useCasePriority: null };
      document.getElementById('priceRange').value = 160000;
      document.getElementById('priceLabel').textContent = '₹1,60,000';
      document.getElementById('brandSelect').value = '';
      document.getElementById('yearSelect').value = '';
      document.querySelectorAll('#ramPills button, #useCasePills button').forEach(b => b.classList.remove('active'));
      this.currentPage = 1;
      this.updateUI();
    });

    document.getElementById('closeModal').addEventListener('click', () => {
      document.getElementById('detailModal').classList.remove('open');
    });

    const sidebar = document.getElementById('filterSidebar');
    document.getElementById('mobileFilterToggle')?.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      document.getElementById('closeFilterMobile').style.display = 'block';
    });
    document.getElementById('closeFilterMobile')?.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  },

  updateUI() {
    let list = SearchModule.search(this.allPhones, this.searchQuery);
    list = FilterModule.applyFilters(list, this.activeFilters);
    list = FilterModule.sortPhones(list, this.activeSort);
    this.filteredPhones = list;

    const compareList = CompareModule.getCompareList();
    document.getElementById('compareCount').textContent = compareList.length;
    document.getElementById('dockCount').textContent = compareList.length;
    document.getElementById('compareDock').classList.toggle('show', compareList.length > 0);

    const grid = document.getElementById('phoneGrid');
    document.getElementById('matchCount').textContent = list.length;

    if (list.length === 0) {
      grid.innerHTML = '';
      document.getElementById('emptyView').style.display = 'block';
      document.getElementById('paginationBar').style.display = 'none';
      return;
    }

    document.getElementById('emptyView').style.display = 'none';
    document.getElementById('paginationBar').style.display = 'flex';

    // Pagination slice
    const totalPages = Math.ceil(list.length / this.pageSize);
    if (this.currentPage > totalPages) this.currentPage = 1;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const pagedItems = list.slice(startIndex, startIndex + this.pageSize);

    grid.innerHTML = pagedItems.map(p => RenderModule.renderCard(p, compareList.includes(p.id))).join('');

    // Pagination info
    const endIndex = Math.min(startIndex + this.pageSize, list.length);
    document.getElementById('paginationInfo').textContent = `Showing ${startIndex + 1}–${endIndex} of ${list.length.toLocaleString()} phones`;

    this.renderPaginationControls(totalPages);
  },

  renderPaginationControls(totalPages) {
    const controls = document.getElementById('paginationControls');
    controls.innerHTML = '';

    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-outline page-btn';
    prevBtn.textContent = '← Prev';
    prevBtn.disabled = this.currentPage === 1;
    prevBtn.onclick = () => { this.currentPage--; this.updateUI(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    controls.appendChild(prevBtn);

    const span = document.createElement('span');
    span.style.fontSize = '0.85rem';
    span.style.padding = '0 8px';
    span.textContent = `Page ${this.currentPage} of ${totalPages}`;
    controls.appendChild(span);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-outline page-btn';
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = this.currentPage === totalPages;
    nextBtn.onclick = () => { this.currentPage++; this.updateUI(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    controls.appendChild(nextBtn);
  },

  toggleCompare(id) {
    if (CompareModule.getCompareList().includes(id)) {
      CompareModule.removeFromCompare(id);
    } else {
      CompareModule.addToCompare(id);
    }
    this.updateUI();
  },

  openModal(id) {
    const p = this.allPhones.find(x => x.id === id);
    if (!p) return;
    document.getElementById('modalTitle').textContent = `${p.brand} ${p.model}`;
    document.getElementById('modalQualityBadge').className = `badge badge-${p.dataQuality}`;
    document.getElementById('modalQualityBadge').textContent = p.dataQuality;

    document.getElementById('modalBody').innerHTML = `
      <div style="font-size:0.86rem; color:var(--text-secondary); margin:12px 0; display:flex; flex-direction:column; gap:8px;">
        <p><b>Launch MRP:</b> ${Utils.formatINR(p.price.inr)} <span style="font-size:0.75rem; color:var(--text-muted);">(${p.price.note || ''})</span></p>
        <p><b>SoC / Processor:</b> ${p.specs.processor || 'N/A'}</p>
        <p><b>Display:</b> ${p.specs.display.size || 'N/A'}" ${p.specs.display.refreshRate || ''}Hz (${p.specs.display.type || ''})</p>
        <p><b>RAM Options:</b> ${p.specs.ram.join(', ')} GB</p>
        <p><b>Storage Options:</b> ${p.specs.storage.join(', ')} GB</p>
        <p><b>Cameras:</b> Main: ${p.specs.cameras.main || 'N/A'}MP | Front: ${p.specs.cameras.front || 'N/A'}MP</p>
        <p><b>Battery:</b> ${p.specs.battery ? p.specs.battery + ' mAh' : 'N/A'}</p>
        <p><b>OS:</b> ${p.specs.os || 'N/A'}</p>
        
        <div style="margin-top:10px; border-top:1px solid var(--border); padding-top:10px;">
          <h4 style="color:var(--text-primary); margin-bottom:8px;">Use-Case Ratings</h4>
          ${['gaming', 'camera', 'battery', 'dailyUse', 'value'].map(k => `
            <div style="margin-bottom:6px;">
              <div style="display:flex; justify-content:space-between; font-size:0.78rem;">
                <span style="text-transform:capitalize;">${k}</span>
                <b>${p.useCases[k]}/10</b>
              </div>
              <div class="score-bar"><div class="score-fill" style="width:${p.useCases[k]*10}%"></div></div>
            </div>
          `).join('')}
        </div>
        <p style="margin-top:8px; font-size:0.75rem; color:var(--text-muted);"><b>Source:</b> ${p.source}</p>
      </div>
    `;
    document.getElementById('detailModal').classList.add('open');
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
