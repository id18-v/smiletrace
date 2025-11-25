"use client"

import Cal from "@calcom/embed-react";

export default function CalPage() {
  // Workaround: library types don't include boolean and nested style objects yet
  const calConfig = {
    layout: "month_view",
    theme: "auto", // se adaptează la tema curentă
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
        border: "1px solid rgb(229 231 235)",
        backgroundColor: "white",
        transition: "all 0.2s"
      },
      availableTimeButton: {
        backgroundColor: "rgb(248 250 252)", // slate-50
        borderColor: "rgb(226 232 240)",     // slate-200
        borderRadius: "0.5rem",
        fontSize: "14px",
        fontWeight: "500",
        color: "rgb(51 65 85)"               // slate-700
      },
     
    }
  };

  return (
    <div className="space-y-8">
        <div className="bg-white dark:bg-[#101727] rounded-xl shadow-sm dark:shadow-lg p-6">
        <Cal
          namespace="30min"
          calLink="dulgheru-ion-o4yu8j/smiletrace"
          style={{
            width: "100%",
            height: "800px", // înălțime fixă mai mică
            border: "",
          }}
          className="border-4 "
          // Cast to any to satisfy current type limitations in @calcom/embed-react
          config={calConfig as any}
        />

        {/* Loading Overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 opacity-0 pointer-events-none transition-opacity duration-300"
          id="cal-loading"
        >
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Se încarcă calendarul...
            </span>
          </div>
        </div>
      </div>

     

      
        </div>
      
    
  );
}