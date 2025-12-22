from django.urls import path
from .views import WeatherApiView

urlpatterns = [
    path('<str:var>/', WeatherApiView.as_view())
]