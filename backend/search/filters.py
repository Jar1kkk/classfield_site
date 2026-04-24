import django_filters
from listings.models import Listing

    
class ListingFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    city = django_filters.CharFilter(field_name='city', lookup_expr='icontains')
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    condition = django_filters.ChoiceFilter(choices=Listing.CONDITION_CHOICES)
    category = django_filters.NumberFilter(field_name='category__id')
    user = django_filters.NumberFilter(field_name='user__id')


    class Meta:
        model = Listing
        fields = ['min_price', 'max_price', 'city', 'title', 'condition', 'category', 'user']