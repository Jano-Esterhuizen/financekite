export default function LandingPage() {
  return (
    <div>
      {/* Hero placeholder — gives enough top padding for the floating navbar */}
      <section className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white pt-28 pb-20">
        <h1 className="text-5xl font-bold text-gray-900">Hero Section</h1>
        <p className="mt-4 text-gray-400">Scroll down to see the navbar shrink</p>
      </section>

      {/* Second section — triggers scroll */}
      <section
        id="features"
        className="flex min-h-screen items-center justify-center bg-white"
      >
        <h2 className="text-3xl font-bold text-gray-900">Features Section</h2>
      </section>
    </div>
  )
}
