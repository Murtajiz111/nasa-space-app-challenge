"""Quick test for all API endpoints."""
import json
import sys
import urllib.request

BASE = "http://127.0.0.1:8000/api/v1"

tests = [
    ("health",     BASE + "/health"),
    ("meta",       BASE + "/meta"),
    ("calendar",   BASE + "/calendar?country=Australia&year_start=2020&year_end=2020"),
    ("timeseries", BASE + "/timeseries?country=Canada&year_start=2020&year_end=2022"),
    ("anomaly",    BASE + "/anomaly?country=Australia&year_start=2019&year_end=2020"),
    ("cells",      BASE + "/cells?country=Australia&month=2020-01"),
    ("summary",    BASE + "/summary?year_start=2020&year_end=2025"),
    ("compare",    BASE + "/compare?country=Australia&year_start=2015&year_end=2020"),
    ("export.csv", BASE + "/export.csv?country=Canada&year_start=2023&year_end=2023"),
]

all_ok = True
for name, url in tests:
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = resp.read()
            status = resp.status
            if name == "export.csv":
                lines = data.decode().split("\n")
                print("  [OK] %-15s -> %d  (%d CSV rows)" % (name, status, len(lines)-1))
            else:
                obj = json.loads(data)
                if name == "health":
                    print("  [OK] %-15s -> %d  row_count=%s" % (name, status, obj.get("row_count")))
                elif name == "meta":
                    print("  [OK] %-15s -> %d  total_rows=%s countries=%d" % (name, status, obj["total_rows"], len(obj["countries"])))
                elif name == "calendar":
                    print("  [OK] %-15s -> %d  cells=%d" % (name, status, len(obj["cells"])))
                elif name == "timeseries":
                    print("  [OK] %-15s -> %d  points=%d" % (name, status, len(obj["data"])))
                elif name == "anomaly":
                    print("  [OK] %-15s -> %d  points=%d" % (name, status, len(obj["data"])))
                elif name == "cells":
                    print("  [OK] %-15s -> %d  cells=%d" % (name, status, len(obj["cells"])))
                elif name == "summary":
                    print("  [OK] %-15s -> %d  kpis=%d" % (name, status, len(obj["kpis"])))
                elif name == "compare":
                    print("  [OK] %-15s -> %d  months=%d" % (name, status, len(obj["data"])))
    except Exception as e:
        print("  [FAIL] %-15s -> %s" % (name, str(e)[:100]))
        all_ok = False

print()
if all_ok:
    print("ALL TESTS PASSED")
else:
    print("SOME TESTS FAILED")
sys.exit(0 if all_ok else 1)
