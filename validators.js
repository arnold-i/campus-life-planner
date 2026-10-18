export const patterns = {
  title: /^\S(?:.*\S)?$/,
  duration: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
  duplicateWords: /\b(\w+)\s+\1\b/i
};

export function validatePlan(plan) {
  const errors = {};
  const title = String(plan.title ?? "");
  const duration = String(plan.duration ?? "");
  const dueDate = String(plan.dueDate ?? "");
  const tag = String(plan.tag ?? "");
  if (!patterns.title.test(title) || title.trim() !== title || /\s{2,}/.test(title))
    errors.title = "Use a title without outer or repeated spaces.";
  if (patterns.duplicateWords.test(title))
    errors.title = "Remove repeated words (for example, “study study”).";
  if (!patterns.duration.test(duration) || !Number.isFinite(Number(duration)))
    errors.duration = "Enter a non-negative number, with up to 2 decimals.";
  if (!patterns.date.test(dueDate) || Number.isNaN(Date.parse(dueDate)))
    errors.date = "Choose a valid date in YYYY-MM-DD format.";
  if (!patterns.tag.test(tag) || tag.trim() !== tag)
    errors.tag = "Use letters, single spaces or hyphens only.";
  return errors;
}

export function validRecord(r) {
  return !!r && typeof r === "object" &&
    typeof r.id === "string" && r.id.length > 0 &&
    typeof r.title === "string" && typeof r.dueDate === "string" &&
    Number.isFinite(Number(r.duration)) && Number(r.duration) >= 0 &&
    typeof r.tag === "string" &&
    typeof r.createdAt === "string" && typeof r.updatedAt === "string" &&
    Object.keys(validatePlan(r)).length === 0;
}
