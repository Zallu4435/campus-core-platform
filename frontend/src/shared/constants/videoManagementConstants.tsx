import { FiVideo } from 'react-icons/fi';
import { Diploma } from '../../domain/types/management/videomanagement';

export const ITEMS_PER_PAGE = 10;

export const STATUS_OPTIONS = ['All Status', 'Published', 'Draft'];

export const getCategoryOptions = (diplomasData: { diplomas: Diploma[] }) => diplomasData?.diplomas.map((d: Diploma) => d.category) || [];

export const getTabs = (activeTab: string, counts?: { all: number; published: number; drafts: number }) => [
  {
    label: `All Videos (${counts?.all || 0})`,
    icon: <FiVideo size={16} />,
    active: activeTab === 'all',
  },
  {
    label: `Published (${counts?.published || 0})`,
    icon: <FiVideo size={16} />,
    active: activeTab === 'published',
  },
  {
    label: `Drafts (${counts?.drafts || 0})`,
    icon: <FiVideo size={16} />,
    active: activeTab === 'drafts',
  },
];

export const ghostParticles = Array(30)
  .fill(0)
  .map((_) => ({
    size: Math.random() * 10 + 5,
    top: Math.random() * 100,
    left: Math.random() * 100,
    animDuration: Math.random() * 10 + 15,
    animDelay: Math.random() * 5,
  }));