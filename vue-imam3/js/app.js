new Vue({
    el: '#app',
    data(){
      return {
        tab: 'stok',
        loading: true,
        trackingQuery: '',
        state: {
          upbjjList: [],
          kategoriList: [],
          pengirimanList: [],
          paket: [],
          stok: [],
          tracking: []
        },
        error: ''
      };
    },
    async created(){
      try {
        const data = await ApiService.loadAll();
        // isi state dari JSON
        this.state.upbjjList     = data.upbjjList || [];
        this.state.kategoriList  = data.kategoriList || [];
        this.state.pengirimanList= data.pengirimanList || [];
        this.state.paket         = data.paket || [];
        this.state.stok          = data.stok || [];
        this.state.tracking      = data.tracking || [];
      } catch (e) {
        this.error = e.message || 'Gagal memuat data';
      } finally {
        this.loading = false;
      }
    }
  });