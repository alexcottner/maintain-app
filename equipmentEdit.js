import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, ScrollView, Alert, BackHandler, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import DatePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { saveEquipment, deleteEquipment } from './db';
import { buttonOffset, image, textOffset, labelOffset, inputOffset, container, pickerOffset } from './style';
import uuid from 'react-native-uuid';
import { formatDateStr, getTimelessStr, parseTimelessDateStr } from './date';
import { Picker } from '@react-native-picker/picker';

function EmptyList() {
  return <Text style={textOffset()}>No tasks created yet...</Text>;
}

export function EquipmentDetailScreen({ item, callback }) {
  const [equipment, setEquipment] = useState(item);
  const [tasks, setTasks] = useState(item.tasks);
  const [dtpValue, setDtpValue] = useState(null);

  BackHandler.addEventListener("hardwareBackPress", () => {
    callback();
    return true;
  })

  const updateTask = (index, field, value) => {
    let newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const removeTask = (index) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            let newTasks = [...tasks];
            newTasks.splice(index, 1);
            setTasks(newTasks);
          }
        }
      ]
    );
  };

  const deleteEq = () => {
    Alert.alert(
      "Delete Equipment",
      "Are you sure you want to delete this equipment and all related maintenance tasks?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async() => {
            await deleteEquipment(item.id);
            callback();
          }
        }
      ]
    );
  };

  const addTask = () => {
    let newTasks = [...tasks];
    newTasks.push({ id: uuid.v4(), name: '', schedule: '', due: getTimelessStr(new Date()), reminder: 1 });
    setTasks(newTasks);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1
    });

    if (result.assets && result.assets.length && result.assets[0].uri) {
      let resized = await manipulateAsync(result.assets[0].uri, [
        {
          resize: {
            width: 1024,
            height: 768
          }
        }
      ],{
        compress: .75,
        format: SaveFormat.JPEG,
        base64: true
      })
      let newEquipment = { ...equipment, pic: {
        uri: `data:image/jpeg;base64,${resized.base64}`
      }};
      setEquipment(newEquipment);
    }
  };

  const save = async () => {
    let newEquipment = { ...equipment, tasks };
    await saveEquipment(newEquipment);
    callback();
  };

  let label = labelOffset(), text = textOffset(), button = buttonOffset(), input = inputOffset(), picker = pickerOffset();

  return (
    <ScrollView>
      {dtpValue && <DatePicker value={dtpValue.val} mode="date" onChange={dtpValue.callback} />}
      <View style={container}>
        {equipment.pic && <Image style={image} source={equipment.pic} />}
        <FontAwesome.Button name="image" backgroundColor={button.background} style={button.style} onPress={pickImage}>Choose Image</FontAwesome.Button>
        <Text style={label}>Name:</Text>
        <TextInput style={input} value={equipment.name} onChangeText={(text) => setEquipment({ ...equipment, name: text })} />

        <Text style={label}>Notes:</Text>
        <TextInput style={input} multiline value={equipment.notes} onChangeText={(text) => setEquipment({ ...equipment, notes: text })} />

        <Text style={label}>Tasks:</Text>
        <FlatList
          nestedScrollEnabled={false}
          scrollEnabled={false}
          data={tasks}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={EmptyList}
          renderItem={({ item, index }) => (
            <View style={{
              paddingBottom: 20
            }}>
              <Text style={label}>Task Name:</Text>
              <TextInput style={input} value={item.name} onChangeText={(text) => updateTask(index, 'name', text)} />

              <Text style={label}>Task Schedule:</Text>
              <TextInput style={input} value={item.schedule} onChangeText={(text) => updateTask(index, 'schedule', text)} />

              <Text style={label}>Next Due Date:</Text>
              <FontAwesome.Button name="calendar" backgroundColor={button.background} style={button.style} onPress={() => {
                setDtpValue({
                  val: parseTimelessDateStr(item.due) || new Date(),
                  callback: (evt, val) => {
                    updateTask(index, 'due', getTimelessStr(val));
                    setDtpValue(null);
                  }
                });
              }}>{ formatDateStr(item.due) }</FontAwesome.Button>
              <Text style={label}>Remind Me:</Text>
              <View style={picker.view}>
                <Picker selectedValue={item.reminder} onValueChange={(val) => {
                  updateTask(index, 'reminder', val);
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
              
              <FontAwesome.Button name="trash" backgroundColor={button.background} style={{
                ...button.style,
                marginTop: 15
              }} onPress={() => removeTask(index)}>Remove Task (above)</FontAwesome.Button>
            </View>
          )}
        />

        <FontAwesome.Button name="plus" backgroundColor={button.background} style={button.style} onPress={addTask}>Add Task</FontAwesome.Button>
        <FontAwesome.Button name="trash" backgroundColor={button.background} style={button.style} onPress={deleteEq}>Delete Equipment</FontAwesome.Button>
        <FontAwesome.Button name="save" backgroundColor={button.background} style={button.style} onPress={save}>Save Equipment</FontAwesome.Button>
      </View>
    </ScrollView>
  );
}
