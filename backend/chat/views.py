from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from listings.models import Listing


class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            Q(buyer=user) | Q(seller=user)
        ).select_related('listing', 'buyer', 'seller').prefetch_related('messages')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ConversationStartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, listing_id):
        listing = get_object_or_404(Listing, pk=listing_id)
        if listing.user == request.user:
            return Response({'error': 'Не можна писати собі'}, status=status.HTTP_400_BAD_REQUEST)

        conversation, created = Conversation.objects.get_or_create(
            listing=listing,
            buyer=request.user,
            defaults={'seller': listing.user}
        )
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation = self.get_conversation()
        conversation.messages.filter(is_read=False).exclude(
            sender=self.request.user
        ).update(is_read=True)
        return conversation.messages.select_related('sender')

    def get_conversation(self):
        conv = get_object_or_404(Conversation, pk=self.kwargs['pk'])
        user = self.request.user
        if conv.buyer != user and conv.seller != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        return conv


class MessageSendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        conversation = get_object_or_404(Conversation, pk=pk)
        user = request.user
        if conversation.buyer != user and conversation.seller != user:
            return Response({'error': 'Немає доступу'}, status=status.HTTP_403_FORBIDDEN)

        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'Повідомлення не може бути порожнім'}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(conversation=conversation, sender=user, text=text)
        conversation.save()
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
    

class UnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(
            conversation__in=Conversation.objects.filter(
                Q(buyer=request.user) | Q(seller=request.user)
            ),
            is_read=False
        ).exclude(sender=request.user).count()
        return Response({'unread': count})