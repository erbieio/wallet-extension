<template>
  <div>
    <van-dialog v-model:show="showModal" teleport="#page-box" :class="`transfer-NFT-modal type1`" :showConfirmButton="false" :showCancelButton="false" closeOnClickOverlay :title="''">
      <div class="title text-center text-bold border-bottom">
        {{ t("converSnft.converTit") }}
      </div>
      <div class="list pl-12 pr-12 mt-20 mb-20">
        <div class="card mb-10">
          <div class="card-form mt-20 pl-12 pr-12">
            <div class="m-card">
              <div class="m-label">{{ t("transferNft.select") }}</div>
              <div class="m-value">{{ selectNumber }}</div>
            </div>
            <div class="border-bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("transferNft.amount") }}</div>
              <div class="m-value">
                {{ selectTotal }} ERB
              </div>
            </div>
            <div class="border-bottom"></div>

            <div class="m-card">
              <div class="m-label">{{ t("transferNft.ratio") }}</div>
              <div class="m-value">{{ ratio }}</div>
            </div>
            <div class="border-bottom"></div>
            <div class="m-card">
              <div class="m-label">{{ t("bourse.gasFee") }}</div>
              <div class="m-value gasFee">≈ {{ gasFee }} ERB</div>
            </div>
          </div>
        </div>
        <Tip :message="t('common.converTip')" type="warn" />
      </div>
      <div class="flex evenly pb-30 pl-16 pr-16">
        <van-button @click="cencel">{{ t("transferNft.cancel") }}</van-button>
        <van-button :loading="loading" :disabled="time < 1 ? false : true" type="primary" @click="handleComfirm">
          {{ t("transferNft.confirm") }}
          <span v-if="time > 0">({{ time }}S)</span>
        </van-button>
      </div>
    </van-dialog>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  watch,
  SetupContext,
  reactive,
  computed,
  toRaw,
} from "vue";
import {
  Dialog,
  Button,
  Field,
  NumberKeyboard,
  Toast,
  CountDown,
  Popover,
} from "vant";
import { regNum2 } from "@/popup/enum/regexp";
import BigNumber from "bignumber.js";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { addressMask } from "@/popup/utils/filters";
import {
  getGasFee,
  getWallet,
  TransactionTypes,
} from "@/popup/store/modules/account";
import { useTradeConfirm } from "@/popup/plugins/tradeConfirmationsModal";
import { TradeStatus } from "@/popup/plugins/tradeConfirmationsModal/tradeConfirm";
import { ethers } from "ethers";
import { web3 } from "@/popup/utils/web3";
import { clone } from "pouchdb-utils";
import { getAccountAddr } from "@/popup/http/modules/common";
import { useRouter } from "vue-router";
import Tip from '@/popup/components/tip/index.vue'
export default defineComponent({
  name: "transfer-NFT-modal",
  components: {
    [Dialog.Component.name]: Dialog.Component,
    [Button.name]: Button,
    [Field.name]: Field,
    [NumberKeyboard.name]: NumberKeyboard,
    [Popover.name]: Popover,
    Tip
  },
  emits: ["update:modelValue", "fail", "confirm"],
  props: {
    // title
    title: {
      type: String,
      default: "Convert to ERB",
    },
    // v-model
    modelValue: {
      type: Boolean,
      default: false,
    },
    // length
    selectNumber: {
      type: String,
      default: '',
    },
    // total
    selectTotal: {
      type: String,
      default: '0',
    },
    // list
    selectList: {
      type: Object,
      default: [] || {},
    },
    // Exchange type 1/ SNFT fragment 2/ SNFT
    type: {
      type: String,
      default: "1",
    },

    ratio: {
      type: Number,
      default: 0.03,
    },
  },
  setup(props: any, context: SetupContext) {
    const { t } = useI18n();
    const { emit }: any = context;
    // count down
    const time = ref(3);
    const showModal: Ref<boolean> = ref(false);
    const store = useStore();
    const { state } = store
    let timer = null
    watch(
      () => props.modelValue,
      (n) => {
        showModal.value = n;
        if (n) {
          timer = setInterval(() => {
            if (time.value == 0) {
              clearInterval(timer);
            }
            time.value = time.value - 1;
          }, 1000);
          calcGasFee();
        }
      },
      {
        immediate: true,
      }
    );

    watch(
      () => showModal.value,
      (n) => {
        if (!n) {
          emit("update:modelValue", false);
          clearInterval(timer);
          time.value = 3;
          loading.value = false;
        }
      }
    );

    const cencel = () => {
      showModal.value = false;
    };


    const loading = ref(false);
    const handleComfirm = async () => {
      emit("confirm");
    };

    const gasFee = ref("");
    const calcGasFee = async () => {
      const list = toRaw(props.selectList)
      const { address } = state.account.accountInfo;
      const [a] = list
      const { nft_address, mergelevel, mergenumber } = a
      let nftAddr = ''
      switch (mergelevel) {
        case 0:
          nftAddr = nft_address
          break;
        case 1:
          nftAddr = nft_address.replace('m', '');
          break;
        case 2:
          nftAddr = nft_address.replace('mm', '');
          break;
        case 3:
          nftAddr = nft_address.replace('mmm', '');
          break;
      }
      const str = `erbie:{"type":6,"nft_address":"${nftAddr}","version":"v0.0.1"}`
      const data3 = toHex(str);
      const tx1 = {
        from: address,
        to: address,
        data: `0x${data3}`,
      };
      const gas = await getGasFee(tx1);
      gasFee.value = new BigNumber(gas).multipliedBy(list.length).toFixed(6);
    };

    return {
      t,
      showModal,
      gasFee,
      cencel,
      handleComfirm,
      loading,
      time,
      addressMask,
    };
  },
});

function toHex(str: string) {
  if (str === "") return "";
  var hexCharCode = [];
  for (var i = 0; i < str.length; i++) {
    hexCharCode.push(str.charCodeAt(i).toString(16));
  }
  return hexCharCode.join("");
}
</script>
<style lang="scss" scoped>
:deep() {
  .wormholes-tip {
    margin-left: 0;
    margin-right: 0;
  }
}

.card-form {
  border: 1px solid #363232;
  border-radius: 5px;
}

.gasFee {
  color: #3aae55;
}

.title {
  color: white;
  font-size: 15px;
  line-height: 62px;
  background: rgba(255,255,255,.05);
  font-weight: bold;
}

:deep(.van-button) {
  width: 100px !important;
}

.pintu {
  i {
    color: white;
    font-size: 38px;
  }
}

.protocol {
  color: #b3b3b3;

  span {
    color: white;
    text-decoration: underline;
  }
}

.list {
  .card {
    &::after {
      border-radius: 4px;
    }

    .tip {
      color: #8f8f8f;
    }
  }
}

.m-card {
  font-size: 12px;
  padding: 6px;

  .m-label {
    color: #8f8f8f;
    line-height: 20px;
  }

  .m-value {
    line-height: 20px;
    font-size: 12px;
  }
}

.custom-exchange-modal {}
</style>
