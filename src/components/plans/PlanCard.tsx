"use client";

import { Plan } from "@/types";
import { Wifi, Zap, Calendar, Database } from "lucide-react";

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
}

export default function PlanCard({ plan, onSelect }: PlanCardProps) {
  const formattedPrice = `KES ${plan.price.toLocaleString()}`;

  const durationText =
    plan.duration === 30
      ? "month"
      : plan.duration === 90
        ? "quarter"
        : plan.duration === 365
          ? "year"
          : `${plan.duration} days`;

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-light-gray">
      {/* Popular tag */}
      {plan.price === 1000 && (
        <div className="absolute top-4 right-4 bg-pumpkin text-white text-xs font-bold px-3 py-1 rounded-full z-10">
          POPULAR
        </div>
      )}

      {/* Card header - Navy */}
      <div className="bg-navy p-6">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-white/80 text-sm">{plan.description}</p>
      </div>

      {/* Card body */}
      <div className="p-6">
        {/* Price */}
        <div className="mb-6">
          <span className="text-4xl font-bold text-pumpkin">
            {formattedPrice}
          </span>
          <span className="text-gray-500 ml-2">/{durationText}</span>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-700">
            <Zap className="w-5 h-5 text-pumpkin mr-3" />
            <span className="text-sm">
              Speed:{" "}
              <span className="font-semibold text-navy">{plan.speed}</span>
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <Calendar className="w-5 h-5 text-salad mr-3" />
            <span className="text-sm">
              Validity:{" "}
              <span className="font-semibold text-navy">
                {plan.duration} days
              </span>
            </span>
          </div>

          {plan.dataCap && (
            <div className="flex items-center text-gray-700">
              <Database className="w-5 h-5 text-bottle mr-3" />
              <span className="text-sm">
                Data:{" "}
                <span className="font-semibold text-navy">
                  {plan.dataCap} GB
                </span>
              </span>
            </div>
          )}

          {!plan.dataCap && (
            <div className="flex items-center text-gray-700">
              <Wifi className="w-5 h-5 text-salad mr-3" />
              <span className="text-sm font-semibold text-navy">
                Unlimited Data
              </span>
            </div>
          )}
        </div>

        {/* Select button */}
        <button
          onClick={() => onSelect(plan)}
          className="w-full bg-pumpkin text-white font-semibold py-3 rounded-xl hover:bg-pumpkin-light transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          Select Plan
        </button>
      </div>

      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-pumpkin via-salad to-pumpkin transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
    </div>
  );
}
