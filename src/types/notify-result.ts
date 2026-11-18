// Response of the send-call-notification route
export type NotifyResult = {
  ok: boolean;
  name?: string;
  number?: string;
  topic?: string;
  error?: string;
  taskId?: string | null;
  taskError?: string | null;
};
