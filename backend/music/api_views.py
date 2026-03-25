from __future__ import annotations

import json

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import Profile

from .models import Playlist, Track


def _playlist_summary(p: Playlist) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "is_favorite_sidebar": p.is_favorite_sidebar,
        "track_count": p.tracks.count(),
    }


def get_or_create_favorites_playlist(user) -> Playlist:
    pl = (
        Playlist.objects.filter(user=user, is_favorite_sidebar=True)
        .order_by("id")
        .first()
    )
    if pl:
        return pl
    pl = Playlist.objects.filter(user=user, name="Favorilerim").first()
    if pl:
        if not pl.is_favorite_sidebar:
            pl.is_favorite_sidebar = True
            pl.save(update_fields=["is_favorite_sidebar"])
        return pl
    return Playlist.objects.create(
        user=user,
        name="Favorilerim",
        is_favorite_sidebar=True,
    )


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request):
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password") or ""
        email = (request.data.get("email") or "").strip()

        if not username or not password:
            return Response(
                {"detail": "Kullanıcı adı ve şifre gerekli."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {"detail": "Bu kullanıcı adı alınmış."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
        )
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )


class MeProfileAPIView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {
                    "authenticated": False,
                    "profile": None,
                    "username": None,
                }
            )

        profile, _ = Profile.objects.get_or_create(user=request.user)
        avatar_url = None
        if profile.avatar:
            avatar_url = request.build_absolute_uri(profile.avatar.url)

        return Response(
            {
                "authenticated": True,
                "username": request.user.username,
                "profile": {
                    "daily_goal": profile.daily_goal,
                    "total_listen_time": profile.total_listen_time,
                    "avatar_url": avatar_url,
                },
            }
        )


class ProfileListenSyncAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        raw = request.data.get("seconds", request.data.get("delta_seconds", 0))
        try:
            seconds = int(raw)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Geçersiz süre."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if seconds <= 0 or seconds > 7200:
            return Response(
                {"detail": "Süre 1–7200 saniye arasında olmalı."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.total_listen_time += seconds
        profile.save(update_fields=["total_listen_time"])

        return Response(
            {
                "total_listen_time": profile.total_listen_time,
                "daily_goal": profile.daily_goal,
            }
        )


class FavoriteJamendoIdsAPIView(APIView):
    """GET: kullanıcının Favorilerim listesindeki jamendo_id'ler."""

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        fav = get_or_create_favorites_playlist(request.user)
        ids = list(fav.tracks.values_list("jamendo_id", flat=True))
        return Response({"jamendo_ids": ids})


class ToggleFavoriteAPIView(APIView):
    """
    POST: jamendo_id ile favori aç/kapa. Şarkı yoksa track_data ile yaratılır.
    """

    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        body = request.data if isinstance(request.data, dict) else {}
        jamendo_id = str(
            body.get("jamendo_id") or body.get("id") or "",
        ).strip()
        if not jamendo_id:
            return Response(
                {"detail": "jamendo_id gerekli."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        track_data = body.get("track_data") or body.get("track")
        try:
            track = Track.objects.get(jamendo_id=jamendo_id)
        except Track.DoesNotExist:
            if not isinstance(track_data, dict):
                return Response(
                    {
                        "detail": "Şarkı veritabanında yok; track_data gerekli.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            track = Track(
                jamendo_id=jamendo_id,
                title=(track_data.get("title") or "Unknown")[:512],
                artist=(track_data.get("artist") or "Unknown")[:512],
                cover=(track_data.get("cover") or "")[:1024],
                audio_url=(
                    track_data.get("audioUrl") or track_data.get("audio_url") or ""
                )[:1024],
                duration=int(track_data.get("duration") or 0),
            )
            if not track.audio_url:
                return Response(
                    {"detail": "track_data içinde audioUrl gerekli."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            track.save()

        fav = get_or_create_favorites_playlist(request.user)
        if fav.tracks.filter(pk=track.pk).exists():
            fav.tracks.remove(track)
            in_favorites = False
        else:
            fav.tracks.add(track)
            in_favorites = True

        return Response(
            {
                "in_favorites": in_favorites,
                "jamendo_id": jamendo_id,
            }
        )


class PlaylistListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        playlists = [
            _playlist_summary(p)
            for p in request.user.playlists.all().order_by("name")
        ]
        return Response({"playlists": playlists})

    def post(self, request):
        name = (request.data.get("name") or "").strip()
        if not name:
            return Response(
                {"detail": "Liste adı gerekli."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if Playlist.objects.filter(user=request.user, name__iexact=name).exists():
            return Response(
                {"detail": "Bu isimde bir listen zaten var."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        playlist = Playlist.objects.create(
            user=request.user,
            name=name[:255],
            is_favorite_sidebar=False,
        )
        return Response(
            {"playlist": _playlist_summary(playlist)},
            status=status.HTTP_201_CREATED,
        )


class PlaylistDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, playlist_id: int):
        playlist = get_object_or_404(Playlist, pk=playlist_id, user=request.user)
        if playlist.is_favorite_sidebar:
            return Response(
                {"detail": "Favoriler listesi silinemez."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        playlist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PlaylistAddTrackAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, playlist_id: int):
        playlist = get_object_or_404(Playlist, pk=playlist_id, user=request.user)

        if isinstance(request.data, dict):
            body = dict(request.data)
        else:
            try:
                body = json.loads(request.body.decode() or "{}")
            except json.JSONDecodeError:
                return Response(
                    {"detail": "Invalid JSON"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        track_data = body.get("track_data")
        if isinstance(track_data, dict):
            merged = {**body, **track_data}
            jamendo_id = str(
                merged.get("id") or merged.get("jamendo_id") or "",
            ).strip()
            field_source = merged
        else:
            jamendo_id = str(body.get("id") or body.get("jamendo_id") or "").strip()
            field_source = body

        if not jamendo_id:
            return Response(
                {"detail": "Track id / jamendo_id gerekli."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        track, _ = Track.objects.update_or_create(
            jamendo_id=jamendo_id,
            defaults={
                "title": (field_source.get("title") or "Unknown")[:512],
                "artist": (field_source.get("artist") or "Unknown")[:512],
                "cover": (field_source.get("cover") or "")[:1024],
                "audio_url": (
                    field_source.get("audioUrl")
                    or field_source.get("audio_url")
                    or ""
                )[:1024],
                "duration": int(field_source.get("duration") or 0),
            },
        )
        playlist.tracks.add(track)

        return Response(
            {
                "ok": True,
                "playlist_id": playlist.id,
                "track_id": track.jamendo_id,
            }
        )


class PlaylistRemoveTrackAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, playlist_id: int, jamendo_id: str):
        playlist = get_object_or_404(Playlist, pk=playlist_id, user=request.user)
        track = get_object_or_404(Track, jamendo_id=jamendo_id)
        playlist.tracks.remove(track)
        return Response({"ok": True})
