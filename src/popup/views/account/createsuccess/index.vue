<template>
  <div>
    <van-nav-bar :title="$t('createsuccessexchange.title')" left-arrow @click-left="onClickLeft" />
    <div class="create-success-content">
      <!-- page -->
      <van-tabs title-active-color="white" title-inactive-color v-model:active="activeName">
        <van-tab :title="$t('createsuccessexchange.cms')" name="a">
          <div class="con-box">
            <H5 class="header-title">{{t('createsuccessexchange.sendlink')}}</H5>
            <div class="title">{{t('createsuccessexchange.visit')}}</div>
            <div class="title">{{t('createsuccessexchange.share')}}</div>
            <div class="display-box title">
              <a class="link-display" :href="adminUrl" target="__blank">{{adminUrl}}</a>
            </div>
            <!-- button -->
            <van-button @click="tocopyCMS" style="margin-top:20px" plain type="primary" block>
              <van-icon name="share-o" />{{t('createsuccessexchange.copytoclipboard')}}
            </van-button>
            <van-button style="margin-top:25px" disabled type="primary" block>{{t('createsuccessexchange.sendlink')}}</van-button>
          </div>
        </van-tab>
        <van-tab :title="$t('createsuccessexchange.trade')" name="b">
          <div class="con-box">
            <H5 class="header-title">{{t('createsuccessexchange.sendlink')}}</H5>
            <div class="title">{{t('createsuccessexchange.visit')}}</div>
            <div class="title">{{t('createsuccessexchange.share')}}</div>
            <div class="display-box title">
              <a class="link-display" :href="exchangeUrl" target="__blank">{{exchangeUrl}}</a>
            </div>
            <van-button @click="tocopyTrade" style="margin-top:20px" plain type="primary" block>
              <van-icon name="share-o" />{{t('createsuccessexchange.copytoclipboard')}}
            </van-button>
            <van-button style="margin-top:25px" disabled type="primary" block>{{t('createsuccessexchange.sendlink')}}</van-button>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, Ref, computed, toRaw, SetupContext, onMounted } from 'vue'
import { Icon, NavBar, Form, Field, CellGroup, Button, Tab, Tabs, Toast } from 'vant'
import useClipboard from 'vue-clipboard3'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { VUE_APP_EXCHANGESMANAGEMENT_URL, VUE_APP_EXCHANGES_URL } from '@/popup/enum/env'
export default {
  components: {
    [Icon.name]: Icon,
    [NavBar.name]: NavBar,
    [Form.name]: Form,
    [Field.name]: Field,
    [Button.name]: Button,
    [CellGroup.name]: CellGroup,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs
  },
  setup() {
    
    const{t}=useI18n()
    const store = useStore()
    const adminUrl = computed(() => {
      const add =  store.state.account.accountInfo.address
      return `${VUE_APP_EXCHANGESMANAGEMENT_URL}?address=${add.toLowerCase()}&exchangeAddress=${add.toLowerCase()}`
    });
    const exchangeUrl = computed(() => {
       const add =  store.state.account.accountInfo.address
      return `${
        VUE_APP_EXCHANGES_URL
      }/c${add.toLowerCase()}/#/`
    })
    
    const onClickLeft = () => history.back()
    const activeName = ref('a')

    // copy
    const { toClipboard } = useClipboard()
    const tocopyCMS = async () => {
      try {
        await toClipboard(`${adminUrl.value}`)
        Toast.success(t('copy.copy'))
      } catch (e) {
        console.error(e)
      }
    }
    const tocopyTrade = async () => {
      try {
        await toClipboard(`${exchangeUrl.value}`)
        Toast.success(t('copy.copy'))
      } catch (e) {
        console.error(e)
      }
    }

    return {
      t,
      onClickLeft,
      activeName,
      tocopyCMS,
      tocopyTrade,
      adminUrl,
      exchangeUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.create-success-content {
  .con-box {
    padding: 0 20px;
  }
  :deep(){
    .van-tabs__line {
    width: 50%;
    height: 0.05333rem;
    background: white;
  }
  .van-tab {
    position: inherit;
    color: rgba(182, 182, 182, 1);
  }
  .van-tab {
    border-bottom: 0.5px solid rgba(151, 151, 151, 1);
    font-size: 11px;
  }
  }

  .header-title {
    text-align: center;
  }
  .title {
    text-align: center;
    font-size: 12px;
    margin-top: 20px;
    color: white;
  }
  .display-box {
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
    .link-display {
      color: white;
      word-break: break-all;
    }
  }

  margin-top: 20px;
  .copy-button {
    margin: bottom 25px;
  }
}
</style>