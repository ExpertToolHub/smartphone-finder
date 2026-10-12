const SearchModule = {
  search(phones, query) {
    if (!query || !query.trim()) return phones;
    const q = query.toLowerCase().trim();
    return phones.filter(p => {
      return p.brand.toLowerCase().includes(q) ||
             p.model.toLowerCase().includes(q) ||
             (p.specs.processor && p.specs.processor.toLowerCase().includes(q));
    });
  }
};
