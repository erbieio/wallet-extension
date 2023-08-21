
import { httpGet,httpPost } from '../request'
import { scanApi,snftUrl4, nftmintApi } from '@/popup/http/httpUrl'


export type ValidParams = {
    index: string
    count: string
}
export const getValidatorInfo = (params: ValidParams) => {
    return httpPost(`${nftmintApi}/v1/getValidatorInfo`, params)
}

export type GetCoefParams = {
    users: string
}
export const getUsersCoefficient = (params: GetCoefParams) => {
    return httpPost(`${nftmintApi}/v1/getUsersCoefficient`, params)
  
}

export type ValidatorPageParams = {
    order: 'score desc' | 'score asc' | 'amount desc' | 'amount asc' | 'weight desc' | 'weight asc',
    page: string,
    page_size: string
}


export const validatorPage = (params: ValidatorPageParams) => {
    return httpGet(`${scanApi}/validator/page`, params)
  
}

