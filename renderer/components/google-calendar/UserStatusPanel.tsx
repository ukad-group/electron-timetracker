import { CheckIcon } from "@heroicons/react/24/solid";
import Button from "../ui/Button";

type UserStatusPanelProps = {
  googleUsername: string;
  googleAccountId: string;
  signOutHandler: (id: string) => void;
};

const UserStatusPanel = ({
  googleUsername,
  googleAccountId,
  signOutHandler,
}: UserStatusPanelProps) => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-4">
        <div className="text-green-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200 dark:text-green-400 dark:bg-green-400/20">
          Already authorized
          <CheckIcon className="w-4 h-4 fill-green-700" />
        </div>

        {googleUsername?.length > 0 && (
          <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-white dark:text-dark-heading dark:bg-blue-500/30">
            {googleUsername}
          </div>
        )}
      </div>
      <Button text="SignOut" callback={() => signOutHandler(googleAccountId)} />
    </div>
  );
};

export default UserStatusPanel;
