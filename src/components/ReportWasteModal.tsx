import React, { useState, useEffect } from 'react';
import { WasteType, WasteSize, UserProfile } from '../types';
import { AKWA_IBOM_LGAS } from '../data/seedData';
import { CleanSpotStore } from '../services/storage';
import { forwardGeocode } from '../services/geoapify';
import { createWasteReportInFirestore, broadcastWaste, auth } from '../services/firebaseService';
import { compressImageToDataUrl } from '../services/imageOptimizer';
import { X, Upload, MapPin, Sparkles, Check, AlertCircle, ExternalLink, Phone, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportWasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onReportCreated?: () => void;
}

const SAMPLE_WASTE_PHOTOS = [
  {
    name: 'Plastic Bottles Pile',
    url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
    type: 'Plastic' as WasteType,
    size: 'Huge' as WasteSize,
  },
  {
    name: 'Scrap Metal & Cans',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    type: 'Metal' as WasteType,
    size: 'Medium' as WasteSize,
  },
  {
    name: 'Market Organic Debris',
    url: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&auto=format&fit=crop&q=80',
    type: 'Organic' as WasteType,
    size: 'Medium' as WasteSize,
  },
  {
    name: 'Street Dumpster Overflow',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
    type: 'General' as WasteType,
    size: 'Huge' as WasteSize,
  },
];

