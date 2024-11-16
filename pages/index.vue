<script setup lang="ts">

import {GoogleSignInButton, decodeCredential, type CredentialResponse} from "vue3-google-signin";
import type {TodoItem} from "~/types/todo";

import {useStorage} from '@vueuse/core';

const title = ref('');
const isDone = ref(0);
const successMessage = ref('');
const errorMessage = ref('');
const userId = ref('');



const googleAuthToken = useStorage('google_auth_token', null); // Automatically syncs with localStorage
const isSignedIn = computed(() => !!googleAuthToken.value); // Reactive sign-in status based on the token


const handleSubmit = async () => {
  if (!userId.value) {
    errorMessage.value = 'User ID is not available. Please sign in first.';
    return;
  }

  try {
    const response = await $fetch('/api/todos/create', {
      method: 'POST',
      body: {
        title: title.value,
        isDone: isDone.value,
        userId: userId.value,
      },
    });

    successMessage.value = response.message;
    errorMessage.value = '';
    title.value = '';
    isDone.value = 0;

    await fetchTodos();
  } catch (error) {
    successMessage.value = '';
    errorMessage.value = (error as Error).message;
  }
};


const todos = ref<TodoItem[]>([]);

const fetchTodos = async () => {
  try {
    const response = await $fetch(`/api/todos?userId=${encodeURIComponent(userId.value)}`);
    todos.value = response.todos;
  } catch (error) {
    errorMessage.value = (error as Error).message;
  }
};

const updateTodoStatus = async (todo: TodoItem) => {

  todo.isDone = todo.isDone === 1 ? 0 : 1;


  try {
    const response = await $fetch('/api/todos/update', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: {
        id: todo.id,
        isDone: todo.isDone,
      }
    });

    if (!response || !response.ok) {
      throw new Error('Failed to update todo status');
    }

    // You can handle the response message here if needed:
    successMessage.value = 'Todo status updated successfully';
  } catch (error) {
    // Handle the error and display it to the user
    errorMessage.value = (error as Error).message || 'An error occurred while updating the todo status.';
  }
};


const handleSignInSuccess = async (response: CredentialResponse) => {
  const {credential} = response;
  const decodedCredential = decodeCredential(credential);

  userId.value = decodedCredential.id;
  googleAuthToken.value = credential; // Automatically stored in localStorage by VueUse

  await fetchTodos();
};

const handleSignInError = () => {
  console.error("Signin Failed");
};

const handleLogout = () => {
  googleAuthToken.value = null; // Automatically removes the token from localStorage
  console.log("User logged out");
};



onMounted(() => {
  if (googleAuthToken.value) {
    // Token exists, mark as signed in and fetch todos
    userId.value = decodeCredential(googleAuthToken.value).id;
    fetchTodos();
  }
});

</script>

<template>

 {{googleAuthToken}}
  <template v-if="!isSignedIn">
    <p>YOU NEED TO SIGN IN</p>
    <GoogleSignInButton
        @success="handleSignInSuccess"
        @error="handleSignInError"
    />
  </template>
  <template v-else>
    <div>
      <h2>Create New Todo</h2>
      <form @submit.prevent="handleSubmit">
        <div>
          <label for="title">Title:</label>
          <input
              type="text"
              id="title"
              v-model="title"
              placeholder="Enter title"
              required
          />
        </div>
        <div>
          <label for="isDone">Is Done:</label>
          <input type="checkbox" id="isDone" v-model="isDone"/>
        </div>
        <button type="submit">Create Todo</button>
      </form>

      <p v-if="successMessage" class="success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>

    <div>
      <h1>Your Todos</h1>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      <ul v-if="todos.length > 0">
        <li v-for="todo in todos" :key="todo.id">
          <!-- Checkbox to toggle the todo status -->
          <input
              type="checkbox"
              :checked="todo.isDone === 1"
              @change="updateTodoStatus(todo)"

          />

          <strong>{{ todo.title }}</strong>

          <!-- Display status using a check mark or cross -->
          <span v-if="todo.isDone === 1">✔</span>
          <span v-else>❌</span>
        </li>
      </ul>
      <p v-else>No todos found.</p>
    </div>

    <button style="background-color:red;" @click="handleLogout">Logout</button>

  </template>

</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: auto;
}

label {
  font-weight: bold;
}

input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.success {
  color: green;
}

.error {
  color: red;
}


ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  gap: 10px;
}

input[type="checkbox"] {
  margin-right: 10px;
}

.error {
  color: red;
}


</style>
