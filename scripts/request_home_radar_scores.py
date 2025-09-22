import requests
import time

BASE_URL = "http://localhost:8080/api/properties/circle/score"

# start & end bounds
start_lat, end_lat = 42.017855, 41.965990
start_lon, end_lon = 21.345787, 21.467124

# increments
step = 0.002

# filters to send with request
filter_params = {
    "radius": 1000,
    # "sizeMax": 100,
    # "sizeMin": 50
}

def sweep_area():
    lat = start_lat
    while lat >= end_lat:  # going downward
        lon = start_lon
        while lon <= end_lon:  # going right
            params = {
                "latitude": lat,
                "longitude": lon,
                **filter_params
            }
            try:
                r = requests.get(BASE_URL, params=params)
                print(f"Lat: {lat:.6f}, Lon: {lon:.6f}, Status: {r.status_code}")
            except Exception as e:
                print("Error:", e)
            lon += step
            time.sleep(0.25)  # small delay to avoid flooding
        lat -= step  # move one row down

if __name__ == "__main__":
    sweep_area()
