from django.conf.urls import include, url
from django.contrib import admin

urlpatterns = [
    # Examples:
    # url(r'^$', 'cleanfly_web.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^cleanfly/', include('cleanfly.urls')),
    url(r'^web/', include('web.urls')),
    url(r'^', include('order.urls')),
]
