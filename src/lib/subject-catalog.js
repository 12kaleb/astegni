export const SUBJECT_GROUPS = [
  {
    name: 'Sciences',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Environmental Science', 'Statistics'],
  },
  {
    name: 'Technology',
    subjects: ['Computer Science', 'Programming', 'Web Development', 'Data Structures & Algorithms', 'Databases', 'Networking', 'Cybersecurity', 'Artificial Intelligence / Machine Learning'],
  },
  {
    name: 'Languages & Humanities',
    subjects: ['English', 'Amharic', 'Afaan Oromo', 'Literature', 'History', 'Geography', 'Philosophy'],
  },
  {
    name: 'Business & Social Sciences',
    subjects: ['Economics', 'Accounting', 'Business Management', 'Marketing', 'Psychology', 'Sociology', 'Civics & Ethical Education'],
  },
  {
    name: 'Engineering',
    subjects: ['Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering'],
  },
  {
    name: 'Other',
    subjects: ['Art & Design', 'Music', 'Test Prep (e.g., Entrance Exam, TOEFL, IELTS)'],
  },
];

export const SUBJECT_OPTIONS = SUBJECT_GROUPS.flatMap(({ subjects }) => subjects);
