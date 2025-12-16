from django.http import JsonResponse

def welcome_view(request):
    """
    Welcome page for the API root endpoint.
    """
    return JsonResponse({
        'message': 'Welcome to API',
        'endpoints': {
            'register': '/register/',
            'login': '/login/',
            'admin': '/admin/'
        }
    })

