#!/bin/bash

# Script to delete old JavaScript route files after TypeScript conversion
# Run this script to clean up the old .js files

echo "Deleting old JavaScript route files..."

# LMS routes
rm -v app/api/lms/courses/\[id\]/route.js
rm -v app/api/lms/assignments/route.js
rm -v app/api/lms/classes/route.js
rm -v app/api/lms/examinations/route.js
rm -v app/api/lms/report-cards/route.js

# Branch routes
rm -v app/api/branches/route.js
rm -v app/api/branches/\[id\]/route.js

# Academic year routes
rm -v app/api/academic-years/route.js
rm -v app/api/academic-years/\[id\]/route.js
rm -v app/api/academic-years/\[id\]/set-current/route.js

echo "Cleanup complete!"
echo ""
echo "Converted files:"
echo "✓ app/api/lms/courses/[id]/route.ts"
echo "✓ app/api/lms/assignments/route.ts"
echo "✓ app/api/lms/classes/route.ts"
echo "✓ app/api/lms/examinations/route.ts"
echo "✓ app/api/lms/report-cards/route.ts"
echo "✓ app/api/branches/route.ts"
echo "✓ app/api/branches/[id]/route.ts"
echo "✓ app/api/academic-years/route.ts"
echo "✓ app/api/academic-years/[id]/route.ts"
echo "✓ app/api/academic-years/[id]/set-current/route.ts"
