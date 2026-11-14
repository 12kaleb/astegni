'use client';

import { AlertCircle, Check, X } from 'lucide-react';

export default function TutorDashboardModals({ editProfileModalOpen, setEditProfileModalOpen, profileSaveSuccess, isSavingProfile, handleSaveProfile, profileForm, setProfileForm, subjectGroups, assignmentModalOpen, setAssignmentModalOpen, assignmentForm, setAssignmentForm, assignmentSaving, assignmentMessage, handleCreateAssignment, students, gradeModalAssignment, setGradeModalAssignment, gradeScoreInput, setGradeScoreInput, handleSaveGrade }) {
  return (
    <>
      {/* 9. MODAL: EDIT PROFILE & TEACHING RATES */}
      {editProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8E2D8] max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif text-2xl text-[#0A1428]">
                  Edit Tutor Profile & Hourly Rates
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your public profile displayed across Astegni search & directory.
                </p>
              </div>
              <button
                onClick={() => setEditProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

              {profileSaveSuccess && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${profileSaveSuccess.startsWith('Could not') ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                {profileSaveSuccess.startsWith('Could not') ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <Check className="w-4 h-4 text-emerald-600" />}
                <span>{profileSaveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={profileForm.title}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                    placeholder="e.g. Senior Mathematics & Calculus Specialist"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    University / Degree
                  </label>
                  <input
                    type="text"
                    value={profileForm.university}
                    onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
                    placeholder="e.g. Addis Ababa University (AAU)"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Location / Neighborhood
                  </label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    placeholder="e.g. Bole, Addis Ababa"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Hourly Rate (ETB)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="1000"
                    step="50"
                    value={profileForm.hourlyRateETB}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, hourlyRateETB: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Hourly Rate (USD)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    step="1"
                    value={profileForm.hourlyRateUSD}
                    onChange={(e) => setProfileForm({ ...profileForm, hourlyRateUSD: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                  />
                </div>

              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Subjects Taught (available courses)
                </label>
                <div className="space-y-4">
                  {subjectGroups.map(({ name, subjects }) => (
                    <fieldset key={name}>
                      <legend className="mb-2 text-xs font-bold text-slate-700">{name}</legend>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {subjects.map((subject) => {
                          const selected = selectedSubjects.includes(subject);
                          return (
                            <label key={subject} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs text-slate-700 ${selected ? 'border-[#E05A47] bg-[#FFF7F4]' : 'border-slate-200'}`}>
                              <input type="checkbox" checked={selected} onChange={() => {
                                setProfileForm((current) => {
                                  const next = current.subjects.includes(subject)
                                    ? current.subjects.filter((item) => item !== subject)
                                    : [...current.subjects, subject];
                                  return { ...current, subjects: next };
                                });
                              }} />
                              {subject}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Bio & Teaching Philosophy
                </label>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Describe your teaching experience, methodology, and how you prepare students for exams..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditProfileModalOpen(false)}
                  className="btn btn-outline text-xs px-4 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn btn-primary text-xs px-6 py-2.5 font-bold shadow-md"
                >
                  {isSavingProfile ? 'Saving Changes…' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. MODAL: ASSIGN HOMEWORK */}
      {assignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8E2D8] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-xl text-[#0A1428]">Assign Work to Student</h3>
              <button
                onClick={() => setAssignmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignmentMessage && (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl font-bold">
                {assignmentMessage}
              </p>
            )}

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Select Student
                </label>
                <select
                  required
                  value={assignmentForm.studentId}
                  onChange={(e) =>
                    setAssignmentForm({ ...assignmentForm, studentId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={assignmentForm.title}
                  onChange={(e) =>
                    setAssignmentForm({ ...assignmentForm, title: e.target.value })
                  }
                  placeholder="e.g. Calculus: Derivatives Problem Set #5"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={assignmentForm.dueDate}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Max Score</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={assignmentForm.maxScore}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, maxScore: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-slate-300 text-xs text-[#0A1428]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignmentModalOpen(false)}
                  className="btn btn-outline text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignmentSaving}
                  className="btn btn-primary text-xs px-5 py-2 font-bold"
                >
                  {assignmentSaving ? 'Assigning…' : 'Send Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. MODAL: GRADE ASSIGNMENT */}
      {gradeModalAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E8E2D8] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-xl text-[#0A1428]">Grade Worksheet</h3>
              <button
                onClick={() => setGradeModalAssignment(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#0A1428]">
                {gradeModalAssignment.title}
              </h4>
              <p className="text-xs text-slate-500">
                Student: {gradeModalAssignment.student?.name}
              </p>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Score (out of {gradeModalAssignment.maxScore || 10})
                </label>
                <input
                  type="number"
                  min="0"
                  max={gradeModalAssignment.maxScore || 10}
                  step="0.5"
                  required
                  value={gradeScoreInput}
                  onChange={(e) => setGradeScoreInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-slate-300 text-sm font-bold text-[#0A1428]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradeModalAssignment(null)}
                  className="btn btn-outline text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs px-5 py-2 font-bold">
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
