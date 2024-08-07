import { encode, decode } from 'js-base64';

export const VUE_APP_EXCHANGESMANAGEMENT_URL = decode(process.env.VUE_APP_EXCHANGESMANAGEMENT_URL || '')




export const VUE_APP_EXCHANGES_URL = decode(process.env.VUE_APP_EXCHANGES_URL || '')


export const VUE_APP_NODE_WORM_URL = decode(process.env.VUE_APP_NODE_WORM_URL || '')


export const VUE_APP_IMGURL = decode(process.env.VUE_APP_IMGURL ||'')


export const VUE_APP_METAURL = decode(process.env.VUE_APP_METAURL ||'')

export const VUE_APP_SCAN_URL = decode(process.env.VUE_APP_SCAN_URL || '')
export const VUE_APP_SCAN_PATH = decode(process.env.VUE_APP_SCAN_PATH || '');
export const VUE_APP_TERMSOFUSE = decode(process.env.VUE_APP_TERMSOFUSE || '')
export const VUE_APP_PRIVACYNOTICE = decode(process.env.VUE_APP_PRIVACYNOTICE || '')


export const VUE_APP_OFFICIAL_EXCHANGE = decode(process.env.VUE_APP_OFFICIAL_EXCHANGE || '')
export const VUE_APP_NODE_URL = decode(process.env.VUE_APP_NODE_URL || '')
export const VUE_APP_NODE_NAME = decode(process.env.VUE_APP_NODE_NAME || '')
export const SCAN_PATH = 'https://www.erbie.io/explorer'

export const WALLET_DOC = 'https://www.erbie.io/erbiedocs/index.html'

export const OFFICIAL_WEBSITE = 'https://www.erbie.io/'

export const isDev = process.env.VUE_APP_NODE_ENV == 'development'



export enum chainDataParse {
    wormholes = 'wormholes',
    erbie = 'erbie'
}
