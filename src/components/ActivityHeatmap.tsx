import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { SolvingRecord, Reflection, DailyQueueItem } from '../types';
import { getLocalDateKey, formatReadableDate } from '../utils/dateUtils';

interface ActivityHeatmapProps {
  solvingRecords: SolvingRecord[];
  reflections: Reflection[];
  dailyQueue: DailyQueueItem[];
}

interface DayData {
  dateKey: string;
  dateObj: Date;
  count: number;
  scheduledCount: number;
  revisionCount: number;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ...
  isToday: boolean;
  isInCurrentMonth?: boolean;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  solvingRecords,
  reflections,
  dailyQueue,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const currentRealYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentRealYear);

  // Calculate daily solved counts mapped by dateKey (YYYY-MM-DD in local time)
  const dailyMap = useMemo(() => {
    const map = new Map<string, { total: number; scheduled: number; revision: number }>();

    const getOrCreate = (key: string) => {
      if (!map.has(key)) {
        map.set(key, { total: 0, scheduled: 0, revision: 0 });
      }
      return map.get(key)!;
    };

    const processedRecordKeys = new Set<string>();

    // 1. Process solvingRecords
    solvingRecords.forEach((rec) => {
      if (!rec.completedAt) return;
      const dKey = getLocalDateKey(rec.completedAt);
      const entry = getOrCreate(dKey);
      const uniqueId = `${dKey}-${rec.problemId}-${rec.source || 'solve'}`;

      if (!processedRecordKeys.has(uniqueId)) {
        processedRecordKeys.add(uniqueId);
        entry.total += 1;
        if (rec.source === 'revision' || rec.isRevision) {
          entry.revision += 1;
        } else {
          entry.scheduled += 1;
        }
      }
    });

    // 2. Process reflections
    reflections.forEach((ref) => {
      if (!ref.timestamp) return;
      const dKey = getLocalDateKey(ref.timestamp);
      const entry = getOrCreate(dKey);
      const uniqueIdRef = `${dKey}-${ref.problemId}-reflection`;
      const uniqueIdSolv = `${dKey}-${ref.problemId}-manual`;
      const uniqueIdGen = `${dKey}-${ref.problemId}-solve`;

      if (
        !processedRecordKeys.has(uniqueIdRef) &&
        !processedRecordKeys.has(uniqueIdSolv) &&
        !processedRecordKeys.has(uniqueIdGen)
      ) {
        processedRecordKeys.add(uniqueIdRef);
        entry.total += 1;
        entry.scheduled += 1;
      }
    });

    // 3. Process completed dailyQueue items
    dailyQueue.forEach((item) => {
      if (item.status === 'completed' && item.dateKey) {
        const dKey = item.dateKey;
        const entry = getOrCreate(dKey);
        const uniqueIdDQ = `${dKey}-${item.problemId}-queue`;
        const uniqueIdSolv = `${dKey}-${item.problemId}-manual`;
        const uniqueIdRev = `${dKey}-${item.problemId}-revision`;
        const uniqueIdGen = `${dKey}-${item.problemId}-solve`;
        const uniqueIdRef = `${dKey}-${item.problemId}-reflection`;

        if (
          !processedRecordKeys.has(uniqueIdDQ) &&
          !processedRecordKeys.has(uniqueIdSolv) &&
          !processedRecordKeys.has(uniqueIdRev) &&
          !processedRecordKeys.has(uniqueIdGen) &&
          !processedRecordKeys.has(uniqueIdRef)
        ) {
          processedRecordKeys.add(uniqueIdDQ);
          entry.total += 1;
          if (item.isRevision) {
            entry.revision += 1;
          } else {
            entry.scheduled += 1;
          }
        }
      }
    });

    return map;
  }, [solvingRecords, reflections, dailyQueue]);

  // Compute list of available years for dropdown
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentRealYear);
    yearsSet.add(currentRealYear - 1);
    yearsSet.add(currentRealYear - 2);

    dailyMap.forEach((_, key) => {
      const year = parseInt(key.split('-')[0], 10);
      if (!isNaN(year)) yearsSet.add(year);
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [dailyMap, currentRealYear]);

  // Color mapping logic for LeetCode style
  const getCellColor = (count: number, isToday: boolean) => {
    if (count === 0) {
      return isToday
        ? 'bg-zinc-800 border-amber-500/80 ring-1 ring-amber-400'
        : 'bg-zinc-950 border-zinc-800/80';
    }
    if (count === 1) return 'bg-emerald-950 border-emerald-800 text-emerald-300';
    if (count === 2) return 'bg-emerald-800 border-emerald-700 text-emerald-200';
    if (count <= 4) return 'bg-emerald-600 border-emerald-500 text-white';
    return 'bg-emerald-400 border-emerald-300 text-zinc-950 font-bold';
  };

  const formatTooltipDate = (dObj: Date) => {
    return formatReadableDate(dObj);
  };

  // --- COLLAPSED VIEW: Current Month Data ---
  const currentMonthData = useMemo(() => {
    const now = new Date();
    const todayKeyStr = getLocalDateKey(now);
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    // First and last date of current month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Grid start: Sunday on or before 1st of month
    const gridStart = new Date(firstDayOfMonth);
    gridStart.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());

    // Grid end: Saturday on or after last day of month
    const gridEnd = new Date(lastDayOfMonth);
    gridEnd.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

    const days: DayData[] = [];
    let curr = new Date(gridStart);

    let totalMonthSolved = 0;
    let activeMonthDays = 0;

    while (curr <= gridEnd) {
      const dateKey = getLocalDateKey(curr);

      const isInCurrentMonth = curr.getMonth() === month && curr.getFullYear() === year;
      const counts = dailyMap.get(dateKey) || { total: 0, scheduled: 0, revision: 0 };

      if (isInCurrentMonth) {
        totalMonthSolved += counts.total;
        if (counts.total > 0) activeMonthDays += 1;
      }

      days.push({
        dateKey,
        dateObj: new Date(curr),
        count: counts.total,
        scheduledCount: counts.scheduled,
        revisionCount: counts.revision,
        dayOfWeek: curr.getDay(),
        isToday: dateKey === todayKeyStr,
        isInCurrentMonth,
      });

      curr.setDate(curr.getDate() + 1);
    }

    // Group into 7-day week columns
    const weeks: DayData[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return {
      monthName,
      weeks,
      days,
      totalMonthSolved,
      activeMonthDays,
    };
  }, [dailyMap]);

  // --- EXPANDED VIEW: Selected Year Full Heatmap Data ---
  const expandedYearData = useMemo(() => {
    const todayKeyStr = getLocalDateKey(new Date());

    // Jan 1 of selected year
    const startDate = new Date(selectedYear, 0, 1);
    // Align to Sunday on or before Jan 1
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Dec 31 of selected year
    const endDate = new Date(selectedYear, 11, 31);
    // Align to Saturday on or after Dec 31
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days: DayData[] = [];
    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    let curr = new Date(startDate);
    let weekIdx = 0;
    let dayInWeekCount = 0;

    let totalYearSolved = 0;
    let activeYearDays = 0;

    while (curr <= endDate) {
      const dateKey = getLocalDateKey(curr);

      const isInYear = curr.getFullYear() === selectedYear;
      const counts = dailyMap.get(dateKey) || { total: 0, scheduled: 0, revision: 0 };

      if (isInYear) {
        totalYearSolved += counts.total;
        if (counts.total > 0) activeYearDays += 1;
      }

      // Track month labels
      const monthNum = curr.getMonth();
      if (monthNum !== lastMonth && isInYear) {
        months.push({
          label: curr.toLocaleString('default', { month: 'short' }),
          weekIndex: weekIdx,
        });
        lastMonth = monthNum;
      }

      days.push({
        dateKey,
        dateObj: new Date(curr),
        count: counts.total,
        scheduledCount: counts.scheduled,
        revisionCount: counts.revision,
        dayOfWeek: curr.getDay(),
        isToday: dateKey === todayKeyStr,
        isInCurrentMonth: isInYear,
      });

      dayInWeekCount++;
      if (dayInWeekCount === 7) {
        weekIdx++;
        dayInWeekCount = 0;
      }

      curr.setDate(curr.getDate() + 1);
    }

    // Group into 7-day week columns
    const weeks: DayData[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return {
      weeks,
      monthLabels: months,
      totalYearSolved,
      activeYearDays,
    };
  }, [dailyMap, selectedYear]);

  // If COLLAPSED, render a compact, elegant inline widget
  if (!isExpanded) {
    return (
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        {/* Left: Section Info & Inline Month Squares */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="space-y-0.5 shrink-0">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-zinc-100 text-sm">Practice Activity</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                {currentMonthData.monthName}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              <strong>{currentMonthData.totalMonthSolved}</strong> solved ({currentMonthData.activeMonthDays} active days)
            </p>
          </div>

          {/* Inline Compact Month Grid */}
          <div className="flex items-center space-x-1.5 sm:pl-4 sm:border-l sm:border-zinc-800">
            <div className="grid grid-rows-7 gap-0.5 text-[9px] font-mono text-zinc-500 pr-1 select-none">
              <span className="h-2.5 leading-none">S</span>
              <span className="h-2.5 leading-none">M</span>
              <span className="h-2.5 leading-none">T</span>
              <span className="h-2.5 leading-none">W</span>
              <span className="h-2.5 leading-none">T</span>
              <span className="h-2.5 leading-none">F</span>
              <span className="h-2.5 leading-none">S</span>
            </div>
            <div className="flex space-x-1">
              {currentMonthData.weeks.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-rows-7 gap-0.5">
                  {week.map((day) => {
                    const colorClass = day.isInCurrentMonth
                      ? getCellColor(day.count, day.isToday)
                      : 'bg-zinc-950/30 border-zinc-900 opacity-20';

                    return (
                      <div
                        key={day.dateKey}
                        className={`w-3 h-3 rounded-[2px] border ${colorClass} transition-all relative group ${
                          day.isInCurrentMonth ? 'cursor-pointer' : 'cursor-default'
                        }`}
                      >
                        {day.isInCurrentMonth && (
                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-30 w-max">
                            <div className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-[10px] font-mono px-2 py-1 rounded shadow-xl space-y-0.5">
                              <div className="font-bold text-amber-300">
                                {formatTooltipDate(day.dateObj)}
                              </div>
                              <div>
                                {day.count === 0 ? (
                                  <span className="text-zinc-500">No solved problems</span>
                                ) : (
                                  <span>
                                    <strong>{day.count}</strong> {day.count === 1 ? 'problem' : 'problems'} solved
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-1.5 h-1.5 bg-zinc-950 border-r border-b border-zinc-700 rotate-45 -mt-0.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Expand Button & Legend */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <div className="hidden lg:flex items-center space-x-1 text-[10px] font-mono text-zinc-500 pr-2">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-[2px] bg-zinc-950 border border-zinc-800" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950 border border-emerald-800" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 border border-emerald-500" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-300" />
            <span>More</span>
          </div>

          <button
            onClick={() => setIsExpanded(true)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Expand Full Heatmap</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>
    );
  }

  // --- EXPANDED VIEW (Full Selected Year Heatmap Grid) ---
  return (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-5 transition-all">
      {/* Expanded Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
              <span>LeetCode Practice Activity Heatmap</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Year {selectedYear}
              </span>
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            Showing complete activity grid and problem solving consistency for {selectedYear}.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Summary Badges */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-200 font-bold">
                {expandedYearData.totalYearSolved} Solved
              </span>
            </div>
          </div>

          {/* Year Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-zinc-400 font-mono">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-amber-300 font-mono font-bold text-xs focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-zinc-900 text-zinc-100">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
          >
            <span>Collapse View</span>
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Expanded Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
          <span className="font-bold text-amber-300">
            {selectedYear} Yearly Activity Grid
          </span>
          <span>
            {expandedYearData.totalYearSolved} problems solved across {expandedYearData.activeYearDays} active days in {selectedYear}
          </span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px]">
            {/* Months Row */}
            <div className="flex text-[10px] font-mono text-zinc-400 mb-2 pl-8 relative h-4">
              {expandedYearData.monthLabels.map((m, idx) => (
                <span
                  key={idx}
                  className="absolute text-zinc-400 font-semibold"
                  style={{ left: `${m.weekIndex * 15 + 32}px` }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            {/* Grid Row */}
            <div className="flex items-start space-x-1.5">
              {/* Day of Week Labels */}
              <div className="grid grid-rows-7 gap-1 text-[10px] font-mono text-zinc-500 pr-2 pt-0.5 select-none">
                <span className="h-3.5 leading-none">Sun</span>
                <span className="h-3.5 leading-none">Mon</span>
                <span className="h-3.5 leading-none">Tue</span>
                <span className="h-3.5 leading-none">Wed</span>
                <span className="h-3.5 leading-none">Thu</span>
                <span className="h-3.5 leading-none">Fri</span>
                <span className="h-3.5 leading-none">Sat</span>
              </div>

              {/* Weeks Columns */}
              <div className="flex space-x-1">
                {expandedYearData.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-rows-7 gap-1">
                    {week.map((day) => {
                      const colorClass = getCellColor(day.count, day.isToday);
                      return (
                        <div
                          key={day.dateKey}
                          className={`w-3.5 h-3.5 rounded-[3px] border ${colorClass} transition-all duration-150 cursor-pointer relative group`}
                        >
                          {/* Tooltip on Hover */}
                          <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-30 w-max max-w-[200px]">
                            <div className="bg-zinc-950 border border-zinc-700 text-zinc-100 text-[11px] font-mono px-3 py-1.5 rounded-lg shadow-2xl space-y-0.5">
                              <div className="font-bold text-amber-300">
                                {formatTooltipDate(day.dateObj)}
                              </div>
                              <div className="text-zinc-200">
                                {day.count === 0 ? (
                                  <span className="text-zinc-500">No problems solved</span>
                                ) : (
                                  <span>
                                    <strong>{day.count}</strong> {day.count === 1 ? 'problem' : 'problems'} solved
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="w-2 h-2 bg-zinc-950 border-r border-b border-zinc-700 rotate-45 -mt-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3 pt-2 border-t border-zinc-800/60">
        <div className="flex items-center space-x-2 text-[11px]">
          <Info className="w-3.5 h-3.5 text-zinc-500" />
          <span>
            Hover over any day square to see the number of problems solved on that date.
          </span>
        </div>

        {/* LeetCode Color Legend */}
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="text-zinc-500">Less</span>
          <div className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-[2px] bg-zinc-950 border border-zinc-800" title="0 solved" />
            <span className="w-3 h-3 rounded-[2px] bg-emerald-950 border border-emerald-800" title="1 solved" />
            <span className="w-3 h-3 rounded-[2px] bg-emerald-800 border border-emerald-700" title="2 solved" />
            <span className="w-3 h-3 rounded-[2px] bg-emerald-600 border border-emerald-500" title="3-4 solved" />
            <span className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-300" title="5+ solved" />
          </div>
          <span className="text-zinc-500">More</span>
        </div>
      </div>
    </div>
  );
};
