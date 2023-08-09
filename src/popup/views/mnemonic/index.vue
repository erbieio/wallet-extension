<template>
    <NavHeader @clickRight="handleRight" backReplaceName="wallet" :title="title"></NavHeader>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
<script lang="ts">
import { Icon, Toast, Button, Sticky, Field } from "vant";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Vue, {computed} from "vue";
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
    const clickLeft = () => {
      router.back();
    }; 
    const handleRight =()=>{
       router.push({
            name: "wallet",
          });
    }
    const title = computed(() => {
      return route.name == 'mnemonic-step3' ? t('mnemonic.tit2') : t('mnemonic.recoveryPhrase') 
    })
    return {
      t,
      title,
      route,
      clickLeft,
      handleRight
    };
  },
};
</script>