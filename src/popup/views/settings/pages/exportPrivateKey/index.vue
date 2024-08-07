<template>
  <div class="bourse">
    <NavHeader :title="t('setting.securityandPrivacy')">
      <template v-slot:left>
        <span class="back" @click="appProvide.back">{{
      t("common.back")
    }}</span>
      </template>
    </NavHeader>
    <div class="page-content">
      <Tip :message="t('exportprivatekey.warn')" />
      <div class="flex tab-box" v-if="check">
        <div class="flex-1 flex center border-right">
          <div :class="`card hover ${selectKey == 'a' ? 'active' : ''}`" @click="choose('a')">
            <div class="text-center icon"><i class="iconfont icon-fuzhi3"></i></div>
            <div class="text mt-4">{{ t('exportprivatekey.copytext') }}</div>
          </div>
        </div>
        <div class="flex-1 flex center">
          <div :class="`card hover ${selectKey == 'b' ? 'active' : ''}`" @click="choose('b')">
            <div class="text-center icon"><i class="iconfont icon-erweima"></i></div>
            <div class="text mt-4">{{ $t("exportprivatekey.qrcode") }}</div>
          </div>
        </div>
      </div>
      <div class="tab-con mt-24" v-if="check">
        <div class="privatekey-content" v-show="selectKey == 'a'">
          <div class="display-box">
            {{ privateKey }}
          </div>
          <div class="btn-groups">
            <div class="container pl-26 pr-26">
              <van-button @click="tocopy" type="default" plain block>
                <i class="iconfont icon-copy"></i>
                {{ $t("exportprivatekey.copyText") }}</van-button>
            </div>
          </div>
        </div>
        <div v-show="selectKey == 'b'">
          <div class="qccode-content">
            <div class="flex center">
              <div class="qccode-display flex center">
                <qrcode-vue size="217" v-if="privateKey" :value="privateKey" level="L" />
              </div>
            </div>
          </div>
          <div class="btn-groups">
            <div class="container pl-26 pr-26">
              <van-button type="default" plain block v-if="check" @click="download">
                <i class="iconfont icon-bottom"></i>
                {{ $t("exportprivatekey.saveText") }}</van-button>
            </div>
          </div>
        </div>
      </div>

      <div :class="`pwd-ipt pl-14 pr-14 ${isError ? 'error' : ''}`" v-if="!check">
        <div class="flex between pwd-tit">
          <span class="text-bold mb-4">{{ t('exportprivatekey.password') }}</span>
          <span>
            <i @click="mask = !mask" :class="`iconfont hover  ${mask ? 'icon-yanjing' : 'icon-yanjing1'} `"></i>
          </span>
        </div>
        <van-field @keydown.enter="handleConfirm" v-model="password" :placeholder="t('loginwithpassword.pleaseinput')" :type="mask ? 'password' : 'text'" />
        <div class="err-msg">{{ errMsg }}</div>
      </div>
    </div>
    <div class="btn-groups" v-if="!check">
      <div class="container pl-26 pr-26">
        <van-button block type="primary" @click="handleConfirm">{{ t('common.confirm') }}</van-button>
      </div>
    </div>
    <SwitchNetwork v-model:show="showModalNetwork" @close="showModalNetwork = false" />
  </div>
</template>

