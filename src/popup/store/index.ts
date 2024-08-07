// @ts-nocheck
import localforage from "localforage";
window.localforage = localforage;
import { clone } from "pouchdb-utils";
import { createStore } from "vuex";
import common from "./modules/common";
import account from "./modules/account";
import price from "./modules/price";
import system from "./modules/system";
import transfer from "./modules/transfer";
import mnemonic from "./modules/mnemonic";
import nft from "./modules/nft";
import txList from "./modules/txList";
import configuration from "./modules/configuration";
import VuexPersistence from "vuex-persist";
import deepmerge from "deepmerge";
export const vuexLocal = new VuexPersistence({
  storage: localforage,
  asyncStorage: true,
  reducer: (store) => {
    const {
      account,
      common,
      nft,
      price,
      system,
      transfer,
      mnemonic,
      txList,
      configuration,
    } = store;
    const {
      amountType,
      ethAccountInfo,
      exchangeBtnStatus,
      finishedGuide,
      hasBackUpMnemonic,
      language,
      lastDelayTime,
      layoutType,
      showGuideVal,
      show0,
      show1,
      show2,
      show3,
      show4,
      show5,
      show6,
      show7,
      show8,
      show9,
      show10,
      show11,
      show12,
      show13,
      show14,
      show15,
      show16,
      wallet_token,
      chainVersion,
    } = system;
    return clone({
      account,
      common,
      nft,
      price,
      transfer,
      system: {
        amountType,
        chainVersion,
        ethAccountInfo,
        exchangeBtnStatus,
        finishedGuide,
        hasBackUpMnemonic,
        language,
        lastDelayTime,
        layoutType,
        showGuideVal,
        show0,
        show1,
        show2,
        show3,
        show4,
        show5,
        show6,
        show7,
        show8,
        show9,
        show10,
        show11,
        show12,
        show13,
        show14,
        show15,
        show16,
        wallet_token,
      },
      mnemonic,
      txList,
      configuration,
    });
  },
});

const store = createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    account,
    price,
    system,
    common,
    transfer,
    nft,
    mnemonic,
    txList,
    configuration,
  },
  plugins: [vuexLocal.plugin],
});
// Actively synchronizes from cache to store
export const asyncStoreFromLocal = () => {
  let time = setTimeout(async () => {
    const savedState = await vuexLocal.restoreState(
      vuexLocal.key,
      vuexLocal.storage
    );
    store.replaceState(
      deepmerge(store.state, savedState || {}, {
        arrayMerge: (destinationArray, sourceArray, options) => sourceArray,
      })
    );
    clearTimeout(time);
  }, 500);
};

export default store;
export interface StoreReturns {
  [key: string]: any;
}
