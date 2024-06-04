import { SocksProxyAgent } from "socks-proxy-agent"

export function getProxyAgent(proto: string | null, address: string | null, port: string | null) {
  if (proto === null || proto === "" || address === null || address === "" || port === null || port === "") {
    throw new Error(`getProxyAgent: empty proto, address or port`)
  }
  let proxyAgent = null
  if (proto === "socks5h" || proto === "socks5" || proto === "socks4" || proto === "socks4a" || proto === "socks") {
    proxyAgent = new SocksProxyAgent(`${proto}://${address}:${port}`)
  } else {
    throw new Error(`getProxyAgent: ${proto} not implemented`)
  }
  return proxyAgent
}