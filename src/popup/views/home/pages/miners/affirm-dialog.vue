<template>
  <van-overlay :show="dislogShow" class="custom-overlay">
    <div class="miners">
      <div class="miners-header">
        <span>{{ t('minerspledge.Stackingtit') }}</span>
      </div>
      <div class="miners-container flex column between">
        <div class="miners-container-item">
          <div class="bourse-container-meaning bt">
            <span class="c1">{{ t('minerspledge.nodeDialogTit') }} </span>
            <el-tooltip popper-class="tooltip2" class="box-item" effect="dark" :content="t('minerspledge.nodeTip')" placement="top" trigger="hover">
              <van-icon name="question" color="#9A9A9A" />
            </el-tooltip>
            <div class="exchange">{{ name || currentNetwork.URL }}</div>
          </div>
          <div class="bourse-container-meaning bt">
            <span class="c1">{{ t('minerspledge.address') }} </span>
            <el-tooltip popper-class="tooltip2" class="box-item" effect="dark" :content="t('minerspledge.proxyAddr')" placement="top" trigger="hover">
              <van-icon name="question" color="#9A9A9A" />
            </el-tooltip>
            <div class="exchange add-box">{{ address }}</div>
          </div>
          <div class="bourse-container-meaning bt">
            <span class="c1">{{ t('minerspledge.stackTit') }} </span>
            <el-tooltip popper-class="tooltip3" class="box-item" effect="dark" placement="top" trigger="hover" :content="t('minerspledge.stackTip')">
              <van-icon name="question" color="#9A9A9A" />
              <!--                <span slot="content" style="width: 300px;">{{t('minerspledge.stackTip')}}</span>-->
            </el-tooltip>
            <div class="exchange">{{ amount }} ERB</div>
          </div>
          <div class="">
            <span class="c1">{{ t('send.gasfee') }} </span>
            <el-tooltip popper-class="tooltip2" class="box-item" effect="dark" :content="t('common.gasFee')" placement="top" trigger="hover" style="width: 300px;">
              <van-icon name="question" color="#9A9A9A" />
            </el-tooltip>
            <div class="exchange exchange-z">
              <span>≈ </span>
              <span class="c2"> {{ gasFee }} ERB</span>
            </div>
          </div>
        </div>
        <div class="container-btn flex center column">
          <div>
            <van-button color="white" class="btn" plain @click="dislogShow = false">{{ t('common.cancel') }}</van-button>
            <van-button type="primary" class="btn" :disabled="Time !== 0" round @click="submit">{{ t('common.confirm') }}{{ Time === 0 ? '' : `(${Time}s)` }}</van-button>
          </div>
        </div>
      </div>
    </div>
  </van-overlay>
</template>

<script lang="ts">
import { Button, Overlay, Field, Toast, Icon } from 'vant'
import { ref, SetupContext, computed, nextTick, watch } from 'vue'
import { ethers, utils } from "ethers";
import { useI18n } from 'vue-i18n'
import { ElTooltip } from 'element-plus'
import { toHex } from '@/popup/utils/utils';
import { getGasFee } from '@/popup/store/modules/account';

import { useStore } from 'vuex';

