export default function PageLoadingSpinner() {
    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-50 flex items-center justify-center">
            <div className="rounded-md h-12 w-12 border-4 border-t-4 border-blue-500 animate-spin"></div>
        </div>
    );
}