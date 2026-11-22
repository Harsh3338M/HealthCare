@echo off
"C:\Users\Harsh\AppData\Local\Programs\Python\Python311\python.exe" -c "import subprocess, sys; arg1 = sys.argv[1].rstrip('s'); timeout_val = float(arg1); cmd = ' '.join(sys.argv[2:]); res = subprocess.run(cmd, timeout=timeout_val, shell=True); sys.exit(res.returncode)" %*
