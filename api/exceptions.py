from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response

def api_exception_handler(exc, context):
    resp = drf_exception_handler(exc, context)
    if resp is None:
        return None

    if isinstance(resp.data, dict) and "detail" in resp.data:
        return resp

    return Response(
        {"detail": "Validation error", "errors": resp.data},
        status=resp.status_code
    )