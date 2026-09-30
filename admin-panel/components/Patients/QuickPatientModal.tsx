"use client";

import { useState } from "react";
import { Patient } from "../Clinical/types";
import { apiFetch } from "@/lib/api";
import { TbX, TbUserPlus, TbAlertTriangle } from "react-icons/tb";

export function QuickPatientModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (patient: Patient, andRecordVitals?: boolean) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergiesText, setAllergiesText] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (andVitals: boolean) => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError("First name, last name, and phone number are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const allergies = allergiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        firstName,
        lastName,
        phone,
        email: email || undefined,
        gender,
        age: age ? parseInt(age, 10) : undefined,
        bloodGroup: bloodGroup || undefined,
        allergies,
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactPhone: emergencyContactPhone || undefined,
        address: address || undefined,
        city: city || undefined,
      };

      const patient = await apiFetch<Patient>("/patients", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onSuccess(patient, andVitals);
    } catch (err: any) {
      setError(err.message || "Failed to register patient");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <TbUserPlus className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Register New Patient
              </h2>
              <p className="text-xs text-slate-500">Fast front-desk intake & MRN issuance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <TbX className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <TbAlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="mt-5 space-y-4"
        >
          {/* Name & Phone */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. John"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Demographics */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Age (Years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 32"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Medical Alerts & Allergies */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Known Drug Allergies (Comma separated)
            </label>
            <input
              type="text"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa, Aspirin"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Emergency Contact */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="e.g. Spouse / Parent"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Emergency Phone
              </label>
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="e.g. +91 9988776655"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* City / Address */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street / locality"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl border border-teal-600 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300 disabled:opacity-50"
            >
              Save Patient Only
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit(true)}
              className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Registering..." : "Save & Record Vitals"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
