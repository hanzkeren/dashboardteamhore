import { Suspense } from "react";
import BudgetsContent from "./client-content";

export default function BudgetsPage() {
  return (
    <Suspense fallback={<div>Loading budgets...</div>}>
      <BudgetsContent />
    </Suspense>
  );
}