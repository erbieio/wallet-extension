<template>
  <div>
    <div class="flex center no-list pt-30">
      <i class="iconfont icon-inbox"></i>
    </div>
    <div class="flex center msg f-12 mt-10" v-if="hasText">
      {{ t('common.no_data') }}
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "no-data",
  props: {
    text: {
      type: String,
      default: 'no-data'
    },
    hasText: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const { t } = useI18n()
    return {
      t
    }
  },
});
</script>
<style lang="scss" scoped>
.no-list {
  i {
    font-size: 40px;
    color: white;
  }

}

.msg {
  color: #BBBBBB;
}
</style>
