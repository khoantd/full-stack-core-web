"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";
import type { FieldArrayWithId, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { LandingFormValues } from "../lib/landing-form-schema";

function SortableRow({
  sid,
  children,
}: {
  sid: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sid,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-2 rounded-lg border bg-card p-3 shadow-sm"
    >
      <button
        type="button"
        className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Reorder"
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-5 shrink-0" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

interface SortableSectionListProps {
  form: UseFormReturn<LandingFormValues>;
  fields: FieldArrayWithId<LandingFormValues, "sections", "_fieldKey">[];
  move: (from: number, to: number) => void;
  sectionIds: string[];
  renderSection: (index: number) => React.ReactNode;
}

export function SortableSectionList({
  form,
  fields,
  move,
  sectionIds,
  renderSection,
}: SortableSectionListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const secs = form.getValues("sections");
      const oldIndex = secs.findIndex((s) => s.id === String(active.id));
      const newIndex = secs.findIndex((s) => s.id === String(over.id));
      if (oldIndex < 0 || newIndex < 0) return;
      move(oldIndex, newIndex);
    },
    [form, move],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {fields.map((field, index) => {
            const sid = form.getValues(`sections.${index}.id`);
            return (
              <SortableRow key={field._fieldKey} sid={sid}>
                {renderSection(index)}
              </SortableRow>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
