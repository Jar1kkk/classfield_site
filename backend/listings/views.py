from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Category, Listing, Favorite
from .serializers import (
    CategorySerializer, ListingSerializer,
    ListingCreateSerializer, FavoriteSerializer
)
from rest_framework.pagination import PageNumberPagination
from search.filters import ListingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Image
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import ImageSerializer

class ListingImageDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk, image_pk):
        listing = get_object_or_404(Listing, pk=pk)
        if listing.user != request.user and not request.user.is_staff:
            return Response({'error': 'Немає доступу'}, status=status.HTTP_403_FORBIDDEN)
        image = get_object_or_404(Image, pk=image_pk, listing=listing)
        image.image.delete(save=False)
        image.delete()
        return Response({'message': 'Видалено'}, status=status.HTTP_204_NO_CONTENT)
    
class ListingImageAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        listing = get_object_or_404(Listing, pk=pk)
        if listing.user != request.user and not request.user.is_staff:
            return Response({'error': 'Немає доступу'}, status=status.HTTP_403_FORBIDDEN)
        images = request.FILES.getlist('images')
        if not images:
            return Response({'error': 'Файли не вибрані'}, status=status.HTTP_400_BAD_REQUEST)
        current_count = listing.images.count()
        if current_count + len(images) > 5:
            return Response({'error': f'Максимум 5 фото. Зараз є {current_count}'}, status=status.HTTP_400_BAD_REQUEST)
        created = []
        for i, image in enumerate(images):
            img = Image.objects.create(
                listing=listing,
                image=image,
                is_main=(current_count == 0 and i == 0),
                order=current_count + i
            )
            created.append(ImageSerializer(img, context={'request': request}).data)
        return Response(created, status=status.HTTP_201_CREATED)
    
class ListingImageSetMainView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, image_pk):
        listing = get_object_or_404(Listing, pk=pk)
        if listing.user != request.user and not request.user.is_staff:
            return Response({'error': 'Немає доступу'}, status=status.HTTP_403_FORBIDDEN)
        listing.images.update(is_main=False)
        image = get_object_or_404(Image, pk=image_pk, listing=listing)
        image.is_main = True
        image.save()
        return Response({'message': 'Головне фото встановлено'})

class ListingPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 48

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ListingListView(generics.ListAPIView):
    serializer_class = ListingSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = ListingPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = ListingFilter

    def get_queryset(self):
        queryset = Listing.objects.filter(status='active') \
            .select_related('user', 'category') \
            .prefetch_related('images')

        ordering = self.request.query_params.get('ordering')
        if ordering in ['price', '-price', 'created_at', '-created_at', 'views_count', '-views_count']:
            queryset = queryset.order_by(ordering)

        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    

class ListingCreateView(generics.CreateAPIView):
    serializer_class = ListingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Listing.objects.all()
    permission_classes = [IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ListingCreateSerializer
        return ListingSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_status = instance.status
        response = super().partial_update(request, *args, **kwargs)
        instance.refresh_from_db()
        new_status = instance.status

        # надсилаємо сповіщення якщо статус змінився на "sold"
        if old_status != 'sold' and new_status == 'sold':
            self._notify_sold(instance)

        return response

    def _notify_sold(self, listing):
        from chat.models import Notification
        from django.db.models import Q
        from chat.models import Conversation
        from listings.models import Favorite

        # збираємо унікальних користувачів з обраного та чатів
        users_from_favorites = Favorite.objects.filter(
            listing=listing
        ).values_list('user_id', flat=True)

        users_from_chats = Conversation.objects.filter(
            listing=listing
        ).values_list('buyer_id', flat=True)

        user_ids = set(list(users_from_favorites) + list(users_from_chats))
        user_ids.discard(listing.user_id)  # продавця не сповіщаємо

        for user_id in user_ids:
            Notification.objects.create(
                user_id=user_id,
                type='listing_sold',
                listing=listing,
                text=f'Товар "{listing.title}" який вас цікавив — продано.'
            )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class MyListingsView(generics.ListAPIView):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Listing.objects.filter(user=self.request.user).select_related('category').prefetch_related('images')


class FavoriteListView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('listing')


class FavoriteToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        listing = get_object_or_404(Listing, pk=pk)
        favorite, created = Favorite.objects.get_or_create(user=request.user, listing=listing)
        if not created:
            favorite.delete()
            return Response({'status': 'removed'})
        return Response({'status': 'added'}, status=status.HTTP_201_CREATED)