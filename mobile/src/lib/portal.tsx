import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from './api';

// Mirrors GET /api/v1/portal/data on the backend.
export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class?: { name: string } | null;
  section?: { name: string } | null;
}

export interface OnlineClass {
  id: string;
  title: string;
  scheduledTime: string;
  duration: number | null;
  status: string;
  meetingLink: string | null;
  recordingLink: string | null;
  course?: { name: string; teacher?: { firstName: string; lastName: string } | null } | null;
}

export interface PortalData {
  role: string;
  children: Child[];
  student: Child | null;
  attendance: {
    records: { date: string; status: string; remarks: string | null }[];
    summary: { PRESENT: number; ABSENT: number; LATE: number; LEAVE: number; total: number; percentage: number | null };
  };
  fees: {
    items: {
      id: string;
      amount: number;
      paidAmount: number;
      dueDate: string;
      status: string;
      receiptNumber: string | null;
      fee?: { name: string } | null;
    }[];
    totalDue: number;
    totalPaid: number;
  };
  assignments: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    maxScore: number;
    course?: { name: string } | null;
    submission: { score: number | null; feedback: string | null; submittedAt: string; gradedAt: string | null } | null;
  }[];
  exams: { id: string; title: string; examDate: string; maxScore: number; course?: { name: string } | null }[];
  examResults: {
    id: string;
    score: number;
    remarks: string | null;
    exam: { title: string; examDate: string; maxScore: number; course?: { name: string } | null };
  }[];
  reportCards: {
    id: string;
    term: string;
    grades: Record<string, unknown>;
    overallScore: number | null;
    remarks: string | null;
    academicYear?: { name: string } | null;
  }[];
  onlineClasses: OnlineClass[];
  announcements: { id: string; title: string; content: string; priority: string; createdAt: string; publishedAt: string | null }[];
}

interface PortalValue {
  data: PortalData | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  selectStudent: (id: string) => void;
}

const PortalContext = createContext<PortalValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState('');

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    try {
      setData(await api<PortalData>(`/portal/data${id ? `?studentId=${id}` : ''}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(studentId);
  }, [studentId, load]);

  return (
    <PortalContext.Provider value={{ data, loading, error, refresh: () => load(studentId), selectStudent: setStudentId }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const value = useContext(PortalContext);
  if (!value) throw new Error('usePortal must be used inside PortalProvider');
  return value;
}

// A class can be joined from 10 minutes before the start until it ends.
export function classState(cls: OnlineClass): 'LIVE' | 'UPCOMING' | 'ENDED' {
  const start = new Date(cls.scheduledTime).getTime();
  const end = start + (cls.duration || 60) * 60000;
  const now = Date.now();
  if (cls.status === 'COMPLETED' || now > end) return 'ENDED';
  if (cls.status === 'LIVE' || now >= start - 10 * 60000) return 'LIVE';
  return 'UPCOMING';
}

export const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export const formatDateTime = (d?: string | null) =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-';

export const formatMoney = (n?: number | null) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
