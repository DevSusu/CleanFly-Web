from django.shortcuts import render
from django.views.decorators.http import require_http_methods

@require_http_methods(["GET","POST"])
def index(request):
    if request.method == "GET":
        return render(request, 'order/address.html')
    else:
        if request.POST['is_address_ok'] == "true":
            return render(request, 'order/order.html', {'user':request.POST})
        else:
            return render(request, 'order/register_noti.html', {'user':request.POST})

@require_http_methods(["POST"])
def order(request):
    return render(request, 'order/order_complete.html', {'user':request.POST})

def card(request):
    return render(request, 'order/card.html', {'user':request.GET})
