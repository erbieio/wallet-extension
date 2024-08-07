<template>
  <div class="van-hairline--top">
    <van-index-bar sticky :sticky-offset-top="offsetTop" :index-list="indexList">
      <div v-for="(item, idx) in contacts" :key="idx">
        <van-index-anchor :index="item.label" />
        <div
          @click="handlerClick(child)"
          class="contact-card flex pt-14 pb-14 border-bottom"
          v-for="child in item.children"
          :key="child.address"
        >
          <div class="contact-icon flex center">
            <div class="contact-icon-box">
              <AccountIcon :data="child.icon" />
            </div>
          </div>
          <div class="contact-info ml-6">
            <div class="contact-info-name f-12 lh-16">{{ child.name }}</div>
            <div class="contact-info-address f-12 lh-16">{{ child.address }}</div>
          </div>
        </div>
      </div>
    </van-index-bar>
  </div>
</template>
<script lang="ts">
import { Icon, Toast, Button, Sticky, Field, Dialog, IndexBar, IndexAnchor, Cell } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { Language, languages } from '@/popup/enum/language'
import { defineComponent, Ref, ref, watch, SetupContext, computed } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import AccountIcon from '@/popup/components/accountIcon/index.vue'
import { getRandomIcon } from '@/popup/utils/index'
import { addressMask } from '@/popup/utils/filters'

export default defineComponent({
  name: 'contacts-list',
  emits: ['handleClick'],
  props: {
    contacts: {
      type: Array,
      default: []
    },
    indexList: {
      type: Array,
      default: []
    },
    handleClick: {
      type: Boolean,
      default: false
    },
    offsetTop: {
      type: Number,
      defult: 0
    }
  },
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Field.name]: Field,
    [Sticky.name]: Sticky,
    [IndexBar.name]: IndexBar,
    [IndexAnchor.name]: IndexAnchor,
    [Cell.name]: Cell,
    AccountIcon
  },
  setup(props: any, context: SetupContext) {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const { emit } = context
    const { commit } = store

    const handlerClick = (data: any) => {
      // Trigger the event when there is a click event
      if (props.handleClick) {
        emit('handleClick', data)
        return
      }
      // Otherwise, it will be returned according to the backurl of the current route
      const { backUrl } = route.query
      if (backUrl) {
        commit('transfer/CHOOSE_CONTACT', data)
        router.replace({ name: backUrl.toString() })
      } else {
        router.push({ name: 'contacts-add', query: data })
      }
    }
    return {
      handlerClick,
      addressMask
    }
  }
})
</script>
<style lang="scss" scoped>
:deep(.van-index-anchor) {
  background: #24152f;
  color: #eee;
  line-height: 30px;
}
:deep(.van-index-bar__sidebar) {
  color: #909090;
  right: 8px;
}
:deep(.van-index-bar__index) {
  width: 18px;
  height: 18px;
  text-align: center;
  line-height: 18px;
  margin-bottom: 4px;
  padding: 0;
}
:deep(.van-index-bar__index--active) {
  background: white;
  color: #fff;
  border-radius: 9px;
}
.contact-card {
  transition: ease all 0.2s;
  padding-left: 15px;
  padding-right: 15px;
  &:hover {
    cursor: pointer;
    background: #24152f;
    box-shadow: 0 2px 4px rgb(6 58 95 / 10%);
  }
  .contact-icon {
    &-box {
      overflow: hidden;
    }
  }
  .contact-info {
    padding: 2px 0;
    &-name {
      color: white;
    }
    &-address {
      color: #909090;
    }
  }
}
</style>