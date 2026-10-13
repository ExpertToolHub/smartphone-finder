const DataModule = {
  cache: null,

  async loadPhones() {
    if (this.cache) return this.cache;

    const candidatePaths = [
      'smartphone-finder/data/phones.json',
      'data/phones.json',
      '../data/phones.json',
      '/smartphone-finder/data/phones.json',
      '/data/phones.json'
    ];

    let staticPhones = null;
    const cacheBuster = `?v=master_${Date.now()}`;

    for (const path of candidatePaths) {
      try {
        const res = await fetch(`${path}${cacheBuster}`);
        if (res.ok) {
          staticPhones = await res.json();
          break;
        }
      } catch (e) {
        // Fallback to next path
      }
    }

    if (!staticPhones || !Array.isArray(staticPhones)) {
      console.error('DataModule Error: phones.json load nahi ho saki.');
      return [];
    }

    const uniqueMap = new Map();

    staticPhones.forEach(p => {
      if (!p || !p.id) return;

      if (!uniqueMap.has(p.id)) {
        const specs = p.specs || {};
        const price = p.price || {};
        const useCases = p.useCases || {};

        const cleanPhone = {
          id: String(p.id),
          brand: p.brand || 'Other',
          model: p.model || 'Unknown Model',
          launchYear: Number(p.launchYear) || 2024,
          dataQuality: p.dataQuality || 'verified',
          price: {
            inr: Number(price.inr) || 0,
            platform: price.platform || 'Amazon / Flipkart',
            note: price.note || 'Verified Online Price'
          },
          specs: {
            processor: specs.processor || 'Octa-Core Processor',
            ram: Array.isArray(specs.ram) ? specs.ram : [Number(specs.ram) || 8],
            storage: Array.isArray(specs.storage) ? specs.storage : [Number(specs.storage) || 128],
            battery: Number(specs.battery) || 5000,
            display: {
              size: specs.display?.size || 6.67,
              refreshRate: specs.display?.refreshRate || 120,
              type: specs.display?.type || 'AMOLED'
            },
            cameras: {
              main: specs.cameras?.main || 50,
              front: specs.cameras?.front || 16
            }
          },
          useCases: {
            gaming: Number(useCases.gaming) || 8.0,
            camera: Number(useCases.camera) || 8.0,
            battery: Number(useCases.battery) || 8.5,
            value: Number(useCases.value) || 9.0
          }
        };

        uniqueMap.set(cleanPhone.id, cleanPhone);
      }
    });

    this.cache = Array.from(uniqueMap.values());
    console.log(`[DataModule] Loaded ${this.cache.length} master smartphones.`);
    return this.cache;
  }
};
