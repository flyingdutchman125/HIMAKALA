// ============================================================================
// Skrip Migrasi Data localStorage Lama ke SQL Seed (Bagian 12 PRD)
// Membaca ekspor himakala_divisions_data dari repo lama dan menyaring
// nama placeholder "Entitas" serta link generik.
// ============================================================================

export interface LegacyMember {
  id: string;
  name: string;
  role: string;
  department: string;
  instagram?: string;
  linkedin?: string;
}

export interface LegacyDivision {
  id: string;
  name: string;
  description: string;
  members: LegacyMember[];
}

export function filterVerifiedLegacyMembers(divisions: LegacyDivision[]) {
  const verified: Array<{
    divisionSlug: string;
    name: string;
    role: string;
    department: string;
    instagram: string | null;
    linkedin: string | null;
  }> = [];

  for (const div of divisions) {
    for (const member of div.members) {
      if (!member.name || member.name.trim().toLowerCase() === "entitas") {
        continue;
      }
      const ig =
        member.instagram && member.instagram !== "https://instagram.com"
          ? member.instagram
          : null;
      const li =
        member.linkedin && member.linkedin !== "https://linkedin.com"
          ? member.linkedin
          : null;

      verified.push({
        divisionSlug: div.id,
        name: member.name.trim(),
        role: member.role.trim(),
        department: member.department.trim(),
        instagram: ig,
        linkedin: li,
      });
    }
  }

  return verified;
}

