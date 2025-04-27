"use client";

export default function TestPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">TailwindCSS Test Page</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Regular Tailwind Classes</h2>
        <p className="text-gray-700 mb-2">This text should be styled with regular Tailwind classes.</p>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Button with Tailwind
        </button>
      </div>
      
      <div className="bg-[#1e3a8a] text-white p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Custom Theme Colors (As Hex)</h2>
        <p className="mb-2">This section uses direct hex colors instead of theme variables.</p>
        <div className="flex gap-2">
          <div className="w-24 h-24 bg-[#f1f5f9] text-[#1e293b] flex items-center justify-center">secondary</div>
          <div className="w-24 h-24 bg-[#f1f5f9] text-[#64748b] flex items-center justify-center">muted</div>
          <div className="w-24 h-24 bg-[#f1f5f9] text-[#1e293b] flex items-center justify-center">accent</div>
        </div>
      </div>
    </div>
  );
} 