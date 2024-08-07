<template>
  <div class="page-inner-box">
    <!-- Account selection area -->
    <div class="p-14 userinfo-box">
      <div :class="`userinfo ${addressErr ? 'error' : ''}`">
        <div class="from flex column between">
          <!-- Sender information -->
          <div class="information p-14 flex between" @click="handleShowAccountModal">
            <div class="flex center-v">
              <div class="avatar flex center">
                <AccountIcon :data="accountInfo.icon" />
              </div>
              <div class="flex column between userinformation center-h pt-4 pb-4">
                <div class="username mb-4" v-show="accountInfo.name">
                  {{ accountInfo.name }}
                </div>
                <div class="userbalance">
                  {{ decimal(accountInfo.amount) }}
                  {{ currentNetwork.currencySymbol }}
                </div>
              </div>
            </div>
            <div class="flex center up-down-box">
              <van-icon :name="`${showModal ? 'arrow-up' : 'arrow-down'}`" />
            </div>
          </div>
        </div>
        <div class="line-box flex between center-v pl-16 pr-16">
          <div class="line van-hairline--bottom"></div>
          <div class="text-bold f-12">{{ t("sendNFT.to") }}</div>
          <div class="line van-hairline--bottom"></div>
        </div>
        <!-- recipient -->
        <div class="to from flex between center-v">
          <div class="add-ipt flex center-v between pl-14 pr-14" v-show="!hasChooseAddress">
            <van-field :placeholder="$t('sendNFT.addAddress')" v-model="toAddress" @blur="checkAddress"></van-field>
            <div class="flex right center-v" v-show="hasChooseAddress && !addressErr">
              <van-icon name="cross" class="clearAddress" @click="clearAddress" />
            </div>
            <div v-show="addressErr" class="flex right center-v clearIcon">
              <van-icon name="cross" @click="clearAdd" />
            </div>
          </div>
          <div class="information p-14 flex between" v-show="hasChooseAddress">
            <div class="flex">
              <div class="avatar">
                <AccountIcon :data="account.data.icon" />
              </div>
              <div class="flex column between userinformation center-h pt-4 pb-4">
                <div class="username mb-4">{{ account.data.name }}</div>
                <div class="userbalance">
                  {{
                    addressMask(account.data.address)
                  }}
                </div>
              </div>
            </div>
            <div class="flex right center-v" v-show="hasChooseAddress">
              <van-icon name="cross" class="clearAddress" @click="clearAddress" />
            </div>
          </div>
        </div>
      </div>
      <div class="error-tip f-12 mt-8 lh-14" v-show="addressErr">
        {{ t("sendNFT.enterErr") }}
      </div>
    </div>
    <!-- contacts -->
    <van-tabs v-model:active="active" sticky shrink offset-top="48px">
      <van-tab name="1" :title="t('contacts.tab_contacts')">
        <!-- <AccountList @handleClick="handleClickAccount" :accountList="contacts3" :offsetTop="94" :indexList="indexList3" /> -->
        <AccountList @handleClick="handleClickAccount" :indexList="indexList3" :accountList="contacts3" :offsetTop="46" />
      </van-tab>
      <van-tab name="2" :title="t('contacts.tab_recents')">
        <AccountList @handleClick="handleClickAccount" :indexList="indexList2" :accountList="contacts2" :offsetTop="46" />
      </van-tab>
      <van-tab name="3" :title="t('contacts.tab_rolodex')">
        <AccountList @handleClick="handleClickAccount" :indexList="indexList" :accountList="contacts" :offsetTop="46" />
      </van-tab>
    </van-tabs>
    <van-sticky position="bottom" offset-bottom="30px">
      <div class="flex center btn-group">
        <van-button type="primary" :loading="loading" @click="handleShowSendConfirm" block>{{
          t("sendNFT.send")
        }}</van-button>
      </div>
    </van-sticky>
    <!-- Account switching -->
    <AccountModal v-model="showModal" />
    <!-- Confirm sending Popup -->
    <!-- <SendConfirm v-model="showSendConfirm" :data="sendTx" /> -->
    <!-- Confirm sending Popup -->
    <SendNftModal v-model="showSendConfirm" :tx="sendTx" @handleComfirm="gonext" />
    <!-- Send successful pop-up -->
    <SendSuccessModal v-model="showSendSuccessModal" />
  </div>
