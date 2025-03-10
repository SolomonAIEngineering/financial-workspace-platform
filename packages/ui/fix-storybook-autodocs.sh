#!/bin/bash

# This script removes the 'tags: ["autodocs"]' line from story files that have corresponding MDX docs
# List of files from the warning message
FILES=(
  "src/components/calendar/calendar-date-picker.stories.tsx"
  "src/components/calendar/calendar-picker.stories.tsx"
  "src/components/cards/bank-account-card/BankAccountCard.stories.tsx"
  "src/components/cards/credit-account-card/CreditAccountCard.stories.tsx"
  "src/components/cards/credit-card/CreditCard.stories.tsx"
  "src/components/cards/linked-account-card/linked-account-card.stories.tsx"
  "src/components/cards/transaction-card/transaction-card.stories.tsx"
  "src/components/collapsible-sidebar/collapse-menu-button.stories.tsx"
  "src/components/collapsible-sidebar/collapsible-panel-layout.stories.tsx"
  "src/components/collapsible-sidebar/content-layout.stories.tsx"
  "src/components/collapsible-sidebar/footer.stories.tsx"
  "src/components/collapsible-sidebar/menu.stories.tsx"
  "src/components/collapsible-sidebar/mode-toggle.stories.tsx"
  "src/components/collapsible-sidebar/navbar.stories.tsx"
  "src/components/collapsible-sidebar/sheet-menu.stories.tsx"
  "src/components/collapsible-sidebar/sidebar-toggle.stories.tsx"
  "src/components/collapsible-sidebar/user-nav.stories.tsx"
  "src/components/portal/bank-account-portal-view.stories.tsx"
  "src/components/portal/connected-account-view.stories.tsx"
  "src/components/portal/credit-account-portal-view.stories.tsx"
  "src/components/portal/financial-portal-view.stories.tsx"
  "src/components/search-address/search-address.stories.tsx"
  "src/components/skeleton/content-skeleton.stories.tsx"
  "src/components/skeleton/dashboard-skeleton.stories.tsx"
  "src/components/skeleton/table-skeleton.stories.tsx"
)

echo "Starting to fix autodocs conflicts..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file"
    # Create a backup file
    cp "$file" "$file.bak"
    
    # Remove the tags: ["autodocs"] line
    # This sed command looks for a line containing 'tags: ["autodocs"]' and comments it out
    sed -i '' 's/tags: \["autodocs"\],/\/\/ tags: \["autodocs"\], \/\/ Removed to fix conflict with MDX docs/g' "$file"
    
    echo "Fixed $file"
  else
    echo "File $file not found, skipping..."
  fi
done

echo "Done! All files have been processed."
echo "Backup files are saved with .bak extension." 