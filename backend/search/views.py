from rest_framework import generics, permissions
from listings.models import Listing
from listings.serializers import ListingSerializer
from .filters import ListingFilter
from listings.views import ListingPagination


class SearchView(generics.ListAPIView):
    pagination_class = ListingPagination
    serializer_class = ListingSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class = ListingFilter
    ordering_fields = ['price', 'created_at', 'views_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Listing.objects.filter(status='active') \
            .select_related('user', 'category') \
            .prefetch_related('images')

        ordering = self.request.query_params.get('ordering')
        if ordering in ['price', '-price', 'created_at', '-created_at', 'views_count', '-views_count']:
            queryset = queryset.order_by(ordering)

        return queryset