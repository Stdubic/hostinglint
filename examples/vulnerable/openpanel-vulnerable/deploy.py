#!/usr/bin/env python3
# SECURITY FLAW: Uses sys.argv without argparse or validation
#
# This script demonstrates missing input validation in OpenCLI commands
# that HostingLint should detect:
#   - openpanel-cli-validation (sys.argv without validation)

import sys
import os
import subprocess

domain = sys.argv[1]
username = sys.argv[2]
action = sys.argv[3]

os.makedirs(f"/var/www/{domain}/public_html", exist_ok=True)
subprocess.run(["chown", "-R", f"{username}:{username}", f"/var/www/{domain}"])
subprocess.run(["systemctl", "restart", "nginx"])

print(f"Deployed {domain} for user {username} with action {action}")
