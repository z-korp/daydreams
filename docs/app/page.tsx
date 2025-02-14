import { Cards } from "nextra/components";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mx-auto">
            <img
              className="mx-auto"
              src="/Daydreams.png"
              alt="Daydreams Logo"
            />
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/80">
            Daydreams is a powerful framework for building generative agents
            that can execute tasks across any blockchain or API.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/introduction/"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-100"
            >
              Get started
            </a>
            <a
              href="/getting-started/"
              className="text-sm font-semibold leading-6 text-white hover:text-white/80"
            >
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <Cards className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Cards.Card
            title="Installation"
            href="/introduction/"
            className="group p-6 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <p className="mt-2 text-sm text-white/80">
              Learn the basics and get up and running in minutes
            </p>
          </Cards.Card>

          <Cards.Card
            title="Guides"
            href="/guides/deep-research/"
            className="group p-6 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <p className="mt-2 text-sm text-white/80">
              Explore our library of pre-built components
            </p>
          </Cards.Card>

          <Cards.Card
            title="API Reference"
            href="/api-reference/"
            className="group p-6 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <p className="mt-2 text-sm text-white/80">
              Follow our detailed tutorials and examples
            </p>
          </Cards.Card>
        </Cards>
      </div>
    </div>
  );
}
