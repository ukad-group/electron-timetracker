import clsx from "clsx";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { Disclosure } from "@headlessui/react";
import React, { ReactNode } from "react";

type DisclosureSectionProps = {
  toggleFunction: () => void;
  isOpen: boolean;
  title: string;
  children: ReactNode;
};

export default function DisclosureSection(props: DisclosureSectionProps) {
  return (
    <div className="w-full">
      <Disclosure>
        {({ open }) => (
          <div
            className={clsx(
              "max-h-20 px-4 py-4 bg-white shadow overflow-hidden transition-[max-height] ease-linear duration-300 sm:rounded-lg sm:px-6 dark:bg-dark-container dark:border dark:border-dark-border",
              {
                "max-h-80 overflow-y-auto ": open,
              }
            )}
          >
            <Disclosure.Button className=" w-full">
              <div className="flex justify-between cursor-pointer">
                <h2
                  id="manual-input-title"
                  className="text-lg font-medium text-gray-900 dark:text-dark-heading"
                >
                  {props.title}
                </h2>
                <ChevronDownIcon
                  className={clsx(
                    "transform transition-transform ease-linear duration-300 w-6 h-7 dark:text-gray-200",
                    {
                      "rotate-180": open,
                    }
                  )}
                  aria-hidden="true"
                />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel static>{props.children}</Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  );
}
