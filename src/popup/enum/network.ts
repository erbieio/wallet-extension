// Enumeration of network data

import { TransactionData } from '@/popup/store/modules/index'
import { Token } from '@/popup/utils/token'
import { guid } from '@/popup/utils/index'
import i18n from "@/popup/language/index";
import { TransactionReceipt } from '@/popup/store/modules/account';
import { VUE_APP_NODE_WORM_URL } from './env';
const URL =  VUE_APP_NODE_WORM_URL
export const netWorklist: Array<NetWorkData> = [
    { color:'rgb(14, 126, 33)', label: "Erbie", select: false ,URL, chainId: 51888, currencySymbol: 'ERB', browser:'http://www.erbiescan.com',tokens:{},id: 'wormholes-network-1', isMain: true  },
]

export interface NetWorkData {
    value?: string
    // Network name
    label: string
    select: boolean
    // RPC URL
    URL: string
    // chainId
    chainId: number
    // currencySymbol
    currencySymbol: String
    // browser
    browser: string
    color: string
    // List of tokens
    tokens: TokenList
    // unique identifier
    id: string,
    isMain?: boolean
}

export type TokenList = {
    [key:string]: Array<Token>
}
export type TransactionList = {
    [key:string]: Array<TransactionReceipt>
}

export interface TransactionRecord {
    address: Array<TransactionData>
}