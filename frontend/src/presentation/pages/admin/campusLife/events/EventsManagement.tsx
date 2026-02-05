import React, { useState, useCallback } from 'react';
import {
  IoAdd as Plus,
  IoEyeOutline as Eye,
  IoCreateOutline as Edit,
  IoTrashOutline as Trash2,
  IoCalendarOutline as Calendar,
  IoLocationOutline as MapPin,
  IoBusinessOutline as Building,
  IoSchoolOutline as GraduationCap,
  IoPersonOutline as User,
} from 'react-icons/io5';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';
import Header from '../../../../components/admin/management/Header';
import ApplicationsTable from '../../../../components/admin/management/ApplicationsTable';
import Pagination from '../../../../components/admin/management/Pagination';
import WarningModal from '../../../../components/common/WarningModal';
import AddEventModal from './AddEventModal';
import EventDetailsModal from './EventDetailsModal';
import EventRequestDetailsModal from './EventRequestDetailsModal';
import { useEventManagement } from '../../../../../application/hooks/useEventManagement';
import {
  Event,
  EventRequest,
  ItemToAction,
} from '../../../../../domain/types/management/eventmanagement';
import {
  EVENT_TYPES,
  EVENT_STATUSES,
  REQUEST_STATUSES,
  DATE_RANGES,
  getEventColumns,
  getEventRequestColumns,
} from '../../../../../shared/constants/eventManagementConstants';
import { formatDate } from '../../../../../shared/utils/dateUtils';
import LoadingSpinner from '../../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../../shared/components/ErrorMessage';

