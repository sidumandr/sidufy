from __future__ import annotations

from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse
from django.views import View

from .jamendo import fetch_tracks, jamendo_item_to_track_payload


class DiscoveryView(View):
    """
    Cached Jamendo discovery (lofi). Response shape matches frontend Track[].
    """

    def get(self, request):
        cached = cache.get(settings.DISCOVERY_CACHE_KEY)
        if cached is not None:
            return JsonResponse({"tracks": cached, "cached": True})

        try:
            data = fetch_tracks(tags="lofi,chillout", limit=50)
        except RuntimeError:
            try:
                data = fetch_tracks(limit=50)
            except RuntimeError as exc:
                return JsonResponse(
                    {"tracks": [], "error": str(exc)},
                    status=502,
                )

        results = data.get("results") or []
        tracks = [jamendo_item_to_track_payload(item) for item in results]

        cache.set(
            settings.DISCOVERY_CACHE_KEY,
            tracks,
            settings.DISCOVERY_CACHE_TIMEOUT,
        )

        return JsonResponse({"tracks": tracks, "cached": False})


class SearchView(View):
    """
    Live Jamendo search by query string ?q=
    """

    def get(self, request):
        query = (request.GET.get("q") or "").strip()
        if not query:
            return JsonResponse(
                {"tracks": [], "error": "Query parameter 'q' is required."},
                status=400,
            )

        try:
            data = fetch_tracks(search=query, limit=50)
        except RuntimeError as exc:
            return JsonResponse(
                {"tracks": [], "error": str(exc)},
                status=502,
            )

        results = data.get("results") or []
        tracks = [jamendo_item_to_track_payload(item) for item in results]
        return JsonResponse({"tracks": tracks})
