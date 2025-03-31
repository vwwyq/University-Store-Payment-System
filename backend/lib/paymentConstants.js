export const TRANSACTION_TYPE_PAYMENT = 'payment';
export const TRANSACTION_TYPE_RECEIVE = 'receive';
export const TRANSACTION_STATUS_COMPLETED = 'completed';

export const ERROR_MSG_PAYMENT_FAILED_INTERNAL = "Internal Server Error: Payment failed. Please try again later.";
export const ERROR_MSG_UNAUTHORIZED = "Unauthorized: Sender identity invalid.";

export const ERROR_MSG_INVALID_RECIPIENT = "Invalid request: Missing or invalid recipient ID.";
export const ERROR_MSG_INVALID_AMOUNT = "Invalid payment amount.";
export const ERROR_MSG_SELF_PAYMENT = "Cannot send payment to yourself.";
export const ERROR_MSG_INVALID_ORDER_ID = "Invalid Order ID format.";
export const ERROR_MSG_INSUFFICIENT_BALANCE = "Insufficient wallet balance.";
export const ERROR_MSG_SENDER_NOT_FOUND = "Sender user not found.";
export const ERROR_MSG_RECIPIENT_NOT_FOUND = "Recipient user not found.";

export const INFO_MSG_PAYMENT_ALREADY_COMPLETED = "Payment already completed for this order.";

export const SUCCESS_MSG_PAYMENT = "Payment successful";

