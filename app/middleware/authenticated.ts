export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, ready } = useUserSession();
  const discordStore = useDiscordStore();

  if (!ready.value) {
    return
  }

  if (!loggedIn.value) {
    return navigateTo('/error')
  }

})
