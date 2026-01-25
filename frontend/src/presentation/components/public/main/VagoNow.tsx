import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { useVagoNow } from "../../../../application/hooks/useSiteSections";
import SiteSectionModal from '../SiteSectionModal';
import { SiteSection } from "../../../../application/services/siteSections.service";

export const VagoNow: React.FC = () => {
    const { data: vagoNowItems, isLoading, error } = useVagoNow({ limit: 5 });
    const [selectedItem, setSelectedItem] = useState<SiteSection | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLearnMore = (item: SiteSection) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    if (isLoading) {
        return (
            <section className="bg-transparent_65 rounded-xl border border-cyan-100 shadow-sm p-4 sm:p-6 md:p-8">
                <div className="max-w-6xl mx-auto text-center mb-6 sm:mb-8 md:mb-10">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-cyan-800">VAGO Now</h2>
                    <p className="text-cyan-600 text-base sm:text-lg mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
                        Come discover our exciting and vibrant campus and find out why #VagoLife is invigorating and fulfilling.
                    </p>
                    <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto mb-6 sm:mb-8 md:mb-10" />
                </div>
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                        {[1, 2, 3].map((idx) => (
                            <div key={idx} className="h-[200px] sm:h-[250px] md:h-[280px] bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                        {[1, 2].map((idx) => (
                            <div key={idx} className="h-[200px] sm:h-[250px] md:h-[280px] bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-transparent_65 rounded-xl border border-cyan-100 shadow-sm p-4 sm:p-6 md:p-8">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-cyan-800">VAGO Now</h2>
                    <p className="text-red-600">Failed to load VAGO Now content. Please try again later.</p>
                </div>
            </section>
        );
    }

    // Split items into first row (3 items) and second row (2 items)
    const firstRow = vagoNowItems?.sections.slice(0, 3) || [];
    const secondRow = vagoNowItems?.sections.slice(3, 5) || [];

    return (
        <section className="bg-transparent_65 rounded-xl border border-cyan-100 shadow-sm p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto text-center mb-6 sm:mb-8 md:mb-10">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-cyan-800">VAGO Now</h2>
                <p className="text-cyan-600 text-base sm:text-lg mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
                    Come discover our exciting and vibrant campus and find out why #VagoLife is invigorating and fulfilling.
                </p>
                <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto mb-6 sm:mb-8 md:mb-10" />
            </div>

            <div className="max-w-6xl mx-auto">
                {/* First row - 3 items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    {firstRow.map((item) => (
                        <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                            onClick={() => handleLearnMore(item)}
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-[200px] sm:h-[250px] md:h-[280px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/90 via-cyan-900/40 to-transparent opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 text-white">
                                    <span className="text-xs font-semibold px-2 sm:px-3 py-1 bg-cyan-500/80 rounded-full mb-2 inline-block">
                                        {item.category || 'General'}
                                    </span>
                                    <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                                    <div className="inline-flex items-center text-xs sm:text-sm font-semibold text-cyan-300">
                                        Learn More <FaArrowRight className="ml-1 sm:ml-2 text-xs" />
                                    </div>
                                </div>
                            </div>
                            {/* Mobile overlay - always visible on mobile */}
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/90 via-cyan-900/40 to-transparent sm:hidden">
                                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                    <span className="text-xs font-semibold px-2 py-1 bg-cyan-500/80 rounded-full mb-2 inline-block">
                                        {item.category || 'General'}
                                    </span>
                                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                    <div className="inline-flex items-center text-xs font-semibold text-cyan-300">
                                        Tap to Learn More <FaArrowRight className="ml-1 text-xs" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Second row - 2 items centered */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    {secondRow.map((item) => (
                        <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                            onClick={() => handleLearnMore(item)}
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-[200px] sm:h-[250px] md:h-[280px] object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/90 via-cyan-900/40 to-transparent opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 text-white">
                                    <span className="text-xs font-semibold px-2 sm:px-3 py-1 bg-cyan-500/80 rounded-full mb-2 inline-block">
                                        {item.category || 'General'}
                                    </span>
                                    <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                                    <div className="inline-flex items-center text-xs sm:text-sm font-semibold text-cyan-300">
                                        Learn More <FaArrowRight className="ml-1 sm:ml-2 text-xs" />
                                    </div>
                                </div>
                            </div>
                            {/* Mobile overlay - always visible on mobile */}
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/90 via-cyan-900/40 to-transparent sm:hidden">
                                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                    <span className="text-xs font-semibold px-2 py-1 bg-cyan-500/80 rounded-full mb-2 inline-block">
                                        {item.category || 'General'}
                                    </span>
                                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                    <div className="inline-flex items-center text-xs font-semibold text-cyan-300">
                                        Tap to Learn More <FaArrowRight className="ml-1 text-xs" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mt-6 sm:mt-8 md:mt-10">
                <Link
                    to="/vago-now"
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                    Explore More
                    <FaArrowRight className="ml-2" />
                </Link>
            </div>

            {/* Modal for previewing VAGO Now item */}
            <SiteSectionModal
                item={selectedItem}
                isOpen={isModalOpen}
                onClose={closeModal}
                type="vagoNow"
            />
        </section>
    );
};
