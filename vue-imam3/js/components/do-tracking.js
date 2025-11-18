Vue.component('do-tracking', {
    template: '#tpl-tracking',
    props: {
      data: { type: Array, required: true },       // array of { "DOyyyy-nnnn": {...} }
      paket: { type: Array, required: true },
      ekspedisi: { type: Array, required: true }   // pengirimanList
    },
    data(){
      return {
        q: '',                            // keyword: nomor DO atau NIM
        progressText: {},                 // map doNo -> input text untuk tambah status
        // form tambah perjalanan via Enter
      };
    },
    filters: {
      rupiah(v){ if(isNaN(v)) return v; return 'Rp ' + (v||0).toLocaleString('id-ID'); },
      tglIndo(iso){
        // input "YYYY-MM-DD" → "25 Agustus 2025"
        if (!iso) return '';
        const [y,m,d] = iso.split('-').map(Number);
        const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        return `${d} ${bulan[m-1]} ${y}`;
      }
    },
    computed: {
      // Normalisasi: [{no:'DO2025-0001', detail:{...}}, ...]
      list(){
        const out = [];
        const seen = new Set();
        for (const obj of this.data) {
          const no = Object.keys(obj)[0];
          if (seen.has(no)) continue;
          seen.add(no);
          out.push({ no, detail: obj[no] });
        }
        // urut terbaru di atas (berdasar tanggalKirim+no)
        out.sort((a,b) => String(b.no).localeCompare(String(a.no)));
        return out;
      },
      filtered(){
        if (!this.q.trim()) return this.list;
        const s = this.q.trim().toLowerCase();
        return this.list.filter(x => x.no.toLowerCase().includes(s) || (x.detail.nim||'').toLowerCase().includes(s));
      }
    },
    methods: {
      clear(){ this.q = ''; },
      nowStr(){
        const pad = n => String(n).padStart(2,'0');
        const dt = new Date();
        return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
      },
      addProgress(doNo){
        const txt = (this.progressText[doNo]||'').trim();
        if (!txt) return;
        const idx = this.data.findIndex(o => Object.keys(o)[0] === doNo);
        if (idx < 0) return;
        const payload = this.data[idx][doNo];
        payload.perjalanan = payload.perjalanan || [];
        payload.perjalanan.push({ waktu: this.nowStr(), keterangan: txt });
        // emit sinkronisasi ke parent
        const copy = this.data.slice();
        copy[idx] = { [doNo]: payload };
        this.$emit('update:data', copy);
        this.$set(this.progressText, doNo, '');
      }
    }
  });