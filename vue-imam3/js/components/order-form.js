Vue.component('order-form', {
    template: '#tpl-order',
    props: {
      paket: { type: Array, required: true },
      ekspedisi: { type: Array, required: true },  // pengirimanList (REG/EXP)
      stok: { type: Array, required: true },
      tracking: { type: Array, required: true }    // untuk menambahkan DO baru
    },
    data(){
      return {
        form: {
          nim: '', nama: '',
          ekspedisi: (this.ekspedisi[0] && this.ekspedisi[0].kode) || 'REG',
          paketKode: '',
          tanggalKirim: '',  // "YYYY-MM-DD"
          total: 0
        },
        paketDetail: null,
        msg: ''
      };
    },
    filters: {
      rupiah(v){ if(isNaN(v)) return v; return 'Rp ' + (v||0).toLocaleString('id-ID'); },
      tglIndo(iso){
        if (!iso) return '';
        const [y,m,d] = iso.split('-').map(Number);
        const bln = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        return `${d} ${bln[m-1]} ${y}`;
      }
    },
    watch: {
      // Watcher: perubahan paket → update total & detail isi
      'form.paketKode': function(k){
        const p = this.paket.find(x => x.kode === k);
        this.paketDetail = p || null;
        this.form.total = p ? Number(p.harga||0) : 0;
      }
    },
    methods: {
      pad(n, len=4){ return String(n).padStart(len,'0'); },
      nextDoNumber(){
        const year = new Date().getFullYear();
        const re = new RegExp(`^DO${year}-(\\d+)$`);
        let max = 0;
        for (const obj of this.tracking) {
          const key = Object.keys(obj)[0]||'';
          const m = key.match(re);
          if (m) max = Math.max(max, parseInt(m[1],10));
        }
        return `DO${year}-${this.pad(max+1,4)}`; // mengikuti contoh file JSON → DO2025-0001
      },
      today(){ 
        const d = new Date(); const p=n=>String(n).padStart(2,'0');
        this.form.tanggalKirim = `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
      },
      valid(){
        if (!this.form.nim || !/^\d{5,}$/.test(this.form.nim)) { this.msg = 'NIM minimal 5 digit angka.'; return false; }
        if (!this.form.nama.trim()) { this.msg = 'Nama wajib diisi.'; return false; }
        if (!this.form.paketKode) { this.msg = 'Paket wajib dipilih.'; return false; }
        if (!this.form.tanggalKirim) { this.msg = 'Tanggal kirim wajib diisi.'; return false; }
        this.msg = ''; return true;
      },
      submit(){
        if (!this.valid()) return;
        const doNo = this.nextDoNumber();
        const p = this.paket.find(x => x.kode === this.form.paketKode);
        const kirim = {
          nim: this.form.nim,
          nama: this.form.nama,
          status: 'Dalam Perjalanan',
          ekspedisi: (this.ekspedisi.find(e => e.kode===this.form.ekspedisi)||{}).nama || this.form.ekspedisi,
          tanggalKirim: this.form.tanggalKirim,
          paket: this.form.paketKode,
          total: this.form.total,
          perjalanan: []
        };
        const copy = this.tracking.slice();
        copy.push({ [doNo]: kirim });
        this.$emit('update:tracking', copy);
        // reset form
        this.form = { nim:'', nama:'', ekspedisi:(this.ekspedisi[0] && this.ekspedisi[0].kode)||'REG', paketKode:'', tanggalKirim:'', total:0 };
        this.paketDetail = null;
        alert(`Delivery Order berhasil dibuat: ${doNo}`);
      }
    }
  });