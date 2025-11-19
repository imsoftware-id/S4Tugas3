Vue.component('ba-stock-table', {
    template: '#tpl-stock',
    props: {
      items: { type: Array, required: true },           // v-bind:items.sync
      upbjjList: { type: Array, required: true },
      kategoriList: { type: Array, required: true }
    },
    data() {
      return {
        // filter & sort
        selectedUpbjj: '',
        selectedKategori: '',
        onlyReorder: false, // qty < safety (termasuk kosong)
        onlyEmpty: false,   // qty == 0
        sortKey: 'judul',
        sortDir: 'asc',
        q: '',              // pencarian cepat
        // form tambah
        addOpen: false,
        newItem: this.blankItem(),
        // edit state
        editIdx: -1,
        editDraft: null,
        // modal hapus
        modal: { show: false, idx: -1 }
      };
    },
    filters: {
      rupiah(v){ if(isNaN(v)) return v; return 'Rp ' + (v||0).toLocaleString('id-ID'); },
      buah(v){ if(isNaN(v)) return v; return v + ' buah'; }
    },
    computed: {
      // opsi kategori tergantung UPBJJ terpilih (dependent options)
      availableKategori() {
        if (!this.selectedUpbjj) return this.kategoriList;
        const set = new Set(
          this.items.filter(x => x.upbjj === this.selectedUpbjj).map(x => x.kategori)
        );
        return this.kategoriList.filter(k => set.has(k));
      },
      filteredSorted() {
        let arr = this.items.slice();
  
        // cari
        if (this.q.trim()) {
          const s = this.q.trim().toLowerCase();
          arr = arr.filter(x =>
            (x.kode && x.kode.toLowerCase().includes(s)) ||
            (x.judul && x.judul.toLowerCase().includes(s))
          );
        }
        // filter upbjj
        if (this.selectedUpbjj) arr = arr.filter(x => x.upbjj === this.selectedUpbjj);
        // filter kategori (aktif setelah UPBJJ dipilih → dependent)
        if (this.selectedKategori) arr = arr.filter(x => x.kategori === this.selectedKategori);
  
        // filter reorder/kosong
        if (this.onlyEmpty) arr = arr.filter(x => x.qty === 0);
        else if (this.onlyReorder) arr = arr.filter(x => x.qty === 0 || x.qty < x.safety);
  
        // sort
        const key = this.sortKey;
        const dir = this.sortDir === 'asc' ? 1 : -1;
        arr.sort((a,b) => {
          const av = a[key], bv = b[key];
          if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
          return String(av).localeCompare(String(bv), 'id') * dir;
        });
        return arr;
      }
    },
    watch: {
      // Watcher 1: ganti UPBJJ → reset kategori agar tidak "nyangkut"
      selectedUpbjj(){
        this.selectedKategori = '';
      },
      // Watcher 2: ubah paket pencarian → debounce ringan untuk mengurangi recompute
      q: {
        handler(newVal) {
          clearTimeout(this._qTimer);
          this._qTimer = setTimeout(() => { /* trigger computed by changing a dummy */ this._qReady = newVal; }, 180);
        }, immediate:false
      }
    },
    methods: {
      blankItem(){
        return { kode:'', judul:'', kategori:'', upbjj:'', lokasiRak:'', harga:0, qty:0, safety:0, catatanHTML:'' };
      },
      resetFilters(){
        this.selectedUpbjj = '';
        this.selectedKategori = '';
        this.onlyReorder = false;
        this.onlyEmpty = false;
        this.q = '';
        this.sortKey = 'judul';
        this.sortDir = 'asc';
      },
      toggleSort(k){
        if (this.sortKey === k) this.sortDir = (this.sortDir === 'asc' ? 'desc' : 'asc');
        else { this.sortKey = k; this.sortDir = 'asc'; }
      },
      // CREATE
      submitAdd(){
        const n = this.newItem;
        if (!n.kode || !n.judul || !n.kategori || !n.upbjj) { alert('Harap lengkapi minimal: kode, judul, kategori, upbjj'); return; }
        ['harga','qty','safety'].forEach(f => n[f] = Number(n[f]||0));
        const copy = this.items.slice();
        copy.push(JSON.parse(JSON.stringify(n)));
        this.$emit('update:items', copy);
        this.newItem = this.blankItem();
        this.addOpen = false;
      },
      // UPDATE (inline row edit)
      startEdit(visualIndex) {
          this.editIdx = visualIndex; // Simpan i agar v-if="editIdx === i" bernilai true
          
          // 1. Ambil objek item berdasarkan urutan TAMPILAN
          const itemVisual = this.filteredSorted[visualIndex];
          
          // 2. Copy data ke draft
          this.editDraft = JSON.parse(JSON.stringify(itemVisual));
        },
saveEdit() {
    if (this.editIdx < 0) return;

    // 1. Kita butuh tahu item mana yang sedang diedit
    // Karena filter/sort mungkin berubah, kita ambil lagi item dari filteredSorted berdasarkan editIdx
    const itemVisual = this.filteredSorted[this.editIdx];

    // 2. Cari indeks ASLI item tersebut di array utama (items)
    // Kita pakai indexOf untuk mencari posisi objek yang sama persis di memori
    const realIndex = this.items.indexOf(itemVisual);

    // 3. Update data di array ASLI
    if (realIndex > -1) {
      const copy = this.items.slice();
      copy.splice(realIndex, 1, JSON.parse(JSON.stringify(this.editDraft)));
      this.$emit('update:items', copy);
    }

    this.cancelEdit();
  },

  cancelEdit() {
    this.editIdx = -1;
    this.editDraft = null;
  },

  // --- LOGIKA DELETE ---
  askDelete(visualIndex) {
    // 1. Ambil item berdasarkan urutan TAMPILAN
    const itemVisual = this.filteredSorted[visualIndex];

    // 2. Cari indeks ASLI di array utama
    const realIndex = this.items.indexOf(itemVisual);

    // 3. Simpan indeks ASLI ini ke modal, bukan indeks visual
    this.modal.idx = realIndex; 
    this.modal.show = true;
  },

  doDelete() {
    const realIdx = this.modal.idx; // Ini sudah indeks asli dari askDelete tadi

    if (realIdx > -1) {
      const copy = this.items.slice();
      copy.splice(realIdx, 1); // Hapus aman karena pakai index asli
      this.$emit('update:items', copy);
    }

    this.modal.show = false;
    this.modal.idx = -1;
  }
    }
  });