</template>

<script lang="ts">
import {
  reactive,
  ref,
  computed,
  Ref,
  toRaw,
  watch,
  SetupContext,
  onUnmounted,
} from "vue";
import { Icon, Toast, Button, Sticky, Field, Slider, Tab, Tabs } from "vant";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import NavHeader from "@/popup/components/navHeader/index.vue";
import AccountIcon from "@/popup/components/accountIcon/index.vue";
import AccountList from "@/popup/views/account/components/accountList/index.vue";
import { addressMask, decimal } from "@/popup/utils/filters";
import { utils } from "ethers";
import { getRandomIcon } from "@/popup/utils";
import BigNumber from "bignumber.js";
import AccountModal from "@/popup/components/accountModal/index.vue";
import { useI18n } from "vue-i18n";
import SendConfirm from "@/popup/views/transferAccounts/components/sendComfirm.vue";
import ContactsList from "@/popup/views/settings/pages/contacts/components/contactsList.vue";
import SendSuccessModal from "@/popup/components/sendSuccessModal/index.vue";
import SendNftModal from "./../components/sendNftModal.vue";
import { TradeStatus } from "@/popup/plugins/tradeConfirmationsModal/tradeConfirm";
import { useTradeConfirm } from "@/popup/plugins/tradeConfirmationsModal";

