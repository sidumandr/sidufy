from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from music.models import Playlist

from .models import Profile

User = get_user_model()


@receiver(post_save, sender=User)
def create_profile_and_default_playlist(
    sender,
    instance: User,
    created: bool,
    **kwargs,
) -> None:
    if not created:
        return
    Profile.objects.get_or_create(user=instance)
    Playlist.objects.get_or_create(
        user=instance,
        name="Favorilerim",
        defaults={"is_favorite_sidebar": True},
    )
