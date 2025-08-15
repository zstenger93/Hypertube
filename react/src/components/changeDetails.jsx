import React, { useState } from "react";

const ChangeDetails = ({ name, currentValue, api }) => {
  const [details, setDetails] = useState(currentValue);

  const updateValue = async () => {
    console.log(api);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 0,
        margin: 0,
      }}
    >
      <label>{name}</label>
      <input
        placeholder=""
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />
      <button onClick={updateValue}>Change {name}</button>
    </div>
  );
};

export default ChangeDetails;
