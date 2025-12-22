import os
import requests
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK,HTTP_500_INTERNAL_SERVER_ERROR


class WeatherApi:
    WEATHER_KEY = os.getenv('WEATHER_KEY')
    location = "Las Vegas, NV"
    unit_group = "us"
    url = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/"
    start_date = datetime.now().strftime('%Y-%m-%d')

    def __call__(self, var="Las Vegas, NV") -> str | Exception:
        constructed_url = (f"{self.url}{var}/{self.start_date}" 
                           f"?unitGroup={self.unit_group}&key={self.WEATHER_KEY}"
                            "&contentType=json&options=nonulls&include=current"
                            "&elements=name,tempmax,tempmin,icon")
        try:
            if not self.WEATHER_KEY:
                raise Exception("Visual Crossing weather api key is missing.")
            response= requests.get(constructed_url)
            data = response.json()
            return data
        except Exception as e:
            raise e


class WeatherApiView(APIView):
   def get(self, request, var):
       forcast = WeatherApi()
       try:
           data = forcast(var)
           low = data["days"][0]["tempmin"]
           high = data["days"][0]["tempmax"]
           icon = data["days"][0]["icon"] + ".svg"
           location = data["address"]
           return Response(({"low":low,"high":high,"icon":icon,"location":location}),status=HTTP_200_OK)
       except Exception as e:
           return Response(e.args, status=HTTP_500_INTERNAL_SERVER_ERROR)