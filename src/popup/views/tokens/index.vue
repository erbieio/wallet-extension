<template>
  <van-sticky>
    <NavHeader :title="t('wallet.importToken')" :hasRight="false"></NavHeader>
  </van-sticky>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
<script lang="ts">
import { Icon, Toast, Button, Sticky, Field } from 'vant'
import NavHeader from '@/popup/components/navHeader/index.vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
export default {
  name: 'page-tokens',
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    NavHeader
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useI18n()
    const clickLeft = () => {
      router.back()
    }
    return {
      route,
      clickLeft,
      t
    }
  }
}
</script>