export default defineNuxtRouteMiddleware(() => {
  useDiscordSDK();
  const { isAuthenticated, status } = useDiscordStore();

  if (!isAuthenticated) {
    if (status == 'authenticating') {
      return abortNavigation()
    }
    return navigateTo('/')
  }
})
