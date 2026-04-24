import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { getConversations, getMessages, sendMessage } from '../api/chat'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useNotif } from '../context/NotifContext'

export default function Chat() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesContainerRef = useRef(null)
  const pollRef = useRef(null)
  const { setUnread } = useNotif()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getConversations().then((res) => {
      setConversations(res.data)
      const convId = searchParams.get('conv')
      if (convId) {
        const found = res.data.find((c) => c.id === parseInt(convId))
        if (found) selectConversation(found)
      } else if (res.data.length > 0) {
        selectConversation(res.data[0])
      }
    }).finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
        container.scrollTop = container.scrollHeight
    }
  }, [messages])



  useEffect(() => {
    if (!activeConv) return
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      getMessages(activeConv.id).then((res) => setMessages(res.data))
    }, 5000)
    return () => clearInterval(pollRef.current)
  }, [activeConv])

  const selectConversation = async (conv) => {
    setActiveConv(conv)
    const res = await getMessages(conv.id)
    setMessages(res.data)
  // оновлюємо лічильник
    getUnreadCount().then((r) => setUnread(r.data.unread)).catch(() => {})
}

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeConv) return
    setSending(true)
    try {
      const res = await sendMessage(activeConv.id, text)
      setMessages((prev) => [...prev, res.data])
      setText('')
    } finally {
      setSending(false)
    }
  }

  const getOtherUser = (conv) => {
    return conv.buyer?.id === user?.id ? conv.seller : conv.buyer
  }

  if (loading) return <div className="detail-loading">Завантаження...</div>

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div className="chat-sidebar__header">
          <h2>Повідомлення</h2>
        </div>
        {conversations.length === 0 ? (
          <div className="chat-empty-sidebar">
            <p>Немає розмов</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const other = getOtherUser(conv)
            const isActive = activeConv?.id === conv.id
            return (
              <div
                key={conv.id}
                className={`chat-conv-item ${isActive ? 'chat-conv-item--active' : ''}`}
                onClick={() => selectConversation(conv)}
              >
                <div className="chat-conv-item__avatar">
                    {other?.avatar ? (
                        <img src={other.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                        other?.username?.[0]?.toUpperCase()
                    )}
                </div>
                <div className="chat-conv-item__info">
                  <div className="chat-conv-item__top">
                    <span className="chat-conv-item__name">{other?.username}</span>
                    {conv.unread_count > 0 && (
                      <span className="chat-conv-item__badge">{conv.unread_count}</span>
                    )}
                  </div>
                  <p className="chat-conv-item__listing">{conv.listing?.title}</p>
                  {conv.last_message && (
                    <p className="chat-conv-item__preview">{conv.last_message.text}</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="chat-main">
        {!activeConv ? (
          <div className="chat-placeholder">
            <p>Виберіть розмову</p>
          </div>
        ) : (
          <>
            <div className="chat-main__header">
                <Link to={`/users/${getOtherUser(activeConv)?.id}`} className="chat-conv-item__avatar">
                    {getOtherUser(activeConv)?.avatar ? (
                        <img src={getOtherUser(activeConv).avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                        getOtherUser(activeConv)?.username?.[0]?.toUpperCase()
                    )}
                </Link>
              <div>
                <Link to={`/users/${getOtherUser(activeConv)?.id}`} className="chat-main__name">
                    {getOtherUser(activeConv)?.username}
                </Link>
                <a href={`/listings/${activeConv.listing?.id}`} className="chat-main__listing">
                    {activeConv.listing?.title}
                </a>
              </div>
            </div>

            <div className="chat-messages" ref={messagesContainerRef}>
                {messages.map((msg) => {
                    const isMe = msg.sender?.id === user?.id
                    return (
                        <div key={msg.id} className={`chat-msg ${isMe ? 'chat-msg--me' : 'chat-msg--other'}`}>
                            <div className="chat-msg__bubble">{msg.text}</div>
                            <span className="chat-msg__time">
                                {new Date(msg.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )
                })}
            </div>

            <form className="chat-input" onSubmit={handleSend}>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Напишіть повідомлення..."
                disabled={sending}
              />
              <button type="submit" className="btn btn--primary" disabled={sending || !text.trim()}>
                Надіслати
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}