<template>
  <div class="ai-page">
    <van-form @submit="onSubmit">
      <van-cell-group class="formGroup">
        <div class="label mb-6">
          <span class="mr-4">*</span>{{ t("generateNFT.promptWord") }}
          <van-popover
            v-model:show="showWord"
            theme="dark"
            placement="bottom-start"
          >
            <div class="p-10">
              <div>{{ t("generateNFT.promptTip") }}</div>
              <div>{{ t("generateNFT.promptTip1") }}</div>
              <div>{{ t("generateNFT.promptTip2") }}</div>
            </div>
            <template #reference>
              <van-icon
                name="question hover"
                @mouseover="showWord = true"
                @mouseleave="showWord = false"
              />
            </template>
          </van-popover>
        </div>
        <van-field
          :class="wordErr ? 'error' : ''"
          label-align="top"
          v-model="promptWord"
          :disabled="query.address ? true : false"
          autosize
          :rows="6"
          clearable
          type="textarea"
          label=""
          :placeholder="t('generateNFT.placeholder')"
          :rules="[{ validator: validatorWord }]"
        />

        <div class="label mt-16">
          <span class="mr-4">*</span>{{ t("castingnft.royalty") }} ( 1%-10% )
       
        </div>
        <van-field
          v-model="royalty"
          name="royalty"
          :disabled="query.address ? true : false"
          :class="royaltyErr ? 'error' : ''"
          type="digit"
          @blur="blurRoyalty"
          :placeholder="$t('castingnft.royaltyPlaceholder')"
          :rules="[{ validator: validRoyalty }]"
        />

        <div class="label mt-16 mb-8">
          {{ t("generateNFT.creativeMode") }}
          <van-popover v-model:show="showSwitch" theme="dark" placement="right">
            <p class="pl-10 pr-10">{{ t("generateNFT.aiDrawTip",{money: sendVal}) }}</p>
            <template #reference>
              <van-icon
                name="question hover"
                @mouseover="showSwitch = true"
                @mouseleave="showSwitch = false"
              />
            </template>
          </van-popover>
        </div>
        <div class="form-item">
          <van-switch v-model="checked" size="20" :disabled="readonlySwitch" @change="handleChange" />
        </div>

        <div v-if="checked">
          <div class="label mt-16 mb-8">
            <span class="mr-4">*</span>{{ t("generateNFT.emailAddr") }}
            <van-popover v-model:show="showAddr" theme="dark" placement="right">
              <p class="pl-10 pr-10">{{ t("generateNFT.emailTip") }}</p>
              <template #reference>
                <van-icon
                  name="question hover"
                  @mouseover="showAddr = true"
                  @mouseleave="showAddr = false"
                />
              </template>
            </van-popover>
          </div>
          <van-field
            v-if="isModif || checked"
            :class="emailErr ? 'error' : ''"
            label-align="top"
            v-model="emailAddr"
            label=""
            clearable
            :placeholder="t('generateNFT.placeEmail')"
            :rules="[{ validator: validatorEmail }]"
          />
          <div class="form-item" v-else>
            <span>{{ emailAddr }}</span>
            <i
              class="iconfont icon-bianji ml-6 hover"
              @click="isModif = false"
            ></i>
          </div>
        </div>
      </van-cell-group>
      <!-- <div class="btn-box mt-30">
        <div class="container flex center pl-28 pr-28">
          <van-button round block type="primary" native-type="submit">
            {{ t("sendto.next") }}
          </van-button>
        </div>
      </div> -->
    </van-form>

    <CommonModal
      v-model="showGenerateModal"
      :title="t('generateNFT.geneateComfirm')"
    >
      <CreateModal
        @cancel="showGenerateModal = false"
        @confirm="handleConfirm"
        :gasFee="gasFee"
        :value="sendVal"
        :sendAddr="sendAddr"
        :promptWord="promptWord"
        :email="emailAddr"
      />
    </CommonModal>
  </div>
