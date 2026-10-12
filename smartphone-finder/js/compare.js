const CompareModule = {
  KEY: 'sf_compare_ids',
  getCompareList() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },
  addToCompare(id) {
    const list = this.getCompareList();
    if (list.includes(id)) return false;
    if (list.length >= 4) {
      alert('You can compare a maximum of 4 smartphones at once.');
      return false;
    }
    list.push(id);
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return true;
  },
  removeFromCompare(id) {
    const list = this.getCompareList().filter(x => x !== id);
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },
  clear() {
    localStorage.removeItem(this.KEY);
  }
};
