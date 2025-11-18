Vue.component('status-badge', {
    template: '#tpl-status-badge',
    props: {
      qty: { type: Number, required: true },
      safety: { type: Number, required: true },
      notes: { type: String, default: '' }
    },
    data() {
      return { showTip: false };
    },
    computed: {
      info() {
        if (this.qty === 0) return { cls:'status-kosong', label:'Kosong' };
        if (this.qty < this.safety) return { cls:'status-menipis', label:'Menipis' };
        return { cls:'status-aman', label:'Aman' };
      }
    }
  });