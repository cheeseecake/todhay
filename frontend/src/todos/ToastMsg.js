import { Toast } from "react-bootstrap";
import React from "react";

export const ToastMsg = ({ msg, setShowMsg, showMsg }) => {
  return (
    <Toast
      onClose={() => setShowMsg(false)}
      show={showMsg}
      delay={3000}
      autohide
    >
      <Toast.Body>{msg}</Toast.Body>
    </Toast>
  );
};
