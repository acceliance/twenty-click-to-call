import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  Response,
  type LogicFunctionExecutionContext,
  type RoutePayload,
} from 'twenty-sdk/logic-function';

import {
  SEND_CALL_NOTIFICATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SEND_CALL_NOTIFICATION_ROUTE_PATH,
} from 'src/constants/universal-identifiers';
import type { NotifyResult } from 'src/types/notify-result';
import { buildCallTaskBody } from 'src/utils/build-call-task-body';
import { buildE164, formatForDisplay, type TwentyPhones } from 'src/utils/build-tel-uri';
import { topicSuffixFor, type WorkspaceMember } from 'src/utils/topic-for-member';

type RequestBody = { personId?: string };

type Person = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  phones?: TwentyPhones | null;
  jobTitle?: string | null;
  company?: { name?: string | null } | null;
};

type CreatedRecord = { id?: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const errorResponse = (status: number, error: string) =>
  new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: { 'content-type': 'application/json' },
  });

// REST create responses are { data: { create<Object>: record } }
const createdId = (response: { data?: Record<string, CreatedRecord | undefined> }) =>
  Object.values(response?.data ?? {}).find((record) => record?.id)?.id ?? null;

// Logs the call as a done task on the contact, assigned to the caller
const createCallTask = async (
  client: RestApiClient,
  title: string,
  number: string,
  personId: string,
  workspaceMemberId: string,
): Promise<string> => {
  const taskId = createdId(
    await client.post<{ data: Record<string, CreatedRecord> }>('/rest/tasks', {
      title,
      bodyV2: buildCallTaskBody(number, crypto.randomUUID()),
      dueAt: new Date().toISOString(),
      status: 'DONE',
      assigneeId: workspaceMemberId,
    }),
  );
  if (!taskId) throw new Error('no id returned for the task');

  await client.post('/rest/taskTargets', { taskId, targetPersonId: personId });

  return taskId;
};

const handler = async (
  params: RoutePayload<RequestBody>,
  context: LogicFunctionExecutionContext,
): Promise<NotifyResult | Response> => {
  const personId = params.body?.personId;
  if (!personId || !UUID_PATTERN.test(personId)) {
    return errorResponse(400, 'Invalid contact.');
  }

  // The topic is tied to whoever clicked: each phone subscribes to its owner's topic only
  const workspaceMemberId = context.workspaceMemberId;
  if (!workspaceMemberId) {
    return errorResponse(403, 'Unknown user: open the CRM with your own account.');
  }

  const ntfyUrl = (process.env.NTFY_URL ?? '').trim().replace(/\/+$/, '');
  const ntfyToken = process.env.NTFY_TOKEN?.trim();
  const topicPrefix = (process.env.NTFY_TOPIC_PREFIX ?? 'call-').trim();
  const taskTitle = (process.env.CALL_TASK_TITLE ?? 'Call').trim();
  if (!ntfyUrl || !ntfyToken) {
    return errorResponse(500, 'The app is not configured: set NTFY_URL and NTFY_TOKEN.');
  }

  const client = new RestApiClient();

  // Topic named after the caller's email (jane.doe@… -> call-jane-doe): easy to type on a phone
  const member = await client
    .get<{ data: { workspaceMember: WorkspaceMember } }>(`/rest/workspaceMembers/${workspaceMemberId}`)
    .then((response) => response.data?.workspaceMember)
    .catch(() => undefined);
  const topic = `${topicPrefix}${topicSuffixFor(member, workspaceMemberId)}`;

  // Read the contact with the caller's own permissions
  const { data } = await client.get<{ data: { person: Person } }>(`/rest/people/${personId}`, {
    query: { depth: 1 },
  });
  const person = data?.person;
  if (!person) {
    return errorResponse(404, 'Contact not found.');
  }

  const number = buildE164(person.phones);
  if (!number) {
    return errorResponse(422, 'This contact has no phone number.');
  }

  const fullName =
    [person.name?.firstName, person.name?.lastName].filter(Boolean).join(' ') || 'Contact';
  const companyName = person.company?.name;
  const title = companyName ? `${fullName} – ${companyName}` : fullName;
  const message = [formatForDisplay(number), person.jobTitle].filter(Boolean).join(' · ');

  // JSON publishing (not headers) so accented names are sent as-is
  const ntfyResponse = await fetch(ntfyUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ntfyToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      title,
      message,
      click: `tel:${number}`,
      actions: [{ action: 'view', label: '📞', url: `tel:${number}`, clear: true }],
      tags: ['telephone_receiver'],
      priority: 4,
    }),
  });

  if (!ntfyResponse.ok) {
    console.error(`ntfy publish failed: HTTP ${ntfyResponse.status} ${await ntfyResponse.text()}`);
    return errorResponse(502, `Could not send the notification (ntfy HTTP ${ntfyResponse.status}).`);
  }

  let taskId: string | null = null;
  let taskError: string | null = null;
  if (taskTitle) {
    try {
      taskId = await createCallTask(client, taskTitle, number, personId, workspaceMemberId);
    } catch (error) {
      taskError = error instanceof Error ? error.message : String(error);
      console.error(`task creation failed: ${taskError}`);
    }
  }

  return { ok: true, number, name: fullName, topic, taskId, taskError };
};

export default defineLogicFunction({
  universalIdentifier: SEND_CALL_NOTIFICATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'send-call-notification',
  description:
    "Sends a push (ntfy) to the clicking user's phone (tap opens the dialer) and logs a done call task on the contact.",
  timeoutSeconds: 15,
  httpRouteTriggerSettings: {
    path: SEND_CALL_NOTIFICATION_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler,
});
