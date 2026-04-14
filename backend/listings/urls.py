from django.urls import path
from .views import (
    CategoryListView, ListingListView, ListingCreateView,
    ListingDetailView, MyListingsView, FavoriteListView, FavoriteToggleView
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='categories'),
    path('', ListingListView.as_view(), name='listings'),
    path('create/', ListingCreateView.as_view(), name='listing_create'),
    path('<int:pk>/', ListingDetailView.as_view(), name='listing_detail'),
    path('my/', MyListingsView.as_view(), name='my_listings'),
    path('favorites/', FavoriteListView.as_view(), name='favorites'),
    path('<int:pk>/favorite/', FavoriteToggleView.as_view(), name='favorite_toggle'),
]