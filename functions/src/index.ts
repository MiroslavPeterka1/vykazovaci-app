import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({ region: 'europe-west3', maxInstances: 10 });

export { onActivityWritten } from './activityCounters';
export { deleteCustomer } from './deleteCustomer';
export { deleteAccount } from './deleteAccount';
