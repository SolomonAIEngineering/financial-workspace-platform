import { AnimatePresence, motion } from 'framer-motion';

import type { Document, FilterMode } from './types';

import { DocumentCard } from './document-card';
import { DocumentListItem } from './document-list-item';
import { EmptyState } from './empty-state';

interface DocumentViewProps {
  documents: Document[];
  filterMode: FilterMode;
  viewMode: 'grid' | 'list';
  onDocumentClick: (document: Document) => void;
}

export const DocumentView = ({
  documents,
  filterMode,
  viewMode,
  onDocumentClick,
}: DocumentViewProps) => {
  if (documents.length === 0) {
    return (
      <motion.div
        key="empty"
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <EmptyState filterMode={filterMode} />
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {viewMode === 'grid' ? (
        <GridView onDocumentClick={onDocumentClick} documents={documents} />
      ) : (
        <ListView onDocumentClick={onDocumentClick} documents={documents} />
      )}
    </AnimatePresence>
  );
};

interface DocumentGridViewProps {
  documents: Document[];
  onDocumentClick: (document: Document) => void;
}

const GridView = ({ documents, onDocumentClick }: DocumentGridViewProps) => {
  return (
    <motion.div
      key="grid-view"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      {documents.map((doc, index) => (
        <motion.div
          key={doc.id}
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
        >
          <DocumentCard onClick={() => onDocumentClick(doc)} document={doc} />
        </motion.div>
      ))}
    </motion.div>
  );
};

interface DocumentListViewProps {
  documents: Document[];
  onDocumentClick: (document: Document) => void;
}

const ListView = ({ documents, onDocumentClick }: DocumentListViewProps) => {
  return (
    <motion.div
      key="list-view"
      className="flex flex-col gap-3"
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
    >
      {documents.map((doc, index) => (
        <motion.div
          key={doc.id}
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
        >
          <DocumentListItem
            onClick={() => onDocumentClick(doc)}
            document={doc}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
