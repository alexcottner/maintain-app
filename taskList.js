import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Pressable } from 'react-native';
import { getTaskList } from './db';
import { TaskWorkScreen } from './taskWork';
import { textOffset, container, itemContainer } from './style';

function EmptyList() {
  return <Text style={textOffset()}>No maintenance tasks created yet...</Text>;
}

export function TaskListScreen() {
  const [tasks, setTasks] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);

  async function fetchData() {
    setTasks(await getTaskList());
  }

  useEffect(() => {
    fetchData();
  }, []);

  const TaskItem = ({ item }) => {
    return (
      <Pressable style={itemContainer} onPress={() => {
        setCurrentItem(item);
      }}>
        {
          item.equipmentPic && <Image 
          style={styles.image}
          source={item.equipmentPic}
        />
        }
        <View style={styles.textContainer}>
          <Text style={styles.equipmentName}>{item.equipmentName} | {item.name}</Text>
          <Text style={styles.due}>{item.due}</Text>
          <Text style={styles.schedule}>{item.schedule}</Text>
        </View>
      </Pressable>
    );
  };

  if (currentItem) {
    return <TaskWorkScreen item={currentItem} callback={async() => {
      setCurrentItem(null);
      fetchData();
    }} />
  }

  return (
    <View style={container}>
      <FlatList
        data={tasks}
        renderItem={TaskItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={EmptyList}
      />
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
  due: {
    fontSize: 16,
    color: '#ddd'
  },
  schedule: {
    color: 'gray'
  }
});