import { web3 } from "@/popup/utils/web3";
export default {
  name: "sendNft-step2",
  components: {
    [Icon.name]: Icon,
    [Toast.name]: Toast,
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    [Field.name]: Field,
    [Slider.name]: Slider,
    [Tabs.name]: Tabs,
    [Tab.name]: Tab,
    NavHeader,
    AccountIcon,
    AccountList,
    AccountModal,
    SendConfirm,
    ContactsList,
    SendSuccessModal,
    SendNftModal
  },
  setup(props: any, context: SetupContext) {
    const router = useRouter();
    const store = useStore();
    const active = ref("1");
    const { state } = store;
    const { commit } = store;
    const { t } = useI18n();
    const { query } = useRoute();
    const { dispatch } = store;
    const addressErr = ref(false);
    const accountInfo = computed(() => store.state.account.accountInfo);
    const currentNetwork = computed(() => store.state.account.currentNetwork);
    //Default token/ selected token data
    const chooseToken = computed(() => {
      const symbol = currentNetwork.value.currencySymbol;
      const balance = accountInfo.value.amount;
      const data = {
        balance,
        logoUrl: "",
        name: symbol,
        precision: 1,
        symbol,
        tokenContractAddress: null,
      };
      const token = store.state.transfer.chooseToken;
      if (token) {
        return token;
      } else {
        return data;
      }
    });
    // Select account
    const handleClickAccount = (acc) => {
      addressErr.value = false;
      account.data = acc;
      toAddress.value = acc.address;
    };
    // My account list data
    const alist3 = computed(() => {
      // Split into two-dimensional arrays according to the first letter
      const list = state.account.accountList.map((item: any) => item);
      list.sort((a: any, b: any) => {
        return (a.name + "").localeCompare(b.name + "");
      });
      const newl = list.filter((item: any) => item);

      const arr: any = [];
      newl.forEach((item: any) => {
        const { name } = item;
        const label = name.substr(0, 1);
        const f = arr.find((child: any) => child.label == label);
        if (f) {
          arr.forEach((sun: any) => {
            sun.label == label ? sun.children.push({ ...item }) : "";
          });
        } else {
          arr.push({ label, children: [{ ...item }] });
        }
      });
      return arr;
    });
    let contacts3 = alist3;
    const indexList3 = computed(() => {
      return contacts3.value.map((item: any) => item.label);
    });
    // recent contacts
    const alist2 = computed(() => {
      // Split into two-dimensional arrays according to the first letter
      const list = state.account.recentList.map((item: any) => item);
      list.sort((a: any, b: any) => {
        return (a.name + "").localeCompare(b.name + "");
      });
      const newl = list.filter((item: any) => item);

      const arr: any = [];
      newl.forEach((item: any) => {
        const { name } = item;
        const label = name.substr(0, 1);
        const f = arr.find((child: any) => child.label == label);
        if (f) {
          arr.forEach((sun: any) => {
            sun.label == label ? sun.children.push({ ...item }) : "";
          });
        } else {
          arr.push({ label, children: [{ ...item }] });
        }
      });
      return arr;
    });
    let contacts2 = alist2;
    const indexList2 = computed(() => {
      return contacts2.value.map((item: any) => item.label);
    });
    // Business card holder
    const alist = computed(() => {
      // Split into two-dimensional arrays according to the first letter
      const list = state.account.contacts.map((item: any) => item);
      list.sort((a: any, b: any) => {
        return (a.name + "").localeCompare(b.name + "");
      });
      const newl = list.filter((item: any) => item);

      const arr: any = [];
      newl.forEach((item: any) => {
        const { name } = item;
        const label = name.substr(0, 1);
        const f = arr.find((child: any) => child.label == label);
        if (f) {
          arr.forEach((sun: any) => {
            sun.label == label ? sun.children.push({ ...item }) : "";
          });
        } else {
          arr.push({ label, children: [{ ...item }] });
        }
      });
      return arr;
    });
    let contacts = alist;
    const indexList = computed(() => {
      return contacts.value.map((item: any) => item.label);
    });
    // Selected contact data
    const chooseContact = computed(() => store.state.transfer.chooseContact);

    // amount of money
    const chooseAmount = computed(() => store.state.transfer.amount);
    const defaultAccount = toRaw(chooseContact.value || {});
    const account = reactive({ data: defaultAccount });
    const amount = ref(
      toRaw(chooseAmount.value == 0 ? null : chooseAmount.value)
    );
    const hasChooseAddress: Ref<boolean> = ref(false);
    // Clear selection
    const cancelAccount = () => {
      account.data = {};
    };
    const toAddress: Ref<string> = ref("");

    // verify the sending data and return the transaction data
    const checkTx = () => {
      // Sending address
      if (!toAddress.value) {
        return false;
      }
      // Whether the balance is equal to 0
      if (chooseToken.value.balance == 0 || amount.value == 0) {
        return false;
      }
      // Whether the balance is greater than the sent amount
      if (new BigNumber(chooseToken.value.balance).lte(amount.value)) {
        return false;
      }
      const { tokenContractAddress } = chooseToken.value;
      if (tokenContractAddress) {
        // token
        return {
          address: tokenContractAddress,
          amount: amount.value,
          to: toAddress.value,
          token: chooseToken.value,
        };
      } else {
        // ordinary
        return {
          to: toAddress.value,
          value: amount.value,
          token: chooseToken.value,
        };
      }
    };

    // Data transmitted to the sending pop-up window
    const sendTx = ref({});
    // Go to the next page
    const loading = ref(false);
    const { $tradeConfirm } = useTradeConfirm()
    function callBack() {
      router.replace({name:"home"})
    }
    const gonext = async () => {
      // @ts-ignore
      const nftInfo = JSON.parse(sessionStorage.getItem('nftInfo'))
      try {
        await checkAddress();
        showSendConfirm.value = false
        $tradeConfirm.open({
          disabled: [TradeStatus.pendding],
          callBack
        })
        try {
          loading.value = true;
          const tx = {
            to: toAddress.value,
            nft_address: nftInfo.address,
          };
          const data = await dispatch("nft/send", tx);
          $tradeConfirm.update({ status: "approve" });
          const receipt = await data.wait()
          $tradeConfirm.update({ status: receipt.status === 1 ?"success" : 'fail', hash: data.hash});

          // showSendSuccessModal.value = true;
        } catch (err: any) {
          if (err.toString().indexOf("timeout") > -1) {
            $tradeConfirm.update({
              status: "warn",
              failMessage: t("error.timeout"),
            });
          } else {
            $tradeConfirm.update({
              status: "fail",
              failMessage: err.reason,
            });
          }
        } finally {
          loading.value = false;
        }
      } catch (err) { }
    };


    // Generate cache based on input address
    function createCache() {
      let data = {};
      if (toAddress.value) {
        data = {
          address: toAddress.value,
          icon: getRandomIcon(),
        };
      } else {
        data = toRaw(account);
      }
      return data;
    }
    // Verify address format
    function checkAddress() {
      // Verify the input address first
      try {
        utils.getAddress(toAddress.value);
        addressErr.value = false;
        if (JSON.stringify(account.data) == '{}') {
          account.data = createCache();
        }
        return Promise.resolve();
      } catch (err) {
        Toast(t("sendto.wrongaddressformat"));
        addressErr.value = true;
        // toAddress.value = ''
        return Promise.reject();
      }
    }
    // Listen and select token
    watch(
      () => chooseToken,
      (n) => {
        // if(chooseToken.value.balance)
      },
      { deep: true, immediate: true }
    );
    // Whether the status of the address is selected
    watch(
      () => account,
      (n) => {
        const data = toRaw(n);
        if (JSON.stringify(data.data) == "{}") {
          hasChooseAddress.value = false;
          return;
        }
        hasChooseAddress.value = true;
      },
      {
        deep: true,
        immediate: true,
      }
    );

    const showModal: Ref<boolean> = ref(false);
    const handleShowAccountModal = () => {
      showModal.value = true;
    };

    // Jump to select contacts
    const toContacts = () => {
      router.replace({ name: "contacts-list", query: { backUrl: "send" } });
    };

    // Clear selected addresses
    const clearAddress = () => {
      account.data = {};
      toAddress.value = "";
      commit("transfer/CHOOSE_CONTACT", null);
    };

    // Jump to select token
    const handleTokenModal = () => {
      router.replace({ name: "receive-choose", query: { backUrl: "send" } });
    };

    // Amount change event
    const changeAmount = (v: any) => {
      commit("transfer/UPDATE_AMOUNT", Number(v));
    };
    // Custom gas, change events
    const gasFee = ref(10);
    const onChange = () => { };

    // Use maximum
    const handleMax = () => {
      amount.value = parseFloat(chooseToken.value.balance);
    };

    // Control button disabled
    const btnDisabled = computed(() => {
      return toAddress.value ? false : true;
    });


    // Successfully sent modal
    const showSendSuccessModal = ref(false);

    // clear address
    const clearAdd = () => {
      toAddress.value = "";
      addressErr.value = false;
    };



    // Send confirmation pop-up
    const showSendConfirm = ref(false);
    const handleShowSendConfirm = async () => {
      await checkAddress();
      // @ts-ignoreignore
      const nftInfo = JSON.parse(sessionStorage.getItem('nftInfo'))
      sendTx.value = {
        to: toAddress.value,
        nft_address: nftInfo.address,
        from: accountInfo.value.address
      }
      showSendConfirm.value = true;
    };
    return {
      showSendSuccessModal,
      gasFee,
      onChange,
      t,
      handleShowSendConfirm,
      showSendConfirm,
      gonext,
      handleTokenModal,
      accountInfo,
      toAddress,
      account,
      hasChooseAddress,
      cancelAccount,
      checkAddress,
      showModal,
      handleShowAccountModal,
      decimal,
      currentNetwork,
      scroll,
      toContacts,
      clearAddress,
      amount,
      changeAmount,
      chooseToken,
      handleMax,
      btnDisabled,
      sendTx,
      handleClickAccount,
      indexList3,
      contacts3,
      alist3,
      indexList2,
      contacts2,
      alist2,
      indexList,
      contacts,
      loading,
      addressErr,
      clearAdd,
      addressMask,
      active
    };
  },
};
</script>

