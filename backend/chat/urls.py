from django.urls import path
from .views import ConversationListView, ConversationStartView, MessageListView, MessageSendView, UnreadCountView, NotificationListView, NotificationCountView

urlpatterns = [
    path('', ConversationListView.as_view()),
    path('unread/', UnreadCountView.as_view()),
    path('notifications/', NotificationListView.as_view()),
    path('notifications/count/', NotificationCountView.as_view()),
    path('start/<int:listing_id>/', ConversationStartView.as_view()),
    path('<int:pk>/messages/', MessageListView.as_view()),
    path('<int:pk>/send/', MessageSendView.as_view()),
]