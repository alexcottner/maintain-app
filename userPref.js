import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DatePicker from '@react-native-community/datetimepicker';
import { getPrefs, setPref } from './db';
import { buttonOffset, labelOffset, textOffset, container } from './style';
import { formatTimeStr, parseDatelessTime } from './date';

export function UserPrefsScreen() {
  const [fontOffset, setFontOffset] = useState(global.prefs?.fontOffset || 0);
  const [reminderValue, setReminderValue] = useState(null);

  async function setFont(offset) {
    await setPref('fontOffset', offset);
    global.prefs.fontOffset = Number(offset) || 0;
    setFontOffset(offset);
  }

  let button = buttonOffset(), label = labelOffset(), text = textOffset();

  return <View style={container}>
    {reminderValue && <DatePicker value={reminderValue} mode="time" onChange={async (evt, val) => {
      let time = `${val.getHours()}:${val.getMinutes().toString().padStart(2, '0')}`;
      await setPref('reminderTime', time);
      global.prefs = {
        ...global.prefs,
        reminderTime: time
      };
      setReminderValue(null);
    }} />}
    <Text style={label}>Font Size:</Text>
    <FontAwesome.Button iconStyle={{ fontSize: 12 }} style={button.style} backgroundColor={button.background} name={fontOffset === -4 ? 'check-square' : 'square'} onPress={async() => { await setFont(-4); }}>Small</FontAwesome.Button>
    <FontAwesome.Button iconStyle={{ fontSize: 16 }} style={button.style} backgroundColor={button.background} name={fontOffset === 0 ? 'check-square' : 'square'} onPress={async() => { await setFont(0); }}>Medium</FontAwesome.Button>
    <FontAwesome.Button iconStyle={{ fontSize: 20 }} style={button.style} backgroundColor={button.background} name={fontOffset === 4 ? 'check-square' : 'square'} onPress={async() => { await setFont(4); }}>Large</FontAwesome.Button>
    <FontAwesome.Button iconStyle={{ fontSize: 24 }} style={button.style} backgroundColor={button.background} name={fontOffset === 8 ? 'check-square' : 'square'} onPress={async() => { await setFont(8); }}>X-Large</FontAwesome.Button>

    <Text style={label}>Daily Reminder Time:</Text>
    <FontAwesome.Button name="bell" backgroundColor={button.background} style={button.style} onPress={() => {
          setReminderValue(parseDatelessTime(global.prefs?.reminderTime || "9:00"));
        }}>{ formatTimeStr(global.prefs?.reminderTime) }</FontAwesome.Button>
  </View>;
}


