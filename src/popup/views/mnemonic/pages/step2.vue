<template>
  <div v-if="!checkPass" :class="`pwd-card ${pwdErr ? 'err' : ''}`">
    <div class="pt-20 pl-26 pr-26">{{ t('importByMnemonic.unlock') }}</div>
    <van-field v-model="password" type="password" :placeholder="t('exportprivatekey.inputpassword')" />
    <div class="error" v-if="pwdErr">{{ t('loginwithpassword.wrong_password') }}</div>
  </div>
  <div v-else>
    <div class="mnemonic-bg pt-24 pb-24">
      <div class="tit-big text-center f-16">
        {{ t('mnemonic.yourRecoveryPhrase') }}
      </div>
      <div class="flex center">
        <div class="tit-small text-center f-12 mt-10 lh-16">
          {{ t('mnemonic.hint1') }}
        </div>
      </div>
      <div class="flex center">
        <div class="color-p text-center f-12 lh-16">
          {{ t('mnemonic.suggest') }}
        </div>
      </div>
    </div>

    <div class="tip pl-14 pr-14 pb-14  flex">
      <div class="tip-card clickActive mt-16 f-12 flex " v-for="(item, idx) in list.data" :key="idx">
        <div class="icon  text-center">
          {{ idx + 1 }}
        </div>
        <div class="word text-center van-ellipsis">{{ item.name }}</div>
      </div>
    </div>

    <div class="bottom-info text-center">
      <div class="tit1 lh-22 f-16">
        {{ t('mnemonic.getStarted') }}
      </div>
      <div class="tit2 f-12 lh-14">
        {{ t('mnemonic.saveTips') }}
      </div>
    </div>

  </div>

  <van-sticky position="bottom" offset-bottom="30px">
    <div class="btn-groups">
      <div class="container pl-28 pr-28">
        <van-button type="primary" v-if="checkPass" block @click="next">
          {{ t('mnemonic.continue') }}
        </van-button>
        <van-button type="primary" v-else block @click="handleCheck">
          {{ t('common.confirm') }}
        </van-button>
      </div>
    </div>
  </van-sticky>
</template>
<script lang="ts">
import Vue, { onMounted, reactive, ref } from "vue";
import { Icon, Toast, Button, Sticky, Field } from "vant";
import { useRouter } from "vue-router";
import { decryptPrivateKey, parseMnemonic } from "@/popup/utils/web3";
import { getCookies } from "@/popup/utils/jsCookie";
import { useI18n } from "vue-i18n";
import { useToast } from '@/popup/plugins/toast';
import { useStore } from 'vuex';


export default {
  name: "mnemonic-step2",
  components: {
    [Button.name]: Button,
    [Sticky.name]: Sticky,
    [Field.name]: Field
  },
  setup() {
    const { t } = useI18n()
    const router = useRouter();
    const store = useStore()
    const list = reactive({
      data: [] as any[],
    });
    const password = ref()
    onMounted(async () => {
      // Get the decrypted mnemonic
      const password = await getCookies("password");
      const realmm = await parseMnemonic(password, store.state.mnemonic.keyStore);
      const nlist = realmm
        .split(" ")
        .map((key: string) => ({ name: key, status: false }));
      // @ts-ignore
      list.data = nlist;
    });
    const next = () => {
      router.push({
        name: "mnemonic-step3",
      });
    };

    const checkPass = ref(false)
    const pwdErr = ref(false)
    const { $toast } = useToast()
    const privateKey = ref()
    const handleCheck = () => {
      pwdErr.value = false
      if (!password.value) {
        $toast.fail(t('sign.password'));
        pwdErr.value = true
        return;
      }

      try {
        const accountInfo = store.state.account.accountInfo;
        const { keyStore } = accountInfo;
        // Unlock the keystore file of the current account through the password
        const data = {
          password: password.value,
          json: keyStore,
        };

        privateKey.value = decryptPrivateKey(data);
        checkPass.value = true

      } catch (err) {
        pwdErr.value = true
        $toast.fail(t('loginwithpassword.wrong_password'));
      }
    };
    return {
      t,
      list,
      next,
      pwdErr,
      checkPass,
      password,
      handleCheck
    };
  },
};
</script>
<style lang="scss" scoped>
.pwd-card {
  .error {
    color: #D73A49;
    padding: 0 26px;
  }

  .van-cell {
    padding-left: 26px;
    padding-right: 26px;
  }

  &.err {

    :deep() {

      .van-field__body {
        border: 1px solid #D73A49;
        background: #24152f;
      }
    }

  }

  .van-field:after {
    display: none;
  }
}

.tip-card {
  border: 1px solid white;

  .icon {
    border: 1px solid white;
    border-radius: 50%;
  }
}

.mnemonic-bg {
  background: rgba(255, 255, 255, .05);

  .tit-big {
    line-height: 21px;
    color: white;

  }

  .tit-small {
    width: 290px;
    color: rgba(132, 132, 132, 1);
  }

  .color-p {
    color: white;
  }
}

.icon-box {
  .iconele {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
  }
}

.tip {
  width: 320px;
  margin: 30px auto;
  box-sizing: border-box;
  min-height: 100px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: flex-start;

  &:after {
    border-radius: 4px;
  }

  &-card {
    width: 90px;
    height: 23px;
    line-height: 23px !important;
    background: rgba(255, 255, 255, .05);
    color: white;
    position: relative;
    border-radius: 12px;

    &:hover {
      /* background: white;
      color: #fff; */

    }

    .icon {
      width: 23px;
      height: 23px;
      line-height: 23px;
      position: absolute;
      left: -1px;
      top: -1px;
      bottom: 1px;
    }

    .word {
      width: 100%;
      padding-left: 15px;
      line-height: 23px;
    }

    &:after,
    .icon:after {
      border-color: white;
      border-radius: 45px;
    }
  }
}

.bottom-info {
  .tit1 {
    width: 255px;
    margin: 32px auto 0;
  }

  .tit2 {
    width: 255px;
    margin: 16px auto 0;
    color: #848484;
  }
}
</style>