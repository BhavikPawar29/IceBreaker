export const LINE_STATUS_PENDING = "pending";
export const LINE_STATUS_APPROVED = "approved";
export const LINE_STATUS_REJECTED = "rejected";

export const LINE_STATUSES = [
  LINE_STATUS_PENDING,
  LINE_STATUS_APPROVED,
  LINE_STATUS_REJECTED,
];

export const LINE_STATUS_LABELS = {
  [LINE_STATUS_PENDING]: "Pending review",
  [LINE_STATUS_APPROVED]: "Approved",
  [LINE_STATUS_REJECTED]: "Rejected",
};