<script lang="ts">
import {
  ref,
  Ref,
  computed,
  toRaw,
  SetupContext,
  onMounted,
  inject,
} from "vue";
import {
  Icon,
  NavBar,
  Form,
  Field,
  CellGroup,
  Button,
  Tab,
  Tabs,
  Toast,
} from "vant";
import { useRouter, useRoute } from "vue-router";
import useClipboard from "vue-clipboard3";
import QrcodeVue from "qrcode.vue";
import { getWallet } from "@/popup/store/modules/account";
import { useI18n } from "vue-i18n";
import { useNetWork } from "@/popup/components/navHeader/hooks/netWork";
import { useStore, mapState } from "vuex";
import SwitchNetwork from "@/popup/components/switchNetwork/index.vue";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { downloadBase64Img } from "@/popup/utils/utils";
import { useToast } from "@/popup/plugins/toast";
import { createWalletByJson } from '@/popup/utils/ether';
import { decryptPrivateKey } from "@/popup/utils/web3";
import { regPassword1 } from '@/popup/enum/regexp';
import Tip from '@/popup/components/tip/index.vue'
export default {
  components: {
    SwitchNetwork,
    [Icon.name]: Icon,
    [NavBar.name]: NavBar,
    [Form.name]: Form,
    [Field.name]: Field,
    [Button.name]: Button,
    [CellGroup.name]: CellGroup,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    QrcodeVue,
    NavHeader,
    Tip
  },
  setup() {
    const { t } = useI18n();
    const check = ref(false);
    const onClickLeft = () => {
      const { backUrl }: any = route.query;
      router.replace({
        name: backUrl || "settings",
      });
    };
    const mask = ref(true)
    const isWarning = ref(false);
    const activeName = ref("a");
    const router = useRouter();
    const route = useRoute();
    const appProvide = inject("appProvide");
    const privateKey: Ref<string> = ref("");
    const initWallet = async () => {
      const wallet = await getWallet();
      const key = JSON.stringify({ type: "pricateKey", "data": wallet.privateKey })
      privateKey.value = key;
    };
    initWallet();
    const {
      netWorkList,
      currentNetwork,
      showModalNetwork,
      chooseNetWork,
      handleChoose,
      handleChooseComfirm,
    } = useNetWork();
    const store = useStore();
    const networkTypeValue = computed(() => store.state.account.networkType);
    const togome = () => {
      const { backUrl }: any = route.query;
      router.replace({
        name: backUrl || "settings",
      });
    };

    // Copying User Addresses
    const { toClipboard } = useClipboard();
    const { $toast } = useToast();
    const tocopy = async () => {
      try {
        isWarning.value = true;
        await toClipboard(privateKey.value);
        $toast.success(t("exportprivatekey.copyText"));
      } catch (e) {
        console.error(e);
      }
    };
    // Two-dimensional code page
    const value = ref(`${privateKey.value}`);
    const download = () => {
      downloadBase64Img();
    };
    const isError = ref(false)
    const errMsg = ref('')
    const password = ref('')
    const handleConfirm = async () => {
      isError.value = false
      if (!regPassword1.test(password.value)) {
        isError.value = true
        errMsg.value = t('createAccountpage.pwdWorng')
        return
      }

      // Unlock wallet directly
      try {
        const params = {
          password: password.value || '',
          json: store.state.account.accountInfo.keyStore
        }
        //   Encrypt and store the time with a password according to the, transfer it to Step2, and then use PWD to restore the time at Step2
        privateKey.value = decryptPrivateKey(params);
        isError.value = false
        check.value = true
      } catch (err) {
        isError.value = true
        errMsg.value = t('loginwithpassword.wrong_password')
      }
    }
    const selectKey = ref('a')
    const choose = (v: string) => {
      selectKey.value = v
    }
    return {
      t,
      selectKey,
      choose,
      tocopy,
      activeName,
      handleConfirm,
      password,
      togome,
      onClickLeft,
      privateKey,
      isWarning,
      value,
      netWorkList,
      currentNetwork,
      showModalNetwork,
      chooseNetWork,
      networkTypeValue,
      handleChoose,
      handleChooseComfirm,
      appProvide,
      download,
      check,
      isError,
      mask,
      errMsg
    };
  },
};
</script>


<style lang="scss" scoped>
.border-right {
  border-right: 1px solid #B3B3B3;
}

.tab-box {
  .card {
    &.active {
      color: white;
    }

    .icon i {
      font-size: 30px;
    }

    .text {}
  }
}

.error {}

.icon-yanjing1 {
  color: white;
  font-size: 14px !important;
}

.icon-yanjing {
  font-size: 18px !important;

}

.page-content {

  .pwd-ipt.error {
    :deep(.van-field__body) {
      border: 1px solid #d73a49 !important;
      background: #24152f;
    }
  }

  .err-msg {
    color: #d73a49;
    font-size: 12px;
  }

  .pwd-ipt {
    .pwd-tit {
      height: 24px;

      span {
        line-height: 24px;
      }
    }
  }

  .title {
    margin: 10px 15px;
    font-size: 12px;
    line-height: 21px;
    font-weight: bold;
  }

  .display-box {
    margin: 0 15px;
    height: 90px;
    border: 1px solid #b3b3b3;
    /* background: #F6F7FA; */
    border-radius: 5px;
    word-wrap: break-word;
    padding: 16px;
    font-size: 12px;

    .copy-function {
      height: 30px;
      border-top: 1px solid rgba(104, 113, 123, 1);
      text-align: center;
      font-size: 12px;
      color: white;
      line-height: 28px;
      padding: 15px;
    }
  }

  :deep() {
    .van-tabs__line {
      z-index: 0;
      width: 50%;
      height: 0.05333rem;
      background: white;
    }

    .van-tab {
      position: inherit;
      color: #848484;
    }

    .van-tab {
      border-bottom: 0.5px solid rgba(151, 151, 151, 1);
      font-size: 11px;
    }
  }
}

.qccode-content {
  width: 100%;

  .qccode-display {
    border: 7px solid white;
    padding: 5px;
    margin: 0 auto;
  }
}
</style>
<style lang="scss" scoped>
:deep(.van-cell:after) {
  display: none;
}

