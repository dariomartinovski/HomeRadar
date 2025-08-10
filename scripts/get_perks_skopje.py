import requests
import json

# Define your custom mapping of OSM tags to PerkType
PERK_TYPES = {
    "gym": "GYM",
    "kindergarten": "KINDERGARDEN",
    "school": "ELEMENTARY_SCHOOL",  # or use "MIDDLE_SCHOOL" if needed
    "high_school": "HIGH_SCHOOL",
    "college": "FACULTY",
    "university": "FACULTY",
    "supermarket": "GROCERY_STORE",
    "convenience": "GROCERY_STORE",
    "restaurant": "RESTAURANT",
    "park": "PARK",
    "mall": "MALL",
    "cafe": "COFFEE_SHOP",
    "bar": "BAR"
}

BBOX = "(41.96,21.35,42.05,21.52)"  # Correct Skopje area

# Define Overpass QL query
overpass_query = f"""
[out:json][timeout:25];
(
  // GYMS
  node["leisure"="fitness_centre"]{BBOX};
  node["amenity"="fitness_centre"]{BBOX};
  node["leisure"="sports_centre"]{BBOX};
  node["sport"="fitness"]{BBOX};

  // SCHOOLS
  node["amenity"="school"]{BBOX};
  node["amenity"="kindergarten"]{BBOX};
  node["amenity"="college"]{BBOX};
  node["amenity"="university"]{BBOX};

  // GROCERY
  node["shop"="supermarket"]{BBOX};
  node["shop"="convenience"]{BBOX};
  node["shop"="grocery"]{BBOX};

  // RESTAURANTS
  node["amenity"="restaurant"]{BBOX};

  // PARKS
  node["leisure"="park"]{BBOX};

  // MALLS
  node["shop"="mall"]{BBOX};
  node["shop"="department_store"]{BBOX};
  node["building"="retail"]{BBOX};

  // COFFEE SHOPS & BARS
  node["amenity"="cafe"]{BBOX};
  node["amenity"="bar"]{BBOX};
);
out body;
"""


def infer_school_type(tags):
    isced = tags.get("isced:level", "")
    name = tags.get("name", "").lower()

    if "high" in name or "средно" in name:
        return "HIGH_SCHOOL"
    if "faculty" in name or "факултет" in name or tags.get("amenity") in ["university", "college"]:
        return "FACULTY"
    if isced:
        levels = set(isced.replace(";", ",").split(","))
        if any(level in levels for level in ["1", "2"]):
            return "ELEMENTARY_SCHOOL"
        if any(level in levels for level in ["3"]):
            return "HIGH_SCHOOL"
        if any(level in levels for level in ["5", "6", "7"]):
            return "FACULTY"
    return "MIDDLE_SCHOOL"


response = requests.get("https://overpass-api.de/api/interpreter", params={'data': overpass_query})
data = response.json()

results = []
for element in data["elements"]:
    tags = element.get("tags", {})
    name = tags.get("name") or tags.get("name:en")
    lat = element.get("lat")
    lon = element.get("lon")

    # Infer type from tags
    perk_type = None
    for key in ["leisure", "amenity", "shop"]:
        if key in tags:
            tag_value = tags[key]
            if tag_value == "school":
                perk_type = infer_school_type(tags)
            else:
                perk_type = PERK_TYPES.get(tag_value)

            if perk_type:
                break

    if name and lat and lon and perk_type:
        results.append({
            "title": name,
            "lat": lat,
            "lon": lon,
            "type": perk_type
        })

# Save to JSON
with open("skopje_perks.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Saved {len(results)} places.")
