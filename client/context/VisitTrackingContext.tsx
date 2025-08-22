import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type VisitType = "Ask" | "Service" | "Sales";

export type VisitStatus = "Active" | "Overdue" | "Completed";

export interface VisitRecord {
  id: string;
  customerId?: string;
  customerName: string;
  visitType: VisitType;
  service?: string;
  arrivedAt: string; // ISO 8601
  expectedLeaveAt?: string; // ISO 8601
  leftAt?: string; // ISO 8601
  status: VisitStatus;
  location?: string;
  notes?: string;
  // Optional details when visitType is "Sales"
  salesDetails?: {
    itemType?: string;
    quantity?: number;
    pricePerItem?: number;
    amount?: number;
    salesperson?: {
      id?: string;
      name?: string;
    };
  };
}

export interface VisitAlert {
  id: string; // visit id
  customerName: string;
  visitType: VisitType;
  service?: string;
  severity: "info" | "warning" | "danger";
  message: string;
  expectedLeaveAt?: string;
  arrivedAt: string;
}

// Baseline SLAs (in minutes)
const DEFAULT_SLA_MINUTES = 90; // default for generic service
const VISIT_TYPE_SLA_MINUTES: Record<VisitType, number> = {
  Ask: 30,
  Service: DEFAULT_SLA_MINUTES,
  Sales: 45,
};

const SERVICE_SLA_MINUTES: Record<string, number> = {
  "Oil Change": 60,
  "Tire Installation": 90,
  "Tire Sales": 30,
  "Engine Repair": 240,
  "Brake Service": 120,
  "Transmission Service": 360,
  "AC Service": 90,
  "Battery Service": 30,
  "Consultation": 30,
  "Fleet Maintenance": 240,
};

function addMinutes(iso: string, minutes: number): string {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}

function isValidISO(iso?: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  return !isNaN(d.getTime());
}

function nowISO() {
  return new Date().toISOString();
}

