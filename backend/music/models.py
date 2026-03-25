from django.conf import settings
from django.db import models


class Track(models.Model):
    jamendo_id = models.CharField(max_length=64, unique=True, db_index=True)
    title = models.CharField(max_length=512)
    artist = models.CharField(max_length=512)
    cover = models.URLField(max_length=1024, blank=True)
    audio_url = models.URLField(max_length=1024)
    duration = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.artist} — {self.title}"


class Playlist(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="playlists",
    )
    name = models.CharField(max_length=255)
    is_favorite_sidebar = models.BooleanField(default=False)
    tracks = models.ManyToManyField(
        Track,
        related_name="playlists",
        blank=True,
    )

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"],
                name="playlist_unique_name_per_user",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.user_id})"
