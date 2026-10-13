const RenderModule = {
  renderCard(p, isCompared, rank = null) {
    const soc = p.specs?.processor ? p.specs.processor.split(' ')[0] : 'Octa-Core';
    const battery = p.specs?.battery ? `${p.specs.battery} mAh` : '5000 mAh';
    const ram = Array.isArray(p.specs?.ram) ? p.specs.ram[0] : (p.specs?.ram || '8');
    const camera = p.specs?.cameras?.main ? `${p.specs.cameras.main} MP` : '50 MP';
    const platform = p.price?.platform || 'Amazon / Flipkart';

    const rankTag = rank ? `<span class="rank-badge">🏆 #${rank} Top Choice</span>` : '';

    return `
    <div class="phone-card">
      <div class="card-top-tag-row">
        ${rankTag}
        <span class="launch-pill">${p.launchYear || '2026'}</span>
      </div>

      <div class="brand-sub">${Utils.escapeHTML(p.brand)}</div>
      <h3 class="phone-title">${Utils.escapeHTML(p.model)}</h3>
      
      <!-- Price & Platform Row -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:6px;">
        <div class="phone-price" style="margin-bottom:0;">${Utils.formatINR(p.price?.inr)}</div>
        <span style="font-size:0.75rem; font-weight:700; color:#4338ca; background:#e0e7ff; padding:3px 10px; border-radius:999px; border:1px solid #c7d2fe;">
          🛒 ${Utils.escapeHTML(platform)}
        </span>
      </div>

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
