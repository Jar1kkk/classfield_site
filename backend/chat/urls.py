from django.urls import path
from .views import ConversationListView, ConversationStartView, MessageListView, MessageSendView, UnreadCountView

urlpatterns = [
    path('', ConversationListView.as_view(), name='conversations'),
    path('unread/', UnreadCountView.as_view(), name='unread_count'),
    path('start/<int:listing_id>/', ConversationStartView.as_view(), name='conversation_start'),
    path('<int:pk>/messages/', MessageListView.as_view(), name='messages'),
    path('<int:pk>/send/', MessageSendView.as_view(), name='message_send'),
]