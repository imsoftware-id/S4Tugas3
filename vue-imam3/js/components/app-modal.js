Vue.component('app-modal', {
    template: '#tpl-modal',
    props: {
      show: { type: Boolean, default: false },
      title: { type: String, default: 'Konfirmasi' }
    },
    methods: {
      close(){ this.$emit('close'); },
      confirm(){ this.$emit('confirm'); }
    }
  });