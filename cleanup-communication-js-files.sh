#!/bin/bash

# Script to delete old JavaScript API route files after TypeScript conversion
# Communication module

echo "Deleting old JavaScript API route files..."

rm -f "/Users/sudipto/Desktop/projects/edu/app/api/communication/announcements/[id]/route.js"
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/communication/messages/route.js"
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/communication/messages/[id]/route.js"
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/communication/messages/[id]/read/route.js"
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/communication/notifications/route.js"
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/communication/events/route.js"
rm -f "/Users/sudipto/Desktop/projects/edu/app/api/communication/events/[id]/route.js"

echo "Done! Old JavaScript files have been removed."
