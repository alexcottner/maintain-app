import * as sqLite from 'expo-sqlite';
import { parseTimestamp } from './date';

const db = sqLite.openDatabaseSync('data');

export async function init() {
  return db.runAsync(`
    create table if not exists equipment(
      id text primary key not null,
      name text,
      notes text,
      pic blob
    );
    create table if not exists task(
      id text primary key not null,
      equipmentId text not null,
      name text,
      schedule text,
      due text,
      reminder integer,
      foreign key(equipmentId) references equipment(id)
    );
    create table if not exists pref(
      name text primary key not null,
      value text
    );
  `);
}

export async function getPrefs() {
  let result = await db.getAllAsync(`select name, value from pref;`);
  let userPrefs = {};
  for (let r of result) {
    userPrefs[r.name] = r.value;
  }

  return {
    fontOffset: userPrefs.fontOffset ? Number(userPrefs.fontOffset) || 0 : 0,
    driveStorage: userPrefs.driveStorage || null,
    reminderTime: userPrefs.reminderTime || "9:00",
    lastNotification: parseTimestamp(userPrefs.lastNotification)
  };
}

export async function setPref(name, val) {
  return db.runAsync(`INSERT OR REPLACE INTO pref(name, value) values(?, ?);`, [name, val]);
}

export async function saveEquipment(equipment) {
  await db.runAsync(
    `INSERT OR REPLACE INTO equipment(id, name, notes, pic) VALUES (?, ?, ?, ?);`,
    [
      equipment.id, 
      equipment.name, 
      equipment.notes || null, 
      equipment.pic ? JSON.stringify(equipment.pic) : null
    ]);

  await db.runAsync(`DELETE FROM task where equipmentId = ?;`, [ equipment.id ]);

  for (let t of equipment.tasks) {
    await db.runAsync(
      `INSERT OR REPLACE INTO task(id, equipmentId, name, schedule, due, reminder) VALUES(?, ?, ?, ?, ?, ?);`,
      [ t.id, equipment.id, t.name, t.schedule, t.due, t.reminder ]);
  }
}

export async function deleteEquipment(id) {
  return db.runAsync(
    `DELETE FROM task where equipmentId = ?;
    DELETE FROM equipment where id = ?;`,
    [ id, id ]);
}

export async function getEquipmentList() {
  let equipment = await db.getAllAsync(`SELECT id, name, notes, pic
    FROM equipment
    ORDER BY name;`);
  
  for (let e of equipment) {
    if (e.pic) {
      e.pic = JSON.parse(e.pic);
    }
  }
  
  return equipment;
}

export async function getEquipment(id) {
  let equipment = await db.getFirstAsync(
    `SELECT id, name, notes, pic 
      FROM equipment 
      WHERE id = ?
      order by name;`,
    [ id ]
  );

  equipment.tasks = await db.getAllAsync(
    `SELECT id, equipmentId, name, schedule, due, reminder 
      FROM task
      WHERE equipmentId = ?
      order by due;`,
    [ id ]
  );

  if (equipment.pic) {
    equipment.pic = JSON.parse(equipment.pic);
  }

  return equipment;
}

export async function getTaskList() {
  let tasks = await db.getAllAsync(
    `SELECT t.id, t.equipmentId, t.name, t.schedule, t.due, t.reminder, e.name equipmentName, e.pic equipmentPic, e.notes equipmentNotes
      FROM task t
      inner join equipment e on t.equipmentId = e.id
      order by due;`
  );

  for (let t of tasks) {
    if (t.equipmentPic) t.equipmentPic = JSON.parse(t.equipmentPic)
  }

  return tasks;
}

export async function getShortTaskList() {
  let tasks = await db.getAllAsync(`SELECT t.name, t.schedule, t.due, t.reminder, e.name equipmentName
    FROM task t
    inner join equipment e on t.equipmentId = e.id
    order by due;`);
        
  for (let t of tasks) {
    if (t.equipmentPic) t.equipmentPic = JSON.parse(t.equipmentPic)
  }

  return tasks;
}

export async function updateTask(id, nextDue, nextReminder) {
  return db.runAsync(
    `UPDATE task
      set due = ?,
      reminder = ?
      where id = ?;`,
    [ nextDue, nextReminder, id ]);
}
