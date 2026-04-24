from django.urls import path
from .views import (
    CategoryListView, ListingListView, ListingCreateView,
    ListingDetailView, MyListingsView, FavoriteListView, FavoriteToggleView,
    ListingImageDeleteView, ListingImageAddView, ListingImageSetMainView
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='categories'),
    path('', ListingListView.as_view(), name='listings'),
    path('create/', ListingCreateView.as_view(), name='listing_create'),
    path('<int:pk>/', ListingDetailView.as_view(), name='listing_detail'),
    path('my/', MyListingsView.as_view(), name='my_listings'),
    path('favorites/', FavoriteListView.as_view(), name='favorites'),
    path('<int:pk>/favorite/', FavoriteToggleView.as_view(), name='favorite_toggle'),
    path('<int:pk>/images/add/', ListingImageAddView.as_view(), name='listing_image_add'),
    path('<int:pk>/images/<int:image_pk>/delete/', ListingImageDeleteView.as_view(), name='listing_image_delete'),
    path('<int:pk>/images/<int:image_pk>/main/', ListingImageSetMainView.as_view(), name='listing_image_main'),
]