import os
import unittest
from fastapi.testclient import TestClient
from app import create_app


class LifespanContract(unittest.TestCase):
    def make_app(self):
        return create_app(defective=os.environ.get("CRAFT_EXAMPLE_DEFECTIVE") == "1")

    def test_request_resource_is_initialized_then_closed(self):
        app = self.make_app()
        self.assertFalse(hasattr(app.state, "resource"))
        with TestClient(app) as client:
            self.assertEqual(client.get("/ready").status_code, 200)
            resource = app.state.resource
            self.assertFalse(resource.closed)
        self.assertTrue(resource.closed)

    def test_failed_request_still_releases_resource(self):
        app = self.make_app()
        with TestClient(app) as client:
            self.assertEqual(client.get("/ready").status_code, 200)
            resource = app.state.resource
            self.assertEqual(client.get("/failure").status_code, 503)
        self.assertTrue(resource.closed)


if __name__ == "__main__":
    unittest.main()
