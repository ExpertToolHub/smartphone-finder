const FilterModule = {
  applyFilters(phones, { maxPrice, brand, minRam, year, useCasePriority }) {
    return phones.filter(p => {
      if (maxPrice && p.price.inr !== null && p.price.inr > maxPrice) return false;
      if (brand && p.brand !== brand) return false;
      if (year) {
        if (year === '2020') {
          if (p.launchYear > 2020) return false;
        } else if (p.launchYear !== Number(year)) {
          return false;
        }
      }
      if (minRam && !p.specs.ram.some(r => r >= minRam)) return false;
      if (useCasePriority && p.useCases[useCasePriority] < 8) return false;
      return true;
    });
  },
  sortPhones(phones, sortKey) {
    const arr = [...phones];
    switch (sortKey) {
      case 'price-asc': return arr.sort((a,b) => (a.price.inr || 999999) - (b.price.inr || 999999));
      case 'price-desc': return arr.sort((a,b) => (b.price.inr || 0) - (a.price.inr || 0));
      case 'battery': return arr.sort((a,b) => (b.specs.battery || 0) - (a.specs.battery || 0));
      case 'ram': return arr.sort((a,b) => Math.max(...b.specs.ram) - Math.max(...a.specs.ram));
      case 'newest':
      default: return arr.sort((a,b) => b.launchYear - a.launchYear);
    }
  }
};
