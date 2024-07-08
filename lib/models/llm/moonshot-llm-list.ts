import { LLM } from "@/types"

const MOONSHOT_PLATORM_LINK = "https://www.moonshot.cn/"

const Moonshot_v1_8k: LLM = {
  modelId: "moonshot-v1-8k",
  modelName: "Moonshot-v1-8k",
  provider: "moonshot",
  hostedId: "moonshot-v1-8k",
  platformLink: MOONSHOT_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "CNY",
    unit: "1M tokens",
    inputCost: 12,
    outputCost: 12
  }
}

const Moonshot_v1_32k: LLM = {
  modelId: "moonshot-v1-32k",
  modelName: "Moonshot-v1-32k",
  provider: "moonshot",
  hostedId: "moonshot-v1-32k",
  platformLink: MOONSHOT_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "CNY",
    unit: "1M tokens",
    inputCost: 24,
    outputCost: 24
  }
}

const Moonshot_v1_128k: LLM = {
  modelId: "moonshot-v1-128k",
  modelName: "Moonshot-v1-128k",
  provider: "moonshot",
  hostedId: "moonshot-v1-128k",
  platformLink: MOONSHOT_PLATORM_LINK,
  imageInput: false,
  pricing: {
    currency: "CNY",
    unit: "1M tokens",
    inputCost: 60,
    outputCost: 60
  }
}

export const MOONSHOT_LLM_LIST: LLM[] = [Moonshot_v1_8k, Moonshot_v1_32k, Moonshot_v1_128k]
