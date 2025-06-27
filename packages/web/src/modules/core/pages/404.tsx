import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router";

export function NotFoundScreen() {
  return (
    <div
      data-testid="not-found-screen"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4"
    >
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Main Content Card */}
        <h1 className="text-9xl text-black/10 tracking-tight font-bold">404</h1>
        <Card className="border-0 ring-1 -mt-14 ring-black/10 bg-white/20 backdrop-blur-sm">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl tracking-tight font-semibold text-gray-900">
                Oops! Page Not Found
              </h2>
              <p className="max-w-md text-base mx-auto">
                The page you're looking for seems to have wandered off into the
                digital void. Don't worry, it happens to the best of us!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/">Return to Homepage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
