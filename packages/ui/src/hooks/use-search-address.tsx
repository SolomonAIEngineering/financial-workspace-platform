import { useCallback, useEffect, useState } from 'react'

/**
 * @file use-search-address.tsx
 * @description A custom React hook for searching and selecting addresses using OpenStreetMap.
 */
import { OpenStreetMapProvider } from 'leaflet-geosearch'
import { RawResult } from 'leaflet-geosearch/dist/providers/bingProvider.js'
import { SearchResult } from 'leaflet-geosearch/dist/providers/provider.js'
import { useDebounce } from './use-debounce'

/**
 * @interface UseSearchAddressResult
 * @description Interface defining the return value of the useSearchAddress hook.
 */
interface UseSearchAddressResult {
  /** Current search query string */
  query: string
  /** Search results grouped by type (e.g., 'building', 'street', etc.) */
  results: Record<string, SearchResult<RawResult>[]>
  /** Whether a search is currently in progress */
  loading: boolean
  /** Function to update the search query */
  handleSearch: (value: string) => void
  /** Currently selected address item */
  selectedItem: SearchResult<RawResult> | null
  /** Function to set the selected address item */
  setSelectedItem: (item: SearchResult<RawResult> | null) => void
}

/**
 * @hook useSearchAddress
 * @description Custom hook for searching addresses using OpenStreetMap.
 * Provides functionality for searching addresses, displaying results grouped by type,
 * and selecting an address from the results.
 * 
 * The hook includes debounced search to prevent excessive API calls and groups
 * results by their type (e.g., building, street, etc.) for better organization.
 * 
 * @returns {UseSearchAddressResult} An object containing:
 *   - query: The current search query
 *   - results: Address search results grouped by type
 *   - loading: Boolean indicating if a search is in progress
 *   - handleSearch: Function to update the search query
 *   - selectedItem: The currently selected address item
 *   - setSelectedItem: Function to set the selected address item
 * 
 * @example
 * ```tsx
 * const AddressSearchComponent = () => {
 *   const {
 *     query,
 *     results,
 *     loading,
 *     handleSearch,
 *     selectedItem,
 *     setSelectedItem
 *   } = useSearchAddress();
 *   
 *   return (
 *     <div>
 *       <input
 *         type="text"
 *         value={query}
 *         onChange={(e) => handleSearch(e.target.value)}
 *         placeholder="Search for an address..."
 *       />
 *       
 *       {loading && <div>Loading...</div>}
 *       
 *       {Object.entries(results).map(([type, items]) => (
 *         <div key={type}>
 *           <h3>{type}</h3>
 *           <ul>
 *             {items.map((item) => (
 *               <li
 *                 key={item.id}
 *                 onClick={() => setSelectedItem(item)}
 *                 className={selectedItem?.id === item.id ? 'selected' : ''}
 *               >
 *                 {item.label}
 *               </li>
 *             ))}
 *           </ul>
 *         </div>
 *       ))}
 *       
 *       {selectedItem && (
 *         <div>
 *           <h3>Selected Address:</h3>
 *           <p>{selectedItem.label}</p>
 *           <p>Coordinates: {selectedItem.x}, {selectedItem.y}</p>
 *         </div>
 *       )}
 *     </div>
 *   );
 * };
 * ```
 */
export const useSearchAddress = (): UseSearchAddressResult => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<
    Record<string, SearchResult<RawResult>[]>
  >({})
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] =
    useState<SearchResult<RawResult> | null>(null)

  const debouncedQuery = useDebounce(query, 500)

  /**
   * Groups search results by their type (class)
   * @param {SearchResult<RawResult>[]} data - The raw search results to group
   * @returns {Record<string, SearchResult<RawResult>[]>} Results grouped by type
   */
  const groupByType = useCallback(
    (
      data: SearchResult<RawResult>[],
    ): Record<string, SearchResult<RawResult>[]> => {
      return data.reduce(
        (acc, item) => {
          const { raw } = item

          const rawData = raw as unknown as any
          const type = rawData.class

          if (!acc[type]) {
            acc[type] = []
          }
          acc[type]?.push(item)
          return acc
        },
        {} as Record<string, SearchResult<RawResult>[]>,
      )
    },
    [],
  )

  /**
   * Updates the search query
   * @param {string} value - The new search query
   */
  const handleSearch = (value: string) => {
    setQuery(value)
  }

  // Fetch search results when the debounced query changes
  useEffect(() => {
    /**
     * Fetches address search results from OpenStreetMap
     */
    const fetchResults = async () => {
      if (debouncedQuery.length > 2) {
        setLoading(true)
        const provider = new OpenStreetMapProvider()
        const results = await provider.search({ query: debouncedQuery })
        setResults(groupByType(results as unknown as SearchResult<RawResult>[]))
        setLoading(false)
      } else {
        setResults({})
      }
    }

    fetchResults()
  }, [debouncedQuery, groupByType])

  return {
    query,
    results,
    loading,
    handleSearch,
    selectedItem,
    setSelectedItem,
  }
}
