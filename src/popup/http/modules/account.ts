


import { scanApi } from '../httpUrl'
import { httpGet } from '../request'
interface GetTransitionsParams {
    page: string
    page_size: string
    number: string
    addr: string
}
/**
 * 
 * @param params page
 * @param params page_size
 * @param params number
 * @param params addr
 * @returns 
 */

export function getTransitionsPage(params: GetTransitionsParams){
    return httpGet(`${scanApi}/transaction/page`, params)
}