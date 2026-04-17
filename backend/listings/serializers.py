from rest_framework import serializers
from .models import Category, Listing, Image, Favorite
from accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image', 'is_main', 'order']


class ListingSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id', 'user', 'category', 'category_name', 'title', 'description',
            'price', 'condition', 'status', 'city', 'views_count',
            'images', 'is_favorited', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'views_count', 'created_at', 'updated_at']

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, listing=obj).exists()
        return False


class ListingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Listing
        fields = ['category', 'title', 'description', 'price', 'condition', 'city']

    def create(self, validated_data):
        request = self.context.get('request')
        listing = Listing.objects.create(**validated_data)
        if request:
            images = request.FILES.getlist('images')
            for i, image in enumerate(images):
                Image.objects.create(
                    listing=listing,
                    image=image,
                    is_main=(i == 0),
                    order=i
                )
        return listing


class FavoriteSerializer(serializers.ModelSerializer):
    listing = ListingSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'listing', 'created_at']

class ImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ['id', 'image', 'is_main', 'order']

    def get_image(self, obj):
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None