from rest_framework import generics, permissions
from listings.models import Listing
from listings.serializers import ListingSerializer
from listings.views import ListingPagination
from .filters import ListingFilter


class SearchView(generics.ListAPIView):
    serializer_class = ListingSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class = ListingFilter
    pagination_class = ListingPagination

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