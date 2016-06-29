from django.shortcuts import render
from django.views.decorators.http import require_http_methods

def index(request):
    return render(request, 'order/index.html')

@require_http_methods(["GET", "POST"])
def order(request):
    return render(request, 'order/register_noti.html')
    # return render(request, 'order/order.html')
