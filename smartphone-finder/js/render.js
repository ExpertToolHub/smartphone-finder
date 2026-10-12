const RenderModule = {
  renderCard(p, isCompared) {
    const imgUrl = p.image || 'assets/placeholder-phone.svg';
    return `
    <div class="phone-card">
      <div class="card-preview">
        <img src="${imgUrl}" alt="${Utils.escapeHTML(p.model)}" loading="lazy">
      </div>
      <div class="card-header">
        <div>
          <div class="card-brand">${Utils.escapeHTML(p.brand)} (${p.launchYear})</div>
          <div class="card-title">${Utils.escapeHTML(p.model)}</div>
        </div>
        <span class="badge badge-${p.dataQuality}">${p.dataQuality}</span>
      </div>
      <div class="card-price">${Utils.formatINR(p.price.inr)}</div>
      <div class="card-specs-list">
        <div class="spec-pill">⚡ ${p.specs.processor ? p.specs.processor.split(' ')[0] : 'SoC'}</div>
        <div class="spec-pill">🔋 ${p.specs.battery ? p.specs.battery + ' mAh' : 'Battery N/A'}</div>
        <div class="spec-pill">💾 ${p.specs.ram.join('/')} GB RAM</div>
        <div class="spec-pill">📸 ${p.specs.cameras.main ? p.specs.cameras.main + ' MP' : 'Camera N/A'}</div>
      </div>
      <div style="display:flex; gap:8px; margin-top:auto; padding-top:6px;">
        <button class="btn btn-primary" style="flex:1;" onclick="app.openModal('${p.id}')">Specs</button>
        <button class="btn btn-outline ${isCompared ? 'active' : ''}" onclick="app.toggleCompare('${p.id}')">
          ${isCompared ? 'Added' : '+ Compare'}
        </button>
      </div>
    </div>`;
  }
};
