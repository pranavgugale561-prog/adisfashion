'use client';

import { Package, CheckCircle, Clock, Truck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineStep {
  status: string;
  time: string;
  done: boolean;
}

interface OrderCardData {
  orderId: string;
  status: string;
  items?: number;
  total?: number;
  payment?: string;
  address?: string;
  timeline?: TimelineStep[];
  estimatedDelivery?: string;
}

interface OrderCardProps {
  data: OrderCardData;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  Confirmed:          { color: 'text-blue-700',   bg: 'bg-blue-100',   label: 'Order Confirmed' },
  Processing:         { color: 'text-yellow-700',  bg: 'bg-yellow-100', label: 'Processing' },
  Packed:             { color: 'text-purple-700',  bg: 'bg-purple-100', label: 'Packed' },
  Shipped:            { color: 'text-orange-700',  bg: 'bg-orange-100', label: 'Shipped' },
  'Out for Delivery': { color: 'text-orange-700',  bg: 'bg-orange-100', label: 'Out for Delivery' },
  Delivered:          { color: 'text-green-700',   bg: 'bg-green-100',  label: 'Delivered' },
  Cancelled:          { color: 'text-red-700',     bg: 'bg-red-100',    label: 'Cancelled' },
};

export default function OrderCard({ data }: OrderCardProps) {
  const statusCfg = STATUS_CONFIG[data.status] ?? { color: 'text-gray-700', bg: 'bg-gray-100', label: data.status };

  const defaultTimeline: TimelineStep[] = [
    { status: 'Order Confirmed', time: 'Just now', done: true },
    { status: 'Packed & Ready', time: 'Processing', done: false },
    { status: 'Shipped', time: 'Pending', done: false },
    { status: 'Out for Delivery', time: 'Pending', done: false },
    { status: 'Delivered', time: 'Estimated 3-5 days', done: false },
  ];

  const timeline = data.timeline ?? defaultTimeline;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden w-full"
    >
      {/* Header */}
      <div className="bg-black px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package size={14} className="text-[#FFE600]" />
          <span className="text-white text-xs font-bold">#{data.orderId}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
      </div>

      {/* Summary */}
      {(data.items !== undefined || data.payment || data.address) && (
        <div className="px-3 py-2 border-b border-gray-100 grid grid-cols-2 gap-1.5">
          {data.items !== undefined && (
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wide">Items</p>
              <p className="text-xs font-semibold text-gray-800">{data.items} item(s)</p>
            </div>
          )}
          {data.payment && (
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-wide">Payment</p>
              <p className="text-xs font-semibold text-gray-800">{data.payment}</p>
            </div>
          )}
          {data.address && (
            <div className="col-span-2">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <MapPin size={8} /> Address
              </p>
              <p className="text-xs font-semibold text-gray-800 line-clamp-1">{data.address}</p>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="px-3 py-2.5 space-y-0">
        {timeline.map((step, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.done ? 'bg-black' : 'bg-gray-100 border border-gray-200'
              }`}>
                {step.done ? (
                  <CheckCircle size={11} className="text-[#FFE600]" />
                ) : (
                  <Clock size={10} className="text-gray-400" />
                )}
              </div>
              {i < timeline.length - 1 && (
                <div className={`w-0.5 h-4 mt-0.5 ${step.done ? 'bg-black' : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-3">
              <p className={`text-[11px] font-semibold leading-tight ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.status}
              </p>
              <p className="text-[9px] text-gray-400 mt-0.5">{step.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Estimated delivery */}
      {data.estimatedDelivery && (
        <div className="px-3 py-2 bg-[#FFE600]/10 border-t border-[#FFE600]/30 flex items-center gap-1.5">
          <Truck size={11} className="text-black" />
          <span className="text-[10px] font-semibold text-gray-800">
            Expected: <span className="text-black font-black">{data.estimatedDelivery}</span>
          </span>
        </div>
      )}
    </motion.div>
  );
}
