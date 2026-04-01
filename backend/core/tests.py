from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class ProfileSignalTest(TestCase):
    def test_profile_created_on_user_create(self):
        user = User.objects.create_user(username ="safa", password="91344")
        self.assertTrue(hasattr(user, "profile"))


    def test_default_daily_goal(self):
        user = User.objects.create_user(username="ilhan", password="913441")
        self.assertEqual(user.profile.daily_goal, 60)

class AuthAPITest(TestCase):
    """JWT login endpoint'i doğru çalışıyor mu?"""

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="testpass123"
        )

    def test_login_returns_tokens(self):
        response = self.client.post(
            "/api/auth/token/",
            {"username": "testuser", "password": "testpass123"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access", data)
        self.assertIn("refresh", data)

    def test_login_wrong_password(self):
        response = self.client.post(
            "/api/auth/token/",
            {"username": "testuser", "password": "yanlis"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)
    
    def test_register_creates_user(self):
        response = self.client.post(
            "/api/auth/register/",
            {"username": "newuser", "password": "newpassword123"},
            content_type="application/json",
        )
        self.assertIn(response.status_code, [200,201])
        self.assertTrue(User.objects.filter(username="newuser").exists())


