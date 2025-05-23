"use client";

import React from 'react';

// Composant pour les erreurs
export const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className="mt-1 text-sm text-red-600">{message}</p>;
};

// Composant pour les champs désactivés
export const DisabledField = ({ label, id, name, value }: { label: string; id: string; name: string; value: string }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="text"
      id={id}
      name={name}
      value={value}
      className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg cursor-not-allowed"
      disabled
    />
    <p className="mt-1 text-xs text-gray-500">Ce champ est prérempli automatiquement</p>
  </div>
);

// Composant pour les champs de saINSTIe standard
export const InputField = ({ 
  label, 
  id, 
  name, 
  value, 
  onChange, 
  error, 
  type = 'text', 
  placeholder = '', 
  required = true 
}: { 
  label: string; 
  id: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; 
  error?: string; 
  type?: string; 
  placeholder?: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      placeholder={placeholder}
      required={required}
    />
    <ErrorMessage message={error} />
  </div>
);

// Composant pour les champs de sélection
export const SelectField = ({ 
  label, 
  id, 
  name, 
  value, 
  onChange, 
  error, 
  options 
}: { 
  label: string; 
  id: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; 
  error?: string; 
  options: {value: string, label: string}[];
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}<span className="text-red-500 ml-1">*</span>
    </label>
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    <ErrorMessage message={error} />
  </div>
);

// Composant pour les zones de texte
export const TextareaField = ({ 
  label, 
  id, 
  name, 
  value, 
  onChange, 
  error, 
  placeholder = '', 
  rows = 3 
}: { 
  label: string; 
  id: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; 
  error?: string; 
  placeholder?: string; 
  rows?: number;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}<span className="text-red-500 ml-1">*</span>
    </label>
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      placeholder={placeholder}
    />
    <ErrorMessage message={error} />
  </div>
); 