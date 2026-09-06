import LoadingIndicator from "./components/LoadingIndicator";

export default function Loading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-[#FFFFF0]"
    >
      <LoadingIndicator />
    </div>
  );
}
