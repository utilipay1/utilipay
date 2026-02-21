"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { DataTableFacetedFilter } from "../bills/data-table-faceted-filter"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  Zap, 
  Droplets, 
  Flame, 
  Waves,
  Building2,
  PlayCircle,
  PauseCircle
} from "lucide-react"

export interface PropertyFiltersState {
  utilityType: Set<string>
  companyId: Set<string>
  managedStatus: Set<string>
  search: string
  showArchived: boolean
}

interface PropertiesToolbarProps {
  filters: PropertyFiltersState
  setFilters: (filters: PropertyFiltersState) => void
  companies: Record<string, string> // id -> name
}

export function PropertiesToolbar({
  filters,
  setFilters,
  companies,
}: PropertiesToolbarProps) {
  const isFiltered = 
    filters.utilityType.size > 0 || 
    filters.companyId.size > 0 ||
    filters.managedStatus.size > 0 ||
    filters.search.length > 0 ||
    filters.showArchived

  const handleReset = () => {
    setFilters({
      utilityType: new Set(),
      companyId: new Set(),
      managedStatus: new Set(),
      search: "",
      showArchived: false,
    })
  }

  const utilityOptions = [
    { label: "Water", value: "Water", icon: Droplets },
    { label: "Sewer", value: "Sewer", icon: Waves },
    { label: "Water + Sewer", value: "Water + Sewer", icon: Waves },
    { label: "Electric", value: "Electric", icon: Zap },
    { label: "Gas", value: "Gas", icon: Flame },
  ]

  const managementOptions = [
    { label: "Managed", value: "Managed", icon: PlayCircle },
    { label: "Paused", value: "Paused", icon: PauseCircle },
  ]

  const companyOptions = Object.entries(companies).map(([id, name]) => ({
    label: name,
    value: id,
    icon: Building2
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Input
            placeholder="Search by address..."
            value={filters.search}
            onChange={(event) =>
              setFilters({ ...filters, search: event.target.value })
            }
            className="h-8 w-full lg:w-[250px] bg-muted/20"
          />
          
          <DataTableFacetedFilter
            title="Utility"
            options={utilityOptions}
            selectedValues={filters.utilityType}
            onSelect={(values) => setFilters({ ...filters, utilityType: values })}
          />

          <DataTableFacetedFilter
            title="Company"
            options={companyOptions}
            selectedValues={filters.companyId}
            onSelect={(values) => setFilters({ ...filters, companyId: values })}
          />

          <DataTableFacetedFilter
            title="Management"
            options={managementOptions}
            selectedValues={filters.managedStatus}
            onSelect={(values) => setFilters({ ...filters, managedStatus: values })}
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
            id="show-archived-props"
            checked={filters.showArchived}
            onCheckedChange={(checked) => setFilters({ ...filters, showArchived: checked })}
          />
          <Label htmlFor="show-archived-props" className="text-sm font-medium">
            Archived
          </Label>
        </div>
      </div>
    </div>
  )
}
