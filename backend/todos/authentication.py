from rest_framework.authentication import SessionAuthentication as DRFSessionAuthentication


class SessionAuthentication(DRFSessionAuthentication):
    """Session auth that responds with 401 instead of 403 when there are no
    credentials, so the frontend can distinguish a logged-out user from a
    permission or CSRF failure and show the login modal."""

    def authenticate_header(self, request):
        return "Session"
