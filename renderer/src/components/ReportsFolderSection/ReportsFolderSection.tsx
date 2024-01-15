import { useMainStore } from "@/store/mainStore";
import { shallow } from "zustand/shallow";
import { FolderSelector } from "../FolderSelector";

const ReportsFolderSection = () => {
  const [reportsFolder, setReportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow,
  );

  return (
    <section className="h-full">
      <div className="overflow-y-auto h-full bg-white sm:rounded-lg p-2 flex flex-col gap-6 dark:bg-dark-container">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
            Folder with reports
          </span>
          <div className="mt-4 max-w-3xl">
            <div className="mb-4">
              <h4 className="text-gray-900 dark:text-dark-heading mb-1">
                For UKAD Users
              </h4>
              <p className="text-sm text-gray-500 dark:text-dark-main">
                The designated folder should be created and shared with you on
                Dropbox by the UKAD DevOps team. <br /> To locate your Dropbox
                root folder, please navigate to C:\Users[Windows user]\Dropbox.{" "}
                <br /> Our application's folder structure mirrors the format
                'John Galt {">"} 2024 {">"} week 05.' <br /> Kindly select the
                'John Galt' folder as your designated storage location.
              </p>
            </div>
            <div>
              <h4 className="text-gray-900 dark:text-dark-heading mb-1">
                For other Users
              </h4>
              <p className="text-sm text-gray-500 dark:text-dark-main">
                As a Non-UKAD user, you have the flexibility to choose any
                folder of your preference for storing your reports. However, we
                strongly recommend utilizing cloud storage services like
                Dropbox, Google Drive, etc. These services facilitate seamless
                report synchronization across your devices, offer automatic
                backups, and preserve a historical record of your data.
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center flex-shrink min-w-0 gap-4">
          <FolderSelector
            folderLocation={reportsFolder}
            setFolderLocation={setReportsFolder}
          />
        </div>
      </div>
    </section>
  );
};

export default ReportsFolderSection;