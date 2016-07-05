from django.shortcuts import render
from django.views.decorators.http import require_http_methods

def index(request):
    return render(request, 'order/address.html')

@require_http_methods(["GET", "POST"])
def order(request):
    if request.method == "POST":
        if request.POST['is_address_ok']:
            return render(request, 'order/order.html', {'user':request.POST})
        else:
            return render(request, 'order/register_noti.html', request.POST)
    else:
        return render(request, 'order/register_noti.html')
        # return render(request, 'order/order.html')

def card(request):
    return render(request, 'order/card.html', {'user':request.GET})

def inicis(request, num):
    if num == '1':
        return render(request, 'order/inicis_first.html', {'user':request.GET})
    else:
        return render(request, 'order/inicis_second.html', {'user':request.GET})
