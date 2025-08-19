import Link from "next/link";

export default function RootPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gradient-to-b from-background to-muted">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Choose Your Assistant
        </h1>
        <p className="text-lg text-muted-foreground">
          Select the specialized AI assistant that best fits your needs
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl w-full">
        <Link 
          href="/verbier"
          className="group relative overflow-hidden rounded-xl border bg-card p-8 transition-all hover:shadow-xl hover:scale-105"
        >
          <div className="space-y-4">
            <div className="text-2xl">🎼</div>
            <h2 className="text-2xl font-semibold">
              Verbier Festival Concierge
            </h2>
            <p className="text-muted-foreground">
              Your personal guide to creating customized classical music experiences at the Verbier Festival in the Swiss Alps. Get personalized concert recommendations from 200+ performances.
            </p>
            <div className="text-sm text-primary font-medium">
              July 17 - August 3, 2025 →
            </div>
          </div>
        </Link>
        
        <Link 
          href="/medical"
          className="group relative overflow-hidden rounded-xl border bg-card p-8 transition-all hover:shadow-xl hover:scale-105"
        >
          <div className="space-y-4">
            <div className="text-2xl">🏥</div>
            <h2 className="text-2xl font-semibold">
              Medical Diagnostic Assistant
            </h2>
            <p className="text-muted-foreground">
              Interactive symptom assessment using a systematic diagnostic funnel approach. Understand your symptoms, identify potential conditions, and receive triage recommendations.
            </p>
            <div className="text-sm text-primary font-medium">
              Educational purposes only →
            </div>
          </div>
        </Link>
      </div>
      
      <div className="text-sm text-muted-foreground text-center max-w-lg">
        <p>
          Each assistant is specialized with domain-specific knowledge and uses advanced AI to provide personalized guidance and recommendations.
        </p>
      </div>
    </div>
  );
}