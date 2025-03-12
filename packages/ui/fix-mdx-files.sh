#!/bin/bash

# This script fixes all MDX files in the repository to properly reference stories
# It changes imports from "import X from './x.stories'" to "import * as X from './x.stories'"
# And updates Canvas references from "<Canvas of={X} />" to "<Canvas of={X.Default} />"

# Find all MDX files
MDX_FILES=$(find ./src -name "*.mdx")

for file in $MDX_FILES; do
  echo "Processing $file..."
  
  # Create a backup of the file
  cp "$file" "${file}.bak"
  
  # 1. Replace import statements
  # Change "import X from './x.stories'" to "import * as X from './x.stories'"
  sed -i '' -E 's/import ([A-Za-z0-9_]+) from "(.+\.stories)"/import * as \1 from "\2"/' "$file"
  
  # 2. Find all Canvas tags that reference the component directly without a specific story
  # Get the component name from the import statement
  component_name=$(grep -o "import \* as [A-Za-z0-9_]\+ from" "$file" | sed -E 's/import \* as ([A-Za-z0-9_]+) from.*/\1/')
  
  if [ -n "$component_name" ]; then
    echo "  Found component: $component_name"
    
    # Replace Canvas references
    sed -i '' -E "s/<Canvas of=\{$component_name\} \/>/<Canvas of=\{$component_name\.Default\} \/>/" "$file"
    
    # Fix nested Canvas tags in code examples
    sed -i '' -E "s/\`\`\`tsx\s*<Canvas>/<Canvas of=\{$component_name\.Default\}\/>\n\n\`\`\`tsx/" "$file"
    sed -i '' -E "s/<\/Canvas>\s*\`\`\`/\`\`\`/" "$file"
    
    # Fix Story tags in code examples
    sed -i '' -E "s/<Story name=\"([^\"]+)\">/<Canvas of=\{$component_name\.\1\}>/" "$file"
    sed -i '' -E "s/<\/Story>/<\/Canvas>/" "$file"
    
    echo "  Updated $file"
  else
    echo "  Could not find component name in $file, skipping..."
  fi
done

echo "All MDX files have been processed!" 