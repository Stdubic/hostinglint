#!/bin/bash
# SECURITY FLAW: Uses positional arguments without validation
#
# This script demonstrates missing input validation in OpenCLI commands
# that HostingLint should detect:
#   - openpanel-cli-validation (args without validation)

DOMAIN=$1
USERNAME=$2
DB_NAME=$3

echo "Setting up extension for domain: $DOMAIN"
echo "Creating user: $USERNAME"

mysql -u root -e "CREATE DATABASE $DB_NAME"
mkdir -p /var/www/$DOMAIN/public_html
chown $USERNAME:$USERNAME /var/www/$DOMAIN
