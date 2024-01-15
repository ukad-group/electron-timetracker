import { BetaToggle } from "@/shared/BetaToggle";

const VersionSection = () => (
  <section className="h-full">
    <div className="overflow-y-auto h-full bg-white sm:rounded-lg p-2 flex flex-col gap-6 dark:bg-dark-container">
      <div className="flex flex-col gap-1">
        <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
          Stable or beta version
        </span>
        <BetaToggle />
      </div>
    </div>
  </section>
);

export default VersionSection;