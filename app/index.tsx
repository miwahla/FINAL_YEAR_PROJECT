import { Redirect } from "expo-router";

export default function Index() {
  // Start app on the login screen
  return <Redirect href="/login" />;
}
