<template>
 <Transition name="modal">
    <div class="trade-dialog-mask flex center" v-if="isShow">
      <div class="wormholes-dialog modal-container">
        <div class="text-center tit van-hairline--bottom">
          {{i18n.global.t('transactiondetails.tradeTit')}}
        </div>
        <div>
          <div class="info-box">
            <div class="icon">
              <div class="flex">
                <Loading
                  color="white"
                  v-show="defaultData.status == 'pendding'"
                />
                <i
                  v-show="defaultData.status != 'pendding'"
                  class="iconfont icon-duihao2 success"
                ></i>
                <span class="lh-30 ml-10 approve">{{
                  i18n.global.t("bootstrapwindow.approve")
                }}</span>
              </div>
            </div>
            <div class="approve-msg pl-30 ml-8 mb-10">
              {{ defaultData.approveMessage }}
            </div>
          </div>
          <div :class="`info-box ${defaultData.status == 'fail' ? 'fail' : ''}`">
            <div class="icon">
              <div class="flex">
                <div class="flex center">
                  <Loading
                    color="white"
                    v-show="defaultData.status == 'approve'"
                  />
                  <i
                    v-show="defaultData.status == 'pendding'"
                    class="iconfont icon-duihao2"
                  ></i>
                  <i
                    v-show="defaultData.status == 'success'"
                    class="iconfont icon-duihao2 success"
                  ></i>
                  <Icon v-show="defaultData.status == 'fail' " name="clear" :class="defaultData.status" />
                  <Icon name="warning" v-show="defaultData.status == 'warn' " :class="defaultData.status"/>
                </div>
                <span
                  class="lh-30 ml-10 approve"
                  v-show="
                    defaultData.status == 'pendding' ||
                    defaultData.status == 'approve' || defaultData.status == 'warn'
                  "
                  >{{ defaultData.wattingTitle }}</span
                >
                <span
                  class="lh-30 ml-10 approve"
                  v-show="
                    defaultData.status == 'success' ||
                    defaultData.status == 'fail'
                  "
                >
                  {{
                    defaultData.status == "success"
                      ? i18n.global.t("transactiondetails.success")
                      : i18n.global.t("transactiondetails.fail")
                  }}
                </span>
              </div>
            </div>
            <div
              class="approve-msg pl-30 ml-8 mb-10"
              v-show="
                defaultData.status == 'pendding' ||
                defaultData.status == 'approve' 
              "
            >
            <span v-if="defaultData.wattingMessageType === 'string'">{{ defaultData.wattingMessage }}</span>
            <span v-else v-html="defaultData.wattingMessage"></span>
            </div>
            <div
              class="approve-msg pl-30 ml-8 mb-10"
              v-show="
                defaultData.status == 'success' || defaultData.status == 'fail' || defaultData.status == 'warn'
              "
            >
            <div v-if="defaultData.status == 'success'">
              <span v-if="defaultData.successMessageType === 'string'">{{ defaultData.successMessage }}</span>
             <span v-else v-html="defaultData.successMessage"></span>
            </div>
            <div v-if="defaultData.status == 'fail' || defaultData.status == 'warn'">
              <span v-if="defaultData.failMessageType === 'string'">{{ defaultData.failMessage }}</span>
             <span v-else v-html="defaultData.failMessage"></span>
            </div>
              <!-- {{
                defaultData.status == "success"
                  ? defaultData.successMessage
                  : defaultData.failMessage
              }} -->
            </div>
          </div>
          <div :class="`flex ${(defaultData.hash || defaultData.historyCallBack) ? 'between' : 'center'} mt-26 btn-done-box`">
            <Button
              @click="callBack"
              :disabled="disabled"
              class="okbtn"
              type="primary"
              >{{ i18n.global.t("returnreceipt.done") }}</Button
            >
            <Button v-if="defaultData.hash || defaultData.historyCallBack"  class="okbtn" type="primary" @click="toHistory(defaultData.hash)">{{i18n.global.t('common.hsitory') }}</Button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script lang="ts" setup>

export type TradeOptions = {
  approveMessage?: string
  successMessage?: string
  wattingMessage?: string
  wattingTitle?: string
  failMessage?: string
  status: string
  callBack?: Function
  failBack?: Function
  historyCallBack?: Function | null
  disabled: Array<string>
  wattingMessageType: string
  failMessageType: string
  successMessageType: string
  hash?: null | string
};