<style lang="scss" scoped>
.error-tip {
  color: #d73a49;
}

.clearIcon {
  font-size: 16px;
  color: #d73a49;
}

:deep() {
  .van-field__body {
    border-color: transparent;

    &:hover {
      border-color: transparent;
    }
  }
}

:deep(.van-sticky--fixed) {
  line-height: 46px !important;
  height: 46px !important;
}

:deep(.van-tabs--line .van-tabs__wrap) {
  height: 46px !important;
}

.account-box {
  margin-bottom: 50px;
}

.userinfo-box {
  background: #13051E;
}

.clearAddress {
  font-size: 16px;
  color: white;
}

.slider-box.amount-info {
  width: 100% !important;

  .value {
    color: white;
    font-size: 12px;
  }
}

.cancel {
  font-size: 11px;
  color: white;
}

.up-down-box {
  i {
    color: white;
    font-size: 16px;
  }

  span {
    color: white;
    word-break: keep-all;
  }

  font-size: 12px;
  color: white;
}

:deep(input) {
  font-size: 12px;
  line-height: 16px;
  font-weight: bold;
}

.amount-info {
  width: 82%;

  .van-cell {
    background: none;
    padding: 0;
  }

  .label,
  .value {
    font-size: 12px;
    color: #a4a4a4;
    line-height: 18px;

    &.equal {
      color: white;
    }
  }
}

