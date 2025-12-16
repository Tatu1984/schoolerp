#!/bin/bash

# Delete old JavaScript route files that have been converted to TypeScript

echo "Deleting old JavaScript route files..."

# Sections
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/sections/[id]/route.js"
echo "Deleted: app/api/sections/[id]/route.js"

# Subjects
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/subjects/[id]/route.js"
echo "Deleted: app/api/subjects/[id]/route.js"

# Roles
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/roles/route.js"
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/roles/[id]/route.js"
echo "Deleted: app/api/roles/route.js"
echo "Deleted: app/api/roles/[id]/route.js"

# Assets
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/assets/route.js"
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/assets/[id]/route.js"
echo "Deleted: app/api/assets/route.js"
echo "Deleted: app/api/assets/[id]/route.js"

# Settings
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/settings/route.js"
echo "Deleted: app/api/settings/route.js"

echo ""
echo "All old JavaScript route files have been deleted successfully!"
echo "TypeScript versions are now in place with authentication and validation."
