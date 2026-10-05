import {
  Check,
  Download,
  Eye,
  Upload,
} from "lucide-react";

function Stepper({ currentStep }) {
  const steps = [
    {
      number: 1,
      label: "Upload Shapefile",
      icon: Upload,
    },
    {
      number: 2,
      label: "Preview & Edit",
      icon: Eye,
    },
    {
      number: 3,
      label: "Generate Metadata",
      icon: Check,
    },
    {
      number: 4,
      label: "Download Excel",
      icon: Download,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-8">
      <div className="relative">

        {/* CONNECTING LINE */}
        <div className="absolute left-[7%] right-[7%] top-6 hidden h-0.5 bg-slate-200 sm:block" />

        {/* ACTIVE CONNECTING LINE */}
        <div
          className="absolute left-[7%] top-6 hidden h-0.5 bg-blue-600 transition-all duration-300 sm:block"
          style={{
            width:
              currentStep === 1
                ? "0%"
                : currentStep === 2
                ? "29%"
                : currentStep === 3
                ? "58%"
                : "86%",
          }}
        />

        <div className="relative z-10 grid grid-cols-4">

          {steps.map((step) => {
            const Icon = step.icon;

            const completed =
              currentStep > step.number;

            const active =
              currentStep === step.number;

            return (
              <div
                key={step.number}
                className="flex flex-col items-center"
              >

                {/* CIRCLE */}
                <div
                  className={`
                    flex h-12 w-12 items-center justify-center
                    rounded-full border-2
                    transition-all duration-300
                    ${
                      completed || active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-400"
                    }
                  `}
                >
                  {completed ? (
                    <Check size={21} strokeWidth={2.5} />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>

                {/* LABEL */}
                <p
                  className={`
                    mt-2 text-center text-[11px] font-semibold
                    sm:text-xs
                    ${
                      completed || active
                        ? "text-blue-600"
                        : "text-slate-500"
                    }
                  `}
                >
                  {step.label}
                </p>

              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}

export default Stepper;