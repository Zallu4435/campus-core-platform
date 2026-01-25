import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { useLeadership } from "../../../../application/hooks/useSiteSections";
import SiteSectionModal from '../SiteSectionModal';
import { SiteSection } from "../../../../application/services/siteSections.service";

export const ThoughtLeadership: React.FC = () => {
  const { data: leadershipItems, isLoading, error } = useLeadership({ limit: 2 });
  const [selectedItem, setSelectedItem] = useState<SiteSection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReadMore = (item: SiteSection) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <section className="bg-transparent_65 rounded-xl border border-cyan-100 shadow-sm p-8">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-cyan-800">Thought Leadership</h2>
          <p className="text-cyan-600 text-lg mb-6 max-w-2xl mx-auto">
            Distinguished thought leaders, movers and shakers in Singapore and across the globe gather regularly on
            campus to share their insights and engage in intellectual discourse.
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {[1, 2].map((idx) => (
            <div key={idx} className="rounded-xl overflow-hidden shadow-lg border border-cyan-50 animate-pulse">
              <div className="h-60 bg-gray-200"></div>
              <div className="bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-600 text-white p-6 min-h-[240px]">
                <div className="h-6 bg-white/20 rounded mb-3"></div>
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-transparent_65 rounded-xl border border-cyan-100 shadow-sm p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3 text-cyan-800">Thought Leadership</h2>
          <p className="text-red-600">Failed to load thought leadership content. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-transparent_65 rounded-xl border border-cyan-100 shadow-sm p-8">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold mb-3 text-cyan-800">Thought Leadership</h2>
        <p className="text-cyan-600 text-lg mb-6 max-w-2xl mx-auto">
          Distinguished thought leaders, movers and shakers in Singapore and across the globe gather regularly on
          campus to share their insights and engage in intellectual discourse.
        </p>
        <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {leadershipItems?.sections.map((item) => (
          <div
            key={item.id}
            className="group rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-cyan-50"
          >
            <div className="relative overflow-hidden h-60">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-gradient-to-r from-cyan-600 to-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                  {item.category || 'Leadership'}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-cyan-700 via-blue-600 to-cyan-600 text-white p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-3 leading-tight">
                  {item.title}
                </h3>
                <p className="text-cyan-50 text-sm leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
              <button
                onClick={() => handleReadMore(item)}
                className="inline-flex items-center mt-4 bg-white/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition group/btn self-start"
              >
                Read More
                <FaArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          to="/leadership"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          View All Insights
          <FaArrowRight className="ml-2" />
        </Link>
      </div>

      {/* Modal for previewing Thought Leadership item */}
      <SiteSectionModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={closeModal}
        type="leadership"
      />
    </section>
  );
};
