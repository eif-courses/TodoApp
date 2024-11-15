<script setup lang="ts">
import {ref} from 'vue';

import {definePageMeta} from '#imports'
import {GoogleSignInButton, decodeCredential, type CredentialResponse} from "vue3-google-signin";

definePageMeta({auth: false})


const title = ref('');
const isDone = ref(false);
const email = ref('m.gzegozevskis@gmail.com');
const successMessage = ref('');
const errorMessage = ref('');

const handleSubmit = async () => {
  try {
    const response = await $fetch('/api/todos/create', {
      method: 'POST',
      body: {
        title: title.value,
        isDone: isDone.value ? 1 : 0, // Convert boolean to SQLite-compatible value
        email: email.value,
      },
    });

    successMessage.value = response.message;
    errorMessage.value = '';
    title.value = '';
    isDone.value = false;
    email.value = '';
  } catch (error) {
    successMessage.value = '';
    errorMessage.value = (error as Error).message;
  }
};


const todos = ref([]);

const fetchTodos = async () => {
  try {
    const response = await $fetch(`/api/todos?email=${encodeURIComponent(email.value)}`);
    todos.value = response.todos;
  } catch (error) {
    errorMessage.value = (error as Error).message;
  }
};

const updateTodoStatus = async (todo: any) => {
  try {
    const response = await $fetch('/api/todos/update', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: todo.id,
        isDone: todo.isDone,
      }),
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
const handleSignInSuccess = (response: CredentialResponse) => {
  const {credential} = response;
  const decodedCredential = decodeCredential(credential);
  console.log("User:", decodedCredential);
};

const handleSignInError = () => {
  console.error("Signin Failed");
};

onMounted(fetchTodos);

</script>


<template>
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
      <div>
        <label for="email">Email:</label>
        <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Enter email"
            required
        />
      </div>
      <button type="submit">Create Todo</button>
    </form>

    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>

  <div>
    <h1>Your Todos</h1>

    <!-- Error message if there's any -->
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

    <!-- Todo list -->
    <ul v-if="todos.length > 0">
      <li v-for="todo in todos" :key="todo.id">
        <!-- Checkbox for marking a todo as done -->
        <input
            type="checkbox"
            v-model="todo.isDone"
            @change="updateTodoStatus(todo)"
            :checked="todo.isDone"
        />
        <strong>{{ todo.title }}</strong>
        <span v-if="todo.isDone">✔</span>
        <span v-else>❌</span>
      </li>
    </ul>

    <p v-else>No todos found for this email.</p>
  </div>

  <div class="center">
    <GoogleSignInButton
        @success="handleSignInSuccess"
        @error="handleSignInError"
    />
  </div>


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
