<template>
  <div :class="`wormholes-tip flex pl-16 pr-16 pt-12 pb-12 ${type}`">
    <div class="flex center icon">
      <van-icon name="warning" />
    </div>
    <div class="lh-16 msg">{{message}}</div>
  </div>
</template>
<script lang="ts">

import { defineComponent } from "vue";
import { Icon } from "vant";
const tipType = {
  primary:'primary',
  warning: 'warning'
};
export default defineComponent({
  components: {
    [Icon.name]: Icon,
  },
  props: {
    message: {
      type: String,
      default: "Message",
    },
    type: {
      type: String,
      default: tipType.primary
    }
  },
  setup() {},
});
</script>
<style lang="scss" scoped>
.wormholes-tip {
  color: white;
    border-radius: 5px;
    &.primary {
      /* background: rgba(255,255,255,.05); */
      .icon i {
        color: white;
      }
    }
    &.warn {
      background: #FEFCDA;
      .icon i {
        color: #F7BF03;
      }
    }
    &.error {
      background: #24152f;
      .icon i {
        color: #D73A49;
      }
    }
    .icon i{
    font-size: 18px;
    
}
}

.msg {
    padding-left: 9px;
    color: #eee;
}
</style>