import { computed, Ref, ref } from "vue";
import { Button, Icon, Loading } from "vant";
import i18n from "@/popup/language";
import { TradeConfirmOpt, TradeStatus } from "./tradeConfirm";
import { toScan } from "@/popup/utils/utils";
import router from "@/popup/router";

enum messageType {
  string = 'string',
  html = 'html'
};
const getDefaultOpt = () => {
  return ref({
    approveMessage: i18n.global.t('send.approveMessage'),
    successMessage:  i18n.global.t('send.successMessage'),
    wattingMessage:  i18n.global.t('send.wattingMessage'),
    failMessage: i18n.global.t('send.failMessage'),
    wattingTitle: i18n.global.t('bootstrapwindow.watting'),
    status: "pendding",
    wattingMessageType: 'string',
    failMessageType:"string",
    successMessageType: 'string',
    hash: null,
    callBack: () => {},
    historyCallBack: null,
    // The button is disabled in this state
    disabled: [TradeStatus.pendding, TradeStatus.approve]
  });
};
const defaultData: Ref<TradeOptions> = getDefaultOpt();

const disabled = computed(() => {
  if (defaultData.value.disabled.includes(defaultData.value.status)) {
    return true;
  }
  return false;
});
const isShow = ref(false);
const show = (opt: TradeConfirmOpt) => {
  defaultData.value = { ...defaultData.value, ...opt };
  !isShow.value ? (isShow.value = true) : "";
};
const callBack = () => {
  hide()
  const { callBack: done, failBack } = defaultData.value
  if(defaultData.value.status == 'success') {
    done && typeof done == 'function' ? done() :''
  }
  if(defaultData.value.status == 'fail') {
    failBack && typeof failBack == 'function' ? failBack() :''
  }
}
const hide = () => {
  isShow.value = false;
};

const open = (_opt: TradeConfirmOpt = {status: TradeStatus.pendding}) => {
  const defaultOpt = {
    ...getDefaultOpt().value,
    ..._opt,
  };

  show(defaultOpt);
};
const update = (_opt: TradeConfirmOpt= {status: TradeStatus.approve}) => {
  const defaultOpt: TradeConfirmOpt = {
    ..._opt,
  };
  show(defaultOpt);
};

const toHistory = (hash: string | null | undefined) => {
  hide()
  if(defaultData.value.historyCallBack && typeof defaultData.value.historyCallBack == 'function') {
    defaultData.value.historyCallBack()
  } else {
    if(hash) {
    router.replace({name:'transaction-history', query: {hash}})
  }
  }

}

defineExpose({
  isShow,
  show,
  hide,
  open,
  update,
  callBack
});
</script>
<style lang="scss" scoped>
.btn-done-box {
  padding: 0 50px;
}
.success {
  color: #3aae55 !important;
}
.fail {
  color: #d73a49 !important;
}
.warn {
  color: #f7bf03 !important;
}
.trade-dialog-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 5002;
  background: rgba($color: white, $alpha: 0.1);
  transition: opacity 0.3s ease;
  .okbtn {
    min-width: 100px;
  }
  .wormholes-dialog {
    overflow: hidden;
    border: 1PX solid #460e70;
    .tit {
      line-height: 62px;
      background: #13051E;
      font-size: 15px;
      font-weight: 600;
      color: white;
    }
    width: 340px;
    min-height: 230px;
    max-height: 500px;
    background: #24152f;
    border-radius: 7px;
    padding-bottom: 25px;
    .approve-msg {
      font-size: 12px;
    }
    .info-box {
      padding: 22px 15px 0;
      &.fail {
        .approve,.approve-msg {
          color:#d73a49;
        }
      }
      &.warn {
        .approve,.approve-msg {
          color:#f7bf03;
        }
      }
      .icon i {
        font-size: 26px;
        color: #9a9a9a;
      }
      .icon .van-icon-clear,.icon .van-icon-warning {
        font-size: 29px;
      }
    }
    .approve {
      font-size: 15px;
      font-weight: bold;
      color: white;
    }
    .approve-msg {
      line-height: 18px;
      color: #848484;
    }
  }
}
</style>