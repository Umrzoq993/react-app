import React from "react";
import { ReactDialogBox } from "react-js-dialog-box";
import "react-js-dialog-box/dist/index.css";
import "../../style/users-dialog.scss";

const UsersDialog = ({ isOpen, title, onClose, onConfirm, children }) => {
  return (
    isOpen && (
      <ReactDialogBox
        headerText={title}
        headerBackgroundColor="#F59023"
        headerTextColor="#fff"
        closeButtonColor="#fff"
        bodyBackgroundColor="#fff"
        bodyTextColor="#333"
        headerHeight="80"
        onClose={onClose}
        closeBox={onClose}
      >
        <div className="dialog-container">
          <div className="dialog-body">{children}</div>
          <div className="dialog-actions">
            <button className="confirm-btn" onClick={onConfirm}>
              Tasdiqlash
            </button>
            <button className="cancelbtn" onClick={onClose}>
              Bekor qilish
            </button>
          </div>
        </div>
      </ReactDialogBox>
    )
  );
};

export default UsersDialog;
