import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, ScrollView, Alert, BackHandler, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import DatePicker from '@react-native-community/datetimepicker';
import { updateTask } from './db';
import { buttonOffset, image, container, labelOffset, pickerOffset } from './style';
import { formatDateStr, getTimelessStr, parseTimelessDateStr } from './date';
import { Picker } from '@react-native-picker/picker';

export function TaskWorkScreen({ item, callback }) {
  const [task, setTask] = useState(item);
  const [dtpValue, setDtpValue] = useState(null);

  BackHandler.addEventListener("hardwareBackPress", () => {
    callback();
    return true;
  })

  const save = async () => {
    await updateTask(task.id, task.due, task.reminder);
    callback();
  };

  let button = buttonOffset(), label = labelOffset(), picker = pickerOffset();

  return (
    <ScrollView>
      {dtpValue && <DatePicker value={dtpValue.val} mode="date" onChange={dtpValue.callback} />}
      <View style={container}>
        {task.equipmentPic && <Image style={image} source={task.equipmentPic} />}
        <Text style={label}>Equipment Name: { task.equipmentName }</Text>
        { task.equipmentNotes && <Text style={label}>Equipment Notes: { task.equipmentNotes }</Text>}
        <Text style={label}>Task Name: { item.name }</Text>
        <Text style={label}>Task Schedule: { item.schedule }</Text>
        
        <Text style={label}>Next Due Date:</Text>
        <FontAwesome.Button name="calendar" backgroundColor={button.background} style={button.style} onPress={() => {
          setDtpValue({
            val: parseTimelessDateStr(task.due) || new Date(),
            callback: (evt, val) => {
              setTask({ ...task, due: getTimelessStr(val) });
              setDtpValue(null);
            }
          });
        }}>{ formatDateStr(task.due) }</FontAwesome.Button>
        
        <Text style={label}>Remind Me:</Text>
          <View style={picker.view}>
            <Picker selectedValue={task.reminder} onValueChange={(val) => {
              setTask({ ...task, reminder: val });
            }} style={picker.picker}>
              <Picker.Item style={picker.item} label="Day Of" value={0} />
              <Picker.Item style={picker.item} label="Day Before" value={1} />
              <Picker.Item style={picker.item} label="2 Days Before" value={2} />
              <Picker.Item style={picker.item} label="3 Days Before" value={3} />
              <Picker.Item style={picker.item} label="4 Days Before" value={4} />
              <Picker.Item style={picker.item} label="5 Days Before" value={5} />
              <Picker.Item style={picker.item} label="6 Days Before" value={6} />
              <Picker.Item style={picker.item} label="7 Days Before" value={7} />
            </Picker>
          </View>
        <FontAwesome.Button name="save" backgroundColor={button.background} style={button.style} onPress={save}>Update Task</FontAwesome.Button>
      </View>
    </ScrollView>
  );
}
