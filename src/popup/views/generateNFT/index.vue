<template>
  <van-sticky>
    <NavHeader
      @clickRight="handleRight"
      backReplaceName="wallet"
      :title="t('castingnft.createNFT')"
      :hasRight="false"
    >
      <template v-slot:left>
        <span class="back" @click="appProvide.back">{{
          t("common.back")
        }}</span>
      </template>
    </NavHeader>
  </van-sticky>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>
  <script lang="ts">
import { Icon, Toast, Button, Sticky, Field } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Vue, { inject, onMounted } from "vue";
import { useStore } from 'vuex'
export default {
  name: "pageMnemonic",
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    NavHeader,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { t } = useI18n();
    const { dispatch } = useStore()
    const clickLeft = () => {
      router.back();
    };
    const appProvide: any = inject("appProvide");
    const handleRight = () => {
      router.push({
        name: "wallet",
      });
    };
    onMounted(() => {
      dispatch("configuration/getConfiguration");
    })
    return {
      appProvide,
      t,
      route,
      clickLeft,
      handleRight,
    };
  },
};
</script>