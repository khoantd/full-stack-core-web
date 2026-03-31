import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type FeatureKey } from "@/types/tenant.type";
import { type PendingToggle } from "./feature-dependencies";

interface DependencyWarningDialogProps {
  open: boolean;
  pending: PendingToggle | null;
  featureMeta: Record<FeatureKey, { label: string }>;
  onConfirm: () => void;
  onCancel: () => void;
}

function buildDescription(
  pending: PendingToggle,
  featureMeta: Record<FeatureKey, { label: string }>
): string {
  const featureLabel = featureMeta[pending.feature].label;

  if (!pending.nextState && pending.willAlsoDisable.length > 0) {
    const dependentLabels = pending.willAlsoDisable
      .map((f) => featureMeta[f].label)
      .join(", ");
    return `Disabling ${featureLabel} will also disable ${dependentLabels} because they require ${featureLabel}.`;
  }

  if (pending.nextState && pending.willAlsoEnable.length > 0) {
    const requiredLabels = pending.willAlsoEnable
      .map((f) => featureMeta[f].label)
      .join(", ");
    return `Enabling ${featureLabel} also requires enabling ${requiredLabels}.`;
  }

  return `This action will affect other features.`;
}

export function DependencyWarningDialog({
  open,
  pending,
  featureMeta,
  onConfirm,
  onCancel,
}: DependencyWarningDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Feature Change</AlertDialogTitle>
          <AlertDialogDescription>
            {pending ? buildDescription(pending, featureMeta) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Apply Changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
