<template>
  <div class="kuang" v-if="showModal"></div>
  <van-popover v-model:show="showModal" @click-overlay="beforeClose" :close-on-click-overlay="false" trigger="manual" class="popover-dialog step5" placement="bottom-end" teleport="#page-box" overlay>
    <div class="dialog-box">
      <div class="serial-number">
        <span class="left">5</span> <span>/</span> 11
      </div>
      <div class="title">
        {{ t("bootstrapwindow.transaction") }}
      </div>
      <div class="small-tit pl-30 pr-30 mt-20">
        {{ t("bootstrapwindow.transactionMessage") }}
      </div>
      <div class="flex center">
        <van-button type="primary" @click="handleClick(6)">{{
    t("bootstrapwindow.next")
          }}</van-button>
      </div>
      <span class="tip2"></span>
    </div>
  </van-popover>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, watch, SetupContext, computed } from "vue";
import { Popover, Dialog, Button } from "vant";
import WormTransition from "@/popup/components/wromTransition/index.vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
export default defineComponent({
  name: "guide-modal",
  components: {
    [Popover.name]: Popover,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    WormTransition,
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    const { state, dispatch, getters } = useStore();
    const show5 = computed(() => state.system.show5);
    const showGuideModalVal = computed(() => getters['system/getGuideModalVal'])

    const handleClick = (v: number) => {
      dispatch("system/showDialog", v);
    };
    const showModal = ref(false);
    watch(
      () => showGuideModalVal,
      (n) => (showModal.value = n.value === 5 ? true : false),
      { immediate: true, deep: true }
    );
    const beforeClose = async () => {
      const flag = await Dialog.confirm({
        className: "closeGuideModal",
        allowHtml: true,
        message: `<div class="icon-inner flex center mb-14"><i class="van-badge__wrapper van-icon van-icon-warning" style="font-size:44px;color:#f7bf03;"></i></div><div class="unboot">${t(
          "bootstrapwindow.unboot"
        )}</div>`,
      })
        .then(() => true)
        .catch(() => false);
      if (flag) {
        dispatch("system/closeGuide");
        showModal.value = false;
      }
    };
    return {
      t,
      beforeClose,
      show5,
      handleClick,
      showModal,
    };
  },
});
</script>
<style lang="scss" scoped>
.kuang {
  border: 1px #fff dotted;
  height: 70px;
  left: 20px;
  right: 20px;
  border-radius: 5px;
  top: 160px;
  position: absolute;
  z-index: 8888;
}

.dialog-box {
  // width: 340px;
  padding-bottom: 25px;
  position: relative;

  .serial-number {
    display: flex;
    justify-content: flex-end;
    text-indent: 10px;
    padding-bottom: 14px;
    padding-right: 14px;
    font-size: 12px;

    .left {
      color: white;
    }
  }

  .tip2 {
    position: absolute;
    top: -75px;
    height: 70px;
    // width: 320px;
    border: 1px dashed #fff;
    border-radius: 5px;
    right: 0;
    left: 0;
  }

  .title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    line-height: 30px;
    margin-top: 22px;
    color: white;
  }

  .small-tit {
    text-align: center;
    margin-bottom: 30px;
    font-size: 12px;
    color: #848484;
  }

  :deep {
    button {
      min-width: 100px;
    }
  }

  :deep(.van-popover__wrapper) {
    height: 0;
  }
}
</style>