import React from "react";
import "./style.scss";
import yearsLater from "../../assets/2000-years-later.jpg";

const Loading = () => {
  return (
    <div id="Loading-FullPage">

      {/* FULLSCREEN BACKGROUND IMAGE */}
      <img
        src={yearsLater}
        alt="Loading"
        className="loading-bg-image"
      />

      {/* DARK OVERLAY */}
      <div className="loading-overlay-full"></div>

      {/* YOUR EXISTING LOADER ANIMATION */}
      <div className="animation"></div>
      <div className="animation-inner"></div>

    </div>
  );
};

export default Loading;
