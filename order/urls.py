from django.conf.urls import include, url

urlpatterns = [
    # Examples:
    # url(r'^$', 'cleanfly_web.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', 'order.views.index'),
    url(r'^order$', 'order.views.order'),
    url(r'^card$', 'order.views.card'),
    url(r'^inicis\/(?P<num>[0-9])$', 'order.views.inicis'),
]
