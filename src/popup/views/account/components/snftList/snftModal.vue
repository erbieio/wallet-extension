
<template>
  <van-dialog
    v-model:show="show"
    teleport="#page-box"
    :showConfirmButton="false"
    :showCancelButton="false"
    class="toggleSnftListModal"
    closeOnClickOverlay
  >
    <div class="sheet-header van-hairline--bottom">
      {{ t("createExchange.snft") }}
    </div>
    <div class="account-container">
      <div
        :class="`card flex between ${item.select ? 'active' : ''}`"
        v-for="(item, i) in list"
        :key="item.value"
        @click="handleChange(i)"
      >
        <div class="info">
          <div class="label">{{ item.label }}</div>
          <div class="desc">{{ item.desc }}</div>
        </div>
        <div class="flex center">
          <i
            :class="`iconfont  ${item.select ? 'icon-duihao2' : 'icon-dui'} `"
          ></i>
        </div>
      </div>
    </div>
  </van-dialog>
</template>
  <script lang="ts">
import {
  defineComponent,
  Ref,
  ref,
  watch,
  SetupContext,
  computed,
  nextTick,
  VNode,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToggleAccount } from "@/popup/components/accountModal/hooks/toggleAccount";
import { Icon, Dialog, Button, Loading, ActionSheet,Toast } from "vant";
import AccountIcon from "@/popup/components/accountIcon/index.vue";
import { decimal } from "@/popup/utils/filters";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
export default defineComponent({
  name: "snft-modal",
  components: {
    [Icon.name]: Icon,
    [Dialog.Component.name]: Dialog.Component,
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Loading.name]: Loading,
    [ActionSheet.name]: ActionSheet,
    AccountIcon,
  },
  emits: ["change", "update:modelValue"],
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  setup(props: any, context: SetupContext) {
    const { emit }: any = context;
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const { dispatch } = store;
    const { t } = useI18n();
    const accountInfo = computed(() => store.state.account.accountInfo);
    const currentNetwork = computed(() => store.state.account.currentNetwork);
    const showModal: Ref<boolean> = ref(false);

    const show = ref(false);
    const handleSelect = async (item: any, index: number) => {};
    watch(
      () => props.modelValue,
      (n: boolean) => {
        show.value = n;
      }
    );
    watch(
      () => show.value,
      (n) => {
        emit("update:modelValue", n);
      }
    );

    const list = ref([
      {
        label: t("createExchange.convert"),
        value: "2",
        desc: t("createExchange.desc3"),
        select: true,
      },
      {
        label: t("createminerspledge.stake"),
        value: "3",
        desc: t("createExchange.desc1"),
        select: false,
      },
      {
        label: t("createExchange.redemption"),
        value: "1",
        desc: t("createExchange.desc2"),
        select: false,
      },
    ]);
    // context.emit('change', {...list.value[0]})
    const handleChange = (idx: number) => {
      list.value.forEach((item, i) =>
        i != idx ? (item.select = false) : (item.select = true)
      );
      context.emit("change", { ...list.value[idx] });
      nextTick(() => (show.value = false));
    };

    return {
      t,
      handleSelect,
      handleChange,
      currentNetwork,
      showModal,
      decimal,
      accountInfo,
      show,
      list,
    };
  },
});
</script>
  <style lang="scss" scoped>
.btn-box {
  padding: 12px 45px;
  button:hover {
    border: 1px solid white;
    color: white;
    background: none;
  }
}
.icon-danxuanxuanzhong {
  font-size: 16px !important;
}
.account-icon {
  color: #848285;
  margin-right: 10px;
  i {
    font-size: 20px;
  }
  i.icon-xuanzhong1 {
    color: white;
  }
}

.sheet-header {
  height: 60px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,.05);
  font-size: 15px;
  font-weight: bold;
  color: white;

}
.card {
  margin: 15px 15px;
  padding: 6px 15px 15px;
  border-radius: 7.5px;
  border: 1px solid #848484;
  cursor: pointer;
  &:hover {
    color: white;
    .desc,
    i {
      color: white;
    }
  }
  .info {
    padding-right: 10px;
  }
  &.active {
    color: white;
    border: 1px solid white;
    background: rgba(255,255,255,.05);
    .desc,
    i {
      color: white;
    }
  }
  .label {
    font-size: 15px;
    font-weight: bold;
    line-height: 24px;
  }
  .desc {
    font-size: 12px;
    line-height: 16px;
    color: #848484;
  }
  i {
    font-size: 22px;
    color: #848484;
    &.icon-duihao2 {
      font-size: 20px;
    }
  }
}
</style>