"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Minus } from "lucide-react";
import {
  DASHBOARD_WIDGET_LABELS,
  getDashboardWidgetGridClass,
  getDashboardWidgetSize,
  type DashboardWidgetId,
} from "@/app/lib/dashboardLayout";
import { ordersEqual } from "@/app/lib/dashboardGridEngine";

const LONG_PRESS_MS = 480;

function minHeightClass(id: DashboardWidgetId) {
  const size = getDashboardWidgetSize(id);
  if (size === "large") return "min-h-[340px] sm:min-h-[400px]";
  if (size === "full") return "min-h-[140px]";
  return "min-h-[168px]";
}

type DashboardEditableGridProps = {
  widgetIds: DashboardWidgetId[];
  onOrderChange: (ids: DashboardWidgetId[]) => void;
  onHide: (id: DashboardWidgetId) => void;
  renderWidget: (id: DashboardWidgetId) => ReactNode;
};

function WidgetTile({
  id,
  isEditMode,
  isDragging,
  jiggleDelay,
  onRequestEditMode,
  onHide,
  children,
}: {
  id: DashboardWidgetId;
  isEditMode: boolean;
  isDragging: boolean;
  jiggleDelay: number;
  onRequestEditMode: () => void;
  onHide: (id: DashboardWidgetId) => void;
  children: ReactNode;
}) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const { attributes, listeners, setNodeRef } = useSortable({
    id,
    disabled: !isEditMode,
    animateLayoutChanges: () => false,
  });

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isEditMode) return;
    if (e.button !== 0 && e.pointerType !== "touch") return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      onRequestEditMode();
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([8, 40, 8]);
      }
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current || isEditMode) return;
    if (Math.abs(e.clientX - pointerStart.current.x) > 10 || Math.abs(e.clientY - pointerStart.current.y) > 10) {
      clearLongPress();
    }
  };

  const gridClass = getDashboardWidgetGridClass(id);
  const isSmallWidget = getDashboardWidgetSize(id) === "small";

  return (
    <div
      ref={setNodeRef}
      style={{
        animationDelay: isEditMode && !isDragging ? `${jiggleDelay}ms` : undefined,
        transition: isDragging ? undefined : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={`dashboard-widget-tile relative ${gridClass} ${minHeightClass(id)} ${
        isSmallWidget ? "dashboard-widget-tile--small" : ""
      } ${isDragging ? "dashboard-widget-tile--dragging z-[5]" : isEditMode ? "z-[15]" : ""} ${
        isEditMode && !isDragging ? "dashboard-widget-tile--editing" : ""
      }`}
      onPointerDown={handlePointerDown}
      onPointerUp={clearLongPress}
      onPointerLeave={clearLongPress}
      onPointerCancel={clearLongPress}
      onPointerMove={handlePointerMove}
      onContextMenu={(e) => {
        e.preventDefault();
        onRequestEditMode();
      }}
      data-widget-id={id}
    >
      {isDragging ? <div className="dashboard-widget-placeholder absolute inset-0 rounded-2xl" aria-hidden /> : null}

      {isEditMode ? (
        <>
          <button
            type="button"
            className="dashboard-widget-delete absolute -left-1.5 -top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-500/90 text-white shadow-md ring-2 ring-white"
            aria-label={`Retirer ${DASHBOARD_WIDGET_LABELS[id]}`}
            onClick={(e) => {
              e.stopPropagation();
              onHide(id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </button>
          <div
            className="absolute inset-0 z-10 cursor-grab touch-none rounded-2xl active:cursor-grabbing"
            {...attributes}
            {...listeners}
          />
        </>
      ) : null}

      <div className={`motion-card h-full ${isEditMode ? "pointer-events-none select-none" : ""}`}>{children}</div>
    </div>
  );
}

export default function DashboardEditableGrid({
  widgetIds,
  onOrderChange,
  onHide,
  renderWidget,
}: DashboardEditableGridProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeId, setActiveId] = useState<DashboardWidgetId | null>(null);
  const [dragItems, setDragItems] = useState<DashboardWidgetId[] | null>(null);
  const [overlaySize, setOverlaySize] = useState<{ width: number; height: number } | null>(null);
  const itemsRef = useRef(widgetIds);
  const lastOverRef = useRef<DashboardWidgetId | null>(null);

  const items = dragItems ?? widgetIds;

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } })
  );

  useEffect(() => {
    if (!isEditMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEditMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isEditMode]);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as DashboardWidgetId;
    setActiveId(id);
    setDragItems(widgetIds);
    itemsRef.current = widgetIds;
    lastOverRef.current = null;

    const el = document.querySelector(`[data-widget-id="${id}"]`);
    if (el) {
      const rect = el.getBoundingClientRect();
      setOverlaySize({ width: rect.width, height: rect.height });
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(6);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      lastOverRef.current = null;
      return;
    }

    const activeWidget = active.id as DashboardWidgetId;
    const overWidget = over.id as DashboardWidgetId;
    if (activeWidget === overWidget) return;
    if (overWidget === lastOverRef.current) return;

    setDragItems((prev) => {
      const base = prev ?? widgetIds;
      const oldIndex = base.indexOf(activeWidget);
      const newIndex = base.indexOf(overWidget);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return base;
      lastOverRef.current = overWidget;
      const next = arrayMove(base, oldIndex, newIndex);
      itemsRef.current = next;
      return next;
    });
  };

  const handleDragEnd = () => {
    const final = itemsRef.current;
    setActiveId(null);
    setOverlaySize(null);
    setDragItems(null);
    lastOverRef.current = null;
    if (!ordersEqual(final, widgetIds)) {
      onOrderChange(final);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverlaySize(null);
    setDragItems(null);
    lastOverRef.current = null;
  };

  return (
    <div className={isEditMode ? "dashboard-edit-mode" : undefined}>
      {isEditMode ? (
        <div className="sticky top-0 z-40 mb-4 flex justify-center px-4 sm:px-6 md:px-0">
          <div className="flex items-center gap-3 rounded-full bg-white px-2 py-2 shadow-lg ring-1 ring-black/[0.06]">
            <span className="pl-3 text-sm font-medium text-zinc-600">Réorganiser</span>
            <button
              type="button"
              className="rounded-full bg-[#007AFF] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0066D6] active:scale-[0.98]"
              onClick={() => setIsEditMode(false)}
            >
              Terminé
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-4 px-4 text-center text-[11px] text-zinc-400 sm:px-6 md:px-0 md:text-left">
          Appui long ou clic droit sur une carte pour réorganiser
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          <div
            className="dashboard-widget-grid grid grid-flow-dense grid-cols-2 gap-4 px-4 sm:gap-5 md:grid-cols-3 md:px-0"
            aria-label="Widgets du tableau de bord"
          >
            {items.map((id, index) => (
              <WidgetTile
                key={id}
                id={id}
                isEditMode={isEditMode}
                isDragging={activeId === id}
                jiggleDelay={(index % 6) * 35}
                onRequestEditMode={() => setIsEditMode(true)}
                onHide={onHide}
              >
                {renderWidget(id)}
              </WidgetTile>
            ))}
          </div>
        </SortableContext>

        <DragOverlay
          dropAnimation={{ duration: 350, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}
          zIndex={100}
        >
          {activeId ? (
            <div
              className={`dashboard-widget-tile dashboard-widget-tile--lifted pointer-events-none ${getDashboardWidgetGridClass(activeId)} ${minHeightClass(activeId)}`}
              style={
                overlaySize
                  ? { width: overlaySize.width, height: overlaySize.height, maxWidth: "92vw" }
                  : undefined
              }
            >
              <div className="motion-card h-full scale-[1.02] shadow-2xl ring-2 ring-[#007AFF]/25">
                {renderWidget(activeId)}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
