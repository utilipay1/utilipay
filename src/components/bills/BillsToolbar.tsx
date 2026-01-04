"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  Zap, 
  Droplets, 
  Flame, 
  Waves 
} from "lucide-react"

export interface BillFiltersState {
  status: Set<string>
  utilityType: Set<string>
  propertyId: Set<string>
  search: string
  showArchived: boolean
}

interface BillsToolbarProps {
  filters: BillFiltersState
  setFilters: (filters: BillFiltersState) => void
  properties: Record<string, string> // id -> address
}

export function BillsToolbar({
  filters,
  setFilters,
  properties,
}: BillsToolbarProps) {
  const isFiltered = 
    filters.status.size > 0 || 
    filters.utilityType.size > 0 || 
    filters.propertyId.size > 0 ||
    filters.search.length > 0 ||
    filters.showArchived

  const handleReset = () => {
    setFilters({
      status: new Set(),
      utilityType: new Set(),
      propertyId: new Set(),
      search: "",
      showArchived: false,
    })
  }

  const statusOptions = [
    { label: "Unpaid", value: "Unpaid", icon: Circle },
    { label: "Overdue", value: "Overdue", icon: AlertCircle },
    { label: "Paid (Charged)", value: "Paid-Charged", icon: CheckCircle2 },
    { label: "Paid (Uncharged)", value: "Paid-Uncharged", icon: CheckCircle2 },
  ]

  const utilityOptions = [
    { label: "Water", value: "Water", icon: Droplets },
    { label: "Sewer", value: "Sewer", icon: Waves }, // Waves might not exist, fallback to text if needed
    { label: "Electric", value: "Electric", icon: Zap },
    { label: "Gas", value: "Gas", icon: Flame },
  ]

  const propertyOptions = Object.entries(properties).map(([id, address]) => ({
    label: address,
    value: id,
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filter by address..."
            value={filters.search}
            onChange={(event) =>
              setFilters({ ...filters, search: event.target.value })
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          
          <DataTableFacetedFilter
            title="Status"
            options={statusOptions}
            selectedValues={filters.status}
            onSelect={(values) => setFilters({ ...filters, status: values })}
          />

          <DataTableFacetedFilter
            title="Utility"
            options={utilityOptions}
            selectedValues={filters.utilityType}
            onSelect={(values) => setFilters({ ...filters, utilityType: values })}
          />

          <DataTableFacetedFilter
            title="Property"
            options={propertyOptions}
            selectedValues={filters.propertyId}
            onSelect={(values) => setFilters({ ...filters, propertyId: values })}
          />

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-archived"
            checked={filters.showArchived}
            onCheckedChange={(checked) => setFilters({ ...filters, showArchived: checked })}
          />
          <Label htmlFor="show-archived" className="text-sm font-medium">
            Archived
          </Label>
        </div>
      </div>
    </div>
  )
}
