from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException


class Resource:
    def __init__(self):
        self.closed = False

    def close(self):
        self.closed = True


@asynccontextmanager
async def defective_lifespan(_app: FastAPI):
    """Explicit teaching defect: requests run without their owned resource."""
    yield


def create_app(defective=False):
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        resource = Resource()
        app.state.resource = resource
        try:
            yield
        finally:
            resource.close()

    app = FastAPI(lifespan=defective_lifespan if defective else lifespan)

    @app.get("/ready")
    async def ready():
        resource = getattr(app.state, "resource", None)
        if resource is None or resource.closed:
            raise HTTPException(503, "resource unavailable")
        return {"ready": True}

    @app.get("/failure")
    async def failure():
        raise HTTPException(503, "deliberate request failure")

    return app


app = create_app()
