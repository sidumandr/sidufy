from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "daily_goal", "total_listen_time")
    search_fields = ("user__username", "user__email")
