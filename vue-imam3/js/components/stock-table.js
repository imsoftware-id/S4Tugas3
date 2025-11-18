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
      startEdit(idx){
        this.editIdx = idx;
        this.editDraft = JSON.parse(JSON.stringify(this.items[idx]));
      },
      saveEdit(){
        if (this.editIdx < 0) return;
        const copy = this.items.slice();
        copy.splice(this.editIdx, 1, JSON.parse(JSON.stringify(this.editDraft)));
        this.$emit('update:items', copy);
        this.cancelEdit();
      },
      cancelEdit(){
        this.editIdx = -1;
        this.editDraft = null;
      },
      // DELETE
      askDelete(idx){
        this.modal.idx = idx;
        this.modal.show = true;
      },
      doDelete(){
        const idx = this.modal.idx;
        const copy = this.items.slice();
        copy.splice(idx,1);
        this.$emit('update:items', copy);
        this.modal.show = false;
        this.modal.idx = -1;
      }
    }
  });