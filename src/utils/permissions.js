function normalizeManagedScope(value) {
  if (value === 'ALL') return 'ALL';
  return Array.isArray(value) ? value.map((id) => String(id)) : [];
}

function isAll(scope) {
  return scope === 'ALL';
}

function hasScope(scopeList, id) {
  if (isAll(scopeList)) return true;
  if (!id) return false;
  return Array.isArray(scopeList) && scopeList.includes(String(id));
}

export function buildPermissions(capabilitiesInput = {}) {
  const capabilities =
    capabilitiesInput && typeof capabilitiesInput === 'object'
      ? capabilitiesInput
      : {};

  const isPlatformSuperadmin = Boolean(capabilities.isPlatformSuperadmin);
  const managedColleges = normalizeManagedScope(capabilities.managedColleges);
  const managedPrograms = normalizeManagedScope(capabilities.managedPrograms);
  const managedYears = normalizeManagedScope(capabilities.managedYears);
  const managedSubjects = normalizeManagedScope(capabilities.managedSubjects);

  function hasManagedColleges() {
    return isAll(managedColleges) || managedColleges.length > 0;
  }

  function hasManagedPrograms() {
    return isAll(managedPrograms) || managedPrograms.length > 0;
  }

  function hasManagedYears() {
    return isAll(managedYears) || managedYears.length > 0;
  }

  function hasManagedSubjects() {
    return isAll(managedSubjects) || managedSubjects.length > 0;
  }

  function canManageCollege() {
    return isPlatformSuperadmin || hasManagedColleges();
  }

  function canManageProgram(programId) {
    if (canManageCollege()) return true;
    if (programId == null || programId === '') return hasManagedPrograms();
    return hasScope(managedPrograms, programId);
  }

  function canManageYear(yearId, programId) {
    if (canManageCollege()) return true;
    if (hasScope(managedPrograms, programId)) return true;
    if (yearId == null || yearId === '') return hasManagedPrograms() || hasManagedYears();
    return hasScope(managedYears, yearId);
  }

  function canManageSubject(subjectId, yearId, programId) {
    if (canManageCollege()) return true;
    if (hasScope(managedPrograms, programId)) return true;
    if (hasScope(managedYears, yearId)) return true;
    if (subjectId == null || subjectId === '') {
      return hasManagedPrograms() || hasManagedYears() || hasManagedSubjects();
    }
    return hasScope(managedSubjects, subjectId);
  }

  function hasAdminAccess() {
    return (
      isPlatformSuperadmin ||
      hasManagedColleges() ||
      hasManagedPrograms() ||
      hasManagedYears() ||
      hasManagedSubjects()
    );
  }

  function canCreateProgram() {
    return canManageCollege();
  }

  function canCreateYear(programId) {
    return canManageProgram(programId);
  }

  function canCreateSubject(yearId, programId) {
    return canManageYear(yearId, programId);
  }

  function canManageRoles() {
    return isPlatformSuperadmin || hasManagedColleges() || hasManagedPrograms() || hasManagedYears();
  }

  function getAssignableRoleTypes() {
    if (isPlatformSuperadmin) {
      return ['college_superadmin', 'program_admin', 'year_admin', 'subject_admin'];
    }

    const assignable = [];
    if (hasManagedColleges()) {
      assignable.push('program_admin', 'year_admin', 'subject_admin');
    }
    if (hasManagedPrograms()) {
      assignable.push('year_admin', 'subject_admin');
    }
    if (hasManagedYears()) {
      assignable.push('subject_admin');
    }
    return [...new Set(assignable)];
  }

  function canAssignRoleType(roleType) {
    return getAssignableRoleTypes().includes(roleType);
  }

  function canAssignRoleInScope(roleType, scopeType, scopeId, context = {}) {
    if (!canAssignRoleType(roleType)) return false;
    if (isPlatformSuperadmin) return true;
    if (!scopeType) return false;

    const { programId = null, yearId = null } = context;

    if (scopeType === 'college') return canManageCollege();
    if (scopeType === 'program') return canManageProgram(scopeId);
    if (scopeType === 'year') return canManageYear(scopeId, programId);
    if (scopeType === 'subject') return canManageSubject(scopeId, yearId, programId);
    return false;
  }

  function canDeleteProgram(programId) {
    return canManageProgram(programId);
  }

  function canDeleteYear(yearId, programId) {
    return canManageYear(yearId, programId);
  }

  function canDeleteSubject(subjectId, yearId, programId) {
    return canManageSubject(subjectId, yearId, programId);
  }

  function canManageResourceSubject(subjectId, yearId, programId) {
    return canManageSubject(subjectId, yearId, programId);
  }

  function hasAnyManagedSubjects() {
    return hasManagedSubjects();
  }

  function canManageStructure() {
    return hasAdminAccess();
  }

  return {
    hasAdminAccess,
    canManageCollege,
    canManageProgram,
    canManageYear,
    canManageSubject,
    canCreateProgram,
    canCreateYear,
    canCreateSubject,
    canDeleteProgram,
    canDeleteYear,
    canDeleteSubject,
    canManageRoles,
    getAssignableRoleTypes,
    canAssignRoleType,
    canAssignRoleInScope,
    canManageResourceSubject,
    hasAnyManagedSubjects,
    canManageStructure
  };
}
