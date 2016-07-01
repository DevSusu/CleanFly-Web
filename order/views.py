from django.shortcuts import render
from django.views.decorators.http import require_http_methods

def index(request):
    return render(request, 'order/address.html')

@require_http_methods(["GET", "POST"])
def order(request):
    if request.method == "POST":
        return render(request, 'order/order.html', request.POST)
    else:
        return render(request, 'order/order.html')
