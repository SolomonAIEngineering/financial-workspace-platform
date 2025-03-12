#!/bin/bash

# This script checks all MDX files in the repository for potential issues
# It looks for patterns that might indicate problems with the Storybook MDX files

# Find all MDX files
MDX_FILES=$(find ./src -name "*.mdx")

echo "Checking for MDX files with potential issues..."
echo ""

for file in $MDX_FILES; do
  echo "Checking $file..."
  
  # Check for import statements without "* as"
  if grep -q "import [A-Za-z0-9_]\+ from \".*\.stories\"" "$file"; then
    echo "  ❌ Found import without '* as' in $file"
  fi
  
  # Check for Canvas tags without specific story references
  component_name=$(grep -o "import \* as [A-Za-z0-9_]\+ from" "$file" | sed -E 's/import \* as ([A-Za-z0-9_]+) from.*/\1/')
  
  if [ -n "$component_name" ]; then
    if grep -q "<Canvas of={$component_name} />" "$file"; then
      echo "  ❌ Found Canvas without specific story reference in $file"
    fi
  fi
  
  # Check for nested Canvas tags in code examples
  if grep -q "\`\`\`tsx.*<Canvas>" "$file"; then
    echo "  ❌ Found nested Canvas tags in code example in $file"
  fi
  
  # Check for Story tags in code examples
  if grep -q "<Story " "$file"; then
    echo "  ❌ Found Story tags in $file"
  fi
done

echo ""
echo "Check completed!" 