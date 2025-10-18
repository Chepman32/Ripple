#!/bin/bash

echo "🧹 Cleaning project..."

# Clean watchman
echo "Cleaning watchman..."
watchman watch-del-all

# Clean Metro cache
echo "Cleaning Metro cache..."
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf node_modules/.cache

# Clean iOS build
echo "Cleaning iOS build..."
cd ios
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/Ripple-*
cd ..

echo "✅ Clean complete!"
echo ""
echo "Now run: yarn ios"
