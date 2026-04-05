import { useState } from "react";
import { usePatient } from "../PatientContext";
import "./Home.css";

export default function Home() {

    const { data, setData } = usePatient();
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(data);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDraft({ ...draft, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setData(draft);
        setEditing(false);
    };

    const handleCancel = () => {
        setDraft(data);
        setEditing(false);
    };

    return (
        <div className="home">
            <div className="chart-header">
                <h2 className="chart-title">Patient Chart</h2>
                {!editing ? (
                    <button className="chart-btn" onClick={() => setEditing(true)}>Edit</button>
                ) : (
                    <div style={{ display: "flex", gap:"8px"}}>
                        <button className="chart-btn save" onClick={handleSave}>Save</button>
                        <button className="chart-btn cancel" onClick={handleCancel}>Cancel</button>
                    </div>
                )}
            </div>

            <div className="chart-section">
                <h3 className="section-title">Patient Information</h3>
                <div className="chart-grid">
                    <Field label="Patient Name" name="patientName" value={draft.patientName} editing={editing} onChange={handleChange}></Field>
                    <Field label="Patient ID" name="patientId" value={draft.patientId} editing={editing} onChange={handleChange}></Field>
                    <Field label="Date of Birth" name="dob" value={draft.dob} editing={editing} onChange={handleChange}></Field>
                    <Field label="Procedure" name="procedure" value={draft.procedure} editing={editing} onChange={handleChange}></Field>
                    <Field label="Surgeon" name="surgeon" value={draft.surgeon} editing={editing} onChange={handleChange}></Field>
                </div>
            </div>

            <div className="chart-section">
                <h3 className="section-title">Notes</h3>
                {editing ? (
                    <textarea
                        className="chart-textarea"
                        name="notes"
                        value={draft.notes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Surgical notes..."
                    />
                ) : (
                    <p className="chart-notes">{data.notes || "-"}</p>
                )}
            </div>
        </div>
    );
}

interface FieldProps {
    label: string;
    name: string;
    value: string;
    editing: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Field({ label, name, value, editing, onChange } : FieldProps) {
    return (
        <div className="chart-field">
            <span className="field-label">{label}</span>
            {editing ? (
                <input
                  className="chart-input"
                  name={name}
                  value={value}
                  onChange={onChange}
                  placeholder={label}
                />
            ) : (
                <span className="field-value">{value || "-"}</span>
            )}
        </div>
    );
}