</template>
<script lang="ts" setup>
import { collectibleRules, regAa, regEmail, RegUrl } from "@/popup/enum/regexp";
import {
  Form as VanForm,
  CellGroup as VanCellGroup,
  Field as VanField,
  Button as VanButton,
  Icon as VanIcon,
  Popover as VanPopover,
  Switch as VanSwitch,
} from "vant";
import { onMounted, ref, Ref,watch, computed } from "vue";
import BigNumber from "bignumber.js";
import { useI18n } from "vue-i18n";
import {
  getAiServerAddr,
  drawImage,
  getEmailByUser,
  DrawImageParams,
  getPaintFee,
} from "@/popup/http/modules/nft";
import CommonModal from "@/popup/components/commonModal/index.vue";
import CreateModal from "../components/createModal.vue";
import { useStore } from "vuex";
import { ethers } from "ethers";
import { web3 } from "@/popup/utils/web3";
import { useTradeConfirm } from "@/popup/plugins/tradeConfirmationsModal";
import { TradeStatus } from "@/popup/plugins/tradeConfirmationsModal/tradeConfirm";
import { useToast } from "@/popup/plugins/toast";
import { useRouter, useRoute } from "vue-router";
import { getGasFee, getProvider } from "@/popup/store/modules/account";
import localforage from 'localforage';
import { clone } from 'pouchdb-utils';


const { $toast } = useToast();
const { $tradeConfirm } = useTradeConfirm();
const router = useRouter();
const store = useStore();
const { dispatch, state } = store;
const { t } = useI18n();
const showWord = ref(false);
const emailErr = ref(false);
const wordErr = ref(false);
const royaltyErr = ref(false);
const route = useRoute();
const sendAddr = ref("");
const sendVal = ref(0)
const query: any = route.query;
const info = query.info ? JSON.parse(query.info) : null;
const promptWord = ref(info ? info.prompt : "");
const checked = ref(info ? true : false);
const showAddr = ref(false);
const showSwitch = ref(false);
const readonlySwitch = ref(info ? true : false);
const emailAddr = ref(query.user_mail || "");
const isModif = ref(query.address ? true : false);
const royalty: Ref<number | string> = ref(
  query.royalty_ratio ? Number(query.royalty_ratio) / 100 : ""
);
const sensitiveWords = computed(() => store.state.configuration.setting.sensitiveWords)
const accountInfo = computed(() => store.state.account.accountInfo)

const gasFee = ref("");
const showGenerateModal = ref(false);
interface ForBidImg {
  time: number;
  url: string
}

const filtersImgUrls:Ref<ForBidImg[]> = ref([])
watch(() => checked.value, n => {
  if(!n) {
    emailAddr.value = ''
  }
})
const onSubmit = async () => {
  if (checked.value && RegUrl.test(promptWord.value)) {
    $toast.warn(t("generateNFT.normalNftTip"));
    return;
  }
  showGenerateModal.value = true;
  const isNormalCreate = !checked.value && RegUrl.test(promptWord.value);
  const myAddr = state.account.accountInfo.address;

  // Not ordinary casting to determine whether pure ai drawing
  try {
    if (!isNormalCreate) {
    const gas2 = await getGasFee({
      to: myAddr,
      value: ethers.utils.parseEther("0"),
    });
    // Judge whether it is simple drawing or casting + drawing
    if (readonlySwitch.value) {
      gasFee.value = gas2;
    } else {
      const gas1 = await handleGetGas();
      gasFee.value = new BigNumber(gas1).plus(gas2).toString();
    }

  } else {
    const gas1 = await handleGetGas();
    gasFee.value = gas1;
  }
  }catch(err){
    $toast.fail(err.message)
  }
};

