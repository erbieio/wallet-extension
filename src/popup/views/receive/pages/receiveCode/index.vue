<template>
  <NavHeader :title="t('wallet.takeover')">
    <template v-slot:left>
      <span class="back hover f-12" @click="back">{{ t('createAccountpage.back') }}</span>
    </template>
  </NavHeader>
  <div class="text-center lh-16 f-12 tit mt-30">{{ t('receive.transfer') }}</div>
  <div class="text-center lh-24 flex center" v-show="amount > 0">
    <span class="f-18">{{ amount }} {{ chooseToken.name }}</span>
  </div>
  <div class="flex center">
    <div class="code-box flex center mt-16">
      <qrcode-vue :value="code" class="code" :size="300" level="L" ref="coderef"></qrcode-vue>
    </div>
  </div>
  <div class="flex center">
    <div class="load-btn pl-10 pr-10 lh-30 hover f-12">{{ tokenContractAddress || address }}</div>
  </div>

  <div class="flex between btn-group">
    <div class="btn-box">
      <div class="flex center">
        <div class="btn flex center" @click="toCopy">
          <i class="iconfont icon-fuzhi2"></i>
        </div>
      </div>
      <div class="text-center text text-bold mt-4">{{ t('receive.copy') }}</div>
    </div>
    <div class="btn-box">
      <div class="flex center" @click="handleSetAmount">
        <div class="btn flex center">
          <i class="iconfont icon-meiyuan"></i>
        </div>
      </div>
      <div class="text-center text text-bold mt-4">{{ t('receive.amount') }}</div>
    </div>
  </div>
  <!-- Set amount Popup -->
  <CustomExchangeModal v-model="setAmountModal" :defaultAmount="amount" :hasTransferToken="true" @handleConfirm="handleConfirm" />
</template>
<script lang="ts">
import QrcodeVue from 'qrcode.vue'
import { downloadBase64Img } from '@/popup/utils/utils'
import { ref, Ref, computed, toRaw, SetupContext, onMounted, onActivated, getCurrentInstance, ComponentInternalInstance } from 'vue'
import { Icon, NavBar, Form, Field, CellGroup, Button, Toast } from 'vant'
import useClipboard from 'vue-clipboard3'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import CustomExchangeModal from '@/popup/views/home/components/customExchangeModal.vue'
// @ts-ignore
import { encrypt, decrypt } from '@/popup/utils/cryptoJS.js'
import { useI18n } from 'vue-i18n'
import { useToast } from '@/popup/plugins/toast'
import NavHeader from '@/popup/components/navHeader/index.vue'

export default {
  name: 'receive-code',
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button,
    CustomExchangeModal,
    NavHeader,
    QrcodeVue
  },
  setup() {
    const { query } = useRoute()
    const { state } = useStore()
    const { tokenContractAddress } = query
    const router = useRouter();
    const route = useRoute();
    const { address } = state.account.accountInfo
    const { backUrl, clickBackUrl } = query;
    const amount = ref(null)
    const { t } = useI18n()
    const code = ref('')
    const { toClipboard } = useClipboard()
    const { $toast } = useToast()
    const toCopy = async () => {
      try {
        await toClipboard(address)
        $toast.success(t('copy.title'))
      } catch (e) {
        console.error(e)
      }
    }

    onActivated(() => {
      const { query } = useRoute()
      const { tokenContractAddress } = query
      const { address } = state.account.accountInfo
      code.value = JSON.stringify({ data: { address, tokenContractAddress, value: amount.value }, type: 'receive' })
    })
    // Set Amount Modal
    const setAmountModal = ref(false)
    const handleSetAmount = () => {
      setAmountModal.value = true
    }
    const replaceBackUrl = ref(clickBackUrl || '')
    // Set Amount Acknowledge events
    const handleConfirm = (v: number) => {
      amount.value = v
      code.value = JSON.stringify({ data: { address, tokenContractAddress, value: amount.value }, type: 'receive' })
    }
    const back = () => {
      router.replace({ name: replaceBackUrl.value?.toString() || 'wallet' })
    }
    // Currently selected token
    const chooseToken = computed(() => {
      const token = state.transfer.chooseToken
      const name = state.account.currentNetwork.currencySymbol
      return token
        ? token
        : {
          name
        }
    })
    return {
      back,
      code,
      t,
      toCopy,
      chooseToken,
      address,
      tokenContractAddress,
      amount,
      handleSetAmount,
      setAmountModal,
      handleConfirm
    }
  }
}
</script>
<style lang="scss" scoped>
.tit {
  line-height: 31px;
}

.meiyuan {
  color: #848484;
}

.code {
  width: 214px !important;
  height: 214px !important;
}

.code-box {
  width: 236px;
  height: 236px;
  border: 5px solid #57096b;
  padding: 1px;
}

.load-btn {
  max-width: 350px;
  /* background: #f1f3f4; */
  border: 1px solid #fff;
  box-sizing: border-box;
  border-radius: 30px;
  margin: 15px auto 0;
  color: white;

  i {
    font-size: 12px;
  }

  &:hover {
    /* background: rgba(255,255,255,.05); */
    color: #b713e1;
    border: 1px solid #b713e1;
  }
}

.btn-group {
  width: 180px;
  margin: 25px auto 20px;
}

.btn-box {
  .btn {
    width: 34px;
    height: 34px;
    box-sizing: border-box;
    border-radius: 17px;
    border: 1PX solid white;
    cursor: pointer;

    &:hover {
      color: #b713e1;
      border: 1PX solid #b713e1;

      i {
        color: #b713e1;
      }
    }

    i {
      font-size: 18px;
      color: white;
    }
  }

  .text {
    color: white;
    font-size: 12px;
  }
}
</style>