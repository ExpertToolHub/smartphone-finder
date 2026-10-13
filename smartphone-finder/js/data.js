const DataModule = {
  cache: null,

  async loadPhones() {
    if (this.cache) return this.cache;
    try {
      const res = await fetch('smartphone-finder/data/phones.json');
      if (!res.ok) throw new Error('Data fetch failed');
      const staticPhones = await res.json();

      // Duplicate IDs ko filter karke unique banana
      const uniqueMap = new Map();
      staticPhones.forEach(p => {
        if (!uniqueMap.has(p.id)) {
          uniqueMap.set(p.id, p);
        }
      });

      this.cache = Array.from(uniqueMap.values());
      return this.cache;
    } catch (err) {
      console.error('DataModule Error:', err);
      return [];
    }
  }
};