export default {
  components: {
    [Button.name]: Button,
    [Overlay.name]: Overlay,
    [Field.name]: Field,
    ElTooltip,
    [Icon.name]: Icon
  },
  emits: ['open'],
  props: ['show', 'name', 'address', 'money', 'amount'],
  setup(props: any, context: SetupContext) {
    const { t } = useI18n()
    const store = useStore()
    const currentNetwork = computed(() => store.state.account.currentNetwork)
    const { emit }: any = context
    let amount = ref(props.minersMoney)

    const gasFee = ref('0')
    watch(() => props.show, async () => {
      const { address } = store.state.account.accountInfo

      // Agent pledge
      const str = `erbie:{"type":9,"proxy_address":"","proxy_sign":"","version":"v0.0.1"}`
      const data3 = toHex(str);
      
      const tx1 = {
        to: address,
        value: ethers.utils.parseEther(props.amount + ""),
        data: `0x${data3}`,
      };
      gasFee.value = await getGasFee(tx1) || '0'


    }, {
      deep: true,
      immediate: true
    })
    let dislogShow = computed({
      get: () => props.show,
      set: v => emit('update:show', v)
    })
    let money = computed({
      get: () => props.minersMoney,
      set: v => emit('update:minersMoney', v)
    })
    const submit = () => {
      emit('update:show', false)
      emit('open')
    }
    let screentNumber = () => {
      return Number(utils.formatEther(amount.value + '')).toFixed(2)
    }
    let Time = ref(3)
    nextTick(() => {
      let setIntervalValue = setInterval(() => {
        Time.value -= 1
        if (Time.value === 0) {
          clearInterval(setIntervalValue)
        }
      }, 1000)
    })
    return {
      t,
      Time,
      amount,
      money,
      dislogShow,
      submit,
      screentNumber,
      currentNetwork,
      ...props,
      gasFee
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-popper) {
  width: 300px;
}

.add-box {
  letter-spacing: -0.8px;
}

.custom-overlay {
  display: flex;

  .miners {
    width: 341px;
    height: 480.5px;
    background: #150520;
    margin: auto;
    border-radius: 8px;
    overflow: hidden;

    .miners-header {
      height: 62px;
      line-height: 62px;
      text-align: center;
      font-weight: bold;
      background: #24152f;
      color: white;
      font-size: 14px;
      color: white;
      border-bottom: 1px solid #363232;

      span {
        font-size: 15px;
      }
    }

    .miners-container {
      .contaienr-top-header {
        margin: 28px 0 21px 0;

        span {
          &:first-child {
            display: inline-block;
            width: 35px;
            height: 35px;
            line-height: 35px;
            margin-bottom: 12px;
            text-align: center;
            border-radius: 5px 5px 5px 5px;
            opacity: 1;
            color: #0287db;
            border: 3px solid #0287db;
          }

          &:last-child {
            font-weight: bold;
            font-size: 14px;
            color: white;
          }
        }
      }

      .contaienr-top-ipt {
        width: 315px;
        height: 90px;
        margin: auto;
        padding: 11px 15px 20px 15px;
        box-sizing: border-box;
        border-radius: 4px 4px 4px 4px;
        border: 1px solid #363232;

        .ipt {
          width: 280px;

          span {
            font-size: 16px;
            font-weight: bold;
          }
        }

        .text {
          font-size: 14px;
        }

        .user-field {
          font-size: 12px;
        }

        >span {
          font-size: 12px;
          color: #8f8f8f;
        }

        .ipt-text-a {
          padding-top: 20px;
          margin-top: 30px;
          font-size: 12px;
          color: #8f8f8f;
        }

        .ipt-text-b {
          margin: 5px 0 9px 0;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .ipt-server {
          font-size: 12px;
          color: #8f8f8f;
          font-weight: bold;

          span {
            font-weight: 400;
            color: white;
          }

          .ipt-server-i {
            width: 133px;
            height: 30px;
            padding: 0 2px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255,255,255,.05);
            border-radius: 7px 7px 7px 7px;

            &:first-child {
              padding: 0 18px;
            }
          }

          .ipt-server-i-active {
            color: #0287db;
            background: rgba(255,255,255,.05);
            border: 1px solid white;

            span {
              color: #0287db;
            }
          }
        }

        .money {
          margin: 10px 0 20px 0;
          font-size: 12px;
          font-weight: bold;

          span {
            &:first-child {
              color: white;
            }

            &:last-child {
              color: #0287db;
            }
          }
        }

        .ipt-slider {
          margin-left: 5px;
        }

        .stake {
          margin: 20px 0 5px 0;
          font-size: 12px;
          color: #8f8f8f;

          span {
            color: #3aae55;
          }
        }

        :deep() {
          .van-cell {
            padding-left: 0px;
          }
        }

        .van-cell:after {
          display: none;
        }
      }

      .container-btn {
        margin-top: 10px;

        .btn {
          width: 104px;
          height: 45px;
          margin-top: 21px;

          &:first-child {
            margin-right: 35px;
          }
        }

        span {
          font-size: 12px;

          &:first-child {
            margin: 0 5px 0 10px;
            color: #8f8f8f;
          }

          &:last-child {
            color: #0287db;
          }
        }

        .btn-text {
          margin: 15px 0 10px 0;
          font-size: 12px;
          color: #8f8f8f;
        }

        .underline {
          text-decoration: underline;
        }
      }
    }
  }
}

.miners-container-item {
  margin: 25px 12.5px 0 12.5px;
  padding: 17px 15px 0 15px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #363232;
  color: white;

}

.c1 {
  color: white;
}

.exchange {
  margin-top: 7px;
  padding-bottom: 16px;
  border-bottom: 1px solid #363232;
}

.bourse-container-meaning {
  margin-bottom: 16px;
}

.exchange-z {
  border: none;
}

.c2 {
  color: #3aae55;
}</style>