export const normalizeStringArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean))];
};

export default {
  normalizeStringArray,
};
