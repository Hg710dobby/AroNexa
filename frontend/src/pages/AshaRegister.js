import React from "react";
import Register from "./Register";

export default function AshaRegister() {
  return (
    <Register
      defaultRole="asha_worker"
      defaultLanguage="hindi"
      redirectPath="/admin"
      isAsha={true}
    />
  );
}