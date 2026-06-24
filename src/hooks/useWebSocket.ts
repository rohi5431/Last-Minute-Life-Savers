import { useEffect, useRef, useState } from 'react'
import { WS_BASE_URL } from '../services/api'

function userIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub
  } catch {
    return null
  }
}

interface UseWebSocketOptions {
  enabled?: boolean
}

// Connects to the backend WebSocket at /ws/notify/{user_id}, parses JSON
// messages, and dispatches them to a handler. Reconnects with exponential
// backoff on drop.
export default function useWebSocket(
  onEvent: (data: any) => void,
  { enabled = true }: UseWebSocketOptions = {}
) {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<WebSocket | null>(null)
  const backoffRef = useRef(1000)
  const closedByUsRef = useRef(false)
  const handlerRef = useRef(onEvent)

  useEffect(() => {
    handlerRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!enabled) return

    let reconnectTimer: any

    const connect = () => {
      const token = localStorage.getItem('lmls_token')
      const userId = token ? userIdFromToken(token) : null
      if (!token || !userId) {
        scheduleReconnect()
        return
      }

      const url = `${WS_BASE_URL}/ws/notify/${userId}?token=${encodeURIComponent(token)}`
      let socket: WebSocket
      try {
        socket = new WebSocket(url)
      } catch {
        scheduleReconnect()
        return
      }
      socketRef.current = socket

      socket.onopen = () => {
        setConnected(true)
        backoffRef.current = 1000
      }

      socket.onmessage = (event) => {
        let data: any
        try {
          data = JSON.parse(event.data)
        } catch {
          data = { type: 'message', payload: { message: String(event.data) } }
        }
        if (handlerRef.current) handlerRef.current(data)
      }

      socket.onerror = () => {
        setConnected(false)
      }

      socket.onclose = () => {
        setConnected(false)
        if (!closedByUsRef.current) scheduleReconnect()
      }
    }

    const scheduleReconnect = () => {
      clearTimeout(reconnectTimer)
      reconnectTimer = setTimeout(() => {
        backoffRef.current = Math.min(backoffRef.current * 2, 15000)
        connect()
      }, backoffRef.current)
    }

    connect()

    return () => {
      closedByUsRef.current = true
      clearTimeout(reconnectTimer)
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [enabled])

  return { connected }
}
