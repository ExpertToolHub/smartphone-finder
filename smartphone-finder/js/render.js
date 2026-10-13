const RenderModule = {
  renderCard(p, isCompared, rank = null) {
    const soc = p.specs.processor ? p.specs.processor.split(' ')[0] : 'Octa-Core';
    const battery = p.specs.battery ? `${p.specs.battery} mAh` : '5000 mAh';
    const ram = Array.isArray(p.specs.ram) ? p.specs.ram[0] : (p.specs.ram || '8');
    const camera = p.specs.cameras?.main ? `${p.specs.cameras.main} MP` : '50 MP';

    const rankTag = rank ? `<span class="rank-badge">🏆 #${rank} Top Choice</span>` : '';

    return `
    <div class="phone-card">
      <div class="card-top-tag-row">
        ${rankTag}
        <span class="launch-pill">${p.launchYear || '2026'}</span>
      </div>

      <div class="brand-sub">${Utils.escapeHTML(p.brand)}</div>
      <h3 class="phone-title">${Utils.escapeHTML(p.model)}</h3>
      <div class="phone-price">${Utils.formatINR(p.price.inr)}</div>

      <div class="specs-pills-wrap">
        <div class="spec-chip chip-soc">⚡ ${soc}</div>
        <div class="spec-chip chip-battery">🔋 ${battery}</div>
        <div class="spec-chip chip-ram">💾 ${ram}GB RAM</div>
        <div class="spec-chip chip-camera">📸 ${camera}</div>
      </div>

      <div class="card-actions">
        <button class="btn-card-specs" onclick="app.openModal('${p.id}')">View Specs</button>
        <button class="btn-card-compare ${isCompared ? 'active' : ''}" onclick="app.toggleCompare('${p.id}')">
          ${isCompared ? '✓ Added' : '+ Compare'}
        </button>
      </div>
    </div>`;
  }
};
