import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, FlatList, Modal, ScrollView } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import axios from 'axios';
import { Alert } from 'react-native'; // Import Alert from react-native
const ChatScreen = () => {
  const [inputText, setInputText] = useState('');
  const [botResponses, setBotResponses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Psychologist');
  const [initialMessage, setInitialMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isRoleMenuVisible, setIsRoleMenuVisible] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      sendInitialMessage(initialMessage);
    }
  }, [selectedCategory]);

  const sendToBot = async (message) => {
    try {
      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage';
      const apiKey = 'AIzaSyAIcndnMBJBnUKn1VXZLr309izWdQxvenk';

      const response = await axios.post(apiUrl, {
        prompt: {
          context: selectedCategory ? selectedCategory : '',
          examples: [],
          messages: [{ content: message }],
        },
        temperature: 0.25,
        top_k: 40,
        top_p: 0.95,
        candidate_count: 1,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: apiKey,
        },
      });     
 console.log('Ответ от бота:', response.data); // Log the entire response for debugging

      if (response.status === 200) {
        if (response.data.candidates && response.data.candidates.length > 0) {
          const botResponse = response.data.candidates[0].content;
          setBotResponses([...botResponses, botResponse]);
          setChatHistory([...chatHistory, { type: 'bot', content: botResponse }]);
        } else {
          console.error('Bot response not found in data');
        }
      } else {
        console.error('Failed to get bot response from Google API');
      }
    } catch (error) {
      console.error('An error occurred while sending request to Google API:', error);
    }
  };

  const sendInitialMessage = (message) => {
    if (message) {
      sendToBot(message);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsRoleMenuVisible(false);
    setBotResponses([]);
    setInputText('');
    // Set initial message based on the selected category
    let initialMessage = '';
    if (category === 'Psychologist') {
      initialMessage = 'I need help with my emotions.';
    } else if (category === 'Game') {
      initialMessage = 'Let\'s play a game!';
    }
    setInitialMessage(initialMessage);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setRoleModalVisible(true)}>
          <Text style={styles.sectionTitle}>Чаты</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={roleModalVisible}
          onRequestClose={() => {
            setRoleModalVisible(false);
          }}
        >
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <TouchableOpacity onPress={() => handleCategorySelect('Psychologist')}>
                <Text style={[styles.categoryItem, selectedCategory === 'Psychologist' && styles.selectedCategoryItem]}>Psychologist</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleCategorySelect('Game')}>
                <Text style={[styles.categoryItem, selectedCategory === 'Game' && styles.selectedCategoryItem]}>Game</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>
      </View>

      <FlatList
        style={styles.chatContainer}
        data={chatHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.message, item.type === 'bot' ? styles.botMessage : styles.userMessage]}>
            <Text style={styles.messageText}>{item.content}</Text>
          </View>
        )}
        onEndReached={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        ref={(ref) => { scrollViewRef = ref }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setInputText}
          value={inputText}
          placeholder="Введите текст"
        />
        <Button title="Отправить" onPress={() => {
          sendToBot(inputText);
          setChatHistory([...chatHistory, { type: 'user', content: inputText }]);
          setInputText('');
        }} />
      </View>
    </View>
  );
};

const HelpersScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.text}>Помощники</Text>
  </View>
);

const Drawer = createDrawerNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="Chat" component={ChatScreen} />
        <Drawer.Screen name="Helpers" component={HelpersScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  categoryItem: {
    fontSize: 16,
    paddingVertical: 10,
  },
  selectedCategoryItem: {
    backgroundColor: '#e6f2ff',
    borderRadius: 5,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  message: {
    maxWidth: '80%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  messageText: {
    fontSize: 16,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f2ff',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#f0f0f0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});

export default App;
