from django.conf import settings
from django.db import models


class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    daily_goal = models.PositiveIntegerField(
        default=60,
        help_text="Daily listening goal (e.g. minutes).",
    )
    total_listen_time = models.PositiveIntegerField(
        default=0,
        help_text="Total listened time in seconds.",
    )
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    def __str__(self) -> str:
        return f"Profile({self.user_id})"