const handleGetGas = async () => {
  const isNormalCreate = !checked.value && RegUrl.test(promptWord.value);
  const myAddr = state.account.accountInfo.address;
  const randomNumber = Math.round(Math.random() * 2147483647) + "";
  const nft_data: any = {};
  if (isNormalCreate) {
    nft_data.meta_url = promptWord.value;
  } else {
    nft_data.prompt = promptWord.value;
    nft_data.randomNumber = randomNumber;
    nft_data.version = 'v1'
  }
  const par = {
    version: "0.0.1",
    type: 0,
    royalty: Number(royalty.value) * 100,
    exchanger: "",
    meta_url: web3.utils.fromUtf8(JSON.stringify(nft_data)),
  };
  const parstr = `erbie:${JSON.stringify(par)}`;
  const newdata = web3.utils.fromUtf8(parstr);
  const tx = {
    to: myAddr,
    from: myAddr,
    data: newdata,
    value: isNormalCreate ? ethers.utils.parseEther('0') :ethers.utils.parseEther(sendVal.value.toString()),
  };
  const gas1 = await getGasFee(tx);
  return gas1;
};
// 1 normal create nft
const normalCreate = async () => {
  const nft_data = {
    meta_url: promptWord.value,
  };
  const { receipt, nft_address, owner, hash } = await handleSendCreate(
    nft_data,
    () => {
      const localUrls = filtersImgUrls.value
      localUrls.push({url: promptWord.value, time: new Date().getTime()})
      localforage.setItem('forbid-img-urls', clone(localUrls))
      $tradeConfirm.update({ status: "approve" });
    }
  );

  $tradeConfirm.update({
    status: "success",
    hash,
    callBack() {
      router.replace({ name: "generateNFT-success" });
    },
  });

  return { receipt, nft_address, owner };
};
// 2 ai create nft
const aiCreate = async () => {
  const randomNumber = Math.round(Math.random() * 2147483647) + "";
  const nft_data = {
    prompt: promptWord.value,
    randomNumber,
    version: 'v1'
  };
  const { receipt, nft_address, owner } = await handleSendCreate(nft_data);
  const drawParams = {
    useraddr: owner,
    nftaddr: nft_address,
    email: emailAddr.value.toString(),
    drawflag: "1",
  };
  const drawData = await drawImage(drawParams);
  const sendData = {
    nft_address,
    owner,
    version: "v1"
  }
  const txData = await dispatch("account/transaction", {
    value: sendVal.value,
    to: sendAddr.value,
    data: web3.utils.fromUtf8(JSON.stringify(sendData))
  });
  $tradeConfirm.update({ status: "approve" });
  const txReceipt = await txData.wait();

  if (txReceipt.status != 1) {
    $tradeConfirm.update({
      status: "fail",
      hash: txData.hash,
      callBack() {
        router.replace({ name: "wallet" });
      },
    });
    return Promise.reject('tx fail');
  }


  return { nft_address, owner, hash: txData.hash };
};

// send create nft tx data
const handleSendCreate = async (nft_data = {}, call = (v: any) => {}) => {
  const myAddr = state.account.accountInfo.address;
  const par = {
    version: "0.0.1",
    type: 0,
    royalty: Number(royalty.value) * 100,
    exchanger: "",
    meta_url: web3.utils.fromUtf8(JSON.stringify(nft_data)),
  };
  const parstr = `erbie:${JSON.stringify(par)}`;
  const newdata = web3.utils.fromUtf8(parstr);
  const tx = {
    to: myAddr,
    from: myAddr,
    data: newdata,
    value: "0",
  };
  const txRes = await dispatch("account/transaction", tx);
  call(txRes);
  const receipt = await txRes.wait();
  const {
    logs: [log],
    status,
  } = receipt;
  if (!status) {
    return Promise.reject("failure of transaction");
  }
  const { topics } = log;
  const [addr1, fullnftaddr] = topics;
  const nft_address = "0x" + fullnftaddr.substr(fullnftaddr.length - 40);
  // const owner = "0x" + fullowner.substr(fullowner.length - 40);
  return { receipt, nft_address, owner: myAddr, hash: txRes.hash };
};

const handleConfirm = async () => {
  const isNormalCreate = !checked.value && RegUrl.test(promptWord.value);
  showGenerateModal.value = false;
  $tradeConfirm.open({
    disabled: [TradeStatus.pendding],
    callback() {
      router.push({
        name: "generateNFT-success",
      });
    },
  });
  try {
    const myAddr = state.account.accountInfo.address;
    if (!readonlySwitch.value) {
      if (isNormalCreate) {
        await normalCreate();
      } else {
        if (checked.value) {
          const { nft_address, owner, hash }: any = await aiCreate();
          $tradeConfirm.update({
            status: "success",
            hash: hash,
            callBack() {
              router.replace({ name: "generateNFT-success" });
            },
          });
        } else {
          const randomNumber = Math.round(Math.random() * 2147483647) + "";
          const nft_data = {
            prompt: promptWord.value,
            randomNumber,
            version: 'v1'
          };
          const { receipt, nft_address, owner } = await handleSendCreate(
            nft_data
          );
          $tradeConfirm.update({
            status: "success",
            hash: receipt.transitionHash,
            callBack() {
              router.replace({ name: "generateNFT-success" });
            },
          });
        }
      }
    } else {

      const nft_address = query.address ? query.address.toString() : ""
      const sendData = {
        owner: myAddr,
        nft_address,
        version: "v1"
      }
      const drawParams = {
        useraddr: myAddr.toString(),
        nftaddr: nft_address,
        email: emailAddr.value.toString(),
        drawflag: "1",
      };
      await drawImage(drawParams);
      // Step 3 draw
      const txData = await dispatch("account/transaction", {
        value: sendVal.value,
        to: sendAddr.value,
        data: web3.utils.fromUtf8(JSON.stringify(sendData))
      });
      $tradeConfirm.update({ status: "approve" });
      const txReceipt = await txData.wait();
      

      if (txReceipt.status != 1) {
        $tradeConfirm.update({
          status: "fail",
          hash: txData.hash,
          callBack() {
            router.replace({ name: "wallet" });
          },
        });
        return;
      }
      $tradeConfirm.update({
        status: "success",
        hash: txData.hash,
        callBack() {
          router.replace({ name: "generateNFT-success" });
        },
      });
    }
  } catch (err: any) {
    console.error(err);
    $toast.warn(err.reason);
  } finally {
    dispatch('account/waitTxQueueResponse')
    showGenerateModal.value = false;
  }
};

