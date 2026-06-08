'use client';

import { Ruler } from 'lucide-react';

const SIZE_GUIDE = [
  { size: 'S',   chest: '36"', length: '27"', shoulder: '16.5"' },
  { size: 'M',   chest: '38"', length: '28"', shoulder: '17.5"' },
  { size: 'L',   chest: '40"', length: '29"', shoulder: '18.5"' },
  { size: 'XL',  chest: '42"', length: '30"', shoulder: '19.5"' },
  { size: 'XXL', chest: '44"', length: '31"', shoulder: '20.5"' },
];

export default function SizeGuideCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden w-full">
      <div className="bg-black px-3 py-2.5 flex items-center gap-2">
        <Ruler size={14} className="text-[#FFE600]" />
        <span className="text-white text-xs font-bold">Size Guide (in inches)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-2 py-1.5 text-left font-bold text-gray-700">Size</th>
              <th className="px-2 py-1.5 text-center font-bold text-gray-700">Chest</th>
              <th className="px-2 py-1.5 text-center font-bold text-gray-700">Length</th>
              <th className="px-2 py-1.5 text-center font-bold text-gray-700">Shoulder</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {SIZE_GUIDE.map(row => (
              <tr key={row.size} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-1.5 font-black text-black">{row.size}</td>
                <td className="px-2 py-1.5 text-center text-gray-600">{row.chest}</td>
                <td className="px-2 py-1.5 text-center text-gray-600">{row.length}</td>
                <td className="px-2 py-1.5 text-center text-gray-600">{row.shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-3 py-2 bg-[#FFE600]/10 border-t border-[#FFE600]/20">
        <p className="text-[9px] text-gray-600">💡 Oversized fits run 1 size larger. When in doubt, size down.</p>
      </div>
    </div>
  );
}
