'use client';

export default function AdminPage() {
  return (
    <div className="w-full h-screen">
      <iframe 
        src="/admin-dashboard.html" 
        className="w-full h-full border-0"
        title="Admin Dashboard"
      />
    </div>
  );
}
