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
    <div className="lg:absolute mt-6 w-full">
      <Disclosure>
        {({ open }) => (
          <div
            className={clsx(
              "max-h-16 px-4 py-4 bg-white shadow overflow-hidden transition-all ease-linear duration-300 sm:rounded-lg sm:px-6",
              {
                "max-h-80 overflow-y-auto ": open,
              }
            )}
          >
            <Disclosure.Button className=" w-full">
              <div className="flex justify-between cursor-pointer">
                <h2
                  id="manual-input-title"
                  className="text-lg font-medium text-gray-900"
                >
                  {props.title}
                </h2>
                <button
                  className={clsx(
                    "transform transition-transform ease-linear duration-300",
                    {
                      "rotate-180": open,
                    }
                  )}
                >
                  <ChevronDownIcon className="w-6 h-7" aria-hidden="true" />
                </button>
              </div>
            </Disclosure.Button>
            <Disclosure.Panel static>{props.children}</Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  );
}
