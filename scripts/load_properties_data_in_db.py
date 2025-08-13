import json
import psycopg2

# Load your properties JSON
with open('../data/properties_mock_data.json', 'r', encoding='utf-8') as f:
    properties = json.load(f)

# Connect to your PostgreSQL DB
conn = psycopg2.connect(
    dbname='home_radar_db',
    user='admin',
    password='admin',
    host='localhost',
    port=5432
)

cur = conn.cursor()

# Insert query — matches your Property entity fields
insert_query = """
INSERT INTO properties (
    title,
    latitude,
    longitude,
    category,
    description,
    address,
    contact_number,
    parking,
    wifi,
    balcony,
    square_meters,
    heating,
    type,
    floor,
    elevator,
    number_of_rooms
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

for prop in properties:
    cur.execute(insert_query, (
        prop['title'],
        prop['latitude'],
        prop['longitude'],
        prop['category'],  # string value e.g. "FOR_RENT"
        prop['description'],
        prop['address'],
        prop['contactNumber'],
        prop['parking'],
        prop['wifi'],
        prop['balcony'],
        prop['squareMeters'],
        prop['heating'],  # string value e.g. "INVERTER_AC"
        prop['type'],     # string value e.g. "FLAT"
        prop.get('floor'),  # nullable
        prop.get('elevator'),  # nullable
        prop['numberOfRooms']
    ))

conn.commit()
cur.close()
conn.close()

print(f"Inserted {len(properties)} property records successfully.")
