import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import OpenAI from "openai"
import { getProxyAgent, getUsingProxy } from "@/lib/server/server-proxy-helpers"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {
    const profile = await getServerProfile()

    checkApiKey(profile.perplexity_api_key, "Perplexity")

    // Perplexity is compatible the OpenAI SDK
    let perplexity
    let proxyAgent
    const isProxyEnabled = getUsingProxy("PERPLEXITY")
    if (isProxyEnabled) {
      proxyAgent = getProxyAgent()
      perplexity = new OpenAI({
        apiKey: profile.perplexity_api_key || "",
        baseURL: "https://api.perplexity.ai/",
        httpAgent: proxyAgent
      })
    } else {
      perplexity = new OpenAI({
        apiKey: profile.perplexity_api_key || "",
        baseURL: "https://api.perplexity.ai/"
      })
    }

    const response = await perplexity.chat.completions.create({
      model: chatSettings.model,
      messages,
      stream: true
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Perplexity API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Perplexity API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
