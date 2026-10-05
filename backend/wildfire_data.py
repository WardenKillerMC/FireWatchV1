import requests


DNR_URL = (
    "https://gis.dnr.wa.gov/site3/rest/services/"
    "Public_Wildfire/WADNR_PUBLIC_WD_WildFire_Data/"
    "MapServer/1/query"
)


def get_current_wildfires():
    params = {
        "where": "1=1",
        "outFields": "*",
        "returnGeometry": "true",
        "outSR": "4326",
        "f": "geojson",
    }

    response = requests.get(
        DNR_URL,
        params=params,
        timeout=30,
    )

    response.raise_for_status()

    return response.json()