from django.conf.urls import include, url

urlpatterns = [
    # Examples:
    # url(r'^$', 'cleanfly_web.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^$', 'cleanfly.views.index'),
    url(r'^login$', 'cleanfly.views.login_view'),
    url(r'^logout$', 'cleanfly.views.logout_view'),
]
