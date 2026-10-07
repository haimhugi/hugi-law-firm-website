import { siteConfig } from '../config/site';
import type { TextAlign } from '../features/a11y/a11y-state';

const phone = siteConfig.officePhone;

export const he = {
  menuOpen: 'פתח תפריט',
  menuClose: 'סגור תפריט',
  nameRequired: 'נא למלא שם מלא.',
  phoneRequired: 'נא למלא מספר טלפון.',
  phoneInvalid: 'נא להזין מספר טלפון עם 7 ספרות לפחות.',
  fixFields: 'יש לתקן את השדות המסומנים.',
  submitLabel: 'שלח הודעה',
  submitPending: 'שולח...',
  submitSent: 'נשלח',
  submitOk: 'ההודעה נשלחה בהצלחה. נחזור אליכם בהקדם.',
  submitRejected: `שגיאה בשליחה. נסו שוב או התקשרו למשרד: ${phone}.`,
  submitTimeout: `השליחה לא הושלמה בזמן. הפרטים נשמרו בטופס — נסו שוב או התקשרו למשרד: ${phone}.`,
  submitOffline: `שגיאת חיבור. נסו שוב או התקשרו למשרד: ${phone}.`,
  align: {
    '': 'יישור טקסט',
    right: 'יישור לימין',
    center: 'יישור למרכז',
    left: 'יישור לשמאל',
  } satisfies Record<TextAlign, string>,
};
