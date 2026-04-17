from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, ChangePasswordSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from listings.models import Listing, Category


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Невірний старий пароль'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Пароль змінено успішно'})


class UserPublicProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    return Response({
        'users': User.objects.count(),
        'listings': Listing.objects.count(),
        'active_listings': Listing.objects.filter(status='active').count(),
        'sold_listings': Listing.objects.filter(status='sold').count(),
        'archived_listings': Listing.objects.filter(status='archived').count(),
        'categories': Category.objects.count(),
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_listings(request):
    listings = Listing.objects.all().select_related('user', 'category').order_by('-created_at')
    from listings.serializers import ListingSerializer
    serializer = ListingSerializer(listings, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    users = User.objects.all().order_by('-created_at')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_listing_status(request, pk):
    listing = get_object_or_404(Listing, pk=pk)
    status_val = request.data.get('status')
    if status_val in ['active', 'sold', 'archived']:
        listing.status = status_val
        listing.save(update_fields=['status'])
        return Response({'status': listing.status})
    return Response({'error': 'Невірний статус'}, status=400)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_listing(request, pk):
    listing = get_object_or_404(Listing, pk=pk)
    listing.delete()
    return Response({'message': 'Видалено'}, status=204)

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def admin_categories(request):
    from listings.models import Category
    from listings.serializers import CategorySerializer
    if request.method == 'GET':
        cats = Category.objects.all()
        return Response(CategorySerializer(cats, many=True).data)
    serializer = CategorySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=201)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_category(request, pk):
    from listings.models import Category
    cat = get_object_or_404(Category, pk=pk)
    cat.delete()
    return Response({'message': 'Видалено'}, status=204)