import * as Notifications from 'expo-notifications';
import { getShortTaskList, setPref } from './db';
import { parseTimelessDateStr, parseDatelessTime } from './date';

const intervalMillis = 40 * 60 * 1000; // give ourselves 40 minutes of wiggle room
const dayMillis = 24 * 60 * 60 * 1000;

export async function checkForReminders() {
  // if no reminderTime is set, bail
  if (!global.prefs || !global.prefs.reminderTime) return;

  // if reminderTime is not parsed, bail
  let notifyTime = parseDatelessTime(global.prefs.reminderTime);
  if (!notifyTime) return;
  
  // if we've sent notifications since the last reminder time, bail
  if (global.prefs.lastNotification && global.prefs.lastNotification.getTime() + intervalMillis >= notifyTime.getTime()) return;

  // request permission to send notifications
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus !== 'granted') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT
      });

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
    }
  } catch (ex) {
    // can occur on first run while debugging, just swallow
    console.log(ex);
    return;
  }
  
  // get tasks that are due for notifications
  let tasks = await getShortTaskList();

  let now = new Date();
  let remindersDue = tasks.filter((x) => {
    let due = parseTimelessDateStr(x.due);
    let reminder = new Date(due.getTime() - (dayMillis * (x.reminder || 0)));
    return reminder <= now;
  });

  for (let t of remindersDue) {
    await Notifications.scheduleNotificationAsync({
      content: {
        body: `Task ${t.name} is scheduled for ${parseTimelessDateStr(t.due).toLocaleDateString()}`,
        title: `Maintenence due for ${t.equipmentName}`,
        autoDismiss: false
      }, trigger: notifyTime > now ? notifyTime : {
        seconds: 1
      }
    });
  }

  // set lastNotification var
  global.prefs.lastNotification = notifyTime;
  await setPref('lastNotification', global.prefs.lastNotification.toISOString());
}
