import json
import psycopg2

with open('../data/skopje_perks_final.json', 'r', encoding='utf-8') as f:
    perks = json.load(f)

# Connect to your PostgreSQL DB
conn = psycopg2.connect(
    dbname='home_radar_db',
    user='admin',
    password='admin',
    host='localhost',
    port=5432
)

cur = conn.cursor()

# Insert query (adjust table and columns names accordingly)
insert_query = """
INSERT INTO perks (title, latitude, longitude, type, opening_hours)
VALUES (%s, %s, %s, %s, %s)
"""

for perk in perks:
    cur.execute(insert_query, (
        perk['title'],
        perk['lat'],
        perk['lon'],
        perk['type'],
        perk.get('opening_hours') 
    ))

conn.commit()
cur.close()
conn.close()

print(f"Inserted {len(perks)} records successfully.")
