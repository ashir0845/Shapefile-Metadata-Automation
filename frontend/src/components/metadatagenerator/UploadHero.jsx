import { Layers } from "lucide-react";
import Stepper from "./Stepper";

function UploadHero({ currentStep }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-5 bg-gradient-to-r from-blue-50 to-sky-50 px-6 py-6 sm:px-8">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-400 text-white shadow-sm">
          <Layers size={26} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
            Turn Your GIS Data into Useful Metadata
          </h2>
          <p className="mt-1 text-sm font-medium text-blue-700">
            Quick. Simple. Accurate.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
        <Stepper currentStep={currentStep} />
      </div>
    </section>
  );
}

export default UploadHero;
