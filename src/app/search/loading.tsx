import LoadingIndicator from "../components/LoadingIndicator";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#FFFFF0] flex flex-col items-center justify-center z-[999]">
      <LoadingIndicator />
    </div>
  );
}
