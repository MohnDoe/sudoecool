<template>
  <UHeader title="Sudoecool">
    <AuthState v-slot="{ loggedIn, user }">
      <div v-if="loggedIn" class="user-info">
        <span class="username">{{ user?.globalName || user?.username }}</span>
      </div>
    </AuthState>
  </UHeader>
</template>

<style scoped></style>
