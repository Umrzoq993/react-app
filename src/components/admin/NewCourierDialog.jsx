import React, { useState } from "react";
import styled from "styled-components";
import axios from "../../axiosConfig";
import { toast } from "react-toastify";

export default function NewCourierDialog({ onClose, regions, cities }) {
  // Form fields
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [region, setRegion] = useState("");
  const [coveredCities, setCoveredCities] = useState([]);

  // Handle single city checkbox toggle
  const handleCityToggle = (cityId) => {
    setCoveredCities((prev) =>
      prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId]
    );
  };

  // Post to /accounts/couriers/create/
  const handleCreateCourier = async () => {
    // Basic validation
    if (!username || !fullName || !region || coveredCities.length === 0) {
      toast.error("Please fill in all fields and select at least one city.");
      return;
    }

    // Prepare data for CourierCreateSerializer
    const payload = {
      username: username,
      full_name: fullName,
      region: parseInt(region, 10),
      covered_cities: coveredCities.map((id) => parseInt(id, 10)),
    };

    try {
      const response = await axios.post("/accounts/couriers/create/", payload);
      toast.success("Courier created successfully!");
      console.log("Courier created:", response.data);
      onClose(); // close the dialog on success
    } catch (err) {
      // If the serializer or form returns errors, they’ll be in err.response.data
      console.error(err);
      toast.error(
        "Error creating courier: " + (err.response?.data || err.message)
      );
    }
  };

  return (
    <Wrapper>
      <h2>Create New Courier</h2>

      <FormRow>
        <label>Username:</label>
        <input
          type="text"
          placeholder="Enter courier's username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </FormRow>

      <FormRow>
        <label>Full Name:</label>
        <input
          type="text"
          placeholder="Enter courier's full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </FormRow>

      <FormRow>
        <label>Region:</label>
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">-- Select Region --</option>
          {regions.map((reg) => (
            <option key={reg.id} value={reg.id}>
              {reg.name}
            </option>
          ))}
        </select>
      </FormRow>

      <CitiesContainer>
        <label>Covered Cities:</label>
        <div className="city-list">
          {cities
            .filter((city) => String(city.region) === region) // or city.region.id if region is an object
            .map((city) => (
              <CityCheckbox key={city.id}>
                <input
                  type="checkbox"
                  checked={coveredCities.includes(city.id)}
                  onChange={() => handleCityToggle(city.id)}
                />
                {city.name}
              </CityCheckbox>
            ))}
        </div>
      </CitiesContainer>

      <ButtonsRow>
        <button onClick={handleCreateCourier}>Create</button>
        <button onClick={onClose}>Cancel</button>
      </ButtonsRow>
    </Wrapper>
  );
}

/* Styled-components for simple styling */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  background: #f5f5f5;
  padding: 2rem;
  border-radius: 8px;
  h2 {
    margin-bottom: 0.5rem;
  }
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  label {
    margin-bottom: 0.25rem;
    font-weight: 600;
  }
  input,
  select {
    padding: 0.4rem;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
`;

const CitiesContainer = styled.div`
  display: flex;
  flex-direction: column;
  label {
    font-weight: 600;
  }
  .city-list {
    margin-top: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 0.5rem;
    border-radius: 4px;
  }
`;

const CityCheckbox = styled.label`
  display: block;
  margin-bottom: 0.25rem;
  input {
    margin-right: 0.5rem;
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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
