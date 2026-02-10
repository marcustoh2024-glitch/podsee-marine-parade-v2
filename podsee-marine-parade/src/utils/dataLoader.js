import * as XLSX from 'xlsx';

// Subject normalization mapping
const SUBJECT_NORMALIZATION = {
  'Math': 'Mathematics',
  'Mathematics': 'Mathematics',
  'POA': 'POA',
  'Principle of Accounts (POA)': 'POA',
};

// Level normalization - ignore J1/J2
const LEVEL_NORMALIZATION = {
  'J1': null, // Ignore
  'J2': null, // Ignore
};

// Curated subject order
const SUBJECT_ORDER = [
  'Biology',
  'Chemistry',
  'Physics',
  'Science',
  'Mathematics',
  'Higher Chinese',
  'Chinese',
  'English',
  'Economics',
  'History',
  'Social Studies',
  'Literature',
  'Geography',
  'General Paper',
  'POA',
  'Malay',
  'English Language & Linguistics',
  'English Language & Literature',
  'China Studies in English',
];

// Level order
const LEVEL_ORDER = [
  'P1', 'P2', 'P3', 'P4', 'P5', 'P6',
  'S1', 'S2', 'S3', 'S4', 'S5',
  'JC1', 'JC2',
  'IB', 'Y5 (IB)', 'Y6 (IB)',
];

export function normalizeSubject(subject) {
  return SUBJECT_NORMALIZATION[subject] || subject;
}

export function normalizeLevel(level) {
  if (LEVEL_NORMALIZATION[level] === null) return null;
  return LEVEL_NORMALIZATION[level] || level;
}

export async function loadCentresData() {
  const response = await fetch('/database_ready_final (Marine Parade).xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Parse centres sheet
  const centresSheet = workbook.Sheets['centres'];
  const centresRaw = XLSX.utils.sheet_to_json(centresSheet);

  // Parse offerings sheet
  const offeringsSheet = workbook.Sheets['offerings'];
  const offeringsRaw = XLSX.utils.sheet_to_json(offeringsSheet);

  // Build centres map
  const centresMap = new Map();

  centresRaw.forEach(centre => {
    centresMap.set(centre.centre_name, {
      name: centre.centre_name,
      address: centre.address,
      postalCode: centre.postal_code,
      websiteUrl: centre.website_url,
      whatsappNumber: centre.whatsapp_number,
      contactType: centre['Whatsapp/Call'],
      levels: new Set(),
      subjects: new Set(),
      offerings: [], // Store all offerings
    });
  });

  // Process offerings and aggregate data
  offeringsRaw.forEach(offering => {
    const centre = centresMap.get(offering.centre_name);
    if (!centre) return;

    const normalizedLevel = normalizeLevel(offering.level);
    const normalizedSubject = normalizeSubject(offering.subject);

    // Skip ignored levels (J1/J2)
    if (normalizedLevel === null) return;

    if (normalizedLevel) centre.levels.add(normalizedLevel);
    if (normalizedSubject) centre.subjects.add(normalizedSubject);

    // Store the offering with its notes
    centre.offerings.push({
      level: normalizedLevel,
      subject: normalizedSubject,
      notes: offering.notes || null,
    });
  });

  // Convert sets to sorted arrays
  const centres = Array.from(centresMap.values()).map(centre => ({
    ...centre,
    levels: Array.from(centre.levels).sort((a, b) => 
      LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b)
    ),
    subjects: Array.from(centre.subjects).sort((a, b) => 
      SUBJECT_ORDER.indexOf(a) - SUBJECT_ORDER.indexOf(b)
    ),
  }));

  return centres;
}

export function getFilterOptions(centres) {
  const allLevels = new Set();
  const allSubjects = new Set();

  centres.forEach(centre => {
    centre.levels.forEach(level => allLevels.add(level));
    centre.subjects.forEach(subject => allSubjects.add(subject));
  });

  return {
    levels: LEVEL_ORDER.filter(level => allLevels.has(level)),
    subjects: SUBJECT_ORDER.filter(subject => allSubjects.has(subject)),
  };
}

export function getSubjectsForLevel(level, centres) {
  if (!level) return [];

  const subjectsForLevel = new Set();

  centres.forEach(centre => {
    centre.offerings.forEach(offering => {
      if (offering.level === level && offering.subject) {
        subjectsForLevel.add(offering.subject);
      }
    });
  });

  // Business rule: Hide specialized sciences for S1 and S2
  // Only "Science" should be available, not Biology/Chemistry/Physics
  if (['S1', 'S2'].includes(level)) {
    subjectsForLevel.delete('Biology');
    subjectsForLevel.delete('Chemistry');
    subjectsForLevel.delete('Physics');
  }

  // Filter SUBJECT_ORDER to only include subjects valid for this level
  const orderedSubjects = SUBJECT_ORDER.filter(subject => subjectsForLevel.has(subject));
  
  // Append any subjects not in SUBJECT_ORDER at the end
  const remainingSubjects = Array.from(subjectsForLevel).filter(
    subject => !SUBJECT_ORDER.includes(subject)
  );

  return [...orderedSubjects, ...remainingSubjects];
}

export function filterCentres(centres, selectedLevel, selectedSubject) {
  return centres.filter(centre => {
    // Check if centre has offerings that match the specific level+subject combination
    const hasMatchingOffering = centre.offerings.some(offering => {
      // Must match level
      if (offering.level !== selectedLevel) return false;

      // Science umbrella logic
      if (selectedSubject === 'Science') {
        const scienceSubjects = ['Science', 'Biology', 'Chemistry', 'Physics'];
        return scienceSubjects.includes(offering.subject);
      }

      // Exact subject match
      return offering.subject === selectedSubject;
    });

    return hasMatchingOffering;
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export function getSubjectsForCentreAtLevel(centre, level) {
  // Get unique subjects offered by this centre at the specified level
  const subjectsAtLevel = new Set();
  
  centre.offerings.forEach(offering => {
    if (offering.level === level && offering.subject) {
      subjectsAtLevel.add(offering.subject);
    }
  });

  // Convert to array and sort by SUBJECT_ORDER
  const orderedSubjects = SUBJECT_ORDER.filter(subject => subjectsAtLevel.has(subject));
  const remainingSubjects = Array.from(subjectsAtLevel).filter(
    subject => !SUBJECT_ORDER.includes(subject)
  );

  return [...orderedSubjects, ...remainingSubjects];
}

export function getMatchingNote(centre, selectedLevel, selectedSubject) {
  // Filter offerings that match the search criteria
  const matchingOfferings = centre.offerings.filter(offering => {
    // Must match level
    if (offering.level !== selectedLevel) return false;

    // Science umbrella logic
    if (selectedSubject === 'Science') {
      const scienceSubjects = ['Science', 'Biology', 'Chemistry', 'Physics'];
      return scienceSubjects.includes(offering.subject);
    }

    // Exact subject match
    return offering.subject === selectedSubject;
  });

  // Find first non-empty note from matching offerings
  const offeringWithNote = matchingOfferings.find(offering => offering.notes);
  return offeringWithNote ? offeringWithNote.notes : null;
}
