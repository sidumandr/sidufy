from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .api_views import (
    FavoriteJamendoIdsAPIView,
    MeProfileAPIView,
    PlaylistAddTrackAPIView,
    PlaylistDetailAPIView,
    PlaylistListAPIView,
    PlaylistRemoveTrackAPIView,
    ProfileListenSyncAPIView,
    RegisterView,
    ToggleFavoriteAPIView,
)
from .views import DiscoveryView, SearchView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path(
        "auth/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path("discovery/", DiscoveryView.as_view(), name="discovery"),
    path("search/", SearchView.as_view(), name="search"),
    path("me/profile/", MeProfileAPIView.as_view(), name="me-profile"),
    path(
        "me/profile/listen/",
        ProfileListenSyncAPIView.as_view(),
        name="me-profile-listen",
    ),
    path("me/favorites/", FavoriteJamendoIdsAPIView.as_view(), name="me-favorites"),
    path(
        "me/favorites/toggle/",
        ToggleFavoriteAPIView.as_view(),
        name="me-favorites-toggle",
    ),
    path("playlists/", PlaylistListAPIView.as_view(), name="playlist-list"),
    path(
        "playlists/<int:playlist_id>/",
        PlaylistDetailAPIView.as_view(),
        name="playlist-detail",
    ),
    path(
        "playlists/<int:playlist_id>/tracks/",
        PlaylistAddTrackAPIView.as_view(),
        name="playlist-add-track",
    ),
    path(
        "playlists/<int:playlist_id>/tracks/<str:jamendo_id>/",
        PlaylistRemoveTrackAPIView.as_view(),
        name="playlist-remove-track",
    ),
]
