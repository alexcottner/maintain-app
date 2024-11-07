export function parseTimelessDateStr(str) {
  if (!str) return null;
  
  let d = new Date(str);
  if (isNaN(d)) return null;

  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  return d;
}

export function getTimelessStr(d) {
  if (!d || isNaN(d)) return "";
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}

export function formatDateStr(str) {
  let d = parseTimelessDateStr(str);
  if (!d) return "";
  return d.toLocaleDateString();
}

export function parseDatelessTime(str) {
  if (!str) return null;

  let d = new Date();
  let strSplit = str.split(":");
  d.setHours(strSplit[0]);
  d.setMinutes(strSplit[1]);
  d.setSeconds(0);
  d.setMilliseconds(0);
  if (isNaN(d)) return null;

  return d;
}

export function formatTimeStr(str) {
  let d = parseDatelessTime(str);
  if (!d) return "";
  return d.toLocaleTimeString().replace(/(.*)(\:00)(.+)/, '$1$3');
}

export function parseTimestamp(str) {
  if (!str) return null;
  let d = new Date(str);
  return (!d || isNaN(d)) ? null : d;
}
