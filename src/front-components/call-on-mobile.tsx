import { RestApiClient, RestApiClientError } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  Command,
  enqueueSnackbar,
  openSidePanelPage,
  SidePanelPages,
  t,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';

import {
  CALL_ON_MOBILE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  SEND_CALL_NOTIFICATION_ROUTE_PATH,
} from 'src/constants/universal-identifiers';
import type { NotifyResult } from 'src/types/notify-result';

const errorMessage = (error: unknown): string => {
  if (error instanceof RestApiClientError) {
    const body = error.body as { error?: string } | undefined;
    if (body?.error) return body.error;
  }
  return error instanceof Error ? error.message : String(error);
};

// Headless: runs once when the "Call on mobile" command is clicked, then unmounts.
const CallOnMobile = () => {
  const selectedRecordIds = useSelectedRecordIds();

  const execute = async () => {
    if (selectedRecordIds.length !== 1) {
      await enqueueSnackbar({ message: t('Select a single contact.'), variant: 'error' });
      return;
    }

    let result: NotifyResult;
    try {
      result = await new RestApiClient().post<NotifyResult>(
        `/s${SEND_CALL_NOTIFICATION_ROUTE_PATH}`,
        { personId: selectedRecordIds[0] },
      );
    } catch (error) {
      await enqueueSnackbar({
        message: t('Notification not sent: {reason}', { reason: errorMessage(error) }),
        variant: 'error',
      });
      return;
    }

    await enqueueSnackbar({
      message: t('Notification sent to your phone: {name}', { name: result.name ?? '' }),
      variant: 'success',
    });

    if (result.taskId) {
      // Show the logged call task so the user can add notes about the call
      await openSidePanelPage({
        page: SidePanelPages.ViewRecord,
        recordId: result.taskId,
        objectNameSingular: 'task',
      });
    } else if (result.taskError) {
      await enqueueSnackbar({
        message: t('Call task not created: {reason}', { reason: result.taskError }),
        variant: 'error',
      });
    }
  };

  return <Command execute={execute} />;
};

export default defineFrontComponent({
  universalIdentifier: CALL_ON_MOBILE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'call-on-mobile',
  description: "Sends the selected contact's number to the user's phone as a push notification",
  isHeadless: true,
  component: CallOnMobile,
});
