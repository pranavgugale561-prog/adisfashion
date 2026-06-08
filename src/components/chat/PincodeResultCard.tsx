'use client';

import { MapPin, CheckCircle, XCircle, Truck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

interface PincodeData {
  pincode: string;
  available: boolean;
  courier?: string;
  days?: number;
  cod?: boolean;
}

export default function PincodeResultCard({ data }: { data: PincodeData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden w-full"
    >
      <div className={`px-3 py-2.5 flex items-center gap-2 ${data.available ? 'bg-green-50' : 'bg-red-50'}`}>
        {data.available
          ? <CheckCircle size={14} className="text-green-600" />
          : <XCircle size={14} className="text-red-500" />
        }
        <span className={`text-xs font-bold ${data.available ? 'text-green-700' : 'text-red-600'}`}>
          Pincode {data.pincode} — {data.available ? 'Delivery Available' : 'Not Serviceable'}
        </span>
      </div>

      {data.available && (
        <div className="px-3 py-2.5 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center text-center">
            <Truck size={14} className="text-gray-500 mb-1" />
            <p className="text-[9px] text-gray-400 uppercase">Courier</p>
            <p className="text-[11px] font-bold text-gray-800">{data.courier}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center mb-1">
              <span className="text-[8px] text-[#FFE600] font-black">{data.days}</span>
            </div>
            <p className="text-[9px] text-gray-400 uppercase">Days</p>
            <p className="text-[11px] font-bold text-gray-800">{data.days}–{(data.days ?? 0) + 1} days</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <CreditCard size={14} className="text-gray-500 mb-1" />
            <p className="text-[9px] text-gray-400 uppercase">COD</p>
            <p className={`text-[11px] font-bold ${data.cod ? 'text-green-600' : 'text-red-500'}`}>
              {data.cod ? 'Available' : 'Not Available'}
            </p>
          </div>
        </div>
      )}

      <div className="px-3 py-1.5 border-t border-gray-100">
        <p className="text-[9px] text-gray-400 flex items-center gap-1">
          <MapPin size={8} /> Free shipping on orders ₹999+
        </p>
      </div>
    </motion.div>
  );
}
