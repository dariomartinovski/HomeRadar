import json

# Load the file
with open("../data/skopje_perks_final.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Get all unique types
types = {item["type"] for item in data if "type" in item}

# Print them
print(types)
