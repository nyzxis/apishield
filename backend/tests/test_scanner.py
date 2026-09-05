import unittest
from fastapi.testclient import TestClient
from backend.mock_api import mock_router
from backend.scanner import APISecurityScanner
from fastapi import FastAPI

app = FastAPI()
app.include_router(mock_router)
client = TestClient(app)

class TestAPISecurityScanner(unittest.TestCase):
    def setUp(self):
        self.scanner = APISecurityScanner()
        # Override session in scanner to route requests through TestClient
        self.client = client

    def test_mock_bank_bola_endpoint(self):
        # Direct verification of mock bank behavior
        resp1 = self.client.get("/api/mock/bank/account/101")
        self.assertEqual(resp1.status_code, 200)
        self.assertIn("Alice Smith", resp1.text)

        # IDOR swap to 102
        resp2 = self.client.get("/api/mock/bank/account/102")
        self.assertEqual(resp2.status_code, 200)
        self.assertIn("Bob Johnson", resp2.text)

    def test_mock_store_mass_assignment(self):
        payload = {
            "item": "Premium License",
            "role": "admin",
            "is_admin": True,
            "discount_percent": 100
        }
        resp = self.client.post("/api/mock/store/order", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["user_context"]["assigned_role"], "admin")
        self.assertTrue(data["user_context"]["is_admin"])
        self.assertEqual(data["total_cost"], 0)

    def test_mock_health_broken_auth(self):
        # Accessing patient record without token
        resp = self.client.get("/api/mock/health/patients/P-901")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("Jane Doe", data["name"])
        self.assertIn("Bypassed", data["auth_status"])

    def test_hardened_enterprise_endpoint(self):
        # Without token -> 401
        unauth = self.client.get("/api/mock/enterprise/secure")
        self.assertEqual(unauth.status_code, 401)
        self.assertIn("Strict-Transport-Security", unauth.headers)
        self.assertIn("X-Content-Type-Options", unauth.headers)

        # With valid token -> 200
        auth = self.client.get(
            "/api/mock/enterprise/secure",
            headers={"Authorization": "Bearer apishield_prod_valid_token_2026"}
        )
        self.assertEqual(auth.status_code, 200)

if __name__ == "__main__":
    unittest.main()
