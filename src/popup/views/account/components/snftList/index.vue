<template>
  <!-- <van-pull-refresh v-model="loadNft" @refresh="onRefresh"> -->
  <van-list v-model:loading="loadNft" :finished="finished" @load="handleOnLoad" v-model:error="nftErr">
    <van-sticky :offset-top="91">
      <div>
        <div class="flex between nfttransfer-box center-v pl-14 pr-14">
          <span class="tit lh-30 f-12 text-bold">
            {{ t("createNft.converttoERB") }} {{ t('createExchange.convert') }}
          </span>
          <van-switch v-model="showConvert" size="17" @change="handleChangeSwitch" v-if="newList.list.length" />
        </div>
      </div>
    </van-sticky>
    <div :class="`nft-list-box ${!loadNft && newList.list.length ? 'mb-90' : ''}`">
      <div :class="`nft-list ${layoutType} ${showConvert ? 'pb' : ''}`" v-show="newList.list.length">

        <div :class="`snft-card ${item.mergelevel == 3 ? 'shining-out' : ''}`" v-for="(item, index) in newList.list" :key="item.nft_address">
          <div class="snft-card-tit flex between">
            <span class="tit">{{ item.period }} {{ t('common.period') }}</span>
          </div>
          <div :class="`snft-card-list flex ${item.mergelevel == 3 ? 'active' : ''}`">
            <div :class="`coll-card hover ${child.garyClass} ${child.shiningClass}`" v-for="(child, idx) in item.children" :key="child.nft_address" @mouseover="handleMouseOver({ index, item, child, idx })" @mouseleave="handleMouseOut({ index, item, child, idx })">
              <i class="iconfont icon-duihao2 check-icon" v-if="child.checked && showConvert && child.canSelect" @click="handleSelect({ index, item, child, idx, checked: false })"></i>
              <img src="./select-white.svg" class="check-icon-default no-select" alt="" v-if="showConvert && !child.checked && child.canSelect" @click="handleSelect({ index, item, child, idx, checked: true })" />
              <img loading="lazy" @error="loadImg(child, idx)" :src="`${child.imgUrl}`" class="snft-img" />
              <img v-show="child.loadErr" loading="lazy" src="@/assets/default.png" class="snft-img" />
              <span class="arrow-top" v-if="child.children && child.children.length"></span>
            </div>
          </div>
          <Transition name="fade">
            <div v-if="item.load && item.showDetails" :class="['snft-list-out', showSNFTIdx > 8 ? 'sec' : '']" @mousemove="handleSNFTSMouseOver" @mouseleave="handleSNFTSMouseLeave({ item, index })">
              <div class="snft-list">
                <div class="flex center" v-show="item.load == 'loading'">
                  <van-loading size="28" color="#9F54BA"></van-loading>
                </div>
                <div v-for="(sun, i) in showSNFTList" class="snft-child hover" :key="sun.nft_address" @click="toDetail(sun, i)">
                  <img loading="lazy" v-if="!sun.loadErr" @error="loadImg(sun, i)" :src="`${sun.imgUrl}`" class="snft-img" />
                  <img v-show="sun.loadErr" loading="lazy" src="@/assets/default.png" class="snft-img" />

                </div>
              </div>
            </div>

          </Transition>
          <div class="process-bar">
            <!-- <div class="tit">Ratio(1:{{ item.ratio }})</div> -->
            <div class="animate-bar">
              <div class="animate-bar-scale" v-for="i in 9"></div>
              <div class="animate-bar-track" :style="{ width: `${item.processBar}%` }"></div>
            </div>
            <div class="flex right total-poss">
              <div class="text-right">{{ item.Chipamount }}/4096</div>
            </div>
          </div>
          <div class="select-all flex center-v">
            <span v-if="showConvert" class="flex center-v mr-6"><i :class="`iconfont hover ${item.checked ? 'icon-duihao2' : 'icon-check_line'}`" @click="handleAllSelect({ index, item })"></i>
              {{ t('common.all') }}</span> {{ item.selectedStr }}/{{ item.Chipamount }}
          </div>
        </div>
      </div>
      <!-- no data -->
      <!-- <div class="flex center no-list pt-30" v-show="!newList.list.length && !nftErr && finished">
        <i class="iconfont icon-inbox"></i>
      </div> -->
      <NoData v-show="!newList.list.length && !nftErr && finished" />

      <!-- error -->
      <div class="err-nft p-20" v-if="nftErr">
        <div class="text-center mt-20 mb-20 f-14">
          {{ t("createNft.pullagain") }}
        </div>
        <div class="flex center">
          <van-button @click="reLoading">{{ t("createNft.retry") }}</van-button>
        </div>
      </div>
    </div>
  </van-list>

  <Transition name="slider">
    <div class="load-tip flex center" v-if="showConvert && loadNft">
      <div class="load-tip-con flex-1 flex center"><van-loading color="#9F54BA" size="13" /> <span class="ml-4">{{ t('common.loading') }}</span></div>
    </div>
  </Transition>

  <!-- </van-pull-refresh> -->
  <!-- <SliderBottom>
    <i18n-t keypath="wallet.buySnft" tag="div" class="text-center f-12">
      <template v-slot:link><a :href="VUE_APP_OFFICIAL_EXCHANGE" target="__blank">{{ t('wallet.findMore') }}</a></template>
    </i18n-t>
  </SliderBottom> -->
  <!-- nft snft -->
  <TransferNFT v-model="showConvert" @handleConfirm="handleConfirmNFT" @handleAll="handleAll" :selectNumber="selectLength" :selectTotal="selectTotal" :ratio="ratio" :selectedText="selectedText" />
  <!-- nft snft Conversion of pop-ups -->
  <TransferNFTModal :selectNumber="selectedText" :selectTotal="selectTotal" :selectList="selectList" v-model="showNFTModal" :ratio="ratio" type="2" @confirm="handleConfirmConvert" @fail="reLoading" />
  <SnftModal v-model="showModal" :loading="loadNft" @change="handleChoose" />
