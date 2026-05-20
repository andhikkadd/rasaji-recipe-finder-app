# Recipe Data Flow & Seeding Safety Guide

This guide details how recipe data is loaded, seeded, sanitized, and updated safely in the Rasaji application. It explains the safety guards implemented to prevent production data loss and details how image fallbacks work.

---

## 1. Database Seeding & Safety Guards

The application uses two main data ingestion scripts:
- **`scripts/seed.js`**: Ingests baseline recipes from `prisma/local_recipes_export.json` (or a static fallback subset if the JSON file is missing) and upserts them.
- **`scripts/importRecipes.js`**: Used to import a larger set of sanitized recipes dynamically.

### Production Safety (Preventing Data Loss)
Previously, both scripts automatically executed a cleanup function (`deleteMany`) that deleted all recipes where `status != 'verified'` or `sourceType != 'internal'`.

In production, external/scraped recipes are saved with `sourceType = 'external'` and `status = 'cached_unverified'`. If the cleanup block ran automatically, it would **wipe out all scraped recipe logs and associated user actions (likes, bookmarks)**.

**Safety Guards Implemented**:
- **RESET_DB Guard**: Broad database cleanup will *only* run if the environment variable `RESET_DB=true` is explicitly set.
- **Selective Deletion**: By default (without `RESET_DB=true`), the scripts will only cleanup specific forbidden/invalid terms (e.g. titles containing `"Kipas Sederhana"` or `"Babi"`).

---

## 2. Recipe Image Handling Flow

Recipes in Rasaji resolve their images using a multi-tier fallback system:

1. **Original Image URL**: If the recipe from `local_recipes_export.json` has a valid, non-empty image URL (e.g., from Cookpad CDN `https://img-global.cpcdn.com/...`), that URL is preserved and saved in the database.
2. **Curated Category Fallback**: If the original image is missing, invalid, or is a generic placeholder, the script generates a deterministic fallback image based on the recipe's category and a hash of its slug (`getCuratedImage`). This ensures consistent visuals across renders/runs instead of purely random placeholders.
3. **Default Placeholder**: If no category matches, it falls back to a global high-quality culinary placeholder.

### Metadata Deep Cleaning (`scripts/cleanRecipeMetadata.js`)
When running `node scripts/cleanRecipeMetadata.js` to normalize titles, tags, and steps:
- The script uses `resolveRecipeImage()` to inspect the existing `image` field.
- If it contains a valid custom image (not matching any generic Unsplash fallback in `CATEGORY_IMAGES`), it **preserves** it.
- If it was missing or was a generic fallback, it recalculates/updates it based on the current slug.

---

## 3. How to Safely Update Recipe Data in the Future

Follow these steps when you need to update or reload recipe data:

### Safe Local Ingestion / Testing
To test seed modifications locally before deploying to production:
```bash
# Run seed normally (updates internal recipes, preserves user-scraped database data)
node scripts/seed.js

# Force a full clean reset (Caution: deletes all external/scraped recipes)
$env:RESET_DB="true"; node scripts/seed.js
```

### Safe Production Ingestion (Neon DB)
When deploying to Cloud Run, `npx prisma db push` and `node scripts/seed.js` run automatically as part of the container startup script. Because `RESET_DB` is not set in the production environment variables, it will **safely update internal recipes without affecting user bookmark data or dynamically cached recipes**.
