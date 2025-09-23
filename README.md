# no-form-buffer

This branch intentionally removes the project's Forms page and all direct references to it.

Purpose: create a clean buffer branch so a different builder can recreate a new Forms page (for example using Dyad) and then re-integrate it.

Notes:

- **Only the Forms page and its direct references were removed.** No database schema changes were made.

- The deleted files include the old Forms page and any components used exclusively by it.

- The original `README.md` and `AI_RULES.md` were removed in this branch only. They remain on main unless this branch is merged.

- To restore the removed files: checkout `main` (or the branch where they still exist) and copy files back.