import React, { useState } from 'react';
import { WasteReport, UserProfile } from '../types';
import { CleanSpotStore } from '../services/storage';
import { markWasteCollectedInFirestore } from '../services/firebaseService';
import { compressImageToDataUrl } from '../services/imageOptimizer';
import { X, Upload, CheckCircle2, Sparkles, Scale, AlertCircle, Loader2, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProofCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: WasteReport | null;
  collector: UserProfile;
  onSuccess: () => void;
}

const CLEAN_PROOF_PRESETS = [
  {
    name: 'Cleaned Paved Street',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cleared Roadside & Bagged',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Recycling Facility Scale Proof',
    url: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800&auto=format&fit=crop&q=80',
  },
];

export const ProofCollectionModal: React.FC<ProofCollectionModalProps> = ({
  isOpen,
  onClose,
  report,
  collector,
  onSuccess,
}) => {
  const [proofPhoto, setProofPhoto] = useState('');
  const [collectedKg, setCollectedKg] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompressingProof, setIsCompressingProof] = useState(false);

  if (!isOpen || !report) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingProof(true);
      setError('');
      try {
        const compressed = await compressImageToDataUrl(file, {
          maxWidth: 550,
          maxHeight: 550,
          quality: 0.55,
          maxSizeBytes: 50 * 1024,
        });
        if (compressed) {
          setProofPhoto(compressed);
        }
      } catch (err) {
        console.warn('Image processing notice:', err);
      } finally {
        setIsCompressingProof(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofPhoto) {
      setError('Please provide a proof photo of the cleaned spot or gathered recyclables.');
      return;
    }
    if (collectedKg === '' || Number(collectedKg) <= 0) {
      setError('Please enter a valid weight in KG.');
      return;
    }

    const finalWeightKg = Number(collectedKg);

    try {
      await markWasteCollectedInFirestore(report.id, {
        collectorId: collector.id,
        proofPhoto,
        collectedKg: finalWeightKg,
        completionNotes: notes,
      });
    } catch (fsErr) {
      console.warn('Firestore collect error:', fsErr);
    }

    CleanSpotStore.completeCollection(report.id, proofPhoto, finalWeightKg, collector);

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#10b981', '#34d399', '#f59e0b'],
    });

    setIsCompleted(true);
    setTimeout(() => {
      setIsCompleted(false);
      onSuccess();
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 p-5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Verification Step
            </div>
            <h2 className="text-xl font-black">Mark as Collected & Upload Proof</h2>
            <p className="text-emerald-100 text-xs">
              Verify clean-up of: <span className="font-semibold">{report.address}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCompleted ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl animate-bounce">
              🌟
            </div>
            <h3 className="text-2xl font-black text-gray-900">Collection Verified!</h3>
            <p className="text-sm text-gray-600 max-w-md">
              You added <b>{collectedKg} KG</b> to your recycling tally and earned{' '}
              <b>+{Number(collectedKg || 0) * 10} Eco Points</b>! Citizen reporter <b>{report.reporterName}</b> has been notified.
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Spot marked Cleaned & Recycled on the live map.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-left">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Before / After Preview */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
                  Before (Dump reported):
                </span>
                <div className="h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={report.photoUrl || report.imageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600'}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase block mb-1">
                  After (Clean Proof):
                </span>
                <div className="relative h-28 rounded-xl overflow-hidden border-2 border-emerald-500 bg-gray-100 flex items-center justify-center">
                  {proofPhoto ? (
                    <img
                      src={proofPhoto}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-gray-400">
                      <Camera className="w-6 h-6 text-emerald-600 mb-1" />
                      <span className="text-[10px] font-semibold text-gray-500">Upload Photo Proof or choose preset below</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center cursor-pointer text-white text-xs font-semibold">
                    {isCompressingProof ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin text-emerald-300" />
                    ) : (
                      <Upload className="w-4 h-4 mr-1" />
                    )}
                    {isCompressingProof ? 'Optimizing...' : proofPhoto ? 'Change Photo' : 'Upload Proof Photo'}
                    <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isCompressingProof} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Quick Proof Photo Presets */}
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-900 block mb-1.5">
                Proof Photo Presets:
              </span>
              <div className="flex gap-2">
                {CLEAN_PROOF_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProofPhoto(preset.url)}
                    className={`flex-1 p-1 text-[11px] rounded-lg border text-center transition-all ${
                      proofPhoto === preset.url
                        ? 'border-emerald-600 bg-emerald-100 font-bold text-emerald-900'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Input */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Estimated Recycled Weight (KG)
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  min="1"
                  max="5000"
                  placeholder="e.g. 70"
                  value={collectedKg}
                  onChange={(e) => setCollectedKg(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-gray-900"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-gray-400">KILOGRAMS</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                This weight updates your collector profile, community impact counter, and recycling stats.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Collection & Processing Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Picked, weighed, and sorted into bags for recycling."
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 text-sm active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify Pickup & Mark as Recycled</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