:deep(.van-cell) {
  padding: 0;
}

:deep(.van-field__body) {
  margin-bottom: 10px;

  &:hover {
    border: 1px solid white;
  }
}

.bourse {
  height: 100%;

  .bourse-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48px;
    padding: 0 16px;
    background: #fff;
    box-sizing: border-box;
    box-shadow: 0 1px 2px rgb(135 134 134 / 10%);
  }

  .bourse-container {
    padding: 23px 15px 25px 15px;
    font-size: 14px;

    .bourse-container-w {
      height: 160px;
      border: 1px solid #363232;
      padding: 0 17.5px;

      .da {
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &:first-child {
          border-bottom: 1px solid #363232;
        }
      }
    }

    .da-c {
      display: flex;
      align-items: center;

      span {
        margin: 0 35.5px 0 10px;
      }
    }

    .da-img {
      width: 20px;
      height: 20px;
      margin-top: -4px;
    }

    .right {
      padding-left: 15px;
      border-left: 1px solid #363232;

      img {
        width: 14px;
        height: 14px;
      }
    }
  }

  .bourse-container-meaning {
    margin-top: 15px;
    padding-top: 15px;
  }

  .bourse-container-pull {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .hundred {
      color: #3aae55;
      font-size: 18px;
      line-height: 30px;
    }
  }

  .bourse-container-slider {
    margin: 33.5px 0;
  }

  .bourse-container-server {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;

    div {
      width: 310px;
      height: 85px;
      display: flex;
      margin-left: 15px;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background: rgba(255, 255, 255, .05);
      border-radius: 7.5px;
      box-sizing: border-box;
    }

    .active {
      border: 1px solid white;

      span {
        color: white;
      }
    }

    .t1 {
      font-size: 12px;
      color: #848484;
      line-height: 20px;
    }

    .t2 {
      font-size: 12px;
      font-weight: bold;
      line-height: 20px;
    }
  }

  .bourse-container-server-b {
    div {
      background-color: #f1f3f4 !important;
    }

    .active-d {
      border: 1px solid white;
    }
  }

  .bourse-container-btns {
    width: calc(100% - 30px);
    position: absolute;
    bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .b1 {
      width: 160px;
    }
  }

  .bourse-container-error {
    margin: 0 15px 25px 15px;
    height: 56.5px;
    background: rgba(255, 255, 255, .05);
    border-radius: 7.5px;
    display: flex;
    align-items: center;
    padding: 0 15px;

    span {
      margin-left: 10px;
      font-size: 12px;
    }
  }

  .t1 {
    font-size: 14px;
    color: white;
  }

  .t3 {
    font-size: 18px;
    font-weight: bold;
    line-height: 40px;
  }

  .t2 {
    font-size: 16px;
  }

  .right-img {
    width: 18px;
    height: 18px;
    margin-top: -2px;
  }

  .create-new-password {
    margin-top: 13.5px;

    .tit-small {
      color: #848484;
    }

    .right {
      color: white;
      text-decoration: underline;
    }

    .icon-yanjing1 {
      color: white;
    }

    :deep(.van-field__label) {
      display: none;
    }

    :deep(.van-field__error-message) {
      margin-bottom: 0px;
    }

    .error-field {
      :deep(.van-field__body) {
        border: 1px solid #d73a49 !important;
      }
    }

    .success-field {
      :deep(.van-field__body) {
        border: 1px solid white !important;
      }
    }

    .tool {
      color: #8AA4FF;
    }

    .pointer {
      cursor: pointer;
    }

    .check-box {
      margin-top: 30px;
    }
  }
}

.bt {
  border-top: 1px solid #363232;
}

.bourse-img {
  height: 135px;
  background-color: rgba(255, 255, 255, .05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .exchange-welcome-icon {
    height: 35px;
    width: 35px;
  }

  .d1 {
    margin: 10px 0;
    font-size: 15px;
  }

  .d2 {
    font-size: 12px;
    color: #848484;
  }
}

.bourse-container-error,
.bourse-container-warning {
  height: 72px;
  background: #24152f;
  border-radius: 7.5px;
  margin-top: 15px !important;
  display: flex;
  align-items: center;
  padding: 0 15px;
  margin-bottom: 36.5px;

  span {
    margin-left: 10px;
    font-size: 12px;
  }
}

.btns-footer {
  position: fixed;
  bottom: 25px;
  width: 100%;
  max-width: 820px;
}

.right-img-copy {
  width: 15px;
  height: 15px;
}

@media screen and (max-width: 750px) {
  .page-content {
    width: 375px;
  }
}

@media screen and (min-width: 750px) {
  .page-content {
    width: 100%;
  }
}
</style>