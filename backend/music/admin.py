from django.contrib import admin

from .models import Playlist, Track


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ("title", "artist", "jamendo_id", "duration")
    search_fields = ("title", "artist", "jamendo_id")


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "is_favorite_sidebar")
    list_filter = ("is_favorite_sidebar",)
    search_fields = ("name", "user__username")
    filter_horizontal = ("tracks",)
