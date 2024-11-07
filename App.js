import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import { TaskListScreen } from './taskList';
import { EquipmentListScreen } from './equipmentList';
import { UserPrefsScreen } from './userPref';
import { init, getPrefs } from './db';
import { container, text } from './style';
import { checkForReminders } from './reminder';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const Tab = createBottomTabNavigator();

Notifications.setNotificationHandler({
  handleNotification: async() => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: false
  })
});

Notifications.addNotificationReceivedListener(n => { /* do nothing for now */ });

Notifications.addNotificationResponseReceivedListener(r => { /* do nothing for now */ });

TaskManager.defineTask('BACKGROUND-NOTIFICATION-TASK', ({ data, err, exec }) => { /* do nothing for now */ });

TaskManager.defineTask('background-fetch', async() => {
  global.prefs = await getPrefs();
  await checkForReminders();
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export default function App() {
  const [initComplete, setInitComplete] = useState(false);
  const [debug, setDebug] = useState("");

  const doInit = async() => {
    try {
      await init();
      global.prefs = await getPrefs();
      await checkForReminders();
      await BackgroundFetch.registerTaskAsync('background-fetch', {
        minimumInterval: 60*15, // every 15 minutes
        stopOnTerminate: false,
        startOnBoot: true
      });
      setInitComplete(true);
    } catch (err) {
      setDebug("\n\n\n" + JSON.stringify(err.toString()));
    }
  };

  useEffect(() => {
    doInit();
  }, []);

  if (!initComplete) {
    return <View style={container}><Text style={text}>{ debug ? JSON.stringify(debug) : "Loading..." }</Text></View>
  }

  return (
    <NavigationContainer theme={{
      dark: true,
      colors: {
        background: '#000',
        text: '#fff'
      }
    }}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: { backgroundColor: '#000' },
          unmountOnBlur: true,
          tabBarLabelStyle: {
            fontSize: 12 + (global.prefs.fontOffset || 0)
          }
        }}
      >
        <Tab.Screen 
          name="Maintenance Tasks" 
          component={TaskListScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <FontAwesome5 name="clipboard-list" size={size} color={color} />
            )
          }}
        />
        <Tab.Screen 
          name="Equipment" 
          component={EquipmentListScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <FontAwesome5 name="toolbox" size={size} color={color} />
            )
          }}
        />
        <Tab.Screen
          name="Settings"
          component={UserPrefsScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <FontAwesome5 name="cogs" size={size} color={color} />
            )
          }}
        />
      </Tab.Navigator>
      <StatusBar style="inverted" />
    </NavigationContainer>
  );
}
