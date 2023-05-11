import DateSelector from "../components/DateSelector";
import Table from "../components/Table";
import Header from "../components/Header";

export default function Home() {
  return (
    <>
      <div className="min-h-full">
        <Header />

        <main className="py-10">
          <div className="max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
            <div className="space-y-6 lg:col-start-1 lg:col-span-2">
              <section>
                <DateSelector />
              </section>
              <section>
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <Table />
                  </div>
                  <div>
                    <a
                      href="#"
                      className="block bg-gray-50 text-sm font-medium text-gray-500 text-center px-4 py-4 hover:text-gray-700 sm:rounded-b-lg"
                    >
                      Track more time
                    </a>
                  </div>
                </div>
              </section>
            </div>

            <section
              aria-labelledby="manual-input-title"
              className="lg:col-start-3 lg:col-span-1"
            >
              <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
                <h2
                  id="manual-input-title"
                  className="text-lg font-medium text-gray-900"
                >
                  Manual input
                </h2>

                <textarea
                  rows={10}
                  className="mt-3 py-2 px-3 shadow-sm focus-visible:outline-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  defaultValue={""}
                  spellCheck={false}
                />
                <div className="mt-6 flex flex-col justify-stretch">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
