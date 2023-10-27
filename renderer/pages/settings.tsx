import Link from "next/link";
import { shallow } from "zustand/shallow";
import { XMarkIcon } from "@heroicons/react/24/solid";
import FolderSelector from "../components/FolderSelector";
import { useMainStore } from "../store/mainStore";
import TrelloConnection from "../components/TrelloConnection";
// import Office365Connection from "../components/Office365Connection";
import GoogleConnection from "../components/GoogleConnection";

const SettingsPage = () => {
  const [reportsFolder, setReportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );

  return (
    <div className="mx-auto sm:px-6 max-w-3xl flex flex-col gap-6 px-6 py-10 dark:bg-dark-back">
      <section>
        <div className="bg-white shadow sm:rounded-lg p-6 flex items-center justify-between dark:bg-dark-container dark:border dark:border-dark-border">
          <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
            Settings
          </span>
          <Link href="/">
            <div className="flex justify-end items-center flex-shrink min-w-0 gap-4">
              <XMarkIcon
                className="w-6 h-6 cursor-pointer dark:text-dark-main"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>
      </section>
      <section>
        <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col gap-6 dark:bg-dark-container dark:border dark:border-dark-border">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
              Folder with reports
            </span>
            <p className="text-sm text-gray-500 dark:text-dark-main">
              Specify the path on your computer where your reports will be saved
            </p>
          </div>
          <div className="flex w-full items-center flex-shrink min-w-0 gap-4">
            <FolderSelector
              folderLocation={reportsFolder}
              setFolderLocation={setReportsFolder}
            />
          </div>
        </div>
      </section>
      <section>
        <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col gap-6 dark:bg-dark-container dark:border dark:border-dark-border">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
              Connections
            </span>
            <p className="text-sm text-gray-500 dark:text-dark-main">
              You can connect available resources to use their capabilities to
              complete your reports
            </p>
          </div>
          <TrelloConnection />
          <GoogleConnection />
          {/* <Office365Connection /> */}
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
