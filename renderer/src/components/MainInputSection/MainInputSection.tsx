import { useState } from "react";
import { LOCAL_STORAGE_VARIABLES } from "@/helpers/contstants";

const MainInputSection = () => {
  const [mainSection, setMainSection] = useState(
    localStorage.getItem(LOCAL_STORAGE_VARIABLES.IS_MANUAL_INPUT_MAIN) === "true",
  );

  const onToggle = () => {
    localStorage.setItem(LOCAL_STORAGE_VARIABLES.IS_MANUAL_INPUT_MAIN, (!mainSection).toString());
    setMainSection(!mainSection);
  };

  return (
    <section className="h-full">
      <div className="overflow-y-auto h-full bg-white sm:rounded-lg p-2 flex flex-col gap-6 dark:bg-dark-container">
        <div className="flex flex-col gap-3">
          <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">Main input</span>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="mainInput"
                defaultChecked={mainSection}
                name="mainInput"
                onClick={onToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-dark-button-back rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-dark-button-hover"></div>
              <span className="ml-3 text-sm font-medium text-gray-500 dark:text-dark-main">
                Toggle to choose <strong>{mainSection ? "Registrations List" : "Manual Input"}</strong> as main
              </span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainInputSection;
