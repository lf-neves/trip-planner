import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FlightBookingSkeleton() {
  return (
    <Card className="w-[320px] shadow-lg animate-pulse">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-xl">
          <Skeleton className="h-6 w-32" />
        </CardTitle>
        <Skeleton className="w-6 h-6 rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-18" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between border-t pt-2">
            <Skeleton className="h-4 w-12 font-bold" />
            <Skeleton className="h-4 w-16 font-bold" />
          </div>
        </div>

        <div className="pt-4">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="text-center">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}
