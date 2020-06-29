import React from "react";

const handleSubmit = (e) => {
  e.preventDefault();
  console.log("handle submit");
};

const EmailListSignUp = ({ currentInteraction }) => (
  <form>
    {currentInteraction.config.fields.map((f) => (
      <input type={f.type} name={f.name} placeholder={f.placeHolder} />
    ))}
    <button onClick={handleSubmit}>Submit</button>
  </form>
);

export default EmailListSignUp;
