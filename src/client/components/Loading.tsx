export default function LoadingScreen() {
  return (
    <div className="w-full h-full bg-neutral-950 flex items-center justify-center flex-1">
      <div className="relative">
        <div className="w-12 h-12 border-3 border-neutral-800 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-3 border-transparent border-t-neutral-400 rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
