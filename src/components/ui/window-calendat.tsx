// components/AppointmentModal.tsx
'use client';

import Cal from "@calcom/embed-react";

export default function AppointmentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  
  const calConfig = {
    layout: "month_view",
    theme: "dark", // schimbat la dark pentru a se potrivi cu modalul
    hideEventTypeDetails: false,
    styles: {
      branding: {
        brandColor: "#2563eb",
        lightColor: "#f1f5f9",
        lighterColor: "#f8fafc",
        lightestColor: "#ffffff",
        darkColor: "#1e293b",
        darkerColor: "#0f172a",
        darkestColor: "#020617"
      },
      enabledDateButton: {
        backgroundColor: "rgb(37 99 235)",
        borderColor: "rgb(37 99 235)",
        color: "white"
      },
      dateButton: {
        borderRadius: "0.5rem",
        border: "1px solid rgb(55 65 81)",
        backgroundColor: "rgb(31 41 55)",
        transition: "all 0.2s"
      },
      availableTimeButton: {
        backgroundColor: "rgb(31 41 55)",
        borderColor: "rgb(55 65 81)",
        borderRadius: "0.5rem",
        fontSize: "14px",
        fontWeight: "500",
        color: "rgb(229 231 235)"
      },
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay mai transparent */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content - mărit și îmbunătățit */}
      <div className="relative bg-[#2b3544] rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50 bg-[#323948]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Gestionare Programări</h2>
              <p className="text-sm text-gray-400">Vizualizează și sincronizează programările din Cal.com și baza de date</p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body cu calendar */}
        <div className="p-6 overflow-auto max-h-[calc(95vh-5rem)]">
          <Cal
            namespace="30min"
            calLink="dulgheru-ion-o4yu8j/smiletrace"
            style={{
              width: "100%",
              height: "700px",
              border: "none",
            }}
            className="rounded-lg overflow-hidden"
            config={calConfig as any}
          />
        </div>
      </div>
    </div>
  );
}