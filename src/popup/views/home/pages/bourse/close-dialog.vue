<template>
    <div v-if="show" class="dialog-warning-dark">
      <div v-if="show" class="dialog-warning">
        <div class="dialog-warning-header" style="color:white;">{{t('bourse.closeTit')}}</div>
        <div class="warning-icon">
            <van-icon color="#D73A49" name="warning" size="35" />
        </div>
        <div class="warning-text">
            <span>{{t('bourse.tip9')}}</span>
        </div>
        <div class="footer-btns">
            <van-button @click="show = false"  style="width: 100px;" class="btn" round plain >{{t('common.cancel')}}</van-button>
            <van-button style="width: 100px;" type="danger" class="btn" :disabled="Time !== 0" round @click="emitWarningSuccess">{{t('common.confirm')}}{{Time === 0 ? '' : `(${Time}s)`}}</van-button>
      </div>
    </div>
    </div>
</template>

<script lang="ts">
import { emit } from 'process'
import { Icon, Checkbox, Button, Toast } from 'vant'
import { ref,nextTick, Ref, computed, toRaw, SetupContext, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
export default {
    components: {
        [Icon.name]: Icon,
        [Button.name]: Button
    },
    props: {
        isWarning: {
            type: Boolean,
            default: false
        },
    },
    setup(props: any, context: SetupContext) {
        let Time = ref(3)
        nextTick(() => {
          let setIntervalValue = setInterval(() => {
            Time.value -= 1
            if (Time.value === 0) {
              clearInterval(setIntervalValue)
            }
          }, 1000)
        })
                const {t} = useI18n()

        const { emit }: any = context
        const show = computed({
            get() {
                return props.isWarning
            },
            set(v: boolean) {
                emit('update:isWarning', v)
            }
        })
        const emitWarningSuccess = () => {
            show.value = false
            emit('warningSuccess')
        }
        const text = props.text
        return {
            show,
            text,
            emitWarningSuccess,
            Time,
            t
        }
    }
}
</script>

<style lang="scss" scoped>
.dialog-warning-dark {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.7000);
  z-index: 9000;
}
    .dialog-warning {
        z-index: 9999;
        width: 340px;
        height: 280px;
        background: #fff;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        max-width: 340px;
        font-size: 15px;
        border-radius: 8px;
        overflow: hidden;
    }
    .dialog-warning-header {
      height: 62px;
      line-height: 62px;
      text-align: center;
      font-size: 15px;
      color: #B3B3B3;
      background: rgba(255,255,255,.05);
      font-weight: bold;
    }
    .warning-icon {
        padding: 25px;
        padding-top: 25px;
        text-align: center;
    }
    .warning-text {
        text-align: center;
        padding: 0 75px;
        font-size: 14px;
        color: white;
    }
    .footer-btns {
      display: flex;
      justify-content: space-between;
      padding: 0 50px;
      margin-top: 30px;
        div {
            padding: 25px;
            text-align: center;
            span {
                display: inline-block;
                width: 100px;
                height: 45px;
                font-size: 12px;
                border-radius: 50px;
                text-align: center;
                line-height: 45px;
                box-sizing: border-box;
                &:first-child {
                    color: white;
                    margin-right: 40px;
                    border: 1px solid white;
                }
                &:last-child {
                    background-color: #D73A49;
                }
            }
        }
    }
</style>