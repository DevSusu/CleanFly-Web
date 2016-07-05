from django.shortcuts import render
from django.views.decorators.http import require_http_methods

def index(request):
    return render(request, 'order/address.html')

@require_http_methods(["POST"])
def order(request):
    if request.POST['is_address_ok'] == "true":
        return render(request, 'order/order.html', {'user':request.POST})
    else:
        return render(request, 'order/register_noti.html', {'user':request.POST})

def card(request):
    return render(request, 'order/card.html', {'user':request.GET})
