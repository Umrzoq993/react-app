import React, { useEffect, useRef, useState } from "react";
import "../../style/edit-region-city.scss";

export default function EditRegionCityContent({
  courier,
  regions,
  allCities,
  onSave,
  onClose,
}) {
  const [tempCourier, setTempCourier] = useState(null);
  const [filteredCities, setFilteredCities] = useState([]);

  // Reference to the 'Select All' checkbox, so we can manually set its 'indeterminate' property
  const selectAllRef = useRef(null);

  useEffect(() => {
    if (!courier) {
      setTempCourier(null);
      return;
    }
    const copy = { ...courier };
    copy.region = copy.region || { id: null, name: "" };
    // Convert covered_cities to an array of numeric IDs
    copy.covered_cities = Array.isArray(copy.covered_cities)
      ? copy.covered_cities.map((c) => (typeof c === "object" ? c.id : c))
      : [];
    setTempCourier(copy);
  }, [courier]);

  useEffect(() => {
    if (!tempCourier?.region?.id) {
      setFilteredCities([]);
      return;
    }
    const regionId = tempCourier.region.id;
    const filtered = allCities.filter((city) =>
      typeof city.region === "number"
        ? city.region === regionId
        : city.region?.id === regionId
    );
    setFilteredCities(filtered);
  }, [tempCourier, allCities]);

  // Check if all filtered cities are selected
  const allSelected =
    filteredCities.length > 0 &&
    filteredCities.every((city) =>
      tempCourier?.covered_cities?.includes(city.id)
    );

  // Check if some (but not all) are selected, for setting the indeterminate state
  const someSelected =
    filteredCities.some((city) =>
      tempCourier?.covered_cities?.includes(city.id)
    ) && !allSelected;

  // Manually manage the "indeterminate" state on the Select All checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleRegionChange = (e) => {
    const newRegionId = parseInt(e.target.value, 10) || null;
    setTempCourier((prev) => ({
      ...prev,
      region: { id: newRegionId },
      covered_cities: [],
    }));
  };

  const handleCityCheckboxChange = (cityId) => {
    setTempCourier((prev) => {
      const updatedCities = prev.covered_cities.includes(cityId)
        ? prev.covered_cities.filter((id) => id !== cityId)
        : [...prev.covered_cities, cityId];
      return { ...prev, covered_cities: updatedCities };
    });
  };

  // Toggle all or none
  const handleToggleAllCities = () => {
    if (!tempCourier) return;
    if (allSelected) {
      // Deselect all
      setTempCourier((prev) => ({
        ...prev,
        covered_cities: [],
      }));
    } else {
      // Select all
      const allIds = filteredCities.map((city) => city.id);
      setTempCourier((prev) => ({
        ...prev,
        covered_cities: allIds,
      }));
    }
  };

  const handleSave = () => {
    if (!tempCourier) return;
    onSave(tempCourier.id, tempCourier.covered_cities);
  };

  if (!tempCourier) return <div>Yuklanmoqda...</div>;

  return (
    <div className="edit-region-city">
      <div className="field-group">
        <label htmlFor="region-select">Viloyat:</label>
        <select
          id="region-select"
          value={tempCourier.region.id || ""}
          onChange={handleRegionChange}
        >
          <option value="">-- Viloyatni tanlang --</option>
          {regions.map((reg) => (
            <option key={reg.id} value={reg.id}>
              {reg.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field-group city-checkbox-group">
        <label>Tumanlar:</label>

        {/* Select All / Deselect All checkbox */}
        <div className="select-all">
          <label>
            <input
              type="checkbox"
              ref={selectAllRef}
              checked={allSelected}
              onChange={handleToggleAllCities}
            />
            Barchasini tanlash
          </label>
        </div>

        {/* List of checkboxes for filtered cities */}
        <div className="city-checkboxes">
          {filteredCities.map((city) => {
            const checked = tempCourier.covered_cities.includes(city.id);
            return (
              <label key={city.id} className="city-checkbox">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCityCheckboxChange(city.id)}
                />
                {city.name}
              </label>
            );
          })}
        </div>
      </div>

      <div className="dialog-actions">
        <button className="save-btn" onClick={handleSave}>
          Saqlash
        </button>
        <button className="cancel-btn" onClick={onClose}>
          Bekor qilish
        </button>
      </div>
    </div>
  );
}
