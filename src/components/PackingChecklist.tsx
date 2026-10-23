'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Square, ChevronDown, ChevronUp,
  RotateCcw, Sparkles, ShieldAlert, Thermometer, BatteryCharging, HeartPulse
} from 'lucide-react';

interface ChecklistCategory {
  id: string;
  title: string;
  icon: 'alpine' | 'docs' | 'gear' | 'med';
  items: { id: string; label: string; important?: boolean }[];
}

const CHECKLIST_DATA: ChecklistCategory[] = [
  {
    id: 'alpine',
    title: 'Alpine Essentials (Sub-Zero Protection)',
    icon: 'alpine',
    items: [
      { id: 'alp_jacket', label: 'Heavy fleece / Down feather winter jacket', important: true },
      { id: 'alp_thermals', label: 'Thermal upper & bottom inner wear (2 pairs)', important: true },
      { id: 'alp_shoes', label: 'Waterproof trekking or sturdy grip sports shoes', important: true },
      { id: 'alp_gloves', label: 'Insulated woolen caps (beanies) & waterproof gloves' },
      { id: 'alp_neck', label: 'Neck warmer / woolen muffler' },
      { id: 'alp_socks', label: 'Thick woolen socks (3–4 pairs)' },
    ],
  },
  {
    id: 'docs',
    title: 'Documents (Strict Gate Desk Check-in)',
    icon: 'docs',
    items: [
      { id: 'doc_college_id', label: 'Physical College / University Student ID Card', important: true },
      { id: 'doc_aadhaar', label: 'Original Aadhaar Card / Government Photo ID', important: true },
      { id: 'doc_ticket', label: 'Digital QR Boarding Pass (Saved offline on phone)', important: true },
    ],
  },
  {
    id: 'gear',
    title: 'Gear & Electronics',
    icon: 'gear',
    items: [
      { id: 'gear_powerbank', label: '20,000mAh Power Bank (Freezing mountain temps drain battery fast)', important: true },
      { id: 'gear_charger', label: 'Fast charger & USB cables (Bus USB ports available)' },
      { id: 'gear_sunglasses', label: 'UV Sunglasses (Essential for snow glare protection in Solang Valley)', important: true },
      { id: 'gear_thermos', label: 'Personal insulated thermos flask / hot water bottle' },
      { id: 'gear_bag', label: 'Small 10–20L daypack for daytime valley explorations' },
    ],
  },
  {
    id: 'med',
    title: 'Medical & Toiletries',
    icon: 'med',
    items: [
      { id: 'med_motion', label: 'Motion sickness / AMS tablets (Avomine / Ondem for winding ghats)', important: true },
      { id: 'med_coldcream', label: 'Moisturizing cold cream, lip balm & sunscreen' },
      { id: 'med_bandaids', label: 'Personal first aid (Band-aids, Paracetamol, Pain spray)' },
      { id: 'med_rx', label: 'Personal prescription medicines' },
    ],
  },
];

const STORAGE_KEY = 'himalayan_packing_checklist';

export default function PackingChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    alpine: true,
    docs: true,
    gear: true,
    med: true,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  const toggleItem = (itemId: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const resetAll = () => {
    if (confirm('Are you sure you want to reset your packing checklist?')) {
      setCheckedItems({});
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  };

  // Calculate percentage
  const totalItems = CHECKLIST_DATA.reduce((sum, cat) => sum + cat.items.length, 0);
  const packedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((packedCount / totalItems) * 100);

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const renderIcon = (type: ChecklistCategory['icon']) => {
    switch (type) {
      case 'alpine':
        return <Thermometer className="w-4 h-4 text-cyan-700 shrink-0" />;
      case 'docs':
        return <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'gear':
        return <BatteryCharging className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'med':
      default:
        return <HeartPulse className="w-4 h-4 text-emerald-700 shrink-0" />;
    }
  };

  return (
    <details className="group rounded-2xl border border-[#D8D2C4] bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 transition hover:bg-[#F7F5EF] [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-sm font-bold text-[#171918]">Quick packing checklist</span>
          <span className="mt-1 block text-xs text-[#646864]">Optional mountain-trip essentials · {totalItems} items</span>
        </span>
        <span className="shrink-0 rounded-full bg-[#edf3ef] px-3 py-1.5 text-xs font-bold text-[#163C32] group-open:hidden">Open list</span>
        <span className="hidden shrink-0 rounded-full bg-[#edf3ef] px-3 py-1.5 text-xs font-bold text-[#163C32] group-open:inline">Close list</span>
      </summary>
      <div className="px-4 pb-4 sm:px-5">
    <div className="space-y-4 rounded-xl bg-[#F7F5EF] p-4">
      {/* Header with Live Progress Indicator */}
      <div className="flex flex-col justify-between gap-3 border-b border-[#E7E2D8] pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#171918]">
              Your list
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#646864]">
            Tick items as you pack. Progress saves in this browser.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-[#646864] uppercase font-mono block">
              PACKING READINESS
            </span>
            <span
              className={`text-lg font-black font-mono ${
                progressPercent === 100
                  ? 'text-emerald-600'
                  : progressPercent > 50
                  ? 'text-amber-600'
                  : 'text-[#163C32]'
              }`}
            >
              {progressPercent}% Packed
            </span>
            <span className="text-[11px] text-[#646864] ml-1 font-mono">
              ({packedCount}/{totalItems})
            </span>
          </div>

          <button
            type="button"
            onClick={resetAll}
            title="Reset Checklist"
            className="p-2 rounded-xl border border-[#D8D2C4] text-[#646864] hover:text-[#171918] hover:bg-[#F7F5EF] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E7E2D8] h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#163C32] via-emerald-500 to-amber-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {CHECKLIST_DATA.map((category) => {
          const isCollapsed = collapsedCategories[category.id];
          const catPacked = category.items.filter((item) => checkedItems[item.id]).length;

          return (
            <div
              key={category.id}
              className="overflow-hidden rounded-xl border border-[#E7E2D8] bg-white transition-all"
            >
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="flex w-full cursor-pointer select-none items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-[#F7F5EF]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#D8D2C4] flex items-center justify-center shrink-0 shadow-xs">
                    {renderIcon(category.icon)}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#171918]">
                    {category.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold font-mono text-[#646864] bg-white px-2 py-0.5 rounded-full border border-[#D8D2C4]">
                    {catPacked}/{category.items.length}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-[#646864]" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-[#646864]" />
                  )}
                </div>
              </button>

              {/* Items List */}
              {!isCollapsed && (
                <div className="p-4 pt-1 space-y-2 border-t border-[#E7E2D8] bg-white">
                  {category.items.map((item) => {
                    const isChecked = !!checkedItems[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`p-2.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-50/60 border-emerald-200 text-stone-500'
                            : 'bg-white border-[#D8D2C4] hover:border-[#163C32] text-[#171918]'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-400" />
                          )}
                        </div>

                        <div className="flex-1 text-xs">
                          <span className={isChecked ? 'line-through opacity-75' : 'font-medium'}>
                            {item.label}
                          </span>
                          {item.important && !isChecked && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 font-mono">
                              MANDATORY
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
      </div>
    </details>
  );
}
