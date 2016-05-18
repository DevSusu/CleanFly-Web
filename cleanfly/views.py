from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.http import require_http_methods

@login_required(login_url="/login")
def index(request):
    return render(request, 'index.html')

@require_http_methods(["GET", "POST"])
def login_view(request):
    if request.method == "GET":
        return render(request,'login.html',{'action':request.GET['next']})
    else:
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username,password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return redirect(request.GET['next'])
            else:
                return render(request, 'account_disabled.html')
        else:
            return render(request,'auth_wrong.html')

def logout_view(request):
    logout(request)
    return redirect('/')

# Create your views here.
