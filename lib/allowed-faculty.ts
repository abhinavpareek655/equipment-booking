// Allowed faculty emails for registration
// Only these emails can register as users in the equipment booking system

export const allowedFacultyEmails = new Set([
  // Department of Biotechnology
  'prof.zore_bt@curaj.ac.in',
  'pankaj_bio@curaj.ac.in', 
  'jaykantyadav@curaj.ac.in',
  'tarun@curaj.ac.in',
  'gajendra.singh@curaj.ac.in',
  'janmejay@curaj.ac.in',
  'jayendrashukla@curaj.ac.in',
  'khemraj_meena@curaj.ac.in',
  'surendranimesh@curaj.ac.in',
  'navnit.kumar@curaj.ac.in',

  // Department of Biochemistry
  'ccmandal@curaj.ac.in',
  'sanjib.panda@curaj.ac.in',
  'hemant.daima@curaj.ac.in',
  'vishvanath@curaj.ac.in',
  'bhawana.bissa@curaj.ac.in',
  'dipak.gayen@curaj.ac.in',
  'shivswaroop@curaj.ac.in',
  'dhaneswarprusty@curaj.ac.in',
  'joydeep.aoun@curaj.ac.in',

  // Department of Microbiology
  'inshad@curaj.ac.in',
  'pdadheech@curaj.ac.in',
  'pradeepverma@curaj.ac.in',
  'akhilagrawal@curaj.ac.in',
  'deeksha.tripathi@curaj.ac.in',
  'nidhipareek@curaj.ac.in',
  'mrrameshkumar@curaj.ac.in',
  'sagar.barale@curaj.ac.in',
]);

export const facultyInfo = {
  // Department of Biotechnology
  'prof.zore_bt@curaj.ac.in': { name: 'Prof. Gajanan B. Zore', designation: 'Professor', department: 'Biotechnology' },
  'pankaj_bio@curaj.ac.in': { name: 'Prof. Pankaj Goyal', designation: 'Professor', department: 'Biotechnology' },
  'jaykantyadav@curaj.ac.in': { name: 'Dr. Jay Kant Yadav', designation: 'Associate Professor & Head', department: 'Biotechnology' },
  'tarun@curaj.ac.in': { name: 'Dr. Tarun Kumar Bhatt', designation: 'Associate Professor', department: 'Biotechnology' },
  'gajendra.singh@curaj.ac.in': { name: 'Dr. Gajendra Singh', designation: 'Assistant Professor', department: 'Biotechnology' },
  'janmejay@curaj.ac.in': { name: 'Dr. Janmejay Pandey', designation: 'Assistant Professor', department: 'Biotechnology' },
  'jayendrashukla@curaj.ac.in': { name: 'Dr. Jayendra Nath Shukla', designation: 'Assistant Professor', department: 'Biotechnology' },
  'khemraj_meena@curaj.ac.in': { name: 'Dr. Khem Raj Meena', designation: 'Assistant Professor', department: 'Biotechnology' },
  'surendranimesh@curaj.ac.in': { name: 'Dr. Surendra Nimesh', designation: 'Assistant Professor (UGC)', department: 'Biotechnology' },
  'navnit.kumar@curaj.ac.in': { name: 'Dr. Navnit K. Ramamoorthy', designation: 'Assistant Professor', department: 'Biotechnology' },

  // Department of Biochemistry
  'ccmandal@curaj.ac.in': { name: 'Prof. Chandi C. Mandal', designation: 'Professor & Dean (School)', department: 'Biochemistry' },
  'sanjib.panda@curaj.ac.in': { name: 'Prof. Sanjib Kumar Panda', designation: 'Professor', department: 'Biochemistry' },
  'hemant.daima@curaj.ac.in': { name: 'Dr. Hemant Daima', designation: 'Associate Professor & Head', department: 'Biochemistry' },
  'vishvanath@curaj.ac.in': { name: 'Dr. Vishvanath Tiwari', designation: 'Associate Professor', department: 'Biochemistry' },
  'bhawana.bissa@curaj.ac.in': { name: 'Dr. Bhawana Bissa', designation: 'Assistant Professor', department: 'Biochemistry' },
  'dipak.gayen@curaj.ac.in': { name: 'Dr. Dipak Gayen', designation: 'Assistant Professor', department: 'Biochemistry' },
  'shivswaroop@curaj.ac.in': { name: 'Dr. Shiv Swaroop', designation: 'Assistant Professor', department: 'Biochemistry' },
  'dhaneswarprusty@curaj.ac.in': { name: 'Dr. Dhaneswar Prusty', designation: 'Assistant Professor (UGC)', department: 'Biochemistry' },
  'joydeep.aoun@curaj.ac.in': { name: 'Dr. Joydeep Aoun', designation: 'Assistant Professor', department: 'Biochemistry' },

  // Department of Microbiology
  'inshad@curaj.ac.in': { name: 'Prof. Inshad Ali Khan', designation: 'Professor', department: 'Microbiology' },
  'pdadheech@curaj.ac.in': { name: 'Prof. Pawan K. Dadheech', designation: 'Professor', department: 'Microbiology' },
  'pradeepverma@curaj.ac.in': { name: 'Prof. Pradeep Verma', designation: 'Professor', department: 'Microbiology' },
  'akhilagrawal@curaj.ac.in': { name: 'Dr. Akhil Agrawal', designation: 'Associate Professor & Head', department: 'Microbiology' },
  'deeksha.tripathi@curaj.ac.in': { name: 'Dr. Deeksha Tripathi', designation: 'Assistant Professor', department: 'Microbiology' },
  'nidhipareek@curaj.ac.in': { name: 'Dr. Nidhi Pareek', designation: 'Assistant Professor', department: 'Microbiology' },
  'mrrameshkumar@curaj.ac.in': { name: 'Dr. Rameshkumar M. Ragavan', designation: 'Assistant Professor', department: 'Microbiology' },
  'sagar.barale@curaj.ac.in': { name: 'Dr. Sagar S. Barale', designation: 'Assistant Professor', department: 'Microbiology' },
};

export function isAllowedFacultyEmail(email: string): boolean {
  return allowedFacultyEmails.has(email.toLowerCase().trim());
}