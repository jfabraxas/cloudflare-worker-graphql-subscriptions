import {
  makeHandler,
  Benzene,
  GRAPHQL_TRANSPORT_WS_PROTOCOL
} from '@benzene/ws'
import { schema, count } from './schema'

const GQL = new Benzene({ schema })

const graphqlWS = makeHandler(GQL)

const handleSession = async (ws: WebSocket, request: Request) => {
  ws.accept()
  graphqlWS({
    protocol: GRAPHQL_TRANSPORT_WS_PROTOCOL,
    set onmessage(fn: any) {
      ws.onmessage = fn
    },
    get onmessage() {
      return ws.onmessage
    },
    set onclose(fn: () => any) {
      ws.onclose = fn
    },
    get onclose() {
      return ws.onclose as any
    },
    send(msg) {
      ws.send(msg)
    },
    close(code, reason) {
      ws.close(code, reason)
    }
  })
  /** start counter */
  count()
  ws.addEventListener('close', async (evt) => {
    console.log(evt)
  })
}

const getProtocols = (request: Request) => {
  const protocol = request.headers.get('sec-websocket-protocol')
  let protocols
  if (Array.isArray(protocol)) {
    protocols = protocol
  } else {
    protocols = protocol ? protocol.split(',').map((p) => p.trim()) : undefined
  }
  return protocols
}

const websocketHandler = async (request: Request): Promise<Response> => {
  const upgradeHeader = request.headers.get('Upgrade')
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected websocket', { status: 400 })
  }
  const protocols = getProtocols(request)
  if (protocols?.indexOf(GRAPHQL_TRANSPORT_WS_PROTOCOL) === -1) {
    return new Response(
      'Expected sec-websocket-protocol: ' + GRAPHQL_TRANSPORT_WS_PROTOCOL,
      { status: 400 }
    )
  }
  const [client, server] = Object.values(new WebSocketPair())
  await handleSession(server, request)
  return new Response(null, {
    status: 101,
    webSocket: client
  } as any)
}

const handleRequest = (request: Request): Promise<Response> | Response => {
  try {
    return websocketHandler(request)
  } catch (error: any) {
    return new Response(typeof error === 'string' ? error.toString() : error)
  }
  return new Response('Not found', { status: 404 })
}

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(handleRequest(event.request as Request))
})
