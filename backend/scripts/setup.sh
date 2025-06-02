#!/bin/bash

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install required packages from requirements.txt
pip install -r requirements.txt

# Run the database setup script
python scripts/setup_database.py

echo "Setup completed!" 