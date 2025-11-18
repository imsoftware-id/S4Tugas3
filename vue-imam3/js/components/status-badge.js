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
        if (this.qty === 0) return { cls:'empty', label:'Kosong' };
        if (this.qty < this.safety) return { cls:'warn', label:'Menipis' };
        return { cls:'safe', label:'Aman' };
      }
    }
  });