function toLocalISOString(date: Date) {
  // Keep timezone local for input type="datetime-local" compatibility
  const pad = (n: number) => `${n}`.padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${y}-${m}-${d}T${h}:${min}`;
}

export interface VisitTrackingContextValue {
  visits: VisitRecord[];
  activeVisits: VisitRecord[];
  overdueVisits: VisitRecord[];
  alerts: VisitAlert[];
  addVisit: (payload: {
    customerId?: string;
    customerName: string;
    visitType: VisitType;
    service?: string;
    arrivedAt?: string; // ISO or local datetime
    expectedLeaveAt?: string; // ISO or local datetime
    location?: string;
    notes?: string;
    salesDetails?: VisitRecord["salesDetails"];
  }) => VisitRecord;
  markLeft: (visitId: string, leftAt?: string) => void;
  updateExpectedLeave: (visitId: string, expectedLeaveAt: string | { addMinutes: number }) => void;
  estimateExpectedLeave: (visitType: VisitType, service: string | undefined, arrivedAtISO: string) => string;
}

const VisitTrackingContext = createContext<VisitTrackingContextValue | null>(null);

export const useVisitTracking = () => {
  const ctx = useContext(VisitTrackingContext);
  if (!ctx) throw new Error("useVisitTracking must be used within VisitTrackingProvider");
  return ctx;
};

export const VisitTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [, forceTick] = useState(0);
  const tickRef = useRef<number | null>(null);

  const estimateExpectedLeave = useCallback(
    (visitType: VisitType, service: string | undefined, arrivedAtISO: string) => {
      let minutes: number;
      if (visitType === "Service") {
        minutes = service && SERVICE_SLA_MINUTES[service] !== undefined ? SERVICE_SLA_MINUTES[service] : DEFAULT_SLA_MINUTES;
      } else {
        minutes = VISIT_TYPE_SLA_MINUTES[visitType];
      }
      return addMinutes(arrivedAtISO, minutes);
    },
    [],
  );

  const recomputeStatus = useCallback((v: VisitRecord): VisitRecord => {
    if (v.leftAt) return { ...v, status: "Completed" };
    if (v.expectedLeaveAt && new Date().toISOString() > v.expectedLeaveAt) {
      return { ...v, status: "Overdue" };
    }
    return { ...v, status: "Active" };
  }, []);

  const addVisit: VisitTrackingContextValue["addVisit"] = useCallback(
    ({ customerId, customerName, visitType, service, arrivedAt, expectedLeaveAt, location, notes, salesDetails }) => {
      const arrivedAtISO = arrivedAt
        ? new Date(arrivedAt).toISOString()
        : nowISO();
      const expected = expectedLeaveAt
        ? new Date(expectedLeaveAt).toISOString()
        : estimateExpectedLeave(visitType, service, arrivedAtISO);

      const newVisit: VisitRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        customerId,
        customerName,
        visitType,
        service,
        arrivedAt: arrivedAtISO,
        expectedLeaveAt: expected,
        leftAt: undefined,
        status: "Active",
        location,
        notes,
        salesDetails,
      };
      setVisits((prev) => [recomputeStatus(newVisit), ...prev]);
      return newVisit;
    },
    [estimateExpectedLeave, recomputeStatus],
  );

  const markLeft: VisitTrackingContextValue["markLeft"] = useCallback((visitId, leftAt) => {
    const leftISO = leftAt ? new Date(leftAt).toISOString() : nowISO();
    setVisits((prev) => prev.map((v) => (v.id === visitId ? recomputeStatus({ ...v, leftAt: leftISO }) : v)));
  }, [recomputeStatus]);

  const updateExpectedLeave: VisitTrackingContextValue["updateExpectedLeave"] = useCallback((visitId, next) => {
    setVisits((prev) =>
      prev.map((v) => {
        if (v.id !== visitId) return v;
        let expectedISO: string | undefined;
        if (typeof next === "string") {
          expectedISO = new Date(next).toISOString();
        } else if (next && typeof next === "object" && typeof next.addMinutes === "number") {
          const base = v.expectedLeaveAt ?? v.arrivedAt;
          expectedISO = addMinutes(base, next.addMinutes);
        }
        return recomputeStatus({ ...v, expectedLeaveAt: expectedISO });
      }),
    );
  }, [recomputeStatus]);

  // Derived collections
  const activeVisits = useMemo(() => visits.filter((v) => v.status === "Active"), [visits]);
  const overdueVisits = useMemo(() => visits.filter((v) => v.status === "Overdue"), [visits]);

  const alerts = useMemo<VisitAlert[]>(() => {
    const now = new Date();
    return visits
      .filter((v) => !v.leftAt)
      .map((v) => {
        const expected = v.expectedLeaveAt ? new Date(v.expectedLeaveAt) : null;
        if (!expected) {
        return {
        id: v.id,
        customerName: v.customerName,
        visitType: v.visitType,
        service: v.service,
        severity: "info",
        message: `No expected leave time set for ${v.customerName}`,
        expectedLeaveAt: v.expectedLeaveAt,
        arrivedAt: v.arrivedAt,
        } as VisitAlert;
        }
        const msLeft = expected.getTime() - now.getTime();
        const tenMin = 10 * 60 * 1000;
        if (msLeft <= 0) {
        return {
        id: v.id,
        customerName: v.customerName,
        visitType: v.visitType,
        service: v.service,
        severity: "danger",
        message: `${v.customerName} is overdue to leave (expected ${expected.toLocaleTimeString()})`,
        expectedLeaveAt: v.expectedLeaveAt,
        arrivedAt: v.arrivedAt,
        } as VisitAlert;
        } else if (msLeft <= tenMin) {
        return {
        id: v.id,
        customerName: v.customerName,
        visitType: v.visitType,
        service: v.service,
        severity: "warning",
        message: `${v.customerName} should leave soon (in ${Math.ceil(msLeft / 60000)} min)` ,
        expectedLeaveAt: v.expectedLeaveAt,
        arrivedAt: v.arrivedAt,
        } as VisitAlert;
        }
        return null;
      })
      .filter((a): a is VisitAlert => a !== null);
  }, [visits]);

  // Heartbeat to refresh statuses
  useEffect(() => {
    tickRef.current = window.setInterval(() => {
      // Recompute statuses and force re-render
      setVisits((prev) => prev.map(recomputeStatus));
      forceTick((x) => x + 1);
    }, 60 * 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [recomputeStatus]);

  const value: VisitTrackingContextValue = useMemo(
    () => ({
      visits,
      activeVisits,
      overdueVisits,
      alerts,
      addVisit,
      markLeft,
      updateExpectedLeave,
      estimateExpectedLeave,
    }),
    [visits, activeVisits, overdueVisits, alerts, addVisit, markLeft, updateExpectedLeave, estimateExpectedLeave],
  );

  return <VisitTrackingContext.Provider value={value}>{children}</VisitTrackingContext.Provider>;
};
