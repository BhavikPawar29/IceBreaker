import {
  LINE_STATUS_LABELS,
  LINE_STATUS_PENDING,
} from "../constants/lineStatuses";

export function formatCategory(category) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function sortLines(lines) {
  return [...lines].sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return new Date(right.createdAt) - new Date(left.createdAt);
  });
}

export function formatLineStatus(status) {
  return LINE_STATUS_LABELS[status] || LINE_STATUS_LABELS[LINE_STATUS_PENDING];
}
