import { useState } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";

export default function Tooltip({ children, tooltipText = "Copied" }) {
  const [isTransparent, setIsTransparent] = useState(true);
  const [isRemoved, setIsRemoved] = useState(true);

  const handleClick = () => {
    setIsTransparent(false);
    setIsRemoved(false);

    setTimeout(() => {
      setIsTransparent(true);

      setTimeout(() => setIsRemoved(true), 150);
    }, 750);
  };

  return (
    <div className="tooltip-wrapper" onClick={handleClick}>
      {children}

      <p
        className={`tooltip 
        ${isTransparent ? "opacity-0" : "opacity-90"} 
        ${isRemoved ? "invisible" : "visible"}`}
      >
        <CheckIcon className="w-4 h-4" />
        {tooltipText}
      </p>
    </div>
  );
}
