window.ApiService = {
    async loadAll() {
      const res = await fetch('data/dataBahanAjar.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Gagal memuat data JSON');
      const data = await res.json();
      return data;
    }
  };