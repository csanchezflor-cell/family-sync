
import React from 'react';
import { FamilyMember, EventCategory } from './types';

export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'all', name: 'Toda la Familia', color: 'bg-slate-500', avatar: 'https://picsum.photos/seed/family/100' },
  { id: 'papa', name: 'Papá', color: 'bg-blue-500', avatar: 'https://picsum.photos/seed/papa/100' },
  { id: 'mama', name: 'Mamá', color: 'bg-rose-500', avatar: 'https://picsum.photos/seed/mama/100' },
  { id: 'ahsoka', name: 'Ahsoka', color: 'bg-amber-500', avatar: 'https://picsum.photos/seed/ahsoka/100' },
];

export const CATEGORIES: EventCategory[] = ['Salud', 'Colegio', 'Ocio', 'Trabajo', 'Hogar', 'Otro'];

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  Salud: 'bg-red-100 text-red-700 border-red-200',
  Colegio: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Ocio: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Trabajo: 'bg-slate-100 text-slate-700 border-slate-200',
  Hogar: 'bg-orange-100 text-orange-700 border-orange-200',
  Otro: 'bg-slate-50 text-slate-600 border-slate-100',
};
