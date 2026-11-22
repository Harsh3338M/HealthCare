"""MediVault Line-Reference Registry Checker.

Validates that code snippets for vulnerabilities V01–V12 in
docs/vulnerability_refs.json match the actual lines in the source code files.
Exits with non-zero status code if any line reference has drifted.
"""

import json
import os
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REGISTRY_PATH = os.path.join(REPO_ROOT, "docs", "vulnerability_refs.json")


def verify_references():
    if not os.path.exists(REGISTRY_PATH):
        print(f"[!] Registry file not found: {REGISTRY_PATH}")
        sys.exit(1)

    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        registry = json.load(f)

    total_vulnerabilities = len(registry)
    verified_count = 0
    has_error = False

    print(f"[*] Verifying line references for {total_vulnerabilities} vulnerabilities (V01-V12)...\n")

    for vid, vdata in sorted(registry.items()):
        title = vdata.get("title", "Unknown")
        severity = vdata.get("severity", "Unknown")
        locations = vdata.get("locations", [])
        v_ok = True

        if not locations:
            print(f"[FAIL] {vid}: No locations registered")
            has_error = True
            continue

        for loc in locations:
            rel_path = loc.get("path", "")
            start_line = loc.get("start_line", 0)
            end_line = loc.get("end_line", 0)
            snippet = loc.get("snippet", "").replace("\r\n", "\n").strip()

            abs_path = os.path.join(REPO_ROOT, rel_path)
            if not os.path.exists(abs_path):
                print(f"[FAIL] {vid}: File not found: {rel_path}")
                v_ok = False
                has_error = True
                continue

            with open(abs_path, "r", encoding="utf-8", errors="replace") as f_src:
                all_lines = f_src.readlines()

            total_file_lines = len(all_lines)
            if start_line < 1 or end_line > total_file_lines or start_line > end_line:
                print(f"[FAIL] {vid}: Invalid line range L{start_line}-L{end_line} in {rel_path} (file has {total_file_lines} lines)")
                v_ok = False
                has_error = True
                continue

            extracted = "".join(all_lines[start_line - 1 : end_line]).replace("\r\n", "\n").strip()

            # Check if snippet matches the extracted range (either exact or contained within)
            if snippet in extracted:
                pass
            elif extracted in snippet:
                pass
            else:
                # Search the entire file to see if it moved
                full_file_text = "".join(all_lines).replace("\r\n", "\n")
                if snippet in full_file_text:
                    char_idx = full_file_text.find(snippet)
                    new_start = full_file_text[:char_idx].count("\n") + 1
                    new_end = new_start + snippet.count("\n")
                    print(f"[DRIFT] {vid}: Snippet in {rel_path} drifted from L{start_line}-L{end_line} to L{new_start}-L{new_end}")
                else:
                    print(f"[FAIL] {vid}: Snippet not found in {rel_path} (L{start_line}-L{end_line})")
                v_ok = False
                has_error = True

        if v_ok:
            verified_count += 1
            print(f"[OK] {vid} ({severity}): {title} -> {len(locations)} location(s) verified")

    print(f"\n[*] Summary: {verified_count}/{total_vulnerabilities} vulnerabilities verified.")

    if has_error:
        print("[ERROR] Line reference verification failed due to drift or errors.")
        sys.exit(1)
    else:
        print("[SUCCESS] All 12 vulnerability line references verified successfully!")
        sys.exit(0)


if __name__ == "__main__":
    verify_references()
