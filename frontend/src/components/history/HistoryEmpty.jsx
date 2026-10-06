export default function HistoryEmpty() {
    return (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white">
            <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">
                    No History Found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Generated metadata Excel files will appear here.
                </p>
            </div>
        </div>
    );
}