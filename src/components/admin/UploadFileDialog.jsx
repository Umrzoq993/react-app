import React, { useState } from "react";
import styled from "styled-components";
import { FileUploader } from "react-drag-drop-files";
import axios from "../../axiosConfig";
import { toast } from "react-toastify";

const fileTypes = ["XLS", "XLSX"];

export default function UploadFileDialog({ onClose }) {
  const [file, setFile] = useState(null);

  // New state for toggling SMS
  const [sendSms, setSendSms] = useState(true);

  const handleChange = (file) => {
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    // Append the toggle value
    formData.append("send_sms", sendSms);

    try {
      const response = await axios.post("/accounts/upload/", formData);
      toast.success("File uploaded successfully.");
      console.log(response.data);
      onClose(); // close dialog on success
    } catch (err) {
      toast.error(
        "Error uploading file: " + (err.response?.data?.error || err.message)
      );
    }
  };

  return (
    <Wrapper>
      <FileUploader handleChange={handleChange} name="file" types={fileTypes} />
      <CheckboxRow>
        <label>
          <input
            type="checkbox"
            checked={sendSms}
            onChange={() => setSendSms((prev) => !prev)}
          />
          Send SMS for each product?
        </label>
      </CheckboxRow>
      <button onClick={handleUpload}>Upload File</button>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  height: 40vh;
  background-color: #f5f5f5;
  button {
    padding: 0.4rem 0.75rem;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    background-color: #f59023;
    color: white;
    border-radius: 4px;
    transition: background-color 0.2s;
    &:hover {
      background-color: #e07c1e;
    }
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  label {
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;
