"""V10 Verification: Dark-Pattern Privacy Notice & Consent UX.

Confirms that registration presents bundled, pre-checked consent checkboxes
with vague purpose descriptions and a visually buried, low-contrast,
non-functional revoke/opt-out control in both Auth.jsx and ConsentModal.jsx.
"""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    auth_path = os.path.join(repo_root, "frontend", "src", "pages", "Auth.jsx")
    modal_path = os.path.join(repo_root, "frontend", "src", "components", "ConsentModal.jsx")

    assert os.path.exists(auth_path), f"Auth.jsx not found at {auth_path}"
    assert os.path.exists(modal_path), f"ConsentModal.jsx not found at {modal_path}"

    with open(auth_path, "r", encoding="utf-8") as f:
        auth_src = f.read()

    with open(modal_path, "r", encoding="utf-8") as f:
        modal_src = f.read()

    checks = {
        "Auth: pre-checked bundled consents default true": "setConsentsBundled(true)" in auth_src or "useState(true)" in auth_src,
        "Auth: bundled health data processing checkbox": 'id="bundled-consent"' in auth_src,
        "Auth: third-party & partner sharing checkbox": 'id="third-party-consent"' in auth_src,
        "Auth: buried low-contrast revoke control": "text-[10px] text-slate-300" in auth_src,
        "Auth: non-functional revoke handler": "e.preventDefault()" in auth_src,
        "Auth: ConsentModal component integrated": "<ConsentModal" in auth_src,
        "Modal: pre-checked default consents": "useState(true)" in modal_src,
        "Modal: vague purpose descriptions": "General Health Processing" in modal_src,
        "Modal: low-contrast buried revoke button": "text-[10px] text-slate-300" in modal_src,
        "Modal: non-functional revoke handler": "e.preventDefault()" in modal_src,
    }

    all_pass = True
    for desc, passed in checks.items():
        status = "PASS" if passed else "FAIL"
        if not passed:
            all_pass = False
        print(f"  [{status}] {desc}")

    if not all_pass:
        print("\nV10 verification FAILED.")
        sys.exit(1)

    print("\nV10 PASSED — Dark-pattern pre-checked bundled consent UX and non-functional revoke control verified.")


if __name__ == "__main__":
    main()
