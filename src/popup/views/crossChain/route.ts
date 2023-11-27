export default {
    path: '/crossChain',
    name: 'crossChain',
    component: () => import('@/popup/views/crossChain/index.vue'),
    redirect: { name: 'crossChainHome' },
    children: [
      {
        path: '/crossChain/index',
        name: 'crossChainHome',
        component: () => import('@/popup/views/crossChain/home/index.vue'),
        meta: {
          auth: true
        }
      },
      {
        path: '/crossChain/tradingSend',
        name: 'crossChainTradingSend',
        component: () => import('@/popup/views/crossChain/tradingSend/index.vue'),
        meta: {
          auth: true
        }
      },
      {
        path: '/crossChain/contractTradingGasFee',
        name: 'contractTradingGasFee',
        component: () => import('@/popup/views/crossChain/contractTradingGasFee/index.vue'),
        meta: {
          auth: true
        }
      },
    ]
  }