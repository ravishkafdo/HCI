#!/bin/bash

# This script creates an admin user for the furniture design system
# It requires curl to make HTTP requests

# Default values
NAME="Admin User"
EMAIL="admin@example.com"
PASSWORD="adminpass"

echo "Creating admin user..."
echo "Name: $NAME"
echo "Email: $EMAIL"
echo "Password: $PASSWORD"

curl -X POST http://localhost:5001/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

echo -e "\n\nAdmin creation complete. You can now login with these credentials." 