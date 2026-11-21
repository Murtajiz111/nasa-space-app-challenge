"""Quick database schema verification."""
import psycopg2
import psycopg2.extras

DSN = "postgresql://postgres.dqbjvsewvybocynvztch:machomanone111224@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

conn = psycopg2.connect(DSN)
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

# Columns
cur.execute(
    "SELECT column_name, data_type FROM information_schema.columns "
    "WHERE table_name = %s ORDER BY ordinal_position",
    ("hotspots_harmonized",),
)
print("=== COLUMNS ===")
for row in cur.fetchall():
    print(f"  {row['column_name']:20s} {row['data_type']}")

# Counts
print("\n=== ROW COUNTS ===")
cur.execute("SELECT count(*) as cnt FROM hotspots_harmonized")
print(f"  Total: {cur.fetchone()['cnt']:,}")

cur.execute(
    "SELECT country, count(*) as cnt FROM hotspots_harmonized "
    "GROUP BY country ORDER BY country"
)
for row in cur.fetchall():
    print(f"  {row['country']:20s} {row['cnt']:>10,}")

# Sample rows
print("\n=== SAMPLE ROWS ===")
cur.execute("SELECT * FROM hotspots_harmonized LIMIT 2")
for row in cur.fetchall():
    print(dict(row))

# Check if 'n' column exists
print("\n=== HAS 'n' COLUMN? ===")
cur.execute(
    "SELECT column_name FROM information_schema.columns "
    "WHERE table_name = 'hotspots_harmonized' AND column_name = 'n'"
)
result = cur.fetchone()
print(f"  n column exists: {result is not None}")

# Distinct sensors
print("\n=== SENSORS ===")
cur.execute("SELECT DISTINCT sensor FROM hotspots_harmonized ORDER BY sensor")
for row in cur.fetchall():
    print(f"  {row['sensor']}")

# Year range
print("\n=== YEAR RANGE ===")
cur.execute("SELECT min(year) as mn, max(year) as mx FROM hotspots_harmonized")
row = cur.fetchone()
print(f"  {row['mn']} – {row['mx']}")

# Partial flag check
print("\n=== PARTIAL FLAGS ===")
cur.execute(
    "SELECT partial, count(*) as cnt FROM hotspots_harmonized "
    "GROUP BY partial ORDER BY partial"
)
for row in cur.fetchall():
    print(f"  partial={row['partial']}: {row['cnt']:,}")

conn.close()
print("\nDone!")
