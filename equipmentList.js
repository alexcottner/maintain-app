import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getEquipment, getEquipmentList } from './db';
import uuid from 'react-native-uuid';
import { EquipmentDetailScreen } from './equipmentEdit';
import { buttonOffset, textOffset, container, itemContainer } from './style';

function EmptyList() {
  return <Text style={textOffset()}>No equipment created yet...</Text>;
}

export function EquipmentListScreen() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  
  async function fetchData() {
    setEquipmentList(await getEquipmentList());
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (currentItem) {
    return <EquipmentDetailScreen item={currentItem} callback={() => {
      setCurrentItem(null);
      fetchData();
    }} />
  }

  let button = buttonOffset();

  const EquipmentItem = ({ item }) => {
    const nextTask = item.tasks?.[0];
  
    return (
      <Pressable style={itemContainer} onPress={async () => {
        let eq = await getEquipment(item.id);
        setCurrentItem(eq);
      }}>
        {item.pic && <Image 
          style={styles.image}
          source={item.pic}
        />}
        <View style={styles.textContainer}>
          <Text style={styles.equipmentName}>{item.name}</Text>
          {nextTask && (
            <View style={styles.nextTaskContainer}>
              <Text style={styles.taskName}>{nextTask.name}</Text>
              <Text style={styles.due}>Due: {nextTask.due}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={container}>
      <FlatList
        data={equipmentList}
        renderItem={EquipmentItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={EmptyList}
      />
      <FontAwesome.Button name="plus" backgroundColor={button.background} style={button.style} onPress={async () => {
        setCurrentItem({
          id: uuid.v4(),
          name: "",
          notes: "",
          pic: null,
          tasks: []
        });
      }}>Add Equipment</FontAwesome.Button>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
    marginRight: 10
  },
  textContainer: {
    justifyContent: 'center'
  },
  equipmentName: {
    fontWeight: 'bold',
    fontSize: 16 + (global.prefs?.fontOffset || 0),
    color: '#fff'
  },
  nextTaskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5
  },
  taskName: {
    fontSize: 14 + (global.prefs?.fontOffset || 0),
    color: '#ddd'
  },
  due: {
    fontSize: 14 + (global.prefs?.fontOffset || 0),
    color: 'gray'
  }
});
