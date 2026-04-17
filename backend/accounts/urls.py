from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView, ChangePasswordView, UserPublicProfileView
from .views import (
    RegisterView, ProfileView, ChangePasswordView, UserPublicProfileView,
    admin_stats, admin_listings, admin_users, admin_listing_status,
    admin_delete_listing, admin_categories, admin_delete_category
)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('users/<int:pk>/', UserPublicProfileView.as_view(), name='user_public_profile'),
    path('admin/stats/', admin_stats, name='admin_stats'),
    path('admin/listings/', admin_listings, name='admin_listings'),
    path('admin/listings/<int:pk>/status/', admin_listing_status, name='admin_listing_status'),
    path('admin/listings/<int:pk>/delete/', admin_delete_listing, name='admin_delete_listing'),
    path('admin/users/', admin_users, name='admin_users'),
    path('admin/categories/', admin_categories, name='admin_categories'),
    path('admin/categories/<int:pk>/', admin_delete_category, name='admin_delete_category'),
]