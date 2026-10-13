const DataModule = {
  cache: null,
  async loadPhones() {
    if (this.cache) return this.cache;
    try {
      const res = await fetch('smartphone-finder/data/phones.json');
      if (!res.ok) throw new Error('Network error reading database');
      this.cache = await res.json();
      return this.cache;
    } catch (err) {
      console.error('DataModule Error:', err);
      return [];
    }
  }
};
