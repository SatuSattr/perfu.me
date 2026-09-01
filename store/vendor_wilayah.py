#!/usr/bin/env python3
"""
Vendor all wilayah JSON to public/data/wilayah for RAM cache.
- provinces already exists
- regencies per province
- districts per regency
- villages per district (full ~7k files)
Skips existing files, retries, small delay to be polite.
"""
import os
import json
import time
import urllib.request
import urllib.error

BASE = "https://wilayah.id/api"
OUT = os.path.join(os.path.dirname(__file__), "public", "data", "wilayah")

LOG_PATH = os.path.join(os.path.dirname(__file__), "vendor_wilayah.log")
FAILED_PATH = os.path.join(os.path.dirname(__file__), "vendor_failed.txt")

def log(msg):
    print(msg)
    try:
        with open(LOG_PATH, "a", encoding="utf-8") as lf:
            lf.write(msg + "\n")
    except:
        pass

def fetch_json(url, retries=3):
    for i in range(retries):
        try:
            with urllib.request.urlopen(url, timeout=15) as r:
                if r.status != 200:
                    raise Exception(f"status {r.status}")
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:
            log(f"  retry {i+1}/{retries} {url} -> {e}")
            time.sleep(0.8 * (i+1))
    log(f"  FAILED {url}")
    try:
        with open(FAILED_PATH, "a", encoding="utf-8") as ff:
            ff.write(url + "\n")
    except:
        pass
    return None

def ensure_dir(p):
    os.makedirs(p, exist_ok=True)

def vendor():
    ensure_dir(os.path.join(OUT, "regencies"))
    ensure_dir(os.path.join(OUT, "districts"))
    ensure_dir(os.path.join(OUT, "villages"))

    prov_path = os.path.join(OUT, "provinces.json")
    if not os.path.exists(prov_path):
        print("Downloading provinces.json")
        data = fetch_json(f"{BASE}/provinces.json")
        if data:
            open(prov_path, "w", encoding="utf-8").write(json.dumps(data, ensure_ascii=False))
    provinces = json.loads(open(prov_path, encoding="utf-8").read())["data"]
    print(f"Provinces: {len(provinces)}")

    # Regencies
    for p in provinces:
        code = p["code"]
        out = os.path.join(OUT, "regencies", f"{code}.json")
        if os.path.exists(out):
            continue
        print(f"Regencies {code} {p['name']}")
        data = fetch_json(f"{BASE}/regencies/{code}.json")
        if data:
            open(out, "w", encoding="utf-8").write(json.dumps(data, ensure_ascii=False))
            time.sleep(0.15)

    # Districts
    reg_files = [os.path.join(OUT, "regencies", f) for f in os.listdir(os.path.join(OUT, "regencies")) if f.endswith(".json")]
    total_regs = 0
    for rf in reg_files:
        try:
            reg_data = json.loads(open(rf, encoding="utf-8").read())["data"]
        except:
            continue
        for r in reg_data:
            code = r["code"]
            out = os.path.join(OUT, "districts", f"{code}.json")
            if os.path.exists(out):
                continue
            print(f"Districts {code} {r['name']}")
            data = fetch_json(f"{BASE}/districts/{code}.json")
            if data:
                open(out, "w", encoding="utf-8").write(json.dumps(data, ensure_ascii=False))
                total_regs += 1
                time.sleep(0.12)
    print(f"Districts new: {total_regs}")

    # Villages - parallel 10 workers
    import concurrent.futures
    import threading

    dist_files = [os.path.join(OUT, "districts", f) for f in os.listdir(os.path.join(OUT, "districts")) if f.endswith(".json")]
    print(f"Districts total files: {len(dist_files)}")

    # collect all missing village tasks
    tasks = []
    for df in dist_files:
        try:
            dist_data = json.loads(open(df, encoding="utf-8").read())["data"]
        except Exception as e:
            print(f"skip bad {df}: {e}")
            continue
        for d in dist_data:
            code = d["code"]
            out = os.path.join(OUT, "villages", f"{code}.json")
            if os.path.exists(out):
                continue
            tasks.append((code, d["name"]))

    print(f"Villages to download: {len(tasks)} (remaining)")
    if not tasks:
        print("All villages already cached.")
        print("All vendor complete. RAM cache will serve these via /data/wilayah.")
        return

    done = 0
    failed = 0
    lock = threading.Lock()
    start = time.time()

    def download_one(task):
        code, name = task
        out = os.path.join(OUT, "villages", f"{code}.json")
        # double-check exists (race)
        if os.path.exists(out):
            return "skipped"
        data = fetch_json(f"{BASE}/villages/{code}.json")
        if data:
            try:
                open(out, "w", encoding="utf-8").write(json.dumps(data, ensure_ascii=False))
            except Exception as e:
                print(f"  write fail {code}: {e}")
                return "failed"
            return "done"
        else:
            return "failed"

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_task = {executor.submit(download_one, t): t for t in tasks}
        for idx, future in enumerate(concurrent.futures.as_completed(future_to_task), 1):
            code, name = future_to_task[future]
            try:
                res = future.result()
            except Exception as e:
                print(f"  exception {code}: {e}")
                res = "failed"
            with lock:
                if res == "done":
                    done += 1
                elif res == "failed":
                    failed += 1
                # progress every 50 or on done
                if idx % 50 == 0 or idx == len(tasks):
                    elapsed = time.time() - start
                    rate = done / elapsed if elapsed > 0 else 0
                    print(f"Progress {idx}/{len(tasks)} done={done} failed={failed} elapsed={elapsed:.0f}s rate={rate:.1f}/s")

    print(f"Done villages: new={done} failed={failed}")
    print("All vendor complete. RAM cache will serve these via /data/wilayah.")

if __name__ == "__main__":
    # clear previous failed log for fresh run
    try:
        if os.path.exists(FAILED_PATH):
            os.remove(FAILED_PATH)
        if os.path.exists(LOG_PATH):
            os.remove(LOG_PATH)
    except:
        pass
    vendor()
    log("=== FINISHED ===")
    # keep window open
    try:
        input("Press Enter to close... (failed URLs in vendor_failed.txt, full log in vendor_wilayah.log)")
    except:
        pass
