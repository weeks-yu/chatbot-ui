import { generateLocalEmbedding } from "@/lib/generate-local-embedding"
import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { Database } from "@/supabase/types"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import { getProxyAgent } from "@/lib/server/server-proxy-helpers"

export async function POST(request: Request) {
  const json = await request.json()
  const { userInput, fileIds, embeddingsProvider, sourceCount } = json as {
    userInput: string
    fileIds: string[]
    embeddingsProvider: "openai" | "local"
    sourceCount: number
  }

  const uniqueFileIds = [...new Set(fileIds)]

  try {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const profile = await getServerProfile()

    if (embeddingsProvider === "openai") {
      if (profile.use_azure_openai) {
        checkApiKey(profile.azure_openai_api_key, "Azure OpenAI")
      } else {
        checkApiKey(profile.openai_api_key, "OpenAI")
      }
    }

    let chunks: any[] = []

    let openai
    let proxyAgent
    const isProxyEnabled = process.env.USE_PROXY === "true"
    if (isProxyEnabled) {
      proxyAgent = getProxyAgent()
    }
    if (profile.use_azure_openai) {
      if (isProxyEnabled) {
        openai = new OpenAI({
          apiKey: profile.azure_openai_api_key || "",
          baseURL: `${profile.azure_openai_endpoint}/openai/deployments/${profile.azure_openai_embeddings_id}`,
          defaultQuery: { "api-version": "2023-12-01-preview" },
          defaultHeaders: { "api-key": profile.azure_openai_api_key },
          httpAgent: proxyAgent
        })
      } else {
        openai = new OpenAI({
          apiKey: profile.azure_openai_api_key || "",
          baseURL: `${profile.azure_openai_endpoint}/openai/deployments/${profile.azure_openai_embeddings_id}`,
          defaultQuery: { "api-version": "2023-12-01-preview" },
          defaultHeaders: { "api-key": profile.azure_openai_api_key }
        })
      }
    } else {
      if (isProxyEnabled) {
        openai = new OpenAI({
          apiKey: profile.openai_api_key || "",
          organization: profile.openai_organization_id,
          httpAgent: proxyAgent
        })
      } else {
        openai = new OpenAI({
          apiKey: profile.openai_api_key || "",
          organization: profile.openai_organization_id
        })
      }
    }

    if (embeddingsProvider === "openai") {
      console.log("provider === openai")
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: userInput
      })

      const openaiEmbedding = response.data.map(item => item.embedding)[0]

      console.log("oepnaiEmbedding: ", openaiEmbedding)
      console.log("sourceCount: ", sourceCount)
      console.log("uniqueFileIds: ", uniqueFileIds)
      const { data: openaiFileItems, error: openaiError } =
        await supabaseAdmin.rpc("match_file_items_openai", {
          query_embedding: openaiEmbedding as any,
          match_count: sourceCount,
          file_ids: uniqueFileIds
        })

      console.log(openaiError)
      if (openaiError) {
        throw openaiError
      }
      console.log("after openaiError")

      chunks = openaiFileItems
    } else if (embeddingsProvider === "local") {
      console.log("provider === local")
      const localEmbedding = await generateLocalEmbedding(userInput)

      const { data: localFileItems, error: localFileItemsError } =
        await supabaseAdmin.rpc("match_file_items_local", {
          query_embedding: localEmbedding as any,
          match_count: sourceCount,
          file_ids: uniqueFileIds
        })

      console.log("after match_file_items_local")
      if (localFileItemsError) {
        throw localFileItemsError
      }

      chunks = localFileItems
    }

    console.log("before chunks?.sort")
    const mostSimilarChunks = chunks?.sort(
      (a, b) => b.similarity - a.similarity
    )
    console.log("after sort")

    return new Response(JSON.stringify({ results: mostSimilarChunks }), {
      status: 200
    })
  } catch (error: any) {
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
