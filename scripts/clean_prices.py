import json
import re
import random

# Path to your local JSON file
INPUT_FILE = "../data/skopje_appartments_v1.json"
OUTPUT_FILE = "products_converted.json"

decimals_found = False

# --- Load JSON file ---
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

# --- Process data ---
for obj in data:
    price_str = obj.get("price", "")

    # Only process if it has "€"
    if "€" in price_str:
        # Remove everything except digits and dots
        cleaned = re.sub(r"[^\d.]", "", price_str)

        if not cleaned:
            continue

        euro_price = float(cleaned)

        obj["price"] = euro_price

    elif "Please contact" in price_str:
        sale_type = obj["sale_type"]
        euro_price = 0
        if sale_type == "rent":
            euro_price = random.randrange(250, 501, 10)
        elif sale_type == "sale":
            euro_price = random.randrange(100000, 125001, 50)
        obj["price"] = euro_price

# --- Save back to JSON file ---
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print(f"✅ Converted prices saved to {OUTPUT_FILE}")