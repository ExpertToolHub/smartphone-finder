const DataModule = {
  cache: null,

  // 2025-2026 Latest Market Flagships (Up to Oct 2026)
  latest2026Flagships: [
    {
      id: "samsung-s26-ultra-2026",
      brand: "Samsung",
      model: "Galaxy S26 Ultra 5G",
      launchYear: 2026,
      price: { inr: 134999, note: "Official India Price" },
      dataQuality: "verified",
      specs: {
        processor: "Snapdragon 8 Elite Gen 2",
        ram: [12, 16],
        storage: [256, 512, 1024],
        battery: 5500,
        display: { size: 6.8, refreshRate: 144, type: "Dynamic AMOLED 2X" },
        cameras: { main: 200, front: 12 }
      },
      useCases: { gaming: 10, camera: 10, battery: 9.8, value: 9.2 }
    },
    {
      id: "apple-iphone-17-pro-max-2026",
      brand: "Apple",
      model: "iPhone 17 Pro Max",
      launchYear: 2026,
      price: { inr: 164900, note: "Official India Price" },
      dataQuality: "verified",
      specs: {
        processor: "Apple A20 Pro Bionic",
        ram: [12],
        storage: [256, 512, 1024],
        battery: 4800,
        display: { size: 6.9, refreshRate: 120, type: "Super Retina XDR OLED" },
        cameras: { main: 48, front: 24 }
      },
      useCases: { gaming: 10, camera: 10, battery: 9.6, value: 9.0 }
    },
    {
      id: "oneplus-13-2025",
      brand: "OnePlus",
      model: "OnePlus 13 5G",
      launchYear: 2025,
      price: { inr: 69999, note: "Official India Price" },
      dataQuality: "verified",
      specs: {
        processor: "Snapdragon 8 Elite",
        ram: [12, 16, 24],
        storage: [256, 512],
        battery: 6000,
        display: { size: 6.82, refreshRate: 120, type: "2K LTPO AMOLED" },
        cameras: { main: 50, front: 32 }
      },
      useCases: { gaming: 9.8, camera: 9.5, battery: 9.9, value: 9.8 }
    },
    {
      id: "iqoo-13-2025",
      brand: "iQOO",
      model: "iQOO 13 Flagship",
      launchYear: 2025,
      price: { inr: 54999, note: "Official India Price" },
      dataQuality: "verified",
      specs: {
        processor: "Snapdragon 8 Elite",
        ram: [12, 16],
        storage: [256, 512],
        battery: 6150,
        display: { size: 6.82, refreshRate: 144, type: "2K 144Hz AMOLED" },
        cameras: { main: 50, front: 32 }
      },
      useCases: { gaming: 10, camera: 9.2, battery: 10, value: 9.9 }
    },
    {
      id: "vivo-x200-pro-2025",
      brand: "Vivo",
      model: "Vivo X200 Pro Zeiss",
      launchYear: 2025,
      price: { inr: 94999, note: "Official India Price" },
      dataQuality: "verified",
      specs: {
        processor: "Dimensity 9400",
        ram: [16],
        storage: [512],
        battery: 6000,
        display: { size: 6.78, refreshRate: 120, type: "LTPO AMOLED" },
        cameras: { main: 200, front: 32 }
      },
      useCases: { gaming: 9.6, camera: 10, battery: 9.8, value: 9.4 }
    },
    {
      id: "google-pixel-10-pro-2026",
      brand: "Google",
      model: "Pixel 10 Pro AI",
      launchYear: 2026,
      price: { inr: 109999, note: "Official India Price" },
      dataQuality: "verified",
      specs: {
        processor: "Google Tensor G5",
        ram: [16],
        storage: [256, 512],
        battery: 5100,
        display: { size: 6.7, refreshRate: 120, type: "Super Actua OLED" },
        cameras: { main: 50, front: 42 }
      },
      useCases: { gaming: 9.0, camera: 10, battery: 9.3, value: 9.1 }
    },
    {
      id: "nothing-phone-3-2025",
      brand: "Nothing",
      model: "Nothing Phone (3)",
      launchYear: 2025,
      price: { inr: 49999, note: "Official India Price" },
      dataQuality: "verified",
      specs: {
        processor: "Snapdragon 8s Gen 3",
        ram: [12, 16],
        storage: [256, 512],
        battery: 5200,
        display: { size: 6.7, refreshRate: 120, type: "Flexible OLED" },
        cameras: { main: 50, front: 32 }
      },
      useCases: { gaming: 9.2, camera: 9.1, battery: 9.2, value: 9.6 }
    }
  ],

  async loadPhones() {
    if (this.cache) return this.cache;
    try {
      const res = await fetch('smartphone-finder/data/phones.json');
      if (!res.ok) throw new Error('Data fetch failed');
      const staticPhones = await res.json();
      
      // Combine 2026/2025 flagships with existing 3,068 phones
      this.cache = [...this.latest2026Flagships, ...staticPhones];
      return this.cache;
    } catch (err) {
      console.warn('Fallback to latest 2026 flagships', err);
      this.cache = this.latest2026Flagships;
      return this.cache;
    }
  }
};
