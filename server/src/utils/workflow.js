export const WORKFLOW_TRANSITIONS = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['IN_REVIEW'],
  IN_REVIEW: ['CLOSED'],
  CLOSED: ['OPEN'] // Reopen allowed
};

export function isValidTransition(currentStatus, targetStatus) {
  if (currentStatus === targetStatus) return true;
  const allowedNext = WORKFLOW_TRANSITIONS[currentStatus] || [];
  return allowedNext.includes(targetStatus);
}