import {
  getLocalParams,
  closeTabs,
  errorCode,
  sendMessage,
  handleType,
  createMsg,
  getSenderAccounts,
  openPopup,
  openTabPopup,
  globalPath,
  getWallet,
  getConnectList,
  eventTypes,
  wallet_methods,
  eventsEmitter,
  createBgMsg,
} from "./common.js";
import { ethers } from "./ethers.js";
import { localforage } from "./localforage.js";

export const handleEvents = {
  [eventsEmitter.disconnect](data, sendResponse, sender) {
    const { method: eventType } = data;
    const method = eventsEmitter.disconnect;
    const errMsg = { ...errorCode["200"], data: {} };
    const sendMsg = createMsg(errMsg, method);
    const resp = { ...sendMsg, eventType };
    console.warn("disconnect", resp);

    sendMessage(resp, {}, sender);
  },
  [eventsEmitter.connect]() {
    const { method: eventType } = data;
    const method = eventsEmitter.connect;
    const errMsg = { ...errorCode["200"], data: {} };
    const sendMsg = createMsg(errMsg, method);
    const resp = { ...sendMsg, eventType };
    console.warn("connect", resp);
    sendMessage(resp, {}, sender);
  },
  async [eventsEmitter.message](data, sendResponse, sender) {
    const { method: eventType } = data;
    const wallet = await getWallet();
    const method = eventsEmitter.message;
    wallet.provider.on(method, (res) => {
      const errMsg = { ...errorCode["200"], data: res };
      const sendMsg = createMsg(errMsg, method);
      const resp = { ...sendMsg, eventType };
      sendMessage(resp, {}, sender);
    });
  },
  async [eventsEmitter.chainChanged](data, sendResponse, sender) {
    const { method: eventType } = data;
    const wallet = await getWallet();
    const method = eventsEmitter.chainChanged;
    wallet.provider.on(method, (res) => {
      const errMsg = { ...errorCode["200"], data: res };
      const sendMsg = createMsg(errMsg, method);
      const resp = { ...sendMsg, eventType };
      sendMessage(resp, {}, sender);
    });
  },
  async [eventsEmitter.accountsChanged](data, sendResponse, sender) {
    const { method: eventType } = data;
    const wallet = await getWallet();
    const method = eventsEmitter.accountsChanged;
    wallet.provider.on(method, (res) => {
      const errMsg = { ...errorCode["200"], data: res };
      const sendMsg = createMsg(errMsg, method);
      const resp = { ...sendMsg, eventType };
      sendMessage(resp, {}, sender);
    });
  },
};
