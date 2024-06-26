// Mnemonic module routing
export default {
    path: "/generateNFT",
    name: "generateNFT",
    redirect: { name: "generateNFT-ai" },
    component:() =>  import('@/popup/views/generateNFT/index.vue'),
    children: [
      {
        path: "/generateNFT/ai",
        name: "generateNFT-ai",
        component:() =>  import('@/popup/views/generateNFT/pages/ai.vue'),
        meta: {
          auth: true,
        },
      },
      {
        path: "/generateNFT/success",
        name: "generateNFT-success",
        component:() =>  import('@/popup/views/generateNFT/pages/success.vue'),
        meta: {
          auth: true,
        },
      },
    ],
  };
  