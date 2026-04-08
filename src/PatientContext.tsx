import { createContext, useContext, useState, useRef } from "react";

interface PatientData {
  patientName: string;
  patientId: string;
  dob: string;
  procedure: string;
  surgeon: string;
  heartRate: string;
  bloodPressure: string;
  oxygenSat: string;
  temperature: string;
  notes: string;
}

const DEFAULT_DATA: PatientData = {
  patientName: "",
  patientId: "",
  dob: "",
  procedure: "",
  surgeon: "",
  heartRate: "",
  bloodPressure: "",
  oxygenSat: "",
  temperature: "",
  notes: "",
};

const PatientContext = createContext<PatientContextType | null>(null);

interface WaveOffsets {
  ecg: React.MutableRefObject<number>;
  spo2: React.MutableRefObject<number>;
  rr: React.MutableRefObject<number>;
}

interface PatientContextType {
  data: PatientData;
  setData: (data: PatientData) => void;
  paused: boolean;
  setPaused: (paused: boolean) => void;
  reset: boolean;
  setReset: (reset: boolean) => void;
  waveOffsets: WaveOffsets;
}

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<PatientData>(() => {
    const saved = localStorage.getItem("patient-data");
    return saved ? JSON.parse(saved) : DEFAULT_DATA;
  });
  const [paused, setPaused] = useState(false);
  const [reset, setReset] = useState(false);
  const waveOffsets: WaveOffsets = {
    ecg: useRef(0),
    spo2: useRef(0),
    rr: useRef(0),
  };

  const setData = (newData: PatientData) => {
    setDataState(newData);
    localStorage.setItem("patient-data", JSON.stringify(newData));
  };

  return (
    <PatientContext.Provider value={{ data, setData, paused, setPaused, reset, setReset, waveOffsets }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatient must be used inside PatientProvider");
  return ctx;
}