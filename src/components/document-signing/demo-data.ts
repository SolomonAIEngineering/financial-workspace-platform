import type { Document } from './types';

// Demo documents data for the document signing page
export const demoDocuments: Document[] = [
  {
    id: 'doc-1',
    expiresAt: '2023-06-10T23:59:59Z',
    isFavorited: true,
    pageCount: 12,
    previewUrl: '/images/document-preview-1.jpg',
    priority: 'high',
    recipients: [
      {
        id: 'r-1',
        email: 'john@example.com',
        name: 'John Smith',
        signedAt: '2023-05-10T14:30:00Z',
        status: 'signed',
      },
      { id: 'r-2', email: 'you@example.com', name: 'You', status: 'pending' },
    ],
    sender: {
      email: 'agent@realestate.com',
      name: 'Real Estate Co.',
    },
    status: 'pending',
    tags: ['contract', 'legal'],
    title: 'Purchase Agreement - 123 Main St',
    updatedAt: '2 hours ago',
  },
  {
    id: 'doc-2',
    expiresAt: '2023-05-30T23:59:59Z',
    isFavorited: false,
    pageCount: 8,
    previewUrl: '/images/document-preview-2.jpg',
    priority: 'medium',
    recipients: [
      { id: 'r-3', email: 'you@example.com', name: 'You', status: 'viewed' },
    ],
    sender: {
      email: 'hr@company.com',
      name: 'HR Department',
    },
    status: 'viewed',
    tags: ['hr'],
    title: 'Employment Contract - Product Manager',
    updatedAt: '1 day ago',
  },
  {
    id: 'doc-3',
    expiresAt: '2023-05-15T23:59:59Z',
    isFavorited: true,
    pageCount: 4,
    previewUrl: '/images/document-preview-3.jpg',
    priority: 'low',
    recipients: [
      {
        id: 'r-4',
        email: 'you@example.com',
        name: 'You',
        signedAt: '2023-05-01T10:15:00Z',
        status: 'signed',
      },
    ],
    sender: {
      email: 'legal@company.com',
      name: 'Legal Department',
    },
    status: 'signed',
    tags: ['legal'],
    title: 'NDA - Project Moonshot',
    updatedAt: '1 week ago',
  },
  {
    id: 'doc-4',
    expiresAt: '2023-05-20T23:59:59Z',
    isFavorited: false,
    pageCount: 16,
    previewUrl: '/images/document-preview-4.jpg',
    priority: 'none',
    recipients: [
      { id: 'r-5', email: 'you@example.com', name: 'You', status: 'rejected' },
    ],
    sender: {
      email: 'contracts@acme.com',
      name: 'Acme Inc.',
    },
    status: 'rejected',
    tags: ['contract'],
    title: 'Service Agreement - Web Development',
    updatedAt: '3 days ago',
  },
  {
    id: 'doc-5',
    expiresAt: '2023-04-15T23:59:59Z',
    isFavorited: false,
    pageCount: 20,
    previewUrl: '/images/document-preview-5.jpg',
    priority: 'medium',
    recipients: [
      { id: 'r-6', email: 'you@example.com', name: 'You', status: 'pending' },
    ],
    sender: {
      email: 'leasing@properties.com',
      name: 'Commercial Properties',
    },
    status: 'expired',
    tags: ['contract', 'financial'],
    title: 'Lease Agreement - Office Space',
    updatedAt: '3 weeks ago',
  },
];
