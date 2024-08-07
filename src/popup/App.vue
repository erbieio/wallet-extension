<template>
  <div :class="`page-box container ${pageType}`" id="page-box">
    <div class="container" id="container">
      <div v-if="route.meta.keepAlive">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
      <div v-else>
        <router-view />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { provide as appProvide } from "@/popup/provides/app";
import { useRoute, useRouter } from "vue-router";
import {
  ref,
  onBeforeMount,
  onMounted,
  computed,
  provide,
} from "vue";
import { useStore, mapActions } from "vuex";
import { Button, Loading } from "vant";
import { utils } from "ethers";
import { useWallet } from "@/popup/hooks/useWallet";
import { useI18n } from "vue-i18n";
import eventBus from "@/popup/utils/bus";

import { getWallet } from "./store/modules/account";
import { version } from "@/popup/enum/version";
import { useEvent } from "@/popup/hooks/useEvent";
import CommonModal from "@/popup/components/commonModal/index.vue";
import { addressMask, transactionStatus } from "./utils/filters";
import { guid } from '@/popup/utils/utils'
import { useBroadCast } from '@/popup/utils/broadCost'
import localforage from 'localforage'
import { VUE_APP_NODE_URL, VUE_APP_SCAN_URL, VUE_APP_NODE_NAME } from '@/popup/enum/env';
import { asyncStoreFromLocal } from './store';
export default {
  components: {
    [Button.name]: Button,
    CommonModal,
  },
  setup() {
    const { t } = useI18n();
    const route = useRoute();
    const store = useStore();
    const { commit, dispatch, state, getters } = store
    const { initWallet } = useWallet();
    const currentNetwork = computed(() => state.account.currentNetwork);
    // @ts-ignore
    const pageType = ref(window ? window.pageType : '')
    provide("appProvide", appProvide());
    onMounted(async () => {
      // update browser session window id
      dispatch('system/setConversationid', guid())
      // Listen to the broadcast of the same source window
      const { broad } = useBroadCast()
      broad.onmessage = async (e: any) => {
        const { action, id } = e
        if (e && action) {
          // If the same-origin window updates the account
          if (action == 'wromHoles-update' && id != state.system.conversationId) {
            asyncStoreFromLocal()
          }
        }
      }
      window.onload = () => {
        // @ts-ignore
        chrome.storage.local.set({ comfirm_password: '' })
        let time = setTimeout(() => {
          document.getElementById('loading-page-box').style.display = 'none'
          document.getElementById('app').style.display = 'block'
          clearTimeout(time)
        }, 500)
        let time2 = setTimeout(function () {
          commit("account/UPDATE_WORMHOLES_URL", {
            URL: VUE_APP_NODE_URL,
            browser: VUE_APP_SCAN_URL,
            label: VUE_APP_NODE_NAME
          });
          clearTimeout(time2);
        }, 2000);

      }

      // move mnemonic to indexDB
      (function () {
        let time = setTimeout(async () => {
          const mnemonic = await localforage.getItem("mnemonic");
          if (!state.mnemonic.keyStore && mnemonic) {
            commit("mnemonic/UPDATE_MNEMONIC", mnemonic);
          }
          clearTimeout(time);
        }, 5000);
      })();
    })
    // Initialize wallet instance
    onBeforeMount(async () => {
      initWallet();
      dispatch("account/getContractAddress");
      dispatch("configuration/getConfiguration");

      useEvent();
    });

    eventBus.on('walletReady', newwallet => {
      dispatch('account/getChainVersion', newwallet);

    })
    const animation = ref("slide");

    return {
      t,
      route,
      addressMask,
      currentNetwork,
      transactionStatus,
      animation,
      pageType
    };
  },
};
</script>
<style lang="scss">
/* #app {
  background: radial-gradient(ellipse at center, #220a35, #0d0316 55%, #0d0316);
} */
.page-container {
  position: relative;
  box-sizing: border-box;
  /* padding-bottom: 30px; */
  color: white;

  &::-webkit-scrollbar {
    display: none;
    /* Chrome Safari */
  }
}

:deep(.van-popup) {
  position: absolute;
}

:deep(.van-overlay) {
  background: rgba(0, 0, 0, 0.5000);
}

.page-box {
  min-height: 100vh;
  transition: ease .3s;
  position: relative;
  margin: 0 auto;
  overflow-y: hidden;
  background: radial-gradient(ellipse at center, #270d3b, #0d0316 55%, #0d0316);

  box-sizing: border-box;



  :deep(.van-toast) {
    word-break: keep-all !important;
  }

  &>.loading-box {
    height: 100vh;
  }

  &.Popup {
    width: 375PX;
    /* min-height: 601PX; */
  }
}

//Trade popover style
.receipt-box {
  .step-box {
    padding: 0 50px;

    div {
      transition: ease 0.3s;
    }

    .num1 {
      background: white;
      border: 1PX solid white;
      color: #fff;
    }

    &.receive {

      .line1::after,
      .line2::after {
        border-color: white !important;
      }

      .num3 {
        background: white;
        border: 1PX solid white;
        color: #fff;
      }
    }

    .num2 {
      background: white;
      border: 1PX solid white;
      color: #fff;
    }

    &.pending {
      .line1::after {
        border-color: #68b1e6 !important;
      }

      .num2 {
        background: #68b1e6;
        border: 1PX solid #68b1e6;
        color: #fff;
      }
    }
  }

  .label-box {
    padding: 0 45px;

    div {
      line-height: 16px;
      transition: ease 0.3s;
      color: #979797;
    }

    &.pending {
      .send {
        color: white;
      }

      .con {
        color: #68b1e6;
      }
    }

    &.receive {

      .send,
      .done {
        color: white;
      }
    }

    .con {
      color: white;
    }
  }

  .num {
    width: 18px;
    line-height: 16px;
    text-align: center;
    font-size: 12px;
    border-radius: 9px;
    color: #979797;
    border: 1PX solid #b3b3b3;
  }

  .line {
    height: 1px;
    flex: 1;
    margin-left: 4px;
    margin-right: 4px;

    &::after {
      border-color: #979797 !important;
      border-style: dashed;
    }
  }
}

.receive-info {
  border: 1PX solid #363232;
  border-radius: 5px;

  * {
    transition: ease all 0.3s;
  }

  div {
    line-height: 28px;
    color: #979797;
  }

  .status1 span {
    display: inline-block;
    line-height: 14px;
    color: rgba(58, 174, 85, 1);
    background: #e5ffeb;
    padding: 0 5px;
    border-radius: 7px;
  }

  .status0 span {
    display: inline-block;
    line-height: 14px;
    color: rgb(214, 25, 25);
    background: #ffe8e5;
    padding: 0 5px;
    border-radius: 7px;
  }
}
</style>
