import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-black">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm text-gray-400">
                  Code error: {params.error}
                </p>
              ) : (
                <p className="text-sm text-gray-400">
                  An unspecified error occurred.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
