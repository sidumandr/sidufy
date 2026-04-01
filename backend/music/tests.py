from django.contrib.auth import get_user_model
from django.test import TestCase

from music.models import Playlist, Track

User = get_user_model()

class TrackModelTest(TestCase):
    """Track modeli doğru çalışıyor mu?"""

    def test_create_track(self):
        track = Track.objects.create(
            jamendo_id="abc123",
            title="Test Track",
            artist="Test Artist",
            audio_url="https://example.com/track.mp3",
            duration=180
        )
        self.assertEqual(str(track), "Test Artist — Test Track")

    def test_jamendo_id_unique(self):
        Track.objects.create(
            jamendo_id="unique123",
            title="Track 1",
            artist="Artist",
            audio_url="https://example.com/1.mp3",
        )
        with self.assertRaises(Exception):
            Track.objects.create(
                jamendo_id="unique123",
                title="Track 2",
                artist="Artist",
                audio_url="https://example.com/2.mp3",
            )


class PlaylistAPITest(TestCase):
    """Playlist endpoint'leri auth gerektiriyor mu, doğru çalışıyor mu?"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="musicUser", password="pass1234"
        )
        response = self.client.post(
            "/api/auth/token/",
            {"username": "musicUser", "password": "pass1234"},
            content_type="application/json",
        )
        self.token = response.json()["access"]
        self.auth = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_playlist_list_requires_auth(self):
        response = self.client.get("/api/playlists/")
        self.assertEqual(response.status_code, 401)

    def test_playlist_list_with_auth(self):
        response = self.client.get("/api/playlists/", **self.auth)
        self.assertEqual(response.status_code, 200)

    def test_create_playlist(self):
        response = self.client.post(
            "/api/playlists/",
            {"name": "Chill Mix"},
            content_type="application/json",
            **self.auth,
        )
        self.assertIn(response.status_code, [200, 201])
        self.assertTrue(
            Playlist.objects.filter(user=self.user, name="Chill Mix").exists()
        )

    def test_duplicate_playlist_name_fails(self):
        Playlist.objects.create(user=self.user, name="Same Name")
        response = self.client.post(
            "/api/playlists/",
            {"name": "Same Name"},
            content_type="application/json",
            **self.auth,
        )
        self.assertNotIn(response.status_code, [200, 201])
