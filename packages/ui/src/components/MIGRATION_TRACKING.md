# Component Migration Tracking

This document tracks the migration of components from the `apps/web-filters` to the `packages/ui` package.

## Migration Status

| Component | Source | Destination | Status | Storybook |
|-----------|--------|-------------|--------|-----------|
| **Data Table V2 Components** | | | | |
| DataTableProvider | `web-filters/src/components/data-table/data-table-provider.tsx` | `ui/src/components/data-table-v2/core/DataTableProvider.tsx` | ✅ Completed | ✅ Completed |
| DataTableTypes | `web-filters/src/components/data-table/types.ts` | `ui/src/components/data-table-v2/core/types.ts` | ✅ Completed | N/A |
| DataTableUtils | `web-filters/src/components/data-table/utils.ts` | `ui/src/components/data-table-v2/core/utils.ts` | ✅ Completed | N/A |
| DataTableReducer | New component | `ui/src/components/data-table-v2/core/reducer.ts` | ✅ Completed | N/A |
| DataTableColumnHeader | `web-filters/src/components/data-table/data-table-column-header.tsx` | `ui/src/components/data-table-v2/columns/DataTableColumnHeader.tsx` | ✅ Completed | ✅ Completed |
| DataTablePagination | `web-filters/src/components/data-table/data-table-pagination.tsx` | `ui/src/components/data-table-v2/pagination/DataTablePagination.tsx` | ✅ Completed | ✅ Completed |
| DataTableToolbar | `web-filters/src/components/data-table/data-table-toolbar.tsx` | `ui/src/components/data-table-v2/DataTableToolbar.tsx` | ✅ Completed | ✅ Completed |
| DataTableViewOptions | `web-filters/src/components/data-table/data-table-view-options.tsx` | `ui/src/components/data-table-v2/DataTableViewOptions.tsx` | ✅ Completed | ✅ Completed |
| DataTableSkeleton | `web-filters/src/components/data-table/data-table-skeleton.tsx` | `ui/src/components/data-table-v2/DataTableSkeleton.tsx` | ✅ Completed | ✅ Completed |
| DataTableFilterControls | `web-filters/src/components/data-table/data-table-filter-controls.tsx` | `ui/src/components/data-table-v2/filters/DataTableFilterControls.tsx` | ✅ Completed | ✅ Completed |
| DataTableFilterInput | `web-filters/src/components/data-table/data-table-filter-input.tsx` | `ui/src/components/data-table-v2/filters/DataTableFilterInput.tsx` | ✅ Completed | ✅ Completed |
| DataTableFilterCheckbox | `web-filters/src/components/data-table/data-table-filter-checkbox.tsx` | `ui/src/components/data-table-v2/filters/DataTableFilterCheckbox.tsx` | ✅ Completed | ✅ Completed |
| DataTableFilterSlider | `web-filters/src/components/data-table/data-table-filter-slider.tsx` | `ui/src/components/data-table-v2/filters/DataTableFilterSlider.tsx` | ✅ Completed | ✅ Completed |
| DataTableFilterTimerange | `web-filters/src/components/data-table/data-table-filter-timerange.tsx` | `ui/src/components/data-table-v2/filters/DataTableFilterTimerange.tsx` | ✅ Completed | ✅ Completed |
| DataTableFilterResetButton | `web-filters/src/components/data-table/data-table-filter-reset-button.tsx` | `ui/src/components/data-table-v2/filters/DataTableFilterResetButton.tsx` | ✅ Completed | ✅ Completed |
| DataTableFilterControlsDrawer | `web-filters/src/components/data-table/data-table-filter-controls-drawer.tsx` | `ui/src/components/data-table-v2/filters/DataTableFilterControlsDrawer.tsx` | ✅ Completed | ✅ Completed |
| DataTableResetButton | `web-filters/src/components/data-table/data-table-reset-button.tsx` | `ui/src/components/data-table-v2/DataTableResetButton.tsx` | ✅ Completed | ✅ Completed |
| DataTable (Main Component) | New Component | `ui/src/components/data-table-v2/DataTable.tsx` | ✅ Completed | ✅ Completed |
| **Infinite Components** | | | | |
| InfiniteConstants | `web-filters/src/app/infinite/constants.tsx` | `ui/src/components/infinite/core/constants.tsx` | ✅ Completed | ✅ Completed |
| InfiniteSchema | `web-filters/src/app/infinite/schema.ts` | `ui/src/components/infinite/core/schema.ts` | ✅ Completed | ✅ Completed |
| QueryOptions | `web-filters/src/app/infinite/query-options.ts` | `ui/src/components/infinite/utils/queryOptions.ts` | ✅ Completed | ✅ Completed |
| SearchParams | `web-filters/src/app/infinite/search-params.ts` | `ui/src/components/infinite/utils/searchParams.ts` | ✅ Completed | ✅ Completed |
| UseInfiniteQuery | `web-filters/src/app/infinite/use-infinite-query.tsx` | `ui/src/components/infinite/core/useInfiniteQuery.tsx` | ✅ Completed | ✅ Completed |
| InfiniteClient | `web-filters/src/app/infinite/client.tsx` | `ui/src/components/infinite/core/client.tsx` | ✅ Completed | ✅ Completed |
| DataTableInfinite | `web-filters/src/app/infinite/data-table-infinite.tsx` | `ui/src/components/infinite/DataTableInfinite.tsx` | ✅ Completed | ✅ Completed |
| TimelineChart | `web-filters/src/app/infinite/timeline-chart.tsx` | `ui/src/components/infinite/TimelineChart.tsx` | ✅ Completed | ✅ Completed |
| InfiniteColumns | `web-filters/src/app/infinite/columns.tsx` | `ui/src/components/infinite/columns.tsx` | ✅ Completed | ✅ Completed |

## Notes

- All components have been migrated with proper TypeScript typing and JSDoc documentation
- Storybook files should be created for each UI component
- Barrel files (index.ts) have been created to export all components 