</template>

<script lang="ts">
import SNftCard from "./snftCard.vue";
import {
  queryOwnerSnftCollections,
  QuerySnftChip,
  queryAllSnftByCollection,
  queryAllSnftByStage,
  queryOwnerStage
} from "@/popup/http/modules/nft";

import eventBus from "@/popup/utils/bus";
import BigNumber from "bignumber.js";
import SnftModal from "./snftModal.vue";
import {
  computed,
  ref,
  watch,
  reactive,
  Ref,
  defineComponent,
  SetupContext,
  onMounted,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  toRaw,
  nextTick,
  onUnmounted,
} from "vue";
import TransferNFT from "@/popup/views/home/components/transferNft.vue";
import TransferNFTModal from "@/popup/views/home/components/transferNFTModal.vue";

import { useStore } from "vuex";
import { List, Toast, Button, Sticky, PullRefresh, Switch, Loading } from "vant";
import { useI18n } from "vue-i18n";
import { VUE_APP_METAURL, VUE_APP_OFFICIAL_EXCHANGE, VUE_APP_IMGURL } from "@/popup/enum/env";
import SliderBottom from "@/popup/components/sliderBottom/index.vue";
import { debounce } from "@/popup/utils/utils";
import { useToast } from "@/popup/plugins/toast";
import { web3 } from "@/popup/utils/web3";
import { useTradeConfirm } from "@/popup/plugins/tradeConfirmationsModal";
import router from "@/popup/router";
import { RegUrl } from "@/popup/enum/regexp";
import NoData from '@/popup/components/noData/index.vue'
export default defineComponent({
  name: "snft-list",
  components: {
    SNftCard,
    [List.name]: List,
    [Sticky.name]: Sticky,
    [Switch.name]: Switch,
    [Loading.name]: Loading,
    TransferNFT,
    TransferNFTModal,
    [Button.name]: Button,
    [PullRefresh.name]: PullRefresh,
    SnftModal,
    SliderBottom,
    NoData
  },
  emits: ["onLoad", "changeSwitch"],
  setup(props: any, context: SetupContext) {
    const store = useStore();
    const { t } = useI18n();
    const layoutType = computed(() => store.state.system.layoutType);
    const accountInfo = computed(() => store.state.account.accountInfo);
    const metaDomain = ref(`${VUE_APP_IMGURL}`);
    // nft load
    const loadNft: Ref<boolean> = ref(false);
    const finished: Ref<boolean> = ref(false);
    const nftErr: Ref<boolean> = ref(false);
    let params = {
      owner_addr: accountInfo.value.address,
      categories: "*",
      count: "3",
      start_index: "0",
      currentPage: 0,
      status: "2",
    };



    const getCollects = (stage_addr: string) => {
      return queryAllSnftByStage({
        stage_addr,
        start_index: '0',
        count: '16',
        snfttype: "collect",
        owner_addr: accountInfo.value.address
      })
    }

    const stagesparams = {
      start_index: '0',
      count: '4',
      owner_addr: accountInfo.value.address.toString()
    }

    const getStages = () => {
      // 0xac12a0b4a038abbe609613eb7634a04abf302c06
      return queryOwnerStage({
        ...stagesparams
      })
    }

    const showSNFTList = ref([])
    const showSNFTIdx = ref(null)

    let timer: any = null
    const handleMouseOut = ({ item, index, child, idx }) => {
      timer = setTimeout(() => {
        const myEle = newList.list[index]
        const currentCollection = newList.list[index].children[idx]
        myEle.showDetails = false
        showSNFTList.value = []
        showSNFTIdx.value = null
        clearTimeout(timer)
      }, 10)
    }
    const handleMouseOver = ({ item, index, child, idx }) => {
      if (timer) {
        clearTimeout(timer)
      }
      const myEle = newList.list[index]
      const currentCollection = newList.list[index].children[idx]
      if (newList.list[index].children[idx].children) {
        showSNFTList.value = [...newList.list[index].children[idx].children]
        showSNFTIdx.value = idx
        let t = setTimeout(() => {
          myEle.showDetails = true
          clearTimeout(t)
        })
      }

    }
    const handleSNFTSMouseOver = () => {
      if (timer) {
        clearTimeout(timer)
      }
    }

    const handleSNFTSMouseLeave = ({ index }) => {
      const myEle = newList.list[index]
      showSNFTList.value = []
      myEle.showDetails = false
    }

    const handleSelect = async ({ item, index, child, idx, checked }) => {
      const myAddr = accountInfo.value.address.toUpperCase()
      showSNFTIdx.value = idx
      const currentCollection = newList.list[index].children[idx]
      const parentEle = newList.list[index]
      if (checked) {
        const { mergelevel: l2level, mergenumber: l2levelnumber, ownaddr: l2ownaddr, exchange } = child
        if (l2level == 2 && l2ownaddr.toUpperCase() == myAddr && !exchange) {
          parentEle.selectAssets.push(({ ...child }))
          parentEle.myOwnerAssets = [{ ...child }]
          parentEle.selectedStr = parentEle.selectedStr + l2levelnumber
          currentCollection.checked = true
          return
        }
        item.showDetails = true
        if (currentCollection.children) {
          const allChild = [...currentCollection.children]
          showSNFTList.value = [...allChild]
          parentEle.load = "loaded"
          currentCollection.checked = true

          nextTick(() => {
            parentEle.showDetails = true
            let total = 0
            currentCollection.myOwnerAssets.forEach(c => {
              if (c.ownaddr.toUpperCase() == myAddr && !c.exchange) {
                if (c.mergelevel > 0) {
                  total += c.mergenumber
                } else {
                  total += 1
                }
              }
            })
            parentEle.selectAssets.push(...toRaw(currentCollection.myOwnerAssets))
            parentEle.selectedStr = item.selectedStr + total
            if (parentEle.selectedStr == item.Chipamount) {
              parentEle.checked = true
            }
          })
          return
        }

        currentCollection.checked = true
        parentEle.load = 'loading'
        const { collection_creator_addr, collections } = child

        const owner_addr = accountInfo.value.address.toUpperCase()
        // get collDetail
        const params = {
          createaddr: collection_creator_addr,
          name: collections,
          owner_addr
        }
        const res = await queryAllSnftByCollection(params)
        const { snftChips, snfts } = res.data

        currentCollection.children = [...snfts].map(item => {
          let imgUrl = ''
          try {
            const re = JSON.parse(item.source_url)
            imgUrl = re.meta_url
          } catch (err) {
            imgUrl = `${metaDomain.value}${item.source_url}`
          }
          return { ...item, imgUrl }
        })
        let total = 0
        const chips = snftChips.filter(s => {
          if (s.ownaddr.toUpperCase() == owner_addr && !s.exchange && s.mergelevel == 0) {
            total += 1
            return s
          }
        })
        const mysnfts = snfts.filter(s => {

          if (s.ownaddr.toUpperCase() == owner_addr && !s.exchange && s.mergelevel == 1) {
            total += s.mergenumber
            return s
          }
        })

        currentCollection.chips = chips
        currentCollection.snfts = snfts
        currentCollection.myOwnerAssets = [...chips, ...mysnfts]

        parentEle.load = 'loaded'
        showSNFTList.value = [...currentCollection.children]


        parentEle.selectAssets.push(...toRaw(currentCollection.myOwnerAssets))
        if (child.mergelevel == 2 && child.ownaddr.toUpperCase() == myAddr && !child.exchange) {
          parentEle.selectAssets.push({ ...child })
        } else {
          parentEle.selectAssets.push(...currentCollection.myOwnerAssets)
        }

        nextTick(() => {
          parentEle.showDetails = true
          parentEle.myOwnerAssets.push(...chips, ...mysnfts)
          parentEle.selectedStr = parentEle.selectedStr ? parentEle.selectedStr + total : total
          if (parentEle.selectedStr == parentEle.Chipamount) {
            parentEle.checked = true
          }
        })
      } else {
        // collection == l2
        const { mergelevel: l2level, mergenumber: l2levelnumber, ownaddr: l2ownaddr, exchange, nft_address: l2nftaddr } = child
        if (l2level == 2 && l2ownaddr.toUpperCase() == myAddr && !exchange) {
          parentEle.selectAssets = parentEle.selectAssets.filter(c => c.nft_address.toUpperCase() != l2nftaddr.toUpperCase())
          parentEle.selectedStr = parentEle.selectedStr - l2levelnumber
          currentCollection.checked = false
          return
        }

        currentCollection.checked = false
        let total = 0
        currentCollection.myOwnerAssets.forEach(c => {
          if (c.ownaddr.toUpperCase() == myAddr && !c.exchange) {
            if (c.mergelevel > 0) {
              total += c.mergenumber
            } else {
              total += 1
            }
          }
        })

        const theCollAddrs = currentCollection.myOwnerAssets.map(c => c.nft_address.toUpperCase())
        parentEle.selectedStr = parentEle.selectedStr - total
        parentEle.selectAssets = parentEle.selectAssets.filter(c => !theCollAddrs.includes(c.nft_address.toUpperCase()))
        if (parentEle.selectedStr != parentEle.Chipamount) {
          parentEle.checked = false
        }
      }
    }
    const { $toast } = useToast()
    const handleAllSelect = async ({ item, index }) => {
      let toast = null
      const { mergelevel, mergenumber } = item
      if (!newList.list[index].checked) {
        let myOwnerAssets = []
        // L2
        if (mergelevel == 3) {
          item['myOwnerAssets'].push({ ...item })
          item['selectAssets'] = [{ ...item }]
          item['selectedStr'] = mergenumber
          item.checked = true
          return
        }
        try {
          toast = Toast.loading({
            duration: 0,
            forbidClick: true,
            message: t('common.loading'),
          });
          const owner_addr = accountInfo.value.address.toUpperCase()
          let total = 0
          // get my snft/ship/ of the collection
          for await (const child of item.children) {
            const { collection_creator_addr, collections, OwnerFlag, children, mergelevel, mergenumber } = child
            if (mergelevel < 2 && OwnerFlag) {

              // get collDetail
              const params = {
                createaddr: collection_creator_addr,
                name: collections,
                owner_addr
              }
              const res = await queryAllSnftByCollection(params)

              const { snftChips, snfts } = res.data
              const mychips = snftChips.filter((it: any) => {
                if (it.ownaddr.toUpperCase() == owner_addr && !it.exchange && it.mergelevel == 0) {
                  total += 1
                  return it
                }
              })
              const mysnfts = snfts.filter((it: any) => {
                if (it.ownaddr.toUpperCase() == owner_addr && !it.exchange && it.mergelevel == 1) {
                  total += it.mergenumber
                  return it
                }
              })
              myOwnerAssets.push(...mychips, ...mysnfts)
              child['myOwnerAssets'] = [...mychips, ...mysnfts]
              child['children'] = [...snfts]

            } else {
              if (mergelevel == 2 && child.ownaddr.toUpperCase() == accountInfo.value.address.toUpperCase() && !child.exchange && child.canSelect) {
                total += mergenumber
                myOwnerAssets.push({ ...child })
              }
            }
          }
          item['myOwnerAssets'].push(...myOwnerAssets)
          item.checked = true
          item.children.forEach(child => child.checked = true)
          item['selectAssets'] = [...myOwnerAssets]
          item['selectedStr'] = total
        } catch (err) {
          $toast.fail(JSON.stringify(err))
        } finally {
          toast.clear()
        }
      } else {
        item.checked = false
        item.children.forEach(child => child.checked = false)
        item['selectAssets'] = []
        item['selectedStr'] = 0
        item['myOwnerAssets'] = []
      }
    }


    const newList = reactive({ list: [] })
    const total = ref(0)
    // List loading event
    const handleOnLoad = async () => {
      loadNft.value = true;
      try {
        const { data: stages, total_count } = await getStages()
        total.value += total_count
        for await (const item of stages) {
          const { data: { snfts } } = await getCollects(item.nft_address.replace('mmm', ''))
          const { mergelevel, mergenumber, Chipamount } = item
          let processBar = '0'
          if (mergelevel == 3) {
            processBar = '100'
          } else {
            processBar = new BigNumber(Chipamount).div(4096).multipliedBy(100).toFixed(2)
          }
          const stateAddr = item.nft_address.replaceAll('m', '').slice(3)
          const period = parseInt('0x' + stateAddr)
          newList.list.push({
            ...item,
            load: false,
            checked: false,
            selectedStr: 0,
            selectAssets: [],
            myOwnerAssets: [],
            ratio: 0,
            period,
            processBar,
            children: [...snfts].map(child => {
              let canSelect = false
              let garyClass = ''
              let shiningClass = ''
              const { mergelevel: collmergelevel, OwnerFlag, ownaddr, exchange, source_url } = child
              let imgUrl = ''

              try {
                const re = JSON.parse(source_url)
                imgUrl = re.meta_url
              } catch (err) {
                imgUrl = `${metaDomain.value}${source_url}`
              }
              if (mergelevel == 3) {
                canSelect = false
                garyClass = ''

              } else {
                const isMy = ownaddr.toUpperCase() == accountInfo.value.address.toUpperCase() && !exchange
                if (collmergelevel == 2 && isMy) {
                  shiningClass = 'shining'
                }
                if ((collmergelevel == 2 && isMy) || OwnerFlag) {
                  canSelect = true
                } else {
                  garyClass = 'gary'
                }
              }
              return { ...child, checked: false, selectedStr: 0, selectAssets: [], myOwnerAssets: [], canSelect, garyClass, shiningClass, imgUrl, loadErr: false }
            })
          })
        }
        if (!stages || stages.length < 4) {
          finished.value = true
        }
        stagesparams.start_index = Number(stagesparams.count) + (Number(stagesparams.start_index)) + ''
      } catch (err) {
        nftErr.value = true;
        Toast(JSON.stringify(err));
      } finally {
        loadNft.value = false;
      }
    };
    onMounted(() => {
      // The list load event updates the current Snft list each time the account is switched
      eventBus.on("changeAccount", (address) => {
        stagesparams.owner_addr = address;
        let time = setTimeout(() => {
          reLoading();
          clearTimeout(time);
        }, 1000);
      });
    })
    onUnmounted(() => {
      eventBus.off('changeAccount')
    })

    // Error, retry
    const reLoading = () => {
      loadNft.value = true
      total.value = 0
      showConvert.value = false;
      newList.list = []
      stagesparams.start_index = '0'
      nftErr.value = false;
      finished.value = false;
      handleOnLoad();
    };

    // Selected length
    const selectLength = computed(() => {

      // let len = 0;
      // Object.keys(checkObjs.data).forEach((key) => {
      //   checkObjs.data[key]
      //     .filter((item) => item.select)
      //     .forEach((item: any) => {
      //       len += item.Chipcount;
      //     });
      // });
      // return len;
      return 0
    });

    // Select the amount of data
    const selectTotal = computed(() => {
      const { t0, t1, t2, t3 } = store.state.configuration.setting.conversion
      let totalErb = new BigNumber(0);
      newList.list.forEach(item => {
        const { selectAssets } = item
        selectAssets.forEach(child => {
          const { mergelevel, mergenumber } = child
          switch (mergelevel) {
            case 0:
              totalErb = totalErb.plus(t0)
              break;
            case 1:
              totalErb = totalErb.plus(new BigNumber(mergenumber).multipliedBy(t1))
              break;
            case 2:
              totalErb = totalErb.plus(new BigNumber(mergenumber).multipliedBy(t2))
              break;
            case 3:
              totalErb = totalErb.plus(new BigNumber(mergenumber).multipliedBy(t3))
              break;
          }
        })
      })
      return totalErb.toNumber() + ''
    });

    const selectedText = computed(() => {
      let totalChip = 0;
      let totalSnft = 0;
      let totalColl = 0;
      let totalPeriod = 0;
      newList.list.forEach(item => {
        const { selectAssets } = item
        selectAssets.forEach(child => {
          const { mergelevel, mergenumber } = child
          switch (mergelevel) {
            case 0:
              totalChip += 1
              break;
            case 1:
              totalSnft += 1
              break;
            case 2:
              totalColl += 1
              break;
            case 3:
              totalPeriod += 1
              break;
          }
        })
      })

      return `${totalPeriod}(L3)${totalColl}(L2)/${totalSnft}(L1)/${totalChip}(L0)`;
    });
    // List of selections
    const selectList = computed(() => {
      const list = []
      newList.list.forEach(item => {
        list.push(...item.selectAssets)
      })
      return list;
    });

    // nft transform
    const showConvert = ref(false);
    const handleConvert = () => {
      showConvert.value = true;
    };

    // Make sure the transition opens the popover
    const showNFTModal = ref(false);
    const handleConfirmNFT = () => {
      if (!Number(selectTotal.value)) {
        Toast(t("sendSNFT.pleasechoose"));
        return;
      }
      showNFTModal.value = true;
    };

    const handleSortAllData = (select: boolean, list: Array<any>) => {
      const treeData = {}
      list.forEach(item => {
        const { snftstage, mergelevel, mergenumber, exchange, ownaddr, nft_address } = item
        const stageAddr = `${snftstage.replaceAll('m', '')}mmm`.toUpperCase()
        const collAddr = `${nft_address.slice(0, 40)}mm`.toUpperCase()

        let selectStr = 0
        if (mergelevel > 0) {
          selectStr = mergenumber
        } else {
          selectStr = 1
        }
        if (!treeData[stageAddr]) {
          const data = { ...item, collAddr, stageAddr }
          treeData[stageAddr] = {
            // all assets
            children: [data],
            selectStr,
            collectAssets: {}
          }
          if (mergelevel < 3) {
            treeData[stageAddr].collectAssets[collAddr] = [{ ...data }]
          }
        } else {
          const data = { ...item, collAddr, stageAddr }
          treeData[stageAddr].children.push(data)
          treeData[stageAddr].selectStr = treeData[stageAddr].selectStr + selectStr
          if (mergelevel < 3) {
            if (!treeData[stageAddr].collectAssets[collAddr]) {
              treeData[stageAddr].collectAssets[collAddr] = [{ ...data }]
            } else {
              treeData[stageAddr].collectAssets[collAddr].push({ ...data })
            }
          }
        }
      })
      newList.list.forEach(item => {
        const { nft_address, mergelevel, mergenumber } = item
        const upAddr = nft_address.toUpperCase()
        const allAssets = [...treeData[upAddr].children]
        item.selectAssets = [...allAssets]
        item.selectedStr = treeData[upAddr].selectStr
        item.checked = true
        item.children.forEach(child => {
          child.checked = true
          const { nft_address: collnftaddr } = child
          const upCollAddr = collnftaddr.toUpperCase()
          const collAssets = treeData[upAddr].collectAssets[upCollAddr]
          if (collAssets) {
            child.myOwnerAssets = collAssets
            child.selectAssets = collAssets
          }
        })
      })
    }

    const selectAll = ref(false);
    //All/none
    const handleAll = async (select) => {
      selectAll.value = select;
      if (select) {
        let toast = null
        try {
          toast = Toast.loading({
            duration: 0,
            forbidClick: true,
            message: t('common.loading'),
          });
          const list = newList.list.map(item => item.nft_address.replaceAll('m', ''))
          const res = await queryOwnerStage({
            owner_addr: accountInfo.value.address,
            stages: JSON.stringify(list)
          })
          handleSortAllData(select, res.data)
        } catch (err) {
          $toast.fail(err.message)
        } finally {
          toast.clear()
        }
      } else {
        newList.list.forEach(item => {
          item.checked = false
          item.selectAssets = []
          item.children.forEach(child => {
            child.checked = false
          })
        })
      }
    };



    const historyCallBack = () => {
      reLoading()
    }

    const { $tradeConfirm } = useTradeConfirm();
    const handleConfirmConvert = async () => {
      showNFTModal.value = false
      const { address } = accountInfo.value
      const len = selectList.value.length
      const waits = []
      const approveMessage = t("wallet.conver_approve");
      const wattingMessage = t("wallet.conver_waiting", {
        count: `<span style='color:#9F54BA;'>${len}</span>`,
        amount: `<span style='color:#9F54BA;'>${selectTotal.value}</span>`,
        countstr: `(${selectedText.value})`,
      });

      $tradeConfirm.open({
        approveMessage,
        // successMessage,
        wattingMessage,
        // failMessage,
        wattingMessageType: "html",

        disabled: ['pendding'],
        callBack: () => {
          reLoading()
        },
        failBack: () => {
          reLoading()
        },
      });
      try {
        for await (const item of selectList.value) {
          let nftAddr = ''
          const { nft_address, mergelevel, mergenumber } = item
          switch (mergelevel) {
            case 0:
              nftAddr = nft_address
              break;
            case 1:
              nftAddr = nft_address.replace('m', '')
              break;
            case 2:
              nftAddr = nft_address.replace('mm', '')
              break;
            case 3:
              nftAddr = nft_address.replace('mmm', '')
              break;
          }
          const data3 = {
            type: 6,
            nft_address: nftAddr,
            version: "0.0.1"
          }
          const data = web3.utils.fromUtf8(`${store.getters['account/chainParsePrefix']}:${JSON.stringify(data3)}`)
          const tx = {
            from: address,
            to: address,
            data
          }
          const res = await store.dispatch('account/transaction', tx)
          waits.push(res)
        }
        $tradeConfirm.update({
          status: 'approve'
        })
        const receiptList = await store.dispatch('account/waitTxQueueResponse')
        const successList = receiptList.map((item: any) => item.status);
        if (successList.length == waits.length) {
          $tradeConfirm.update({
            status: "success",
            successMessage: t("wallet.conver_success", {
              count: `<span style='color:#9F54BA;'>${waits.length}</span>`,
              amount: `<span style='color:#9F54BA;'>${selectTotal.value}</span>`,
            }),
            successMessageType: "html",
            historyCallBack,
          });
        } else {
          $tradeConfirm.update({
            status: "fail",
            failMessage: t("wallet.conver_wrong", {
              count: waits.length - successList.length,
            }),
            successMessageType: "html",
          });
        }
      } catch (err) {
        $tradeConfirm.update({
          status: "fail",
          failMessage: err.reason
        })
      }

    }
    // The drop-down load
    const onRefresh = () => {
      reLoading();
    };

    const showModal = ref(false);
    const handleShowModal = () => {
      if (loadNft.value) {
        Toast(t("common.loadingText"));
        return;
      }
      showModal.value = !showModal.value;
    };
    /**
     * status
     * 2 duihuan
     * 3 zhiya
     * 1 shuhui
     */

    const params2 = {
      owner: accountInfo.value.address,
      page: "1",
      page_size: "60",
      status: "3",
    };

    const handleChoose = (e: any) => {
      finished.value = false;
      params.start_index = "0";
      params.currentPage = 0;
      params.status = e.value;
      params2.page = "1";
      showConvert.value = false;
      handleOnLoad();
    };

    const handleChangeSwitch = (v: boolean) => {
      context.emit("changeSwitch", v);
    };

    // Exchange rate by selected quantity 256 by single snft
    const ratio = computed(() => {
      const { t0, t1, t2, t3 } = store.state.configuration.setting.conversion
      let r = 0;
      let n = 0
      newList.list.forEach(item => {
        const { selectAssets } = item
        selectAssets.forEach(child => {
          const { mergelevel, mergenumber } = child
          switch (mergelevel) {
            case 0:
              r += Number(t0)
              n += 1
              break;
            case 1:
              r += Number(t1)
              n += 1
              break;
            case 2:
              r += Number(t2)
              n += 1

              break;
            case 3:
              r += Number(t3)
              n += 1
              break;
          }
        })
      })
      return parseFloat(new BigNumber(r).div(n).toFixed(4));
    });

    const toDetail = (sun, i) => {
      sessionStorage.setItem(
        "compData",
        JSON.stringify({ ...toRaw(sun), selectIndex: i })
      );
      router.push({ name: 'coll-detail' });
    }

    const loadImg = (child, idx) => {
      child.loadErr = true
    }

    return {
      loadImg,
      // toMore,
      toDetail,
      ratio,
      handleChoose,
      selectedText,
      handleShowModal,
      showModal,
      onRefresh,
      layoutType,
      handleOnLoad,
      showConvert,
      handleConvert,
      handleAll,
      selectAll,
      showNFTModal,
      handleConfirmNFT,
      selectLength,
      selectTotal,
      reLoading,
      loadNft,
      nftErr,
      handleChangeSwitch,
      finished,
      selectList,
      VUE_APP_OFFICIAL_EXCHANGE,
      t,
      metaDomain,
      newList,
      handleSelect,
      handleMouseOut,
      handleMouseOver,
      showSNFTList,
      handleSNFTSMouseOver,
      handleSNFTSMouseLeave,
      showSNFTIdx,
      handleAllSelect,
      handleConfirmConvert
    };
  },
});
</script>
<style src="./index.scss" lang="scss" scoped></style>