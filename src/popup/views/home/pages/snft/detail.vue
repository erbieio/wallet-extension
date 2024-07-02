<template>
  <NavHeader :hasRight="true" :title="t('nftDetail.title')"></NavHeader>

  <div class="snft-detail">
    <div class="flex between mt-14 snft-list pl-22 pr-22">
      <div :class="`img-box flex center van-hairline--surround hover  flex center  ${item.select ? 'active' : ''
        } ${item.isLight ? '' : 'gary'} ${item.hasConvertSNFT ? 'shining' : ''}`" :title="getTipText(item)" v-for="(item, idx) in pageData.data.children" :key="item.address" @click="hancleClick(item, idx)">
        <img v-show="!item.loadErr" :src="`${item.imgUrl}`" @error="loadImg(item, idx)" :class="`flex center snft-img  ${item.select ? 'active' : ''}`" fit="cover" />
        <img v-show="item.loadErr" loading="lazy" src="@/assets/default.png" />
      </div>
    </div>
    <div class="swipe-box">
      <i class="iconfont icon-fangda hover" @click="showImg"></i>
      <van-icon name="arrow-left hover" @click="to('prev')" />
      <van-swipe @change="onChange" ref="swipe" lazy-render :initial-swipe="swiperIdx">
        <van-swipe-item class="flex center position relative swipe-slider" v-for="(item, idx) in pageData.data.children" :key="item">
          <div :class="`swipe-img mt-10 position relative ${item.selectFlag ? 'select' : ''}`" @click="handleSelectSingleSnft(item)">
            <img v-show="!item.loadErr" :src="`${item.imgUrl}`" loading="lazy" @error="loadImg(item, idx)" />
            <img v-show="item.loadErr" loading="lazy" src="@/assets/default.png" />

            <!-- Transfer -->
            <div class="check-list flex" v-if="!hasMyConvertSnft">
              <div :class="`fg van-hairline--right van-hairline--bottom ${child.select ? 'select' : ''} ${child.disabled ? 'disabled' : ''}`" v-for="(child, idx) in mySnfts.list" :key="item" @click.stop="selectSnft(child, idx)"></div>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>
      <van-icon name="arrow hover" @click="to('next')" />
    </div>
    <!-- Selected -->
    <div class="select-box">
      {{ t("sendSNFT.selected") }} {{ chooseNum }}/{{ hasChooseNum }}
    </div>
    <!-- 3.speed of progress -->
    <div class="progress-box pl-10 pr-10 mt-10">
      <ProgressBar :value="hasChooseNum" :own="chooseNum" :total="totalNotConvert" :ratio="ratio" :maxRadio="conversion.t1" />
    </div>
    <!-- snft- info -->
    <div class="snft-form van-hairline--surround m-14">
      <div class="card border-bottom">
        <div class="name">{{ t("sendSNFT.name") }}</div>
        <div class="value">{{ chooseSnftData.name }}</div>
      </div>
      <div class="card border-bottom mt-8">
        <div class="name">{{ t("sendSNFT.amount") }}</div>
        <div class="value">
          <span>{{ totalAmount }} ERB</span>
        </div>
      </div>
      <div class="card mt-8 card-last">
        <div class="name">{{ t("sendSNFT.address") }}</div>
        <div class="value">{{ chooseSnftData.nft_address.substr(0, 41) }}</div>
      </div>
    </div>
    <!-- Button group -->
    <div class="flex center">
      <div class="btn-box flex evenly">
        <div class="btn" @click="toSend" v-if="showBtn">
          <div class="flex center">
            <div class="icon-in flex center">
              <i class="iconfont icon-teshujiantouzuoxiantiao-copy"></i>
            </div>
          </div>
          <div class="btn-txt text-center">{{ t("sendSNFT.send") }}</div>
        </div>
        <div :class="`btn`" @click="handleConvert" v-if="showBtn">
          <div class="flex center">
            <div class="icon-in flex center">
              <i class="iconfont icon-icon-"></i>
            </div>
          </div>
          <div class="btn-txt text-center">{{ t("sendSNFT.convert") }}</div>
        </div>
      </div>
    </div>
  </div>
  <!-- Transfer Erb -->
  <TransferNFTModal :selectNumber="selectText" :selectName="chooseName" :selectTotal="totalAmount" :selectList="selectList" type="1" :ratio="ratio" v-model="showModal" @confirm="handleConfirmConvert" @fail="reLoading" />
</template>
<script lang="ts">
import {
  Image,
  Swipe,
  SwipeItem,
  Icon,
  SwipeInstance,
  Toast,
  ImagePreview,
  Sticky,
} from "vant";
import {
  computed,
  defineComponent,
  onActivated,
  onMounted,
  Ref,
  ref,
  toRaw,
  watch
} from "vue";
import ProgressBar from "@/popup/views/account/components/snftList/progressBar.vue";
import { useRouter, useRoute } from "vue-router";
import TransferNFTModal from "@/popup/views/home/components/transferNFTModal.vue";
import { QuerySnftChip, queryAllSnftByCollection } from "@/popup/http/modules/nft";
import { useStore } from "vuex";
import { addressMask } from "@/popup/utils/filters";
import BigNumber from "bignumber.js";
import NavHeader from "@/popup/components/navHeader/index.vue";
import { useI18n } from "vue-i18n";
import { VUE_APP_METAURL, VUE_APP_IMGURL } from "@/popup/enum/env";
import TransferSingleSNFTModal from "@/popup/views/home/components/transferSingleSNFTModal.vue";
import { useTradeConfirm } from "@/popup/plugins/tradeConfirmationsModal";
import { web3 } from "@/popup/utils/web3";
import { useToast } from "@/popup/plugins/toast";
import { reactive } from "vue";
import { toScan } from "@/popup/utils/utils";


const disabledChip = {
  address: null,
  select: false,
  index: null,
  ownaddr: '',
  Chipcount: 0,
  MergeLevel: 0,
  disabled: true,
};

export default {
  name: "snft-detail",
  components: {
    [Image.name]: Image,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Sticky.name]: Sticky,
    [Icon.name]: Icon,
    ProgressBar,
    TransferNFTModal,
    NavHeader,
    TransferSingleSNFTModal,
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const { state, dispatch } = store
    const metaDomain = ref(`${VUE_APP_IMGURL}`);
    const swipe: Ref = ref(null);
    const currentNetwork = computed(() => state.account.currentNetwork)
    const accountInfo = computed(() => state.account.accountInfo);
    const pageData: any = reactive({ data: JSON.parse(sessionStorage.getItem("compData")) });
    const conversion = computed(() => state.configuration.setting.conversion)
    const mySnfts = reactive({ list: [] });
    const showModal = ref(false)
    const { query } = route;
    //Query the subscript of the swiper according to the address

    const swiperIdx = ref(0);

    const chooseData = computed(() => {
      return pageData.data.children[swiperIdx.value];
    });

    const getPageData = () => {
      const { collection_creator_addr, collections } = JSON.parse(sessionStorage.getItem("compData"))
      const params = {
        createaddr: collection_creator_addr,
        name: collections,
        owner_addr: accountInfo.value.address
      }
      return queryAllSnftByCollection(params)
    }



    onMounted(async () => {
      const myAddr = accountInfo.value.address.toUpperCase()
      const currentColl = JSON.parse(sessionStorage.getItem('compData'))
      const { data: { snfts, snftChips } } = await getPageData()
      snfts.forEach((item) => {
        const { mergelevel, exchange, ownaddr, nft_address } = item
        snftChips.forEach(child => {
          let imgUrl = ''

          try {
            const re = JSON.parse(item.source_url)
            imgUrl = re.meta_url
          } catch (err) {
            imgUrl = `${metaDomain.value}${item.source_url}`
          }
          item.imgUrl = imgUrl
          const { mergelevel: childmergeLevel, exchange: childexchange, ownaddr: childownaddr, nft_address: childnft_address } = child
          const theFatherAddr = (childnft_address.slice(0, 41) + 'm').toUpperCase()
          if (theFatherAddr == nft_address.toUpperCase()) {
            if (!item.children) {
              item.children = [child]
            } else {
              item.children.push(child)
            }
          }
        })
        const hasChips = item.children.filter(child => !child.exchange && child.ownaddr.toUpperCase() == myAddr && child.mergelevel == 0)
        const hasConvertSNFT = myAddr == ownaddr.toUpperCase() && !exchange && mergelevel == 1
        item.hasConvertSNFT = hasConvertSNFT
        item.isLight = hasChips.length || hasConvertSNFT
      })
      pageData.data = {
        ...currentColl,
        children: [...snfts]
      }
      const currentSnft = snfts[currentColl.selectIndex]
      const { nft_contract_addr, nft_token_id } = currentSnft
      const params = {
        nft_contract_addr,
        nft_token_id,
        start_index: "0",
        count: "16",
      };
      pageData.data.children[currentColl.selectIndex].select = true
      getNft256(params);
      swiperIdx.value = currentColl.selectIndex

    })
    // Currently selected snft fragments
    let selectList = computed(() => {
      const myAddr = accountInfo.value.address.toUpperCase()
      const { selectFlag, mergelevel, exchange, ownaddr } = chooseSnftData.value
      if (myAddr == ownaddr.toUpperCase() && !exchange && mergelevel == 1 && selectFlag) {
        return [toRaw(chooseSnftData.value)]
      }
      return mySnfts.list.filter((item) => item.select);
    });


    // // Query NFT fragment details
    const getNft256 = (params = {}) => {
      Toast.loading({ message: t("sendSNFT.loading") });
      const allList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      return QuerySnftChip(params)
        .then(({ data }) => {
          const address = accountInfo.value.address;
          const currentData = pageData.data.children[swiperIdx.value];
          data.forEach((item: any) => {
            let { nft_address } = item;
            nft_address = nft_address.replaceAll('m', '0')
            item.select = false;
            item.address = nft_address;
            item.index = parseInt(
              nft_address.substr(nft_address.length - 1, 1),
              16
            );
            if (item.mergelevel != 0 || item.ownaddr.toUpperCase() != address.toUpperCase() || item.exchange) {
              item.disabled = true;
            } else {
              item.disabled = false;
            }
          });
          let data3 = [];
          if (!data.length) {
            allList.forEach((sun: any) => {
              data3.push(disabledChip);
            });
          }

          if (data.length < 16 && data.length > 0) {
            const data2 = data.map((item: any) => item.index);
            const filterList = allList.filter((sun2) => !data2.includes(sun2));
            allList.forEach((sun: any, idx: number) => {
              if (filterList.includes(idx)) {
                data.splice(idx, 0, disabledChip);
              }
            });
          }
          mySnfts.list = [...data, ...data3];
        })
        .catch((err) => {
          // mySnfts.value = [];
        })
        .finally(() => {
          Toast.clear();
        });
    };
    const hancleClick = (e, i) => {
      swipe.value?.swipeTo(i);
    };
    // // change
    const onChange = (e) => {
      console.log(e);
      pageData.data.children.forEach((item: any) => {
        item.selectFlag = false
      });
      swiperIdx.value = e;
      pageData.data.children.forEach((item) => (item.select = false));
      pageData.data.children[e].select = true;
      // Query 256nft fragment information according to the current ID
      const { nft_contract_addr, nft_token_id } = pageData.data.children[e];
      const params = {
        nft_contract_addr,
        nft_token_id,
        start_index: "0",
        count: "16",
      };
      getNft256(params);
    };

    const showImg = () => {
      const idx = pageData.data.children.findIndex((item) => item.select);
      const arr2 = pageData.data.children.map(
        (item) => item.imgUrl
      );
      ImagePreview({
        images: [...arr2],
        startPosition: idx,
        closeable: true,
        showIndicators: true,
      });
    };

    const showBtn = computed(() => {
      const myAddr = accountInfo.value.address.toUpperCase()
      const { mergelevel, mergenumber, exchange, ownaddr } = chooseSnftData.value
      if (ownaddr.toUpperCase() == myAddr && !exchange && mergelevel == 1) {
        return true
      } else {
        const e = mySnfts.list.find(item => !item.disabled)
        return e ? true : false
      }
    });

    const handleSelectSingleSnft = (item) => {
      if (item.disabled) {
        return
      } else {
        item.selectFlag = !item.selectFlag
      }
    }

    const { $toast } = useToast()
    const toSend = () => {
      const len = selectList.value.length
      if (!len) {
        $toast.warn(t('sendSNFT.pleaseselect'))
        return
      }
      sessionStorage.setItem("sendSnftList", JSON.stringify(selectList.value));
      router.push({ name: "sendSnft-step2" });
    };

    // // Select snft event
    const selectSnft = (v, idx) => {
      if (v.disabled) {
        return;
      }
      mySnfts.list[idx].select = !v.select;
    };

    // // Exchange pop-up event
    const handleConvert = () => {
      if (!selectList.value.length) {
        $toast.warn(t("sendSNFT.notselected"));
        return;
      }
      showModal.value = true;
    };

    // Event of successful redemption
    const reLoading = async () => {
      const currentColl = JSON.parse(sessionStorage.getItem('compData'))
      const myAddr = accountInfo.value.address.toUpperCase()
      const { data: { snfts, snftChips } } = await getPageData()
      snfts.forEach((item) => {
        const { mergelevel, exchange, ownaddr, nft_address } = item

        snftChips.forEach(child => {
          const { mergelevel: childmergeLevel, exchange: childexchange, ownaddr: childownaddr, nft_address: childnft_address } = child
          const theFatherAddr = (childnft_address.slice(0, 41) + 'm').toUpperCase()
          if (theFatherAddr == nft_address.toUpperCase()) {
            if (!item.children) {
              item.children = [child]
            } else {
              item.children.push(child)
            }
          }
        })
        const hasChips = item.children.filter(child => !child.exchange && child.ownaddr.toUpperCase() == myAddr && child.mergelevel == 0)
        const hasConvertSNFT = myAddr == ownaddr.toUpperCase() && !exchange && mergelevel == 1
        item.hasConvertSNFT = hasConvertSNFT
        item.isLight = hasChips.length || hasConvertSNFT
      })
      pageData.data = {
        ...currentColl,
        children: [...snfts]
      }
      const currentSnft = snfts[swiperIdx.value]
      const { nft_contract_addr, nft_token_id } = currentSnft
      const params = {
        nft_contract_addr,
        nft_token_id,
        start_index: "0",
        count: "16",
      };
      pageData.data.children[swiperIdx.value].select = true
      getNft256(params);
    };
    // Optional quantity
    const hasChooseNum = computed(() => {
      let total = 0;
      if (pageData.data.children) {
        return mySnfts.list.filter(item => item.ownaddr.toUpperCase() == accountInfo.value.address.toUpperCase()).length
      }
      return total;
    });

    // Amount of data currently selected
    const chooseNum = computed(() => {
      console.log('---', pageData.data, swiperIdx.value)
      const current = pageData.data.children && pageData.data.children[swiperIdx.value || 0];
      if (current && current.mergelevel == 1 && current.selectFlag) {
        return current.mergenumber;
      }
      if(current && current.mergelevel == 1 && !current.selectFlag) {
        return 0;
      }
      return mySnfts.list.filter((item) => item.select).length;
    });
    // Currently selected fragment name
    const chooseName = computed(() => chooseSnftData.value.categories);

    // Currently selected snft
    const chooseSnftData = computed(
      () => {
        const idx = swiperIdx.value 
        if (pageData.data.children) {
          return pageData.data.children[idx]
        }
        return {
          nft_address: "",
          name: "",
          ownaddr: ""
        }
      }
    );

    // // Total amount
    const totalAmount = computed(() => {
      const { t0, t1, t2, t3 } = state.configuration.setting.conversion
      const { select, mergelevel, mergenumber, exchange, ownaddr } = chooseSnftData.value
      const myAddr = accountInfo.value.address.toUpperCase()
      if (select && mergelevel == 1 && !exchange && ownaddr.toUpperCase == myAddr) {
        return select ? new BigNumber(mergenumber).multipliedBy(t1).toNumber() + '' : '0'
      } else {
        const selectList = mySnfts.list.filter(item => item.select)
        return selectList.length ? new BigNumber(selectList.length).multipliedBy(t0).toNumber() + '' : '0'
      }
    });

    const selectText = computed(() => {
      const { mergelevel, mergenumber, ownaddr, exchange } = chooseSnftData.value
      const myAddr = accountInfo.value.address.toUpperCase()
      if (mergelevel == 1 && !exchange && ownaddr.toUpperCase() == myAddr) {
        return `0(L2)/1(L1)/0(L0)`
      } else {
        const selectList = mySnfts.list.filter(item => item.select)
        return `0(L2)/0(L1)/${selectList.length}(L0)`
      }
    })
    const to = (type: string) => {
      if (type == "next") {
        swipe.value?.next();
      }
      if (type == "prev") {
        swipe.value?.prev();
      }
    };

    // // Exchange rate by selected quantity 256 by single snft
    const ratio = computed(() => {
      const { t0, t1, t2, t3 } = state.configuration.setting.conversion
      const { mergelevel, mergenumber, ownaddr, exchange } = chooseSnftData.value
      const myAddr = accountInfo.value.address.toUpperCase()
      if (mergelevel == 1 && !exchange && ownaddr.toUpperCase() == myAddr) {
        return t1
      } else {
        return t0

      }
    })

    const getTipText = (item: any) => {
      const { isLight, mergelevel, exchange } = item
      if (exchange) {
        return t('converSnft.converted')
      }
      if (!isLight) {
        return t('converSnft.notObtain')
      }
      if (isLight && (mergelevel > 0 || chooseSnftData.value.mergelevel > 0)) {
        return t('converSnft.synthesized')
      }
      return t('converSnft.beSyned')
    }

    const totalNotConvert = computed(() => {
      if (!pageData.data.children || !pageData.data.children.length) {
        return 0
      }
      return pageData.data.children[swiperIdx.value].children.filter(item => !item.exchange).length
    })


    const { $tradeConfirm } = useTradeConfirm();
    const handleConfirmConvert = async () => {
      showModal.value = false
      const { address } = accountInfo.value
      const len = selectList.value.length
      const waits = []
      const approveMessage = t("wallet.conver_approve");
      const wattingMessage = t("wallet.conver_waiting", {
        count: `<span style='color:white;'>${len}</span>`,
        amount: `<span style='color:white;'>${totalAmount.value}</span>`,
        countstr: `(${selectText.value})`,
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

        },
      });
      try {
        for await (const item of selectList.value) {

          const { nft_address, mergelevel, mergenumber } = item
          const nftAddr = nft_address.replaceAll('m', '')
          const data3 = {
            type: 6,
            nft_address: nftAddr,
            version: "0.0.1"
          }

          const data = web3.utils.fromUtf8(`erbie:${JSON.stringify(data3)}`)
          const tx = {
            from: address,
            to: address,
            data
          }
          const res = await dispatch('account/transaction', tx)
          waits.push(res)
        }
        $tradeConfirm.update({
          status: 'approve'
        })
        const receiptList = await dispatch('account/waitTxQueueResponse')
        const successList = receiptList.map((item: any) => item.status);
        if (successList.length == waits.length) {
          $tradeConfirm.update({
            status: "success",
            successMessage: t("wallet.conver_success", {
              count: `<span style='color:white;'>${waits.length}</span>`,
              amount: `<span style='color:white;'>${totalAmount.value}</span>`,
            }),
            successMessageType: "html",

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

    const hasMyConvertSnft = computed(() => {
      const myAddr = accountInfo.value.address.toUpperCase()
      const { mergelevel, mergenumber, exchange, ownaddr } = chooseSnftData.value
      return mergelevel == 1 && !exchange && myAddr == ownaddr.toUpperCase() ? true : false
    })

    const loadImg = (child, idx) => {
      child.loadErr = true
    }
    return {
      hasMyConvertSnft,
      loadImg,
      handleConfirmConvert,
      getTipText,
      totalNotConvert,
      handleSelectSingleSnft,
      showBtn,
      t,
      to,
      hancleClick,
      selectSnft,
      totalAmount,
      reLoading,
      onChange,
      addressMask,
      swipe,
      chooseNum,
      chooseName,
      showImg,
      toScan,
      toSend,
      showModal,
      pageData,
      metaDomain,
      swiperIdx,
      mySnfts,
      hasChooseNum,
      chooseSnftData,
      selectText,
      selectList,
      handleConvert,
      ratio,
      conversion,
    };
  },
};
</script>
<style lang="scss" src="./detail.scss" scoped></style>