const AdminEventsManagement: React.FC = () => {
  const {
    events,
    eventRequests,
    totalPages,
    page,
    setPage,
    setSearchTerm,
    filters,
    setFilters,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    approveEventRequest,
    rejectEventRequest,
    handleTabChange,
    getEventDetails,
    getEventRequestDetails,
  } = useEventManagement();

  const [activeTab, setActiveTab] = useState<'events' | 'requests'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<EventRequest | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [itemToAction, setItemToAction] = useState<ItemToAction | null>(null);

  const eventColumns = getEventColumns(MapPin, Building, GraduationCap, User);
  const eventRequestColumns = getEventRequestColumns(Calendar, Building, GraduationCap, User, formatDate);

  const debouncedSearchChange = useCallback(
    debounce((query: string) => {
      setSearchTerm(query);
      setPage(1);
    }, 500),
    [setSearchTerm, setPage]
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    debouncedSearchChange(query);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setShowAddEventModal(true);
  };

  const handleEditEvent = async (event: Event) => {
    try {
      const details = await getEventDetails(event.id);
      setSelectedEvent(details);
      setShowAddEventModal(true);
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to fetch event details');
    }
  };

  const handleViewEvent = async (event: Event | EventRequest) => {
    try {
      if ('id' in event) {
        const details = await getEventDetails(event.id);
        setSelectedEvent(details);
      } else {
        setSelectedEvent(null);
      }
      setShowEventDetailsModal(true);
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to fetch event details');
    }
  };

  const handleSaveEvent = async (data: unknown) => {
    try {
      if (selectedEvent && (selectedEvent.id || selectedEvent._id)) {
        const eventId = selectedEvent.id || selectedEvent._id;
        if (!eventId) {
          toast.error('Event ID is missing for update!');
          return;
        }
        await updateEvent({ id: eventId, data: data as Partial<Event> });
        toast.success('Event updated successfully');
      } else {
        await createEvent(data as Omit<Event, 'id' | 'participants'>);
        toast.success('Event created successfully');
      }
      setShowAddEventModal(false);
      setSelectedEvent(null);
    } catch (error: unknown) {
      console.error('handleSaveEvent - error:', error);
      // Error toast is now handled by the form component
      throw error;
    }
  };

  const handleDeleteEvent = (id: string) => {
    setItemToAction({ id, type: 'event', action: 'delete' });
    setShowWarningModal(true);
  };

  const handleViewRequest = async (request: EventRequest) => {
    try {
      const details = await getEventRequestDetails(request.requestedId || '');
      setSelectedRequest(details);
      setShowRequestDetailsModal(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast.error('Failed to fetch request details');
    }
  };

  const handleConfirmAction = async () => {
    if (itemToAction) {
      try {
        if (itemToAction.type === 'event' && itemToAction.action === 'delete') {
          await deleteEvent(itemToAction.id);
          toast.success('Event deleted successfully');
        } else if (itemToAction.type === 'eventRequest') {
          if (itemToAction.action === 'reject') {
            await rejectEventRequest(itemToAction.id);
            toast.success('Event request rejected');
          } else if (itemToAction.action === 'approve') {
            await approveEventRequest(itemToAction.id);
            toast.success('Event request approved');
          }
          setShowRequestDetailsModal(false);
          setSelectedRequest(null);
        }
        setShowWarningModal(false);
        setItemToAction(null);
        handleTabChange(activeTab);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to perform action';
        toast.error(errorMessage);
      }
    }
  };

  const handleResetFilters = () => {
    setFilters({
      eventType: 'All',
      dateRange: 'All',
      status: 'All',
      organizerType: 'All',
    });
    setSearchQuery('');
    setSearchTerm('');
    setPage(1);
  };

  const debouncedFilterChange = useCallback(
    debounce((field: string, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [field]: value || 'All',
      }));
      setPage(1);
    }, 300),
    [setFilters, setPage]
  );

  const eventActions = [
    {
      icon: <Eye size={16} />,
      label: 'View Event',
      onClick: handleViewEvent,
      color: 'blue' as const,
    },
    {
      icon: <Edit size={16} />,
      label: 'Edit Event',
      onClick: handleEditEvent,
      color: 'green' as const,
    },
    {
      icon: <Trash2 size={16} />,
      label: 'Delete Event',
      onClick: (event: Event) => handleDeleteEvent(event.id),
      color: 'red' as const,
    },
  ];

  const eventRequestActions = [
    {
      icon: <Eye size={16} />,
      label: 'View Request',
      onClick: handleViewRequest,
      color: 'blue' as const,
    },
    {
      icon: <Edit size={16} />,
      label: 'Approve Request',
      onClick: (request: EventRequest) => {
        setItemToAction({ id: request.requestedId || '', type: 'eventRequest', action: 'approve' });
        setShowWarningModal(true);
      },
      color: 'green' as const,
      disabled: (request: EventRequest) => request.status !== 'pending',
    },
    {
      icon: <Trash2 size={16} />,
      label: 'Reject Request',
      onClick: (request: EventRequest) => {
        setItemToAction({ id: request.requestedId || '', type: 'eventRequest', action: 'reject' });
        setShowWarningModal(true);
      },
      color: 'red' as const,
      disabled: (request: EventRequest) => request.status !== 'pending',
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-500/10 blur-md"
            style={{
              width: `${Math.random() * 12 + 4}px`,
              height: `${Math.random() * 12 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatingMist ${Math.random() * 15 + 20}s ease-in-out infinite ${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Header
          title="Event Management"
          subtitle="Manage campus events and activities"
          stats={[
            {
              icon: <Calendar />,
              title: 'Total Events',
              value: events.length.toString(),
              change: '+10%',
              isPositive: true,
            },
            {
              icon: <Calendar />,
              title: 'Upcoming Events',
              value: events.filter((e) => e.status?.toLowerCase() === 'upcoming').length.toString(),
              change: '+8%',
              isPositive: true,
            },
            {
              icon: <Building />,
              title: 'Department Events',
              value: events.filter((e) => e.organizerType?.toLowerCase() === 'department').length.toString(),
              change: '+5%',
              isPositive: true,
            },
          ]}
          tabs={[
            { label: 'Events', icon: <Calendar size={16} />, active: activeTab === 'events' },
            { label: 'Event Requests', icon: <Edit size={16} />, active: activeTab === 'requests' },
          ]}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          searchPlaceholder="Search events or requests..."
          filters={filters as Record<string, string>}
          filterOptions={{
            eventType: EVENT_TYPES as unknown as string[],
            dateRange: DATE_RANGES as unknown as string[],
            status: (activeTab === 'events' ? EVENT_STATUSES : REQUEST_STATUSES) as unknown as string[],
          }}
          debouncedFilterChange={debouncedFilterChange}
          handleResetFilters={handleResetFilters}
          onTabClick={(index) => {
            const tabMap = ['events', 'requests'];
            const newTab = tabMap[index] as 'events' | 'requests';
            setActiveTab(newTab);
            handleTabChange(newTab);
            setFilters({
              eventType: 'All',
              dateRange: 'All',
              status: 'All',
              organizerType: 'All',
            });
            setSearchQuery('');
            setSearchTerm('');
            setPage(1);
          }}
        />

        <div className="mt-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-purple-500/20 relative">
            {isLoading && <LoadingSpinner />}
            <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
              {activeTab === 'events' && (
                <button
                  onClick={handleAddEvent}
                  className="mb-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  aria-label="Add new event"
                >
                  <Plus size={16} />
                  Add Event
                </button>
              )}

              {activeTab === 'events' && events.length > 0 && (
                <>
                  <ApplicationsTable data={events} columns={eventColumns} actions={eventActions} />
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    itemsCount={events.length}
                    itemName="events"
                    onPageChange={(newPage: number) => setPage(newPage)}
                    onFirstPage={() => setPage(1)}
                    onLastPage={() => setPage(totalPages)}
                  />
                </>
              )}
              {activeTab === 'requests' && eventRequests.length > 0 && (
                <>
                  <ApplicationsTable
                    data={eventRequests}
                    columns={eventRequestColumns}
                    actions={eventRequestActions}
                  />
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    itemsCount={eventRequests.length}
                    itemName="event requests"
                    onPageChange={(newPage: number) => setPage(newPage)}
                    onFirstPage={() => setPage(1)}
                    onLastPage={() => setPage(totalPages)}
                  />
                </>
              )}
              {activeTab === 'events' && events.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                    <Calendar size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">No Events Found</h3>
                  <p className="text-gray-400 text-center max-w-sm">
                    There are no events matching your current filters. Try adjusting your search criteria.
                  </p>
                </div>
              )}
              {activeTab === 'requests' && eventRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                    <Edit size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">No Event Requests Found</h3>
                  <p className="text-gray-400 text-center max-w-sm">
                    There are no event requests matching your current filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddEventModal
        isOpen={showAddEventModal}
        onClose={() => {
          setShowAddEventModal(false);
          setSelectedEvent(null);
        }}
        onSubmit={handleSaveEvent}
        initialData={selectedEvent ? {
          title: selectedEvent.title,
          date: selectedEvent.date,
          time: selectedEvent.time,
          location: selectedEvent.location,
          organizerType: selectedEvent.organizerType as "club" | "department" | "student" | "administration" | "external",
          eventType: selectedEvent.eventType as "workshop" | "seminar" | "fest" | "competition" | "exhibition" | "conference" | "hackathon" | "cultural" | "sports" | "academic",
          icon: selectedEvent.icon,
          color: selectedEvent.color,
          description: selectedEvent.description,
          fullTime: selectedEvent.fullTime,
          additionalInfo: selectedEvent.additionalInfo,
          requirements: selectedEvent.requirements,
          maxParticipants: selectedEvent.maxParticipants,
          registrationRequired: selectedEvent.registrationRequired,
          organizer: selectedEvent.organizer,
        } : undefined}
        isEditing={!!selectedEvent}
      />

      <EventDetailsModal
        isOpen={showEventDetailsModal}
        onClose={() => {
          setShowEventDetailsModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditEvent}
      />

      <EventRequestDetailsModal
        isOpen={showRequestDetailsModal}
        onClose={() => {
          setShowRequestDetailsModal(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onApprove={(id) => {
          setItemToAction({ id, type: 'eventRequest', action: 'approve' });
          setShowWarningModal(true);
        }}
        onReject={(id) => {
          setItemToAction({ id, type: 'eventRequest', action: 'reject' });
          setShowWarningModal(true);
        }}
      />

      <WarningModal
        isOpen={showWarningModal}
        onClose={() => {
          setShowWarningModal(false);
          setItemToAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={
          itemToAction?.type === 'event'
            ? 'Delete Event'
            : itemToAction?.action === 'approve'
              ? 'Approve Event Request'
              : 'Reject Event Request'
        }
        message={
          itemToAction?.type === 'event'
            ? 'Are you sure you want to delete this event? This action cannot be undone.'
            : itemToAction?.action === 'approve'
              ? 'Are you sure you want to approve this event request?'
              : 'Are you sure you want to reject this event request?'
        }
        confirmText={
          itemToAction?.type === 'event'
            ? 'Delete'
            : itemToAction?.action === 'approve'
              ? 'Approve'
              : 'Reject'
        }
        cancelText="Cancel"
        type={itemToAction?.action === 'approve' ? 'info' : 'danger'}
      />

      <style>{`
        @keyframes floatingMist {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) translateX(15px);
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminEventsManagement;