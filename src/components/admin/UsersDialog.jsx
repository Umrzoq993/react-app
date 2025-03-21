// src/components/admin/UsersDialog.jsx
import React from "react";
import { ReactDialogBox } from "react-js-dialog-box";
import "react-js-dialog-box/dist/index.css";
import "../../style/users-dialog.scss";

const UsersDialog = ({ isOpen, title, onClose, onConfirm, children }) => {
  return (
    isOpen && (
      <ReactDialogBox
        headerText={title}
        headerBackgroundColor="#007bff"
        headerTextColor="#fff"
        closeButtonColor="#fff"
        bodyBackgroundColor="#fff"
        bodyTextColor="#333"
        headerHeight="60"
        onClose={onClose}
        closeBox={onClose}
      >
        <div>
          {children}
          <div className="dialog-actions">
            <button className="confirm-btn" onClick={onConfirm}>
              Confirm
            </button>
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </ReactDialogBox>
    )
  );
};

export default UsersDialog;
