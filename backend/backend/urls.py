"""backend URL Configuration
The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from todos import views


# DefaultRouter allows you to see all the API routes at /api
# Remove trailing slash at the end of route URLs for prettiness
router = routers.DefaultRouter(trailing_slash=False)
router.register('tags', views.TagViewSet)
router.register('projects', views.ProjectViewSet)
router.register('todos', views.TodoViewSet, basename="todos")
router.register('wishlist', views.WishlistViewSet)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('set-csrf', views.set_csrf_token, name='Set-CSRF'),
    # path('login', views.LoginView, name='Login'),
    # path('logout', views.LogoutView, name='Logout'),
    *router.urls
]
