const CompareModule = {
  KEY: 'smartfinder_compare_v2',

  getCompareList() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  isInCompare(id) {
    return this.getCompareList().includes(id);
  },

  toggleCompare(id) {
    let list = this.getCompareList();
    if (list.includes(id)) {
      list = list.filter(item => item !== id);
    } else {
      if (list.length >= 4) {
        alert('Aap ek saath maximum 4 smartphones compare kar sakte hain!');
        return list;
      }
      list.push(id);
    }
    localStorage.setItem(this.KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('compare-updated'));
    return list;
  },

  removeFromCompare(id) {
    let list = this.getCompareList().filter(item => item !== id);
    localStorage.setItem(this.KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('compare-updated'));
    return list;
  },

  clear() {
    localStorage.removeItem(this.KEY);
    window.dispatchEvent(new Event('compare-updated'));
  }
};
