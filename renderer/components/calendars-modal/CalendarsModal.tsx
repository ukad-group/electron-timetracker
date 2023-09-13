import { Fragment, useState } from "react";
import { Dialog, Disclosure, Transition } from "@headlessui/react";
import GoogleCalendarAuth from "../google-calendar/GoogleCalendarAuth";
import Button from "../ui/Button";
import { ChevronUpIcon } from '@heroicons/react/20/solid'
export default function CalendarsModal() {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="p-2 text-sm text-grey-600 cursor-pointer hover:text-blue-500"
        onClick={() => {setIsOpen(true)}}>
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
        <Dialog onClose={() => setIsOpen(false)} className="fixed inset-0 z-10 overflow-y-auto bg-green-300">
          <Dialog.Panel className="absolute inset-0 z-10 overflow-y-auto bg-white">
            <Dialog.Title>
              <header className="bg-white shadow">
                <div className="flex justify-between h-16 px-2 mx-auto max-w-[1400px] sm:px-4 lg:px-8">
                  <div className="flex w-full justify-start items-center flex-shrink min-w-0 gap-4">
                    Calendars Integration
                  </div>
                  <div className="flex w-full justify-end items-center flex-shrink min-w-0 gap-4" onClick={() => setIsOpen(false)}>
                    <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">  <line x1="18" y1="6" x2="6" y2="18" />  <line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </div>
                </div>
              </header>
            </Dialog.Title>
            <div>
              <div className="w-full px-4 pt-16">
                <div className="mx-auto w-full ounded-2xl bg-white p-2">
                  <Disclosure>
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex w-full justify-between rounded-lg bg-blue-300 px-4 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-400 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                          <span>Google Calendar</span>
                          <ChevronUpIcon
                            className={`${
                              open ? 'rotate-180 transform' : ''
                            } h-5 w-5 text-blue-600`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                          <GoogleCalendarAuth/>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                  <Disclosure as="div" className="mt-2">
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex w-full justify-between rounded-lg bg-blue-300 px-4 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-400 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                          <span>Another Calendar</span>
                          <ChevronUpIcon
                            className={`${
                              open ? 'rotate-180 transform' : ''
                            } h-5 w-5 text-blue-600`}
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                          No.
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </Transition>
    </>
  );
}