const validatorEmail = (v: string) => {
  if (!v) {
    emailErr.value = true;
    return t("generateNFT.emailNotNull");
  }
  if (!regEmail.test(v)) {
    emailErr.value = true;
    return t("generateNFT.emailError");
  }
  emailErr.value = false;
  return true;
};

const validatorWord = (v: string) => {
  if (!v) {
    wordErr.value = true;
    return t("generateNFT.promptWordNotNull");
  }
  if (
    regAa.test(v) && !RegUrl.test(v)
  ) {
    // Sensitive word blocking
    const wordList = []
    sensitiveWords.value.forEach(e => {
      if (v.replace(/\s+/g, " ").toUpperCase().search(e.toUpperCase()) > -1) {
        wordList.push(e)
      }
    })
    if (wordList.length) {
      wordErr.value = true;
      return t("generateNFT.promptWordIsSensitive", { words: wordList.join(',') });
    } else {
      wordErr.value = false;
      return true;
    }
  }
  if (RegUrl.test(v)) {
    const hasUrl = filtersImgUrls.value.find(item => item.url == v);
    if(hasUrl) {
      wordErr.value = true;
      return t('generateNFT.repeatImgUrl')
    }
    wordErr.value = false;
    return true;
  }

  if (!regAa.test(v) && !RegUrl.test(v)) {
    wordErr.value = true;
    return t("generateNFT.promptWordErr");
  }

  wordErr.value = false;
  return true;
};

const validRoyalty = (v: string) => {
  if (!v) {
    royaltyErr.value = true;
    return t("castingnft.numbersof");
  }
  royaltyErr.value = false;
  return true;
};

const blurRoyalty = () => {
  const bigInt = new BigNumber(royalty.value || "0");
  if (bigInt.gt(10)) {
    royalty.value = 10;
    return;
  }
  if (bigInt.lt(1)) {
    royalty.value = 1;
    return;
  }
  // Keep one decimal place
  royalty.value = parseInt(bigInt.toFormat(1).toString());
};

onMounted(async () => {
  const res = await getAiServerAddr();
  sendAddr.value = res.data;
  const res2 = await getPaintFee()
  sendVal.value = ethers.utils.formatUnits(res2.data, 'ether')
  if (readonlySwitch.value) {
    const myAddr = state.account.accountInfo.address;
    const resEmail = await getEmailByUser({ useraddr: myAddr });
    emailAddr.value = resEmail.data;
  }
  localforage.getItem('forbid-img-urls').then(res => {
    filtersImgUrls.value = res ? res as Array<ForBidImg> : []
  })
});

const handleChange = async(e) => {
  if(e) {
    const provider = await getProvider()
    const balance = await provider.getBalance(accountInfo.value.address)
    const am = ethers.utils.formatEther(balance);
    const minVal = sendVal.value + 1
    if(new BigNumber(am).lt(minVal)) {
      $toast.warn(t('common.ispoor'))
      checked.value = false
    }
  }
}
</script>
<style lang="scss" scoped>
.ai-page {
  padding: 20px 0 0;
}

:deep() {
  .van-cell .van-field__body {
    min-height: 44px;
    height: auto;
  }

  .van-field--label-top {
    padding: 0 15px;
  }

  .formGroup {
    &::after {
      display: none;
    }
  }

  .van-cell::after {
    display: none;
  }

  .van-field__error-message {
    margin-top: 7px;
  }
}

.label {
  padding: 0 15px;
  line-height: 17px;
  font-size: 12px;
  font-weight: bold;

  span {
    color: red;
    font-weight: normal;
  }
}

.form-item {
  padding: 0 15px;
  font-size: 12px;

  i {
    color: grey;
    font-size: 12px;
  }
}


</style>