import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';

interface ViewToggleSortProps {
  documentsCount: number;
  isAscending: boolean;
  sortBy: 'date' | 'name' | 'priority';
  viewMode: 'grid' | 'list';
  onSortChange: (value: 'date' | 'name' | 'priority') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const ViewToggleSort = ({
  documentsCount,
  isAscending,
  setViewMode,
  sortBy,
  viewMode,
  onSortChange,
}: ViewToggleSortProps) => {
  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md border bg-white p-1 shadow-sm dark:bg-gray-900">
            <button
              className={`flex h-8 items-center justify-center rounded-sm px-2 text-sm transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <Squares2X2Icon className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              className={`flex h-8 items-center justify-center rounded-sm px-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <ListBulletIcon className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">{documentsCount}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {' '}
              document{documentsCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Sort:</span>
          <div className="flex rounded-md border bg-white shadow-sm dark:bg-gray-900">
            <button
              className={`flex h-8 items-center justify-center rounded-l-sm px-3 text-sm transition-colors ${sortBy === 'date' ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'}`}
              onClick={() => onSortChange('date')}
            >
              <ClockIcon className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Date</span>
              {sortBy === 'date' &&
                (isAscending ? (
                  <ChevronUpIcon className="ml-1.5 h-3 w-3" />
                ) : (
                  <ChevronDownIcon className="ml-1.5 h-3 w-3" />
                ))}
            </button>
            <button
              className={`flex h-8 items-center justify-center border-x px-3 text-sm transition-colors ${sortBy === 'name' ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'}`}
              onClick={() => onSortChange('name')}
            >
              <DocumentTextIcon className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Name</span>
              {sortBy === 'name' &&
                (isAscending ? (
                  <ChevronUpIcon className="ml-1.5 h-3 w-3" />
                ) : (
                  <ChevronDownIcon className="ml-1.5 h-3 w-3" />
                ))}
            </button>
            <button
              className={`flex h-8 items-center justify-center rounded-r-sm px-3 text-sm transition-colors ${sortBy === 'priority' ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'}`}
              onClick={() => onSortChange('priority')}
            >
              <ExclamationCircleIcon className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Priority</span>
              {sortBy === 'priority' &&
                (isAscending ? (
                  <ChevronUpIcon className="ml-1.5 h-3 w-3" />
                ) : (
                  <ChevronDownIcon className="ml-1.5 h-3 w-3" />
                ))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
