import { SetupContext, Ref, ref, reactive, defineComponent, toRaw } from "vue";
import { useStore } from "vuex";
import { computed, onMounted } from "vue";
import { NetWorkData } from '@/popup/enum/network'
import { Toast } from "vant";
import { useI18n } from 'vue-i18n'
import i18n from '@/popup/language/index'
import eventBus from '@/popup/utils/bus'
// import { getWallet, NetStatus } from "@/popup/store/modules/account";
export const useNetWork = () => {
    const {t}=useI18n()
    const store = useStore()
    const { dispatch, commit } = store
    // Currently selected network
    const currentNetwork = computed(() => store.state.account.currentNetwork)
    // List of network
    const netWorkList = computed(() => {
        const { netWorkList, currentNetwork } = store.state.account
        // The network that filters out the main network
        return netWorkList.filter((item: NetWorkData) => {
            if (!item.isMain) {
                return item
            }
        })
    })
    const mainNetwork = computed(() => {
        return store.state.account.netWorkList.find((item:NetWorkData) => item.isMain)
    })
    const networkLoading: Ref<boolean> = ref(false)
    // Select the network popover
    const showModalNetwork: Ref<boolean> = ref(false);
    // Open the Switch network pop-up window
    const chooseNetWork = () => {
        // Update network list data when reopening
        commit('account/UPDATE_NETWORKSTATUS', currentNetwork)
        showModalNetwork.value = true;
    };
    let chooseN: NetWorkData = null
    const handleChoose = (data: NetWorkData) => {
        chooseN = data
        // Updated the network selection status in vuEX
        commit('account/UPDATE_NETWORKSTATUS', chooseN)
    }
    const handleChooseComfirm = async (data: NetWorkData) => {
        // commit('account/UPDATE_NETSTATUS', NetStatus.pendding)
        chooseN = data
        // Updated the network selection status in vuEX
        commit('account/UPDATE_NETWORKSTATUS', chooseN)
        // Update Network Update balance
        if (chooseN) {
            networkLoading.value = true
            try {
                await dispatch('account/setNetWork', chooseN).finally(() => networkLoading.value = false)
                dispatch("account/updateAllBalance")
                dispatch('account/getChainVersion')
                showModalNetwork.value = false
                eventBus.emit('changeNetwork',chooseN)
            } catch (err) {
                Toast(JSON.stringify(err))
            } finally { () => networkLoading.value = false }
        } else {
            Toast(i18n.global.t('internet.checknetwork'))
        }
    }

    return {
        t,
        netWorkList,
        currentNetwork,
        showModalNetwork,
        chooseNetWork,
        handleChoose,
        handleChooseComfirm,
        chooseN,
        networkLoading,
        mainNetwork
    }
}