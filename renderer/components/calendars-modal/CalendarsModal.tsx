import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import GoogleCalendarAuth from "../google-calendar/GoogleCalendarAuth";

export default function CalendarsModal() {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="p-2 text-sm text-grey-600 cursor-pointer hover:text-blue-500"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Calendars
      </button>
      <Transition
        show={isOpen}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        as={Fragment}
      >
        <Dialog
          onClose={() => setIsOpen(false)}
          className="fixed inset-0 z-10 overflow-y-auto bg-green-300"
        >
          <Dialog.Panel className="absolute inset-0 z-10 overflow-y-auto bg-white">
            <Dialog.Title>
              <header className="bg-white shadow">
                <div className="flex justify-between h-16 px-2 mx-auto max-w-[1400px] sm:px-4 lg:px-8">
                  <div className="flex w-full justify-start items-center flex-shrink min-w-0 gap-4">
                    Calendars Integration
                  </div>
                  <div
                    className="flex w-full justify-end items-center flex-shrink min-w-0 gap-4"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg
                      className="h-6 w-6 text-gray-500 cursor-pointer"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {" "}
                      <line x1="18" y1="6" x2="6" y2="18" />{" "}
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                </div>
              </header>
            </Dialog.Title>
            <div>
              <div className="w-full px-4 pt-16">
                <div className="mx-auto w-full ounded-2xl bg-white p-2">
                  <GoogleCalendarAuth />
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>
    </>
  );
}
