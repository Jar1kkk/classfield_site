import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import { getUnreadCount } from '../api/chat'

const NotifContext = createContext(null)

export function NotifProvider({ children }) {
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)
  const pollRef = useRef(null)

  useEffect(() => {
    if (!user) { setUnread(0); return }

    const fetch = () => {
      getUnreadCount().then((res) => setUnread(res.data.unread)).catch(() => {})
    }

    fetch()
    pollRef.current = setInterval(fetch, 10000)
    return () => clearInterval(pollRef.current)
  }, [user])

  return (
    <NotifContext.Provider value={{ unread, setUnread }}>
      {children}
    </NotifContext.Provider>
  )
}

export const useNotif = () => useContext(NotifContext)