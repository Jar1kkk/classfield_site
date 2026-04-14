from django.contrib import admin
from .models import Category, Listing, Image, Favorite

admin.site.register(Category)
admin.site.register(Listing)
admin.site.register(Image)
admin.site.register(Favorite)