#!/bin/bash

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