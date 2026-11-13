import React from "react"
import Login from "./Login";
export default function AshaLogin() {
  return (
    <Login
      defaultRole="asha_worker"
      redirectPath="/admin"
      isAsha={true}
    />
  );
}