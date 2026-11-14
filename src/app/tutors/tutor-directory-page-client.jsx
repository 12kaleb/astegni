'use client';

import TutorDirectoryView from '../../views/TutorDirectoryView';
import { useAppShell } from '../../components/AppShell';

export default function TutorDirectoryPageClient({ tutors, initialSearchTerm }) {
  const { selectTutor, selectedTutorIds } = useAppShell();
  return (
    <TutorDirectoryView
      tutors={tutors}
      initialSearchTerm={initialSearchTerm}
      onSelectTutor={selectTutor}
      selectedTutorIds={selectedTutorIds}
    />
  );
}
