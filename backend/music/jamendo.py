from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from django.conf import settings

JAMENDO_TRACKS_URL = "https://api.jamendo.com/v3.0/tracks/"
DEFAULT_COVER = (
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=500"
)


def _request_jamendo(params: dict[str, str]) -> dict[str, Any]:
    query = urllib.parse.urlencode(params)
    url = f"{JAMENDO_TRACKS_URL}?{query}"
    req = urllib.request.Request(url, headers={"User-Agent": "Sidufy/1.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode())


def fetch_tracks(
    *,
    tags: str | None = None,
    search: str | None = None,
    limit: int = 20,
) -> dict[str, Any]:
    params: dict[str, str] = {
        "client_id": settings.JAMENDO_CLIENT_ID,
        "format": "json",
        "limit": str(limit),
        "include": "musicinfo",
        "audioformat": "mp32",
        "order": "popularity_total",
    }
    if tags:
        params["tags"] = tags
    if search:
        params["search"] = search

    try:
        data = _request_jamendo(params)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError(str(exc)) from exc

    if data.get("headers", {}).get("status") != "success":
        raise RuntimeError("Jamendo response status not success")

    return data


def jamendo_item_to_track_payload(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(item["id"]),
        "title": item["name"],
        "artist": item["artist_name"],
        "cover": item.get("album_image") or DEFAULT_COVER,
        "audioUrl": item["audio"],
        "duration": int(item.get("duration") or 0),
    }
