import React, { useState } from 'react';
import { ServiceItem } from '../../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Layers,
  Camera,
  Search,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import { ServiceModal } from './ServiceModal';
import { ChangeServiceImageModal } from '../ChangeServiceImageModal';
import { ServiceFormBuilderModal } from './ServiceFormBuilderModal';

interface ServicesTabProps {
  services: ServiceItem[];
  onSaveService: (service: ServiceItem) => void;
  onDeleteService: (id: string) => void;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({
  services,
  onSaveService,
  onDeleteService
}) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceForImageModal, setServiceForImageModal] = useState<ServiceItem | null>(null);
  const [serviceForFormBuilder, setServiceForFormBuilder] = useState<ServiceItem | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (service: ServiceItem) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleOpenImageChange = (service: ServiceItem) => {
    setServiceForImageModal(service);
  };

  const filteredServices = services.filter(service => {
    const q = searchQuery.toLowerCase();
    return (
      service.title.toLowerCase().includes(q) ||
      (service.titleBn || '').toLowerCase().includes(q) ||
      (service.slug || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-400" />
            <span>Manage Water Tank Cleaning Services</span>
          </h2>
          <p className="text-xs text-slate-400">
            Edit service images, titles, pricing, descriptions, and feature lists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleAddNew}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div 
            key={service.id} 
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm group"
          >
            <div>
              {/* Service Cover Thumbnail with Quick Change Button */}
              <div className="relative aspect-video bg-slate-950 border-b border-slate-800 overflow-hidden">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs gap-1">
                    <ImageIcon className="w-6 h-6" />
                    <span>No image set</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* Popular Badge */}
                {service.popular && (
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded backdrop-blur-sm">
                    Popular
                  </div>
                )}

                {/* Quick 1-Click Change Image Button */}
                <button
                  type="button"
                  onClick={() => handleOpenImageChange(service)}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-950/90 hover:bg-blue-600 text-white border border-slate-700 hover:border-blue-400 text-[11px] font-semibold flex items-center gap-1 backdrop-blur-md shadow-md transition-all cursor-pointer"
                  title="Change Service Image"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>Change Image</span>
                </button>

                {/* Starting Price Pill */}
                {service.startingPrice && (
                  <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-950/90 text-emerald-400 border border-slate-800">
                    ৳{Number(service.startingPrice).toLocaleString()} start
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-sm line-clamp-1">{service.title}</h3>
                </div>
                <p className="text-xs text-blue-400 font-medium">{service.titleBn}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{service.description || service.shortDesc}</p>

                <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                  {(service.features || []).slice(0, 2).map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenImageChange(service)}
                  className="px-2 py-1.5 bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 text-xs font-medium rounded-lg flex items-center gap-1 border border-blue-800/40 cursor-pointer"
                  title="ছবি পরিবর্তন"
                >
                  <Camera className="w-3 h-3" />
                  <span className="hidden sm:inline">ছবি</span>
                </button>

                <button
                  type="button"
                  onClick={() => setServiceForFormBuilder(service)}
                  className="px-2.5 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-1 border border-emerald-800/40 cursor-pointer"
                  title="এই সার্ভিসের কাস্টম বুকিং ফরম এডিট করুন"
                >
                  <FileText className="w-3 h-3 text-emerald-400" />
                  <span>বুকিং ফরম</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleEdit(service)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setServiceToDelete(service)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg border border-rose-900/30 cursor-pointer"
                  title="Delete Service"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Edit Modal */}
      {isModalOpen && (
        <ServiceModal
          service={selectedService}
          onClose={() => setIsModalOpen(false)}
          onSave={(updated) => {
            onSaveService(updated);
            setIsModalOpen(false);
          }}
        />
      )}

      {/* Dedicated Quick Image Change Modal */}
      <ChangeServiceImageModal
        service={serviceForImageModal}
        isOpen={Boolean(serviceForImageModal)}
        onClose={() => setServiceForImageModal(null)}
        onImageUpdated={(id, newUrl) => {
          if (serviceForImageModal) {
            onSaveService({ ...serviceForImageModal, image: newUrl });
          }
          setServiceForImageModal(null);
        }}
      />

      {/* Delete Confirmation Modal (In-App, iFrame Safe) */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">Delete Service?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to delete <span className="text-white font-semibold">&quot;{serviceToDelete.title}&quot;</span>?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteService(serviceToDelete.id);
                  setServiceToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Service Booking Form Builder Modal */}
      {serviceForFormBuilder && (
        <ServiceFormBuilderModal
          service={serviceForFormBuilder}
          isOpen={Boolean(serviceForFormBuilder)}
          onClose={() => setServiceForFormBuilder(null)}
          onSaved={() => setServiceForFormBuilder(null)}
        />
      )}
    </div>
  );
};

export default ServicesTab;
