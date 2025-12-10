import { Suspense } from "react";
import ReportsContent from "./client-content";

export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Loading reports...</div>}>
      <ReportsContent />
    </Suspense>
  );
}