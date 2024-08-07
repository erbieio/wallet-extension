const isProduct = process.env.VUE_APP_NODE_ENV == "production";

const exchantest = "c0x5051580802283c7b053d234d124b199045ead750";

export const scanApi = "https://scanapi.erbie.io";

export const snftUrl3 = "https://snft.erbie.io";

export const snftUrl4 = isProduct
  ? snftUrl3
  : `http://192.168.1.235:9006/${exchantest}`;

export const nftUrl = isProduct
  ? "https://api.erbiescan.io"
  : "http://43.129.181.130:3001";
export const nftmintApi = isProduct
  ? "https://ai.erbie.io"
  : "http://192.168.1.235:18081";