export const ReportWasteModal: React.FC<ReportWasteModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onReportCreated,
}) => {
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_WASTE_PHOTOS[0].url);
  const [wasteType, setWasteType] = useState<WasteType>('Plastic');
  const [wasteSize, setWasteSize] = useState<WasteSize>('Huge');

  // Location fields - initialized empty without hardcoded numbers
  const [postalCode, setPostalCode] = useState('');
  const [roadStreet, setRoadStreet] = useState('');
  const [lga, setLga] = useState('');
  const [stateName, setStateName] = useState('');
  const [phone, setPhone] = useState('');

  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  // Clean state on form open: Reset all fields to empty strings
  useEffect(() => {
    if (isOpen) {
      setPostalCode('');
      setRoadStreet('');
      setLga('');
      setStateName('');
      setPhone('');
      setDescription('');
      setError('');
      setSubmitted(false);
      setIsSubmitting(false);
      setIsCompressingPhoto(false);
      setPhotoUrl(SAMPLE_WASTE_PHOTOS[0].url);
      setWasteType('Plastic');
      setWasteSize('Huge');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Fix "Open Location on Google Map" button logic using exact full address query
  const handleOpenLocationOnGoogleMap = () => {
    const road = roadStreet.trim();
    const lgaVal = lga.trim();
    const stateVal = stateName.trim();
    const postal = postalCode.trim();

    if (!road || !lgaVal || !postal || !stateVal) {
      setError('Please fill all location fields');
      return;
    }

    const fullAddress = `${road}, ${lgaVal}, ${stateVal}, ${postal}, Nigeria`;
    const query = encodeURIComponent(fullAddress);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingPhoto(true);
      setError('');
      try {
        const compressed = await compressImageToDataUrl(file, {
          maxWidth: 550,
          maxHeight: 550,
          quality: 0.55,
          maxSizeBytes: 50 * 1024,
        });
        if (compressed) {
          setPhotoUrl(compressed);
        }
      } catch (err) {
        console.warn('Image compression notice:', err);
        setError('Could not process this image. Please choose another.');
      } finally {
        setIsCompressingPhoto(false);
      }
    }
  };

  // Validation before broadcast & form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!photoUrl) {
      setError('Please provide a photo of the waste dump.');
      return;
    }

    // Check that road, lga, postalCode, state are all filled
    if (!roadStreet.trim() || !lga.trim() || !postalCode.trim() || !stateName.trim()) {
      setError('Please fill all location fields');
      return;
    }

    if (!phone.trim()) {
      setError('Phone Number is required.');
      return;
    }

    setIsSubmitting(true);

    const fullAddress = `${roadStreet.trim()}, ${lga.trim()}, ${stateName.trim()}, ${postalCode.trim()}, Nigeria`;

    // Try to geocode fullAddress via Geoapify or just allow - query string is used for maps navigation
    let geoLat = 0;
    let geoLng = 0;
    try {
      const geo = await forwardGeocode(fullAddress);
      if (geo) {
        geoLat = geo.latitude;
        geoLng = geo.longitude;
      }
    } catch {
      // Continue even if geocoding service is unavailable
    }

    const userPhoto =
      currentUser.photoURL ||
      currentUser.profilePhotoUrl ||
      currentUser.avatarUrl ||
      auth.currentUser?.photoURL ||
      (currentUser.id ? localStorage.getItem(`profilePhoto_${currentUser.id}`) : null) ||
      null;

    // Ensure photoUrl is optimized under Firestore and local storage limits
    let finalPhoto = photoUrl;
    if (finalPhoto && finalPhoto.startsWith('data:') && finalPhoto.length > 250000) {
      try {
        finalPhoto = await compressImageToDataUrl(finalPhoto, {
          maxWidth: 960,
          maxHeight: 960,
          quality: 0.65,
          maxSizeBytes: 250 * 1024,
        });
      } catch {
        // Fallback
      }
    }

    const reportPayload = {
      reporterId: currentUser.id,
      reporterName: currentUser.name || 'Citizen Disposer',
      reporterEmail: currentUser.email,
      reporterPhone: phone.trim(),
      reporterAvatar: userPhoto || '',
      disposerId: currentUser.id,
      disposerName: currentUser.name || 'Citizen Disposer',
      disposerPhone: phone.trim(),
      disposerPhotoURL: userPhoto,
      photoURL: userPhoto,
      photoUrl: finalPhoto,
      imageUrl: finalPhoto,
      photos: [finalPhoto],
      postalCode: postalCode.trim(),
      roadStreet: roadStreet.trim(),
      lga: lga.trim(),
      state: stateName.trim(),
      fullAddress,
      address: roadStreet.trim(),
      latitude: geoLat,
      longitude: geoLng,
      lat: geoLat,
      lng: geoLng,
      wasteType,
      size: wasteSize,
      description: description.trim(),
      status: 'pending' as const,
    };

    try {
      await createWasteReportInFirestore(reportPayload);
    } catch (fsErr) {
      console.warn('Firestore report write notice:', fsErr);
    }

    CleanSpotStore.createReport(reportPayload);

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#22c55e', '#86efac', '#eab308'],
    });

    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      if (onReportCreated) onReportCreated();
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Earn +50 Eco Points
            </div>
            <h2 className="text-xl font-black">Report Waste Dump in Akwa Ibom</h2>
            <p className="text-emerald-100 text-xs">
              Direct Google Maps navigation for collectors with exact street address.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl animate-bounce">
              🎉
            </div>
            <h3 className="text-2xl font-black text-gray-900">Waste Spot Mapped!</h3>
            <p className="text-sm text-gray-600 max-w-md">
              Your report has been broadcast to verified recyclers and collectors in Akwa Ibom State. You earned <b>+50 Eco Points</b>!
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-200">
              <Check className="w-4 h-4" /> Collectors can now navigate directly via Google Maps!
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-left">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Photo Section */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                <span>1. Take / Upload Photo of Waste Dump</span>
                <span className="text-gray-400 font-normal">JPG, PNG</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5 relative h-36 rounded-2xl overflow-hidden border-2 border-dashed border-emerald-400 bg-emerald-50/40 group">
                  <img
                    src={photoUrl || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800'}
                    alt="Waste Dump"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800';
                    }}
                  />
                  <label className="absolute inset-0 bg-black/40 hover:bg-black/50 text-white flex flex-col items-center justify-center cursor-pointer transition-opacity">
                    {isCompressingPhoto ? (
                      <Loader2 className="w-5 h-5 mb-1 animate-spin text-emerald-300" />
                    ) : (
                      <Upload className="w-5 h-5 mb-1" />
                    )}
                    <span className="text-xs font-semibold">
                      {isCompressingPhoto ? 'Optimizing Photo...' : 'Upload Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isCompressingPhoto}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="sm:col-span-7 bg-gray-50 p-2.5 rounded-2xl border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-600 block mb-1.5">
                    💡 Quick Test Presets (1-Click Select):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SAMPLE_WASTE_PHOTOS.map((sample, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setPhotoUrl(sample.url);
                          setWasteType(sample.type);
                          setWasteSize(sample.size);
                        }}
                        className={`text-left p-1.5 rounded-lg border text-[11px] flex items-center gap-1.5 transition-all ${
                          photoUrl === sample.url
                            ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-900'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <img src={sample.url} alt="" className="w-6 h-6 rounded object-cover" />
                        <span className="truncate">{sample.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* LOCATION DETAILS SECTION */}
            <div className="space-y-3 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  2. Location Details
                </span>
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 524102"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 bg-white shadow-xs"
                />
              </div>

              {/* Road / Street */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Road / Street <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={roadStreet}
                  onChange={(e) => setRoadStreet(e.target.value)}
                  placeholder="e.g. F103, Oron Road"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 bg-white shadow-xs"
                />
              </div>

              {/* Local Government Area (LGA) */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Local Government Area (LGA) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="akwa-ibom-lgas-list"
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    placeholder="e.g. Eket"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 bg-white shadow-xs"
                  />
                  <datalist id="akwa-ibom-lgas-list">
                    {AKWA_IBOM_LGAS.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Akwa Ibom"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 bg-white shadow-xs"
                />
              </div>

              {/* Phone Number Field */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08012345678"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-gray-900 bg-white shadow-xs"
                  />
                </div>
              </div>

              {/* Button: Open location on Google Map */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleOpenLocationOnGoogleMap}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open location on Google Map</span>
                </button>
              </div>
            </div>

            {/* Waste Type & Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  3. Waste Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Plastic', 'Organic', 'Metal', 'General', 'Hazardous'] as WasteType[]).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setWasteType(type)}
                      className={`py-2 px-2 text-xs rounded-xl border text-center font-medium transition-all ${
                        wasteType === type
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  4. Waste Size (Estimate)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Small', 'Medium', 'Huge'] as WasteSize[]).map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setWasteSize(size)}
                      className={`py-2 px-2 text-xs rounded-xl border text-center font-medium transition-all ${
                        wasteSize === size
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div>{size}</div>
                      <div className="text-[9px] opacity-80">
                        {size === 'Small' ? '1-5 kg' : size === 'Medium' ? 'Dumpster' : 'Truckload'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                5. Description & Access Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="e.g. Near street corner, accessible by pickup or truck..."
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm active:scale-[0.99] cursor-pointer"
              >
                <span>{isSubmitting ? 'Submitting Report...' : 'Broadcast Report to Akwa Ibom Collectors'}</span>
                <span className="bg-emerald-800/60 px-2 py-0.5 rounded-full text-xs font-semibold">
                  +50 Points
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
