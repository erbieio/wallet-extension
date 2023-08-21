import mitt, { Emitter } from 'mitt';
import { NetWorkData } from '../enum/network';

type Events = {
  changeAccount: string;
  disconnect?: any;
  walletReady: any;
  waitTxEnd: any;
  txQueuePush: any;
  delTxQueue: any;
  txPush: any;
  txUpdate: any;
  loopTxListUpdata: Array<any>;
  sameNonce?: any;
  sendComfirm?: any;
  changeNetwork: NetWorkData;
};
const eventBus: Emitter<Events> = mitt<Events>();
export default eventBus