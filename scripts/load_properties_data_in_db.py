import json
import psycopg2
from enum import Enum
from psycopg2 import sql

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'home_radar_db',
    'user': 'admin',
    'password': 'admin',
    'port': '5432'
}

# Configuration :
HANDLE_NULL_SIZE = True
DEFAULT_SIZE = 0.0

# Enum mappings
class PropertyType(Enum):
    APARTMENT = "FLAT"
    HOUSE = "HOUSE"

class PropertyCategory(Enum):
    SALE = "FOR_SALE"
    RENT = "FOR_RENT"

class HeatingType(Enum):
   INVERTER_AC = "INVERTER_AC"
   AC = "AC"
   CENTRAL = "CENTRAL",
   NO_HEATING = "NO_HEATING"
   ELECTRIC = "ELECTRIC"
   WOOD = "WOOD",
   OTHER = "OTHER"

def safe_int(value, default=None):
    """Safely convert value to int, returning default if conversion fails"""
    try:
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def safe_float(value, default=None):
    """Safely convert value to float, returning default if conversion fails"""
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default

def transform_property(original):
    """Transform the original JSON property to match the database schema"""
    # Handle size field first since it's required
    size = safe_float(original.get('size'))
    if size is None:
        if not HANDLE_NULL_SIZE:
            print(f"Skipping record with null size: {original.get('id', 'unknown ID')}")
            return None
        size = DEFAULT_SIZE
        print(f"Using default size for record: {original.get('id', 'unknown ID')}")

    # Handle other numeric fields
    bedrooms = safe_int(original.get('bedrooms'))
    bathrooms = safe_int(original.get('bathrooms'))
    year_built = safe_int(original.get('year_built'))
    floor = safe_int(original.get('floor'))
    rooms = safe_int(original.get('rooms'), 0)

    # Create title
    neighborhood = original.get('neighborhood', 'Unknown Neighborhood')
    room_text = f"{rooms} room{'s' if rooms != 1 else ''}" if rooms != 0 else "rooms not specified"
    title = f"{neighborhood} - {room_text}"

    # Handle other fields
    description = original.get('description', '')
    address = original.get('street', 'Address not specified')
    image_url = original.get('image_url', '')

    # Map enums with fallbacks
    try:
        category = PropertyCategory[original['sale_type'].upper()].value
    except (KeyError, AttributeError):
        category = PropertyCategory.SALE.value

    try:
        property_type = PropertyType[original['property_type'].upper()].value
    except (KeyError, AttributeError):
        property_type = PropertyType.APARTMENT.value

    try:
        heating = HeatingType[original['heating_type'].upper()].value
    except (KeyError, AttributeError):
        heating = HeatingType.NO_HEATING.value

    return {
        "title": title,
        "latitude": original.get('latitude', 0.0),
        "longitude": original.get('longitude', 0.0),
        "category": category,
        "description": description,
        "address": address,
        "contact_number": original.get('contact_number', ''),
        "parking": original.get('parking', False),
        "wifi": original.get('wifi', False),
        "balcony": original.get('balcony', False),
        "square_meters": size,  # Use the processed size value
        "heating": heating,
        "type": property_type,
        "floor": floor,
        "elevator": original.get('elevator'),
        "number_of_rooms": rooms,
        "price": original.get('price', 'Price not specified'),
        "year_built": year_built,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "image_url": image_url,
        "neighborhood": neighborhood
    }

def insert_properties(properties):
    """Insert transformed properties into the database"""
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        insert_query = sql.SQL("""
            INSERT INTO properties (
                title, latitude, longitude, category, description, address,
                contact_number, parking, wifi, balcony, square_meters, heating,
                type, floor, elevator, number_of_rooms, price, year_built,
                bedrooms, bathrooms, image_url, neighborhood
            ) VALUES (
                %(title)s, %(latitude)s, %(longitude)s, %(category)s, %(description)s, %(address)s,
                %(contact_number)s, %(parking)s, %(wifi)s, %(balcony)s, %(square_meters)s, %(heating)s,
                %(type)s, %(floor)s, %(elevator)s, %(number_of_rooms)s, %(price)s, %(year_built)s,
                %(bedrooms)s, %(bathrooms)s, %(image_url)s, %(neighborhood)s
            )
        """)

        # Filter out None values (skipped records)
        valid_properties = [prop for prop in properties if prop is not None]

        for prop in valid_properties:
            try:
                cur.execute(insert_query, prop)
            except psycopg2.Error as e:
                print(f"Failed to insert property: {prop.get('title', 'Unknown')}")
                print(f"Error details: {e}")
                conn.rollback()
                continue

        conn.commit()
        print(f"Successfully inserted {len(valid_properties)} properties")
        print(f"Skipped {len(properties) - len(valid_properties)} invalid records")

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Database error: {error}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

def main():
    try:
        with open('data/final_data.json', 'r', encoding='utf-8') as f:
            original_data = json.load(f)

        transformed_data = [transform_property(prop) for prop in original_data]
        insert_properties(transformed_data)

    except FileNotFoundError:
        print("Error: data/final_data.json file not found")
    except json.JSONDecodeError:
        print("Error: Invalid JSON format in input file")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()