.to-btns {
  width: 20px;

  i {
    color: white;
    font-size: 20px;
  }
}

.line-box {
  .line {
    height: 1px;
    width: 46%;
    border-bottom: 1px solid #B3B3B3;
  }
}

.userinfo {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  background: #fff;
  border-radius: 5px;
  border: 1PX solid rgba($color: #B3B3B3, $alpha: 0.5);

  &.error {
    border-color: #d73a49;
  }
}

.btn-group {
  margin: 0 20px 0;
}

.from {
  display: flex;
  justify-content: space-around;

  .userfrom {
    font-size: 12px;
    margin-top: 18px;
    width: 76px;
    text-align: center;
  }

  .information {
    border-collapse: collapse;
    width: 100%;
    position: relative;

    &.amount {
      padding: 20px 14px 20px;
    }

    &:hover {
      transition: ease 0.3s;
      background-color: rgba(255,255,255,.05);
    }

    .closeIcon {
      position: absolute;
      right: 10px;
      top: 14px;
      font-size: 18px;
      color: #6a737d;
    }

    .jticon {
      position: absolute;
      right: 10px;
      top: 14px;

      &::before {
        color: #6a737d;
      }
    }

    &::after {
      border-radius: 10px;
    }

    .avatar {
      overflow: hidden;
    }

    .userinformation {
      margin-left: 5px;

      .username {
        font-size: 12px;
        line-height: 14px;
      }

      .userbalance {
        line-height: 14px;
        font-size: 12px;
        color: rgba(132, 140, 150, 1);
      }
    }
  }
}

.to {
  display: flex;
  justify-content: space-between;

  .sendto {
    font-size: 12px;
    margin-top: 18px;
    width: 76px;
    text-align: center;
  }

  .add-ipt {
    width: 100%;
    height: 100%;
    padding-top: 11.4px;
    padding-bottom: 11.4px;

    &::after {
      border-radius: 10px;
    }

    & .van-cell {
      padding-left: 0;
    }

    & .van-cell:after {
      display: none;
    }
  }

  .receiver {
    font-size: 12px;
    text-align: center;
    line-height: 46px;
    width: 286px;
    height: 46px;
    border-radius: 10px;
    border: 1px solid rgba(209, 212, 215, 1);
  }
}

.transfer {
  height: 40px;
  line-height: 40px;
  margin-left: 15px;
  font-size: 12px;
  color: rgba(7, 118, 211, 1);
}

.useravatar {
  width: 30px;
  height: 30px;
  background-color: green;
}

.recent {
  .text {
    width: 100%;
    background-color: rgba(241, 243, 244, 1);
    border: 1px solid rgba(216, 216, 216, 1);
    height: 28px;
    line-height: 28px;
    font-size: 12px;
    color: rgba(121, 121, 121, 1);
    padding-left: 15px;
  }
}

:deep(.van-tab--active) {
  color: white;
}

:deep(.van-tabs__line) {
  display: none;
}

.btn-box {
  padding: 0 15px;
}

.van-tabs {
  margin-bottom: 50px;
}</style>
