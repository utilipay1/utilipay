import { PropertySchema } from "@/lib/schemas";
import { z } from "zod";
import { Badge } from "@/components/ui/badge"; // Assuming we have Badge or I'll use simple spans
import { Button } from "@/components/ui/button";
import { Edit, User, Home, Lightbulb, FileText, Phone } from "lucide-react";

type Property = z.infer<typeof PropertySchema>;

interface PropertyDetailsProps {
  property: Property;
  onEdit: () => void;
}

export function PropertyDetails({ property, onEdit }: PropertyDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{property.address}</h2>
          <div className="flex gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
              property.tenant_status === 'Occupied' 
                ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' 
                : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
            }`}>
              {property.tenant_status}
            </span>
            {property.is_archived && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-600 border-gray-200">
                Archived
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Owner Info */}
        <div className="space-y-3 p-4 border rounded-xl bg-muted/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <Home className="w-4 h-4" />
            Owner Information
          </div>
          <div className="space-y-1">
            <p className="font-medium">{property.owner_info?.name || "No owner name"}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-3 h-3" />
              {property.owner_info?.contact || "No contact info"}
            </div>
          </div>
        </div>

        {/* Tenant Info */}
        <div className="space-y-3 p-4 border rounded-xl bg-muted/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <User className="w-4 h-4" />
            Tenant Information
          </div>
          {property.tenant_status === "Occupied" ? (
            <div className="space-y-1">
              <p className="font-medium">{property.tenant_info?.name || "No tenant name"}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3 h-3" />
                {property.tenant_info?.contact || "No contact info"}
              </div>
            </div>
          ) : (
             <p className="text-sm text-muted-foreground italic">Property is currently vacant.</p>
          )}
        </div>
      </div>

      {/* Utilities */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          <Lightbulb className="w-4 h-4" />
          Managed Utilities
        </div>
        <div className="flex flex-wrap gap-2">
          {property.utilities_managed.length > 0 ? (
            property.utilities_managed.map((utility) => (
              <div key={utility} className="px-3 py-1.5 rounded-md border bg-card font-medium text-sm flex items-center gap-2 shadow-sm">
                {utility}
              </div>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">No utilities managed.</span>
          )}
        </div>
      </div>

      {/* Notes */}
      {property.notes && (
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            Notes
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {property.notes}
          </p>
        </div>
      )}
    </div>
  );
}