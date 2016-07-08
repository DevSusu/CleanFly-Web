from django.conf.urls import include, url

urlpatterns = [
    # Examples:
    # url(r'^$', 'cleanfly_web.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', 'order.views.index'),
    url(r'^order$', 'order.views.order'),
    url(r'^(?P<order_code>[\d]+)/(?P<phash>[\da-z]{10})$', 'order.